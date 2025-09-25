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

-- | DAMOCLES Emergency Pause System
-- Circuit breaker for critical system protection
-- Can pause all platform operations instantly during exploit/attack

module EmergencyPause where

import           Ledger               hiding (singleton)
import           Ledger.Constraints   as Constraints
import qualified Ledger.Scripts       as Scripts
import           Ledger.Ada           as Ada
import           Playground.Contract  (printJson, printSchemas, ensureKnownCurrencies, stage, ToSchema)
import           Playground.TH        (mkKnownCurrencies, mkSchemaDefinitions)
import           Playground.Types     (KnownCurrency (..).)
import qualified PlutusTx
import           PlutusTx.Prelude     hiding (Semigroup(..), unless)
import           Prelude              (IO, Semigroup (..), Show (..), String)
import           Text.Printf          (printf)

-- | Emergency pause state
data PauseState = Active    -- System operating normally
                | Paused    -- Emergency pause activated
                deriving (Show, Eq, Generic, FromJSON, ToJSON, ToSchema)

-- | Emergency pause datum
data EmergencyDatum = EmergencyDatum
    { currentState      :: !PauseState           -- Current pause state
    , pauseTimestamp    :: !(Maybe POSIXTime)    -- When pause was activated
    , pauseInitiator    :: !(Maybe PubKeyHash)   -- Who initiated the pause
    , pauseReason       :: !BuiltinByteString    -- Reason for pause
    , unpauseVotes      :: ![PubKeyHash]         -- Signers who voted to unpause
    , pauseCount        :: !Integer              -- Number of times system has been paused
    , lastUnpause       :: !(Maybe POSIXTime)    -- Last time system was unpaused
    } deriving (Show, Generic, FromJSON, ToJSON, ToSchema)

-- | Emergency pause redeemer actions
data EmergencyRedeemer = EmergencyPause BuiltinByteString  -- Pause with reason
                       | VoteUnpause                        -- Vote to unpause
                       | ExecuteUnpause                     -- Execute unpause after sufficient votes
                       | CheckState                         -- Read-only state check
                       deriving (Show, Generic, FromJSON, ToJSON, ToSchema)

PlutusTx.makeIsDataIndexed ''PauseState [('Active, 0), ('Paused, 1)]
PlutusTx.makeIsDataIndexed ''EmergencyDatum [('EmergencyDatum, 0)]
PlutusTx.makeIsDataIndexed ''EmergencyRedeemer [ ('EmergencyPause, 0)
                                               , ('VoteUnpause, 1)
                                               , ('ExecuteUnpause, 2)
                                               , ('CheckState, 3)]

-- | Emergency pause parameters
data EmergencyParams = EmergencyParams
    { authorizedPausers   :: ![PubKeyHash]    -- Who can trigger emergency pause
    , governanceSigners   :: ![PubKeyHash]    -- Multi-sig governance (for unpause)
    , requiredUnpauseVotes:: !Integer         -- Minimum votes needed to unpause (3)
    , maxPauseCount       :: !Integer         -- Max pauses before manual intervention
    , cooldownPeriod      :: !POSIXTime       -- Minimum time between pauses (24 hours)
    } deriving (Show, Generic, FromJSON, ToJSON, ToSchema)

PlutusTx.makeIsDataIndexed ''EmergencyParams [('EmergencyParams, 0)]

{-# INLINABLE emergencyValidator #-}
-- | Emergency pause validator logic
emergencyValidator :: EmergencyParams -> EmergencyDatum -> EmergencyRedeemer -> ScriptContext -> Bool
emergencyValidator params datum redeemer ctx =
    case redeemer of
        EmergencyPause reason -> validateEmergencyPause reason
        VoteUnpause           -> validateUnpauseVote
        ExecuteUnpause        -> validateUnpauseExecution
        CheckState            -> validateStateCheck
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx

    -- Validate emergency pause activation
    validateEmergencyPause :: BuiltinByteString -> Bool
    validateEmergencyPause reason =
        traceIfFalse "System already paused" systemNotPaused &&
        traceIfFalse "Unauthorized pause request" authorizedPauser &&
        traceIfFalse "Pause reason required" validReason &&
        traceIfFalse "Too many pauses, manual intervention required" belowPauseLimit &&
        traceIfFalse "Cooldown period not met" cooldownMet
      where
        systemNotPaused = currentState datum == Active

        authorizedPauser = any (`elem` txInfoSignatories info) (authorizedPausers params)

        validReason = not $ null reason

        belowPauseLimit = pauseCount datum < maxPauseCount params

        cooldownMet = case lastUnpause datum of
            Nothing -> True
            Just lastTime -> case ivFrom (txInfoValidRange info) of
                LowerBound (Finite currentTime) _ ->
                    currentTime >= lastTime + cooldownPeriod params
                _ -> False

    -- Validate unpause vote
    validateUnpauseVote :: Bool
    validateUnpauseVote =
        traceIfFalse "System not paused" systemPaused &&
        traceIfFalse "Unauthorized unpause vote" authorizedVoter &&
        traceIfFalse "Already voted to unpause" hasntVoted
      where
        systemPaused = currentState datum == Paused

        authorizedVoter = any (`elem` txInfoSignatories info) (governanceSigners params)

        hasntVoted = case txInfoSignatories info of
            (signer:_) -> signer `notElem` unpauseVotes datum
            []         -> False

    -- Validate unpause execution (after sufficient votes)
    validateUnpauseExecution :: Bool
    validateUnpauseExecution =
        traceIfFalse "System not paused" systemPaused &&
        traceIfFalse "Insufficient unpause votes" sufficientVotes &&
        traceIfFalse "Must be signed by governance member" governanceSigned
      where
        systemPaused = currentState datum == Paused

        sufficientVotes =
            let totalVotes = length (unpauseVotes datum) + 1  -- +1 for current signer
            in toInteger totalVotes >= requiredUnpauseVotes params

        governanceSigned = any (`elem` txInfoSignatories info) (governanceSigners params)

    -- Validate state check (always succeeds for read-only)
    validateStateCheck :: Bool
    validateStateCheck = True

-- | Circuit breaker check - can be called by other contracts
{-# INLINABLE checkEmergencyState #-}
checkEmergencyState :: EmergencyDatum -> Bool
checkEmergencyState datum = currentState datum == Active

-- | Get pause duration helper
{-# INLINABLE getPauseDuration #-}
getPauseDuration :: EmergencyDatum -> POSIXTime -> Maybe POSIXTime
getPauseDuration datum currentTime = case pauseTimestamp datum of
    Just pauseTime -> Just (currentTime - pauseTime)
    Nothing        -> Nothing

-- | Compile the emergency validator
emergencyScript :: EmergencyParams -> Scripts.Validator
emergencyScript params = Scripts.mkValidatorScript $
    $$(PlutusTx.compile [|| emergencyValidator ||])
        `PlutusTx.applyCode`
            PlutusTx.liftCode params

-- | Generate script address
emergencyAddress :: EmergencyParams -> Ledger.Address
emergencyAddress = scriptAddress . emergencyScript

-- | Generate script hash for reference
emergencyScriptHash :: EmergencyParams -> Ledger.ValidatorHash
emergencyScriptHash = Scripts.validatorHash . emergencyScript

-- | DAMOCLES emergency parameters
damoclesEmergencyParams :: EmergencyParams
damoclesEmergencyParams = EmergencyParams
    { authorizedPausers = [ "FOUNDER_PUBKEY_HASH"           -- Founder
                          , "SECURITY_TEAM_HASH"            -- Security team
                          , "AUTOMATED_MONITOR_HASH"        -- Monitoring system
                          ]
    , governanceSigners = [ "FOUNDER_PUBKEY_HASH"
                          , "COMMUNITY_1_PUBKEY_HASH"
                          , "COMMUNITY_2_PUBKEY_HASH"
                          , "ADVISOR_PUBKEY_HASH"
                          , "BACKUP_PUBKEY_HASH"
                          ]
    , requiredUnpauseVotes = 3
    , maxPauseCount = 5              -- Max 5 pauses before manual intervention
    , cooldownPeriod = 86400000      -- 24 hours between pauses
    }

-- | Initial emergency state
initialEmergencyDatum :: EmergencyDatum
initialEmergencyDatum = EmergencyDatum
    { currentState = Active
    , pauseTimestamp = Nothing
    , pauseInitiator = Nothing
    , pauseReason = ""
    , unpauseVotes = []
    , pauseCount = 0
    , lastUnpause = Nothing
    }

-- Schema definitions
type EmergencySchema =
        Endpoint "emergency-pause" String
    .\/ Endpoint "vote-unpause" ()
    .\/ Endpoint "execute-unpause" ()
    .\/ Endpoint "check-system-status" ()

data PauseRequest = PauseRequest
    { reason :: !String
    } deriving (Generic, ToJSON, FromJSON, ToSchema)

data SystemStatus = SystemStatus
    { isActive       :: !Bool
    , isPaused       :: !Bool
    , pausedSince    :: !(Maybe POSIXTime)
    , pauseReason    :: !String
    , unpauseVotes   :: !Integer
    , votesNeeded    :: !Integer
    , totalPauses    :: !Integer
    } deriving (Generic, ToJSON, FromJSON, ToSchema)

-- | Utility function to create pause datum
mkPauseDatum :: EmergencyDatum -> PubKeyHash -> POSIXTime -> String -> EmergencyDatum
mkPauseDatum currentDatum initiator timestamp reason = EmergencyDatum
    { currentState = Paused
    , pauseTimestamp = Just timestamp
    , pauseInitiator = Just initiator
    , pauseReason = fromString reason
    , unpauseVotes = []
    , pauseCount = pauseCount currentDatum + 1
    , lastUnpause = lastUnpause currentDatum
    }

-- | Utility function to create unpause datum
mkUnpauseDatum :: EmergencyDatum -> POSIXTime -> EmergencyDatum
mkUnpauseDatum pausedDatum timestamp = EmergencyDatum
    { currentState = Active
    , pauseTimestamp = Nothing
    , pauseInitiator = Nothing
    , pauseReason = ""
    , unpauseVotes = []
    , pauseCount = pauseCount pausedDatum
    , lastUnpause = Just timestamp
    }

-- | Check if system can be paused
canPause :: EmergencyParams -> EmergencyDatum -> POSIXTime -> Bool
canPause params datum currentTime =
    currentState datum == Active &&
    pauseCount datum < maxPauseCount params &&
    case lastUnpause datum of
        Nothing -> True
        Just lastTime -> currentTime >= lastTime + cooldownPeriod params

-- | Integration helper for other contracts
{-# INLINABLE requireSystemActive #-}
requireSystemActive :: EmergencyDatum -> Bool
requireSystemActive datum =
    traceIfFalse "System is paused for emergency maintenance"
                 (currentState datum == Active)

-- Validation helper functions
{-# INLINABLE fromString #-}
fromString :: String -> BuiltinByteString
fromString = toBuiltin . encodeUtf8

-- Schema generation for Plutus Playground
mkSchemaDefinitions ''EmergencySchema

-- Export the compiled validator for deployment
compiledEmergencyValidator :: EmergencyParams -> CompiledCode (BuiltinData -> BuiltinData -> BuiltinData -> ())
compiledEmergencyValidator params = $$(PlutusTx.compile [|| emergencyValidator ||])
    `PlutusTx.applyCode` PlutusTx.liftCode params