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

-- | DAMOCLES Treasury Time-Lock Contract
-- Enforces 48-hour withdrawal delays for large amounts
-- Part of the 5-layer security stack

module TreasuryTimeLock where

import           Ledger               hiding (singleton)
import           Ledger.Constraints   as Constraints
import qualified Ledger.Scripts       as Scripts
import           Ledger.Ada           as Ada
import           Playground.Contract  (printJson, printSchemas, ensureKnownCurrencies, stage, ToSchema)
import           Playground.TH        (mkKnownCurrencies, mkSchemaDefinitions)
import           Playground.Types     (KnownCurrency (..))
import qualified PlutusTx
import           PlutusTx.Prelude     hiding (Semigroup(..), unless)
import           Prelude              (IO, Semigroup (..), Show (..), String)
import           Text.Printf          (printf)

-- | Treasury withdrawal datum
data TreasuryDatum = TreasuryDatum
    { withdrawalAmount    :: !Integer        -- Amount requested (in lovelace)
    , withdrawalRecipient :: !PubKeyHash     -- Who requested the withdrawal
    , requestTime         :: !POSIXTime      -- When withdrawal was requested
    , withdrawalPurpose   :: !BuiltinByteString -- Purpose description
    , approvedSigners     :: ![PubKeyHash]   -- Signers who approved
    , executed            :: !Bool           -- Whether withdrawal was executed
    } deriving (Show, Generic, FromJSON, ToJSON, ToSchema)

-- | Treasury withdrawal redeemer actions
data TreasuryRedeemer = RequestWithdrawal
                      | ApproveWithdrawal
                      | ExecuteWithdrawal
                      | CancelWithdrawal
                      deriving (Show, Generic, FromJSON, ToJSON, ToSchema)

PlutusTx.makeIsDataIndexed ''TreasuryDatum [('TreasuryDatum, 0)]
PlutusTx.makeIsDataIndexed ''TreasuryRedeemer [ ('RequestWithdrawal, 0)
                                              , ('ApproveWithdrawal, 1)
                                              , ('ExecuteWithdrawal, 2)
                                              , ('CancelWithdrawal, 3)]

-- | Treasury parameters (set at deployment)
data TreasuryParams = TreasuryParams
    { requiredSigners     :: ![PubKeyHash]   -- Multi-sig signers
    , minimumSignatures   :: !Integer        -- Required signatures (3)
    , timeLockDelay       :: !POSIXTime      -- 48 hours = 172800000 ms
    , minimumLockAmount   :: !Integer        -- Min amount requiring time-lock (lovelace)
    } deriving (Show, Generic, FromJSON, ToJSON, ToSchema)

PlutusTx.makeIsDataIndexed ''TreasuryParams [('TreasuryParams, 0)]

{-# INLINABLE treasuryValidator #-}
-- | Main validator logic
treasuryValidator :: TreasuryParams -> TreasuryDatum -> TreasuryRedeemer -> ScriptContext -> Bool
treasuryValidator params datum redeemer ctx =
    case redeemer of
        RequestWithdrawal -> validateWithdrawalRequest
        ApproveWithdrawal -> validateApproval
        ExecuteWithdrawal -> validateExecution
        CancelWithdrawal  -> validateCancellation
  where
    info :: TxInfo
    info = scriptContextTxInfo ctx

    -- Validate withdrawal request
    validateWithdrawalRequest :: Bool
    validateWithdrawalRequest =
        traceIfFalse "Request must be signed by authorized signer" validRequester &&
        traceIfFalse "Amount must be positive" (withdrawalAmount datum > 0) &&
        traceIfFalse "Purpose must be provided" (not $ null $ withdrawalPurpose datum) &&
        traceIfFalse "Request time must be current" validRequestTime &&
        traceIfFalse "Cannot request on already executed withdrawal" (not $ executed datum)
      where
        validRequester = any (`elem` txInfoSignatories info) (requiredSigners params)
        validRequestTime = case ivFrom (txInfoValidRange info) of
            LowerBound (Finite requestTime) _ -> requestTime datum == requestTime
            _                                 -> False

    -- Validate approval (additional signatures)
    validateApproval :: Bool
    validateApproval =
        traceIfFalse "Must be signed by authorized signer" validApprover &&
        traceIfFalse "Cannot approve executed withdrawal" (not $ executed datum) &&
        traceIfFalse "Signer already approved" signerNotYetApproved
      where
        validApprover = any (`elem` txInfoSignatories info) (requiredSigners params)
        signerNotYetApproved = case txInfoSignatories info of
            (signer:_) -> signer `notElem` approvedSigners datum
            []         -> False

    -- Validate execution (after time delay and sufficient signatures)
    validateExecution :: Bool
    validateExecution =
        traceIfFalse "Time lock period not met" timeLockMet &&
        traceIfFalse "Insufficient approvals" sufficientApprovals &&
        traceIfFalse "Invalid withdrawal amount" correctWithdrawalAmount &&
        traceIfFalse "Withdrawal already executed" (not $ executed datum)
      where
        -- Check if 48 hours have passed since request
        timeLockMet = case ivFrom (txInfoValidRange info) of
            LowerBound (Finite currentTime) _ ->
                if withdrawalAmount datum >= minimumLockAmount params
                then currentTime >= (requestTime datum) + (timeLockDelay params)
                else True  -- Small amounts don't need time lock
            _ -> False

        -- Check if we have enough signatures
        sufficientApprovals =
            let totalApprovals = length (approvedSigners datum) + 1  -- +1 for requester
            in toInteger totalApprovals >= minimumSignatures params

        -- Verify the withdrawal amount matches
        correctWithdrawalAmount =
            let outputs = txInfoOutputs info
                toRecipient = [ o | o <- outputs,
                                  txOutAddress o == pubKeyHashAddress (withdrawalRecipient datum) Nothing ]
                totalToRecipient = sum [ Ada.fromValue (txOutValue out) | out <- toRecipient ]
            in totalToRecipient >= Ada.lovelaceOf (withdrawalAmount datum)

    -- Validate cancellation (emergency or unanimous decision)
    validateCancellation :: Bool
    validateCancellation =
        traceIfFalse "Cannot cancel executed withdrawal" (not $ executed datum) &&
        (traceIfFalse "Insufficient signatures for cancellation" unanimousCancellation ||
         traceIfFalse "Not an emergency cancellation" emergencyCancellation)
      where
        unanimousCancellation =
            let signaturesCount = length $ filter (`elem` txInfoSignatories info) (requiredSigners params)
            in toInteger signaturesCount == toInteger (length (requiredSigners params))

        emergencyCancellation =
            -- Emergency cancellation allowed within first 1 hour
            case ivFrom (txInfoValidRange info) of
                LowerBound (Finite currentTime) _ ->
                    currentTime <= (requestTime datum) + 3600000  -- 1 hour in ms
                _ -> False

-- | Compile the validator
treasuryScript :: TreasuryParams -> Scripts.Validator
treasuryScript params = Scripts.mkValidatorScript $
    $$(PlutusTx.compile [|| treasuryValidator ||])
        `PlutusTx.applyCode`
            PlutusTx.liftCode params

-- | Generate script address
treasuryAddress :: TreasuryParams -> Ledger.Address
treasuryAddress = scriptAddress . treasuryScript

-- | Generate script hash for reference
treasuryScriptHash :: TreasuryParams -> Ledger.ValidatorHash
treasuryScriptHash = Scripts.validatorHash . treasuryScript

-- Example parameters for DAMOCLES treasury
damoclesTreasuryParams :: TreasuryParams
damoclesTreasuryParams = TreasuryParams
    { requiredSigners = [ "FOUNDER_PUBKEY_HASH"
                        , "COMMUNITY_1_PUBKEY_HASH"
                        , "COMMUNITY_2_PUBKEY_HASH"
                        , "ADVISOR_PUBKEY_HASH"
                        , "BACKUP_PUBKEY_HASH"
                        ]
    , minimumSignatures = 3
    , timeLockDelay = 172800000      -- 48 hours in milliseconds
    , minimumLockAmount = 100000000000  -- 100,000 ADA in lovelace
    }

-- Schema definitions for playground
PlutusTx.makeIsDataIndexed ''TreasuryParams [('TreasuryParams, 0)]

type TreasurySchema =
        Endpoint "request-withdrawal" WithdrawalRequest
    .\/ Endpoint "approve-withdrawal" ApprovalRequest
    .\/ Endpoint "execute-withdrawal" ExecutionRequest
    .\/ Endpoint "cancel-withdrawal" CancellationRequest

data WithdrawalRequest = WithdrawalRequest
    { wrAmount    :: !Integer
    , wrRecipient :: !PubKeyHash
    , wrPurpose   :: !String
    } deriving (Generic, ToJSON, FromJSON, ToSchema)

data ApprovalRequest = ApprovalRequest
    { arWithdrawalRef :: !TxOutRef
    } deriving (Generic, ToJSON, FromJSON, ToSchema)

data ExecutionRequest = ExecutionRequest
    { erWithdrawalRef :: !TxOutRef
    } deriving (Generic, ToJSON, FromJSON, ToSchema)

data CancellationRequest = CancellationRequest
    { crWithdrawalRef :: !TxOutRef
    , crReason        :: !String
    } deriving (Generic, ToJSON, FromJSON, ToSchema)

-- Contract endpoints would go here in a full implementation
-- This validator focuses on the core security logic

-- | Utility function to create initial treasury state
mkInitialTreasuryDatum :: WithdrawalRequest -> POSIXTime -> TreasuryDatum
mkInitialTreasuryDatum wr currentTime = TreasuryDatum
    { withdrawalAmount = wrAmount wr
    , withdrawalRecipient = wrRecipient wr
    , requestTime = currentTime
    , withdrawalPurpose = fromString (wrPurpose wr)
    , approvedSigners = []
    , executed = False
    }

-- | Validation helper functions
{-# INLINABLE fromString #-}
fromString :: String -> BuiltinByteString
fromString = toBuiltin . encodeUtf8

-- Schema generation for Plutus Playground
mkSchemaDefinitions ''TreasurySchema

-- Export the compiled validator for deployment
compiledTreasuryValidator :: TreasuryParams -> CompiledCode (BuiltinData -> BuiltinData -> BuiltinData -> ())
compiledTreasuryValidator params = $$(PlutusTx.compile [|| treasuryValidator ||])
    `PlutusTx.applyCode` PlutusTx.liftCode params