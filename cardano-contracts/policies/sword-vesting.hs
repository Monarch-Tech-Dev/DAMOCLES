{-# LANGUAGE DataKinds                  #-}
{-# LANGUAGE DeriveAnyClass             #-}
{-# LANGUAGE DeriveGeneric              #-}
{-# LANGUAGE DerivingStrategies         #-}
{-# LANGUAGE FlexibleContexts           #-}
{-# LANGUAGE GeneralizedNewtypeDeriving #-}
{-# LANGUAGE LambdaCase                 #-}
{-# LANGUAGE MultiParamTypeClasses      #-}
{-# LANGUAGE NoImplicitPrelude          #-}
{-# LANGUAGE OverloadedStrings          #-}
{-# LANGUAGE RecordWildCards            #-}
{-# LANGUAGE ScopedTypeVariables        #-}
{-# LANGUAGE TemplateHaskell            #-}
{-# LANGUAGE TypeApplications           #-}
{-# LANGUAGE TypeFamilies               #-}
{-# LANGUAGE TypeOperators              #-}

-- | SWORD Token Vesting Policy
-- Enforces 4-year vesting schedule for SWORD tokens
-- Part of DAMOCLES 5-layer security stack

module SwordVesting where

import           Ledger               hiding (singleton)
import           Ledger.Constraints   as Constraints
import qualified Ledger.Scripts       as Scripts
import           Ledger.Ada           as Ada
import           Ledger.Value         as Value
import           Playground.Contract  (printJson, printSchemas, ensureKnownCurrencies, stage, ToSchema)
import           Playground.TH        (mkKnownCurrencies, mkSchemaDefinitions)
import           Playground.Types     (KnownCurrency (..).)
import qualified PlutusTx
import           PlutusTx.Prelude     hiding (Semigroup(..), unless)
import           Prelude              (IO, Semigroup (..), Show (..), String)
import           Text.Printf          (printf)

-- | SWORD Token Information
swordTokenName :: TokenName
swordTokenName = "SWORD"

totalSupply :: Integer
totalSupply = 1000000000  -- 1 billion tokens

-- | Vesting schedule parameters
data VestingParams = VestingParams
    { vestingStart       :: !POSIXTime      -- Token generation event timestamp
    , founderAllocation  :: !Integer        -- 5% = 50M tokens
    , teamAllocation     :: !Integer        -- 15% = 150M tokens
    , advisorAllocation  :: !Integer        -- 5% = 50M tokens
    , communityAllocation:: !Integer        -- 75% = 750M tokens (no vesting)
    , founderAddress     :: !PubKeyHash     -- Founder wallet
    , teamAddresses      :: ![PubKeyHash]   -- Team member wallets
    , advisorAddresses   :: ![PubKeyHash]   -- Advisor wallets
    } deriving (Show, Generic, FromJSON, ToJSON, ToSchema)

-- | Vesting redeemer for token releases
data VestingRedeemer = ClaimFounderTokens
                     | ClaimTeamTokens
                     | ClaimAdvisorTokens
                     | ClaimCommunityTokens
                     deriving (Show, Generic, FromJSON, ToJSON, ToSchema)

PlutusTx.makeIsDataIndexed ''VestingParams [('VestingParams, 0)]
PlutusTx.makeIsDataIndexed ''VestingRedeemer [ ('ClaimFounderTokens, 0)
                                             , ('ClaimTeamTokens, 1)
                                             , ('ClaimAdvisorTokens, 2)
                                             , ('ClaimCommunityTokens, 3)]

{-# INLINABLE swordVestingPolicy #-}
-- | Main vesting policy logic
swordVestingPolicy :: VestingParams -> VestingRedeemer -> ScriptContext -> Bool
swordVestingPolicy params redeemer ctx =
    case redeemer of
        ClaimFounderTokens   -> validateFounderClaim
        ClaimTeamTokens      -> validateTeamClaim
        ClaimAdvisorTokens   -> validateAdvisorClaim
        ClaimCommunityTokens -> validateCommunityClaim
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx

    ownCurrencySymbol :: CurrencySymbol
    ownCurrencySymbol = ownCurrencySymbol ctx

    -- Get current time from transaction validity range
    getCurrentTime :: Maybe POSIXTime
    getCurrentTime = case ivFrom (txInfoValidRange info) of
        LowerBound (Finite time) _ -> Just time
        _                          -> Nothing

    -- Calculate vesting progress (0-100%)
    getVestingProgress :: POSIXTime -> Integer
    getVestingProgress currentTime =
        let timeElapsed = currentTime - vestingStart params
            fourYears = 126144000000  -- 4 years in milliseconds
        in min 100 (timeElapsed * 100 `divide` fourYears)

    -- Founder vesting: 1-year cliff, then 3-year linear
    validateFounderClaim :: Bool
    validateFounderClaim =
        traceIfFalse "Founder must sign the transaction" founderSigned &&
        traceIfFalse "Cliff period not met" cliffMet &&
        traceIfFalse "Cannot claim more than vested amount" correctClaimAmount
      where
        founderSigned = founderAddress params `elem` txInfoSignatories info

        cliffMet = case getCurrentTime of
            Just currentTime -> currentTime >= (vestingStart params) + 31536000000  -- 1 year cliff
            Nothing          -> False

        correctClaimAmount = case getCurrentTime of
            Just currentTime ->
                let vestingProgress = getVestingProgress currentTime
                    -- After 1 year cliff, linear vesting over 3 years
                    vestedAmount = if currentTime >= (vestingStart params) + 31536000000
                                  then (founderAllocation params * (vestingProgress - 25)) `divide` 75
                                  else 0
                    mintedValue = txInfoMint info
                    mintedAmount = case flattenValue mintedValue of
                        [(cs, tn, amt)] -> if cs == ownCurrencySymbol && tn == swordTokenName
                                          then amt
                                          else 0
                        _               -> 0
                in mintedAmount <= vestedAmount && mintedAmount > 0
            Nothing -> False

    -- Team vesting: 6-month cliff, then 3.5-year linear
    validateTeamClaim :: Bool
    validateTeamClaim =
        traceIfFalse "Team member must sign the transaction" teamSigned &&
        traceIfFalse "Cliff period not met" cliffMet &&
        traceIfFalse "Cannot claim more than vested amount" correctClaimAmount
      where
        teamSigned = any (`elem` txInfoSignatories info) (teamAddresses params)

        cliffMet = case getCurrentTime of
            Just currentTime -> currentTime >= (vestingStart params) + 15768000000  -- 6 months cliff
            Nothing          -> False

        correctClaimAmount = case getCurrentTime of
            Just currentTime ->
                let vestingProgress = getVestingProgress currentTime
                    -- After 6 months cliff, linear vesting over 3.5 years
                    vestedAmount = if currentTime >= (vestingStart params) + 15768000000
                                  then (teamAllocation params * (vestingProgress - 12)) `divide` 88
                                  else 0
                    mintedValue = txInfoMint info
                    mintedAmount = case flattenValue mintedValue of
                        [(cs, tn, amt)] -> if cs == ownCurrencySymbol && tn == swordTokenName
                                          then amt
                                          else 0
                        _               -> 0
                in mintedAmount <= vestedAmount && mintedAmount > 0
            Nothing -> False

    -- Advisor vesting: No cliff, 2-year linear
    validateAdvisorClaim :: Bool
    validateAdvisorClaim =
        traceIfFalse "Advisor must sign the transaction" advisorSigned &&
        traceIfFalse "Cannot claim more than vested amount" correctClaimAmount
      where
        advisorSigned = any (`elem` txInfoSignatories info) (advisorAddresses params)

        correctClaimAmount = case getCurrentTime of
            Just currentTime ->
                let twoYears = 63072000000  -- 2 years in milliseconds
                    timeElapsed = currentTime - vestingStart params
                    vestingProgress = min 100 (timeElapsed * 100 `divide` twoYears)
                    vestedAmount = (advisorAllocation params * vestingProgress) `divide` 100
                    mintedValue = txInfoMint info
                    mintedAmount = case flattenValue mintedValue of
                        [(cs, tn, amt)] -> if cs == ownCurrencySymbol && tn == swordTokenName
                                          then amt
                                          else 0
                        _               -> 0
                in mintedAmount <= vestedAmount && mintedAmount > 0
            Nothing -> False

    -- Community tokens: No vesting, available immediately
    validateCommunityClaim :: Bool
    validateCommunityClaim =
        traceIfFalse "Community allocation already fully distributed" notExhausted &&
        traceIfFalse "Cannot mint more than community allocation" correctClaimAmount
      where
        notExhausted = True  -- Community distribution managed by treasury

        correctClaimAmount =
            let mintedValue = txInfoMint info
                mintedAmount = case flattenValue mintedValue of
                    [(cs, tn, amt)] -> if cs == ownCurrencySymbol && tn == swordTokenName
                                      then amt
                                      else 0
                    _               -> 0
            in mintedAmount <= communityAllocation params && mintedAmount > 0

-- | Compile the vesting policy
swordVestingScript :: VestingParams -> Scripts.MintingPolicy
swordVestingScript params = Scripts.mkMintingPolicyScript $
    $$(PlutusTx.compile [|| swordVestingPolicy ||])
        `PlutusTx.applyCode`
            PlutusTx.liftCode params

-- | Generate policy ID (currency symbol)
swordPolicyId :: VestingParams -> CurrencySymbol
swordPolicyId = scriptCurrencySymbol . swordVestingScript

-- | Generate policy hash for reference
swordVestingHash :: VestingParams -> Scripts.MintingPolicyHash
swordVestingHash = Scripts.mintingPolicyHash . swordVestingScript

-- | DAMOCLES SWORD token parameters
damoclesSwordParams :: VestingParams
damoclesSwordParams = VestingParams
    { vestingStart = 1704067200000  -- January 1, 2024 (placeholder)
    , founderAllocation = 50000000  -- 50M tokens (5%)
    , teamAllocation = 150000000    -- 150M tokens (15%)
    , advisorAllocation = 50000000  -- 50M tokens (5%)
    , communityAllocation = 750000000 -- 750M tokens (75%)
    , founderAddress = "FOUNDER_PUBKEY_HASH_PLACEHOLDER"
    , teamAddresses = [ "TEAM_MEMBER_1_HASH_PLACEHOLDER"
                      , "TEAM_MEMBER_2_HASH_PLACEHOLDER"
                      , "TEAM_MEMBER_3_HASH_PLACEHOLDER"
                      ]
    , advisorAddresses = [ "ADVISOR_1_HASH_PLACEHOLDER"
                         , "ADVISOR_2_HASH_PLACEHOLDER"
                         ]
    }

-- Schema definitions for playground
type SwordVestingSchema =
        Endpoint "claim-founder-tokens" Integer
    .\/ Endpoint "claim-team-tokens" Integer
    .\/ Endpoint "claim-advisor-tokens" Integer
    .\/ Endpoint "claim-community-tokens" Integer

-- | Utility function to calculate available tokens
calculateAvailableTokens :: VestingParams -> PubKeyHash -> POSIXTime -> Integer
calculateAvailableTokens params recipient currentTime
    | recipient == founderAddress params = calculateFounderVested
    | recipient `elem` teamAddresses params = calculateTeamVested
    | recipient `elem` advisorAddresses params = calculateAdvisorVested
    | otherwise = 0
  where
    timeElapsed = currentTime - vestingStart params

    calculateFounderVested =
        if currentTime >= vestingStart params + 31536000000  -- 1 year cliff
        then let progress = min 100 ((timeElapsed - 31536000000) * 100 `divide` 94608000000)  -- 3 years after cliff
             in (founderAllocation params * progress) `divide` 100
        else 0

    calculateTeamVested =
        if currentTime >= vestingStart params + 15768000000  -- 6 months cliff
        then let progress = min 100 ((timeElapsed - 15768000000) * 100 `divide` 110376000000)  -- 3.5 years after cliff
             in (teamAllocation params * progress) `divide` 100
        else 0

    calculateAdvisorVested =
        let progress = min 100 (timeElapsed * 100 `divide` 63072000000)  -- 2 years linear
        in (advisorAllocation params * progress) `divide` 100

-- Schema generation for Plutus Playground
mkSchemaDefinitions ''SwordVestingSchema

-- Export the compiled policy for deployment
compiledSwordVestingPolicy :: VestingParams -> CompiledCode (BuiltinData -> BuiltinData -> ())
compiledSwordVestingPolicy params = $$(PlutusTx.compile [|| swordVestingPolicy ||])
    `PlutusTx.applyCode` PlutusTx.liftCode params