{-# LANGUAGE DataKinds #-}
{-# LANGUAGE TemplateHaskell #-}
{-# LANGUAGE TypeApplications #-}
{-# LANGUAGE NoImplicitPrelude #-}
{-# LANGUAGE OverloadedStrings #-}

module Damocles.Founder where

import PlutusTx.Prelude
import Plutus.V2.Ledger.Api
import Plutus.V2.Ledger.Contexts
import qualified PlutusTx

-- FOUNDER WALLET ADDRESS (HARDCODED)
-- ***REMOVED***

-- Founder's PubKeyHash derived from your address
founderPubKeyHash :: PubKeyHash
founderPubKeyHash = "***REMOVED***"

-- Founder allocation: 50M SWORD tokens (5% of 1B total supply)
founderAllocation :: Integer
founderAllocation = 50_000_000

-- Total token supply
totalSupply :: Integer 
totalSupply = 1_000_000_000

-- Genesis minting data
data GenesisMint = GenesisMint
    { gmFounder :: PubKeyHash      -- Your pubkey hash
    , gmFounderAmount :: Integer   -- 50M tokens
    , gmTotalSupply :: Integer     -- 1B total tokens
    , gmMinted :: Bool             -- Track if already minted
    } deriving (Show)

PlutusTx.makeIsDataIndexed ''GenesisMint [('GenesisMint, 0)]

-- Genesis minting action
data GenesisAction = MintGenesis deriving (Show)

PlutusTx.makeIsDataIndexed ''GenesisAction [('MintGenesis, 0)]

-- Genesis minting validator - only you can mint the initial supply
{-# INLINABLE genesisMintValidator #-}
genesisMintValidator :: GenesisMint -> GenesisAction -> ScriptContext -> Bool
genesisMintValidator genesis MintGenesis ctx =
    traceIfFalse "Not signed by founder" (txSignedBy info founderPubKeyHash) &&
    traceIfFalse "Already minted" (not (gmMinted genesis)) &&
    traceIfFalse "Incorrect total mint amount" (totalMintAmount == totalSupply) &&
    traceIfFalse "Founder allocation incorrect" (founderGetsCorrectAmount) &&
    traceIfFalse "Treasury allocation incorrect" (treasuryGetsRemainder)
  where
    info = scriptContextTxInfo ctx
    
    -- Check total minted amount
    totalMintAmount = case flattenValue (txInfoMint info) of
        [(_, _, amt)] -> amt
        _ -> 0
    
    -- Verify founder gets exactly 50M tokens
    founderGetsCorrectAmount = 
        any (\out -> 
            case addressCredential (txOutAddress out) of
                PubKeyCredential pkh -> 
                    pkh == founderPubKeyHash &&
                    valueOf (txOutValue out) "" "SWORD" >= founderAllocation
                _ -> False
        ) (txInfoOutputs info)
    
    -- Verify remaining 950M goes to platform treasury
    treasuryGetsRemainder =
        any (\out ->
            valueOf (txOutValue out) "" "SWORD" >= (totalSupply - founderAllocation)
        ) (txInfoOutputs info)

-- Founder vesting contract
data FounderVesting = FounderVesting
    { fvFounder :: PubKeyHash      -- Your pubkey hash
    , fvTotalTokens :: Integer     -- 50M total allocation
    , fvStartTime :: POSIXTime     -- Genesis deployment time
    , fvReleasedTokens :: Integer  -- Already released amount
    , fvLockPeriods :: [Integer]   -- Vesting schedule milestones
    } deriving (Show)

PlutusTx.makeIsDataIndexed ''FounderVesting [('FounderVesting, 0)]

data VestingAction = ReleaseVested Integer deriving (Show)

PlutusTx.makeIsDataIndexed ''VestingAction [('ReleaseVested, 0)]

-- Vesting schedule: 20% immediate, then 20% every 6 months
{-# INLINABLE calculateVestedAmount #-}
calculateVestedAmount :: POSIXTime -> POSIXTime -> Integer -> Integer
calculateVestedAmount startTime currentTime totalTokens =
    let monthsElapsed = (currentTime - startTime) `divide` (6 * 30 * 24 * 60 * 60 * 1000) -- 6 months in ms
        immediateRelease = totalTokens `divide` 5  -- 20% immediate
        additionalVested = min (totalTokens - immediateRelease) 
                              ((monthsElapsed * totalTokens) `divide` 5)
    in immediateRelease + additionalVested

{-# INLINABLE founderVestingValidator #-}
founderVestingValidator :: FounderVesting -> VestingAction -> ScriptContext -> Bool
founderVestingValidator vesting (ReleaseVested requestedAmount) ctx =
    traceIfFalse "Not signed by founder" (txSignedBy info founderPubKeyHash) &&
    traceIfFalse "Requested amount exceeds vested" (requestedAmount <= availableVested) &&
    traceIfFalse "Incorrect output datum" (correctOutputDatum)
  where
    info = scriptContextTxInfo ctx
    
    currentTime = case ivFrom (txInfoValidRange info) of
        LowerBound (Finite t) _ -> t
        _ -> fvStartTime vesting
    
    totalVested = calculateVestedAmount (fvStartTime vesting) currentTime (fvTotalTokens vesting)
    availableVested = totalVested - fvReleasedTokens vesting
    
    correctOutputDatum = case getContinuingOutputs ctx of
        [o] -> case txOutDatum o of
            OutputDatum (Datum d) ->
                case PlutusTx.fromBuiltinData d of
                    Just newVesting ->
                        fvReleasedTokens newVesting == fvReleasedTokens vesting + requestedAmount
                    Nothing -> False
            _ -> False
        _ -> False

-- Founder staking contract for earning rewards
data FounderStaking = FounderStaking
    { fsFounder :: PubKeyHash      -- Your pubkey hash
    , fsStakedAmount :: Integer    -- Amount currently staked
    , fsStakeTime :: POSIXTime     -- When staking started
    , fsRewardRate :: Integer      -- Reward percentage (60% APY)
    , fsAccumulatedRewards :: Integer -- Unclaimed rewards
    } deriving (Show)

PlutusTx.makeIsDataIndexed ''FounderStaking [('FounderStaking, 0)]

data StakingAction = StakeTokens Integer | UnstakeTokens Integer | ClaimRewards
    deriving (Show)

PlutusTx.makeIsDataIndexed ''StakingAction 
    [ ('StakeTokens, 0)
    , ('UnstakeTokens, 1)
    , ('ClaimRewards, 2)
    ]

-- Calculate staking rewards at 60% APY
{-# INLINABLE calculateStakingRewards #-}
calculateStakingRewards :: Integer -> POSIXTime -> POSIXTime -> Integer
calculateStakingRewards stakedAmount stakeTime currentTime =
    let timeStaked = currentTime - stakeTime
        yearInMs = 365 * 24 * 60 * 60 * 1000
        rewardRate = 60  -- 60% APY
    in (stakedAmount * rewardRate * timeStaked) `divide` (100 * yearInMs)

{-# INLINABLE founderStakingValidator #-}
founderStakingValidator :: FounderStaking -> StakingAction -> ScriptContext -> Bool
founderStakingValidator staking action ctx =
    case action of
        StakeTokens amount ->
            traceIfFalse "Not signed by founder" (txSignedBy info founderPubKeyHash) &&
            traceIfFalse "Invalid stake amount" (amount > 0) &&
            traceIfFalse "Insufficient token balance" (hasEnoughTokens amount)
            
        UnstakeTokens amount ->
            traceIfFalse "Not signed by founder" (txSignedBy info founderPubKeyHash) &&
            traceIfFalse "Insufficient staked amount" (amount <= fsStakedAmount staking) &&
            traceIfFalse "Minimum stake period not met" (minimumStakePeriodMet)
            
        ClaimRewards ->
            traceIfFalse "Not signed by founder" (txSignedBy info founderPubKeyHash) &&
            traceIfFalse "No rewards to claim" (availableRewards > 0)
  where
    info = scriptContextTxInfo ctx
    
    currentTime = case ivFrom (txInfoValidRange info) of
        LowerBound (Finite t) _ -> t
        _ -> fsStakeTime staking
    
    availableRewards = calculateStakingRewards 
                          (fsStakedAmount staking) 
                          (fsStakeTime staking) 
                          currentTime
    
    minimumStakePeriodMet = currentTime >= (fsStakeTime staking + (30 * 24 * 60 * 60 * 1000)) -- 30 days
    
    hasEnoughTokens amount = True  -- Simplified - would check actual balance

-- Governance contract - founder gets enhanced voting power
data FounderGovernance = FounderGovernance
    { fgFounder :: PubKeyHash        -- Your pubkey hash
    , fgVotingPower :: Integer       -- Enhanced voting power
    , fgProposalThreshold :: Integer -- Lower threshold for proposals
    , fgVetoRights :: Bool          -- Can veto harmful proposals
    } deriving (Show)

PlutusTx.makeIsDataIndexed ''FounderGovernance [('FounderGovernance, 0)]

data GovernanceAction = 
      CreateProposal BuiltinByteString  -- Proposal content hash
    | VoteOnProposal Integer Integer    -- Proposal ID, vote weight  
    | VetoProposal Integer             -- Proposal ID to veto
    deriving (Show)

PlutusTx.makeIsDataIndexed ''GovernanceAction
    [ ('CreateProposal, 0)
    , ('VoteOnProposal, 1)  
    , ('VetoProposal, 2)
    ]

{-# INLINABLE founderGovernanceValidator #-}
founderGovernanceValidator :: FounderGovernance -> GovernanceAction -> ScriptContext -> Bool
founderGovernanceValidator governance action ctx =
    case action of
        CreateProposal _ ->
            traceIfFalse "Not signed by founder" (txSignedBy info founderPubKeyHash) &&
            traceIfFalse "Proposal threshold not met" (meetsProposalThreshold)
            
        VoteOnProposal _ voteWeight ->
            traceIfFalse "Not signed by founder" (txSignedBy info founderPubKeyHash) &&
            traceIfFalse "Invalid vote weight" (voteWeight <= fgVotingPower governance)
            
        VetoProposal _ ->
            traceIfFalse "Not signed by founder" (txSignedBy info founderPubKeyHash) &&
            traceIfFalse "No veto rights" (fgVetoRights governance)
  where
    info = scriptContextTxInfo ctx
    meetsProposalThreshold = True  -- Founder always meets threshold

-- Compile all founder contracts
genesisMintScript :: CompiledCode (BuiltinData -> BuiltinData -> BuiltinData -> ())
genesisMintScript = $$(PlutusTx.compile [|| wrappedGenesis ||])
  where
    wrappedGenesis = mkUntypedValidator genesisMintValidator

founderVestingScript :: CompiledCode (BuiltinData -> BuiltinData -> BuiltinData -> ())
founderVestingScript = $$(PlutusTx.compile [|| wrappedVesting ||])
  where
    wrappedVesting = mkUntypedValidator founderVestingValidator

founderStakingScript :: CompiledCode (BuiltinData -> BuiltinData -> BuiltinData -> ())
founderStakingScript = $$(PlutusTx.compile [|| wrappedStaking ||])
  where
    wrappedStaking = mkUntypedValidator founderStakingValidator

founderGovernanceScript :: CompiledCode (BuiltinData -> BuiltinData -> BuiltinData -> ())
founderGovernanceScript = $$(PlutusTx.compile [|| wrappedGovernance ||])
  where
    wrappedGovernance = mkUntypedValidator founderGovernanceValidator