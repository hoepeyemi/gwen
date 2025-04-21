-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('GBP', 'USD', 'EUR', 'CNY', 'MXN', 'CAD', 'PHP');

-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('CRYPTO', 'FIAT');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hashedPin" TEXT,
    "email" TEXT,
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "assignedGAddress" TEXT,
    "passkeyCAddress" TEXT,
    "passkeyKey" TEXT,
    "phone" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT,
    "publicKey" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYC" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "authSessionId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sep12Id" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "email_address" TEXT,
    "bank_account_number" TEXT,
    "bank_number" TEXT,
    "photo_id_front" BYTEA,
    "photo_id_back" BYTEA,
    "phone_number" TEXT,
    "address" TEXT,
    "photo_id_front_type" TEXT,
    "photo_id_back_type" TEXT,

    CONSTRAINT "KYC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostedDeposits" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "destinationAsset" TEXT NOT NULL,
    "sourceAsset" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "authSessionId" INTEGER,
    "sep6Id" TEXT,

    CONSTRAINT "HostedDeposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostedWithdrawals" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "destinationAsset" TEXT NOT NULL,
    "sourceAsset" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "roting_number" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "authSessionId" INTEGER,
    "sep6Id" TEXT,

    CONSTRAINT "HostedWithdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" "Currency" NOT NULL,
    "currencyType" "CurrencyType" NOT NULL,
    "senderId" INTEGER,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "recipientPhone" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientCountry" TEXT,
    "senderAuthSessionId" INTEGER,
    "receiverAuthSessionId" INTEGER,
    "recipientAddress" TEXT,
    "recipientBankName" TEXT,
    "recipientBankAddress" TEXT,
    "recipientAccountNumber" TEXT,
    "recipientIBAN" TEXT,
    "recipientSWIFTBIC" TEXT,
    "recipientRoutingNumber" TEXT,
    "recipientTransitNumber" TEXT,
    "recipientSortCode" TEXT,
    "recipientCLABE" TEXT,
    "oTPVerificationId" INTEGER,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTPVerification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "otpCode" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OTPVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" SERIAL NOT NULL,
    "contact" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isEmail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "assigned_g_address_idx" ON "User"("assignedGAddress");

-- CreateIndex
CREATE INDEX "passkey_c_address_idx" ON "User"("passkeyCAddress");

-- CreateIndex
CREATE INDEX "user_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "kyc_user_idx" ON "KYC"("userId");

-- CreateIndex
CREATE INDEX "hosted_deposits_user_idx" ON "HostedDeposits"("userId");

-- CreateIndex
CREATE INDEX "hosted_deposits_transfer_idx" ON "HostedDeposits"("transferId");

-- CreateIndex
CREATE INDEX "hosted_withdrawals_user_idx" ON "HostedWithdrawals"("userId");

-- CreateIndex
CREATE INDEX "hosted_withdrawals_transfer_idx" ON "HostedWithdrawals"("transferId");

-- CreateIndex
CREATE INDEX "sender_idx" ON "Transfer"("senderId");

-- CreateIndex
CREATE INDEX "sender_auth_session_idx" ON "Transfer"("senderAuthSessionId");

-- CreateIndex
CREATE INDEX "receiver_auth_session_idx" ON "Transfer"("receiverAuthSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "OTPVerification_userId_key" ON "OTPVerification"("userId");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_authSessionId_fkey" FOREIGN KEY ("authSessionId") REFERENCES "AuthSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostedDeposits" ADD CONSTRAINT "HostedDeposits_authSessionId_fkey" FOREIGN KEY ("authSessionId") REFERENCES "AuthSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostedDeposits" ADD CONSTRAINT "HostedDeposits_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostedDeposits" ADD CONSTRAINT "HostedDeposits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostedWithdrawals" ADD CONSTRAINT "HostedWithdrawals_authSessionId_fkey" FOREIGN KEY ("authSessionId") REFERENCES "AuthSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostedWithdrawals" ADD CONSTRAINT "HostedWithdrawals_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostedWithdrawals" ADD CONSTRAINT "HostedWithdrawals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_oTPVerificationId_fkey" FOREIGN KEY ("oTPVerificationId") REFERENCES "OTPVerification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTPVerification" ADD CONSTRAINT "OTPVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
