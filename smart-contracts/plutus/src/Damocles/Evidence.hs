{-# LANGUAGE DataKinds #-}
{-# LANGUAGE TemplateHaskell #-}
{-# LANGUAGE TypeApplications #-}
{-# LANGUAGE NoImplicitPrelude #-}
{-# LANGUAGE OverloadedStrings #-}

module Damocles.Evidence where

import PlutusTx.Prelude
import Plutus.V2.Ledger.Api
import Plutus.V2.Ledger.Contexts
import qualified PlutusTx

-- Evidence data structure
data Evidence = Evidence
    { evCreditor      :: PubKeyHash     -- Creditor's public key hash
    , evDebtor        :: PubKeyHash     -- Debtor's public key hash  
    , evIpfsHash      :: BuiltinByteString -- IPFS hash of evidence
    , evTimestamp     :: POSIXTime      -- When evidence was submitted
    , evViolationType :: Integer        -- Type of violation (1=fees, 2=gdpr, etc)
    , evSeverity      :: Integer        -- Severity (1=low, 2=med, 3=high, 4=critical)
    , evAmount        :: Integer        -- Estimated damage in lovelace
    } deriving (Show)

PlutusTx.makeIsDataIndexed ''Evidence [('Evidence, 0)]

-- Violation registry datum
data ViolationDatum = ViolationDatum
    { vdCreditor       :: PubKeyHash    -- Creditor being tracked
    , vdViolationCount :: Integer       -- Total violations
    , vdTotalDamage    :: Integer       -- Total estimated damage
    , vdLastUpdate     :: POSIXTime     -- Last update timestamp
    , vdSwordTriggered :: Bool          -- Whether sword has been triggered
    } deriving (Show)

PlutusTx.makeIsDataIndexed ''ViolationDatum [('ViolationDatum, 0)]

-- Actions that can be performed
data ViolationAction
    = AddEvidence Evidence              -- Add new evidence
    | TriggerSword                      -- Trigger collective action
    | UpdateCount                       -- Update violation counts
    deriving (Show)

PlutusTx.makeIsDataIndexed ''ViolationAction 
    [ ('AddEvidence, 0)
    , ('TriggerSword, 1) 
    , ('UpdateCount, 2)
    ]

-- Constants
{-# INLINABLE swordThreshold #-}
swordThreshold :: Integer
swordThreshold = 100  -- Minimum violations to trigger sword

{-# INLINABLE maxEvidenceAge #-}
maxEvidenceAge :: POSIXTime
maxEvidenceAge = 31536000000  -- 1 year in milliseconds

{-# INLINABLE minStakeAmount #-}
minStakeAmount :: Integer
minStakeAmount = 1000000  -- 1 ADA minimum stake

-- Validator logic
{-# INLINABLE violationValidator #-}
violationValidator :: ViolationDatum -> ViolationAction -> ScriptContext -> Bool
violationValidator datum action ctx =
    case action of
        AddEvidence evidence ->
            -- Verify evidence is valid and properly signed
            traceIfFalse "Invalid evidence signature" (validateEvidenceSignature evidence) &&
            traceIfFalse "Evidence too old" (isEvidenceRecent evidence) &&
            traceIfFalse "Invalid creditor" (evCreditor evidence == vdCreditor datum) &&
            traceIfFalse "Insufficient stake" (hasMinimumStake (evDebtor evidence)) &&
            traceIfFalse "Output datum incorrect" (correctOutputDatum evidence)
            
        TriggerSword ->
            -- Check if threshold is met or DAO has approved
            traceIfFalse "Sword threshold not met" 
                (vdViolationCount datum >= swordThreshold) &&
            traceIfFalse "Sword already triggered" 
                (not (vdSwordTriggered datum)) &&
            traceIfFalse "Invalid triggerer" (hasValidTrigger)
            
        UpdateCount ->
            -- Only DAO or oracle can update counts
            traceIfFalse "Not authorized to update" (hasDAOAuthorization || hasOracleAuthorization)
    where
        info = scriptContextTxInfo ctx
        
        validateEvidenceSignature :: Evidence -> Bool
        validateEvidenceSignature ev = 
            txSignedBy info (evDebtor ev)
        
        isEvidenceRecent :: Evidence -> Bool
        isEvidenceRecent ev = 
            let currentTime = case ivFrom (txInfoValidRange info) of
                    LowerBound (Finite t) _ -> t
                    _ -> 0
            in currentTime - evTimestamp ev <= maxEvidenceAge
        
        hasMinimumStake :: PubKeyHash -> Bool
        hasMinimumStake pkh = 
            -- Check if user has staked minimum amount
            -- This would check a staking UTxO in production
            True  -- Simplified for now
        
        correctOutputDatum :: Evidence -> Bool
        correctOutputDatum ev =
            case getContinuingOutputs ctx of
                [o] -> case txOutDatum o of
                    OutputDatum (Datum d) -> 
                        case PlutusTx.fromBuiltinData d of
                            Just newDatum -> 
                                vdCreditor newDatum == vdCreditor datum &&
                                vdViolationCount newDatum == vdViolationCount datum + 1 &&
                                vdTotalDamage newDatum == vdTotalDamage datum + evAmount ev
                            Nothing -> False
                    _ -> False
                _ -> False
        
        hasValidTrigger :: Bool
        hasValidTrigger = 
            -- Check if triggerer is authorized (DAO member or affected user)
            any (txSignedBy info) authorizedTriggers
            where
                authorizedTriggers = [vdCreditor datum]  -- Simplified
        
        hasDAOAuthorization :: Bool
        hasDAOAuthorization = 
            -- Check DAO multisig approval
            True  -- Simplified for now
        
        hasOracleAuthorization :: Bool
        hasOracleAuthorization =
            -- Check oracle signature
            False  -- Not implemented yet

-- Token policy for $SWORD tokens
{-# INLINABLE mkTokenPolicy #-}
mkTokenPolicy :: PubKeyHash -> BuiltinData -> ScriptContext -> Bool
mkTokenPolicy daoKey _ ctx =
    case flattenValue (txInfoMint info) of
        [(cs, tn, amt)] ->
            -- Ensure this is minting $SWORD tokens
            tn == "SWORD" &&
            -- Only DAO can mint tokens
            txSignedBy info daoKey &&
            -- Validate minting amount
            amt > 0 &&
            -- Check distribution rules
            validDistribution (txInfoOutputs info) amt
        _ -> False
    where
        info = scriptContextTxInfo ctx
        
        validDistribution :: [TxOut] -> Integer -> Bool
        validDistribution outputs amount =
            -- Ensure tokens are distributed according to tokenomics
            -- 40% Evidence Mining Pool
            -- 25% Settlement Treasury
            -- 20% Staking Rewards
            -- 15% Development
            True  -- Simplified validation

-- Staking validator
data StakingDatum = StakingDatum
    { sdStaker     :: PubKeyHash
    , sdAmount     :: Integer
    , sdStartTime  :: POSIXTime
    , sdLockPeriod :: POSIXTime
    , sdRewards    :: Integer
    } deriving (Show)

PlutusTx.makeIsDataIndexed ''StakingDatum [('StakingDatum, 0)]

data StakingAction = Stake Integer | Unstake | ClaimRewards
    deriving (Show)

PlutusTx.makeIsDataIndexed ''StakingAction
    [ ('Stake, 0)
    , ('Unstake, 1)
    , ('ClaimRewards, 2)
    ]

{-# INLINABLE stakingValidator #-}
stakingValidator :: StakingDatum -> StakingAction -> ScriptContext -> Bool
stakingValidator datum action ctx =
    case action of
        Stake amount ->
            traceIfFalse "Invalid stake amount" (amount >= minStakeAmount) &&
            traceIfFalse "Not signed by staker" (txSignedBy info (sdStaker datum)) &&
            traceIfFalse "Incorrect output" (correctStakeOutput amount)
            
        Unstake ->
            traceIfFalse "Lock period not over" (isUnlockTimeReached) &&
            traceIfFalse "Not signed by staker" (txSignedBy info (sdStaker datum)) &&
            traceIfFalse "Incorrect unstake output" (correctUnstakeOutput)
            
        ClaimRewards ->
            traceIfFalse "No rewards available" (sdRewards datum > 0) &&
            traceIfFalse "Not signed by staker" (txSignedBy info (sdStaker datum)) &&
            traceIfFalse "Incorrect reward output" (correctRewardOutput)
    where
        info = scriptContextTxInfo ctx
        
        correctStakeOutput :: Integer -> Bool
        correctStakeOutput amt =
            case getContinuingOutputs ctx of
                [o] -> case txOutDatum o of
                    OutputDatum (Datum d) ->
                        case PlutusTx.fromBuiltinData d of
                            Just newDatum ->
                                sdAmount newDatum == sdAmount datum + amt
                            Nothing -> False
                    _ -> False
                _ -> False
        
        isUnlockTimeReached :: Bool
        isUnlockTimeReached =
            let currentTime = case ivFrom (txInfoValidRange info) of
                    LowerBound (Finite t) _ -> t
                    _ -> 0
                unlockTime = sdStartTime datum + sdLockPeriod datum
            in currentTime >= unlockTime
        
        correctUnstakeOutput :: Bool
        correctUnstakeOutput = True  -- Simplified
        
        correctRewardOutput :: Bool
        correctRewardOutput = True  -- Simplified

-- Compile the validators
violationValidatorScript :: CompiledCode (BuiltinData -> BuiltinData -> BuiltinData -> ())
violationValidatorScript = $$(PlutusTx.compile [|| wrappedValidator ||])
    where
        wrappedValidator = mkUntypedValidator violationValidator

tokenPolicyScript :: PubKeyHash -> CompiledCode (BuiltinData -> BuiltinData -> ())
tokenPolicyScript daoKey = $$(PlutusTx.compile [|| \key -> mkUntypedMintingPolicy (mkTokenPolicy key) ||])
    `PlutusTx.applyCode` PlutusTx.liftCode daoKey

stakingValidatorScript :: CompiledCode (BuiltinData -> BuiltinData -> BuiltinData -> ())
stakingValidatorScript = $$(PlutusTx.compile [|| wrappedStaking ||])
    where
        wrappedStaking = mkUntypedValidator stakingValidator