-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "personal_number_hash" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(20),
    "risk_score" DECIMAL(3,2),
    "shield_tier" VARCHAR(20) NOT NULL DEFAULT 'bronze',
    "token_balance" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "onboarding_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creditors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organization_number" VARCHAR(20),
    "type" TEXT NOT NULL,
    "privacy_email" VARCHAR(255),
    "violation_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "total_violations" INTEGER NOT NULL DEFAULT 0,
    "average_settlement_rate" DECIMAL(3,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creditors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "creditor_id" TEXT NOT NULL,
    "original_amount" DECIMAL(12,2) NOT NULL,
    "current_amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL,
    "account_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "debts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gdpr_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "creditor_id" TEXT NOT NULL,
    "reference_id" VARCHAR(50) NOT NULL,
    "content" TEXT,
    "status" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3),
    "response_due" TIMESTAMP(3),
    "response_received_at" TIMESTAMP(3),
    "tracking_pixel_viewed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gdpr_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gdpr_responses" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "content" BYTEA,
    "extracted_data" JSONB,
    "format" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gdpr_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "violations" (
    "id" TEXT NOT NULL,
    "gdpr_request_id" TEXT,
    "creditor_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confidence" DECIMAL(3,2) NOT NULL,
    "evidence" TEXT NOT NULL,
    "legal_reference" TEXT NOT NULL,
    "estimated_damage" DECIMAL(12,2) NOT NULL,
    "blockchain_hash" TEXT,
    "ipfs_hash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "debt_id" TEXT NOT NULL,
    "original_amount" DECIMAL(12,2) NOT NULL,
    "settled_amount" DECIMAL(12,2) NOT NULL,
    "saved_amount" DECIMAL(12,2) NOT NULL,
    "platform_fee" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL,
    "smart_contract_address" TEXT,
    "transaction_hash" TEXT,
    "proposed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(18,6) NOT NULL,
    "transaction_hash" TEXT,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_personal_number_hash_key" ON "users"("personal_number_hash");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "creditors_organization_number_key" ON "creditors"("organization_number");

-- CreateIndex
CREATE UNIQUE INDEX "gdpr_requests_reference_id_key" ON "gdpr_requests"("reference_id");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_debts_user_id" ON "debts"("user_id");

-- CreateIndex
CREATE INDEX "idx_gdpr_requests_user_id" ON "gdpr_requests"("user_id");

-- CreateIndex
CREATE INDEX "idx_violations_severity" ON "violations"("severity");

-- CreateIndex
CREATE INDEX "idx_settlements_status" ON "settlements"("status");

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debts" ADD CONSTRAINT "debts_creditor_id_fkey" FOREIGN KEY ("creditor_id") REFERENCES "creditors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gdpr_requests" ADD CONSTRAINT "gdpr_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gdpr_requests" ADD CONSTRAINT "gdpr_requests_creditor_id_fkey" FOREIGN KEY ("creditor_id") REFERENCES "creditors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gdpr_responses" ADD CONSTRAINT "gdpr_responses_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "gdpr_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_gdpr_request_id_fkey" FOREIGN KEY ("gdpr_request_id") REFERENCES "gdpr_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_creditor_id_fkey" FOREIGN KEY ("creditor_id") REFERENCES "creditors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_debt_id_fkey" FOREIGN KEY ("debt_id") REFERENCES "debts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;