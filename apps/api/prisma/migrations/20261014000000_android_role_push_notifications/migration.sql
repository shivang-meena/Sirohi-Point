CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE "PushAppKind" AS ENUM ('CUSTOMER_APP', 'B2B_APP');
CREATE TYPE "PushAudience" AS ENUM ('CUSTOMER', 'B2B');
CREATE TYPE "PushCampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'QUEUED', 'SENDING', 'SENT', 'PARTIALLY_SENT', 'FAILED', 'NO_RECIPIENTS', 'CANCELLED', 'EXPIRED');
CREATE TYPE "PushDeliveryStatus" AS ENUM ('PENDING', 'ACCEPTED', 'FAILED', 'SKIPPED');

CREATE TABLE "PushDevice" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(), "userId" UUID, "installationId" UUID NOT NULL,
  "appKind" "PushAppKind" NOT NULL, "platform" TEXT NOT NULL DEFAULT 'ANDROID', "token" TEXT,
  "permissionGranted" BOOLEAN NOT NULL DEFAULT false, "active" BOOLEAN NOT NULL DEFAULT false,
  "revocationSecretHash" TEXT NOT NULL, "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PushDevice_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PushCampaign" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(), "requestId" UUID NOT NULL, "requestHash" TEXT NOT NULL,
  "title" TEXT NOT NULL, "body" TEXT NOT NULL, "audience" "PushAudience" NOT NULL,
  "status" "PushCampaignStatus" NOT NULL DEFAULT 'DRAFT', "version" INTEGER NOT NULL DEFAULT 1,
  "scheduledAt" TIMESTAMP(3), "expiresAt" TIMESTAMP(3), "queuedAt" TIMESTAMP(3), "snapshotAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "cancelledAt" TIMESTAMP(3), "createdById" UUID, "updatedById" UUID,
  "targetCount" INTEGER NOT NULL DEFAULT 0, "acceptedCount" INTEGER NOT NULL DEFAULT 0, "failedCount" INTEGER NOT NULL DEFAULT 0, "skippedCount" INTEGER NOT NULL DEFAULT 0,
  "leaseOwner" TEXT, "leaseUntil" TIMESTAMP(3), "lastErrorCode" TEXT, "lastErrorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PushCampaign_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PushDelivery" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(), "campaignId" UUID NOT NULL, "deviceId" UUID NOT NULL, "recipientUserId" UUID NOT NULL, "tokenHash" TEXT NOT NULL,
  "status" "PushDeliveryStatus" NOT NULL DEFAULT 'PENDING', "attemptCount" INTEGER NOT NULL DEFAULT 0, "nextAttemptAt" TIMESTAMP(3), "acceptedAt" TIMESTAMP(3), "fcmMessageId" TEXT, "errorCode" TEXT, "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PushDelivery_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PushDevice_token_key" ON "PushDevice"("token");
CREATE UNIQUE INDEX "PushDevice_appKind_installationId_key" ON "PushDevice"("appKind", "installationId");
CREATE INDEX "PushDevice_userId_active_appKind_idx" ON "PushDevice"("userId", "active", "appKind");
CREATE INDEX "PushDevice_lastSeenAt_idx" ON "PushDevice"("lastSeenAt");
CREATE UNIQUE INDEX "PushCampaign_requestId_key" ON "PushCampaign"("requestId");
CREATE INDEX "PushCampaign_status_scheduledAt_idx" ON "PushCampaign"("status", "scheduledAt");
CREATE INDEX "PushCampaign_status_leaseUntil_idx" ON "PushCampaign"("status", "leaseUntil");
CREATE INDEX "PushCampaign_createdAt_idx" ON "PushCampaign"("createdAt");
CREATE UNIQUE INDEX "PushDelivery_campaignId_deviceId_key" ON "PushDelivery"("campaignId", "deviceId");
CREATE INDEX "PushDelivery_campaignId_status_nextAttemptAt_idx" ON "PushDelivery"("campaignId", "status", "nextAttemptAt");
ALTER TABLE "PushDevice" ADD CONSTRAINT "PushDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PushCampaign" ADD CONSTRAINT "PushCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PushCampaign" ADD CONSTRAINT "PushCampaign_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PushDelivery" ADD CONSTRAINT "PushDelivery_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PushCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PushDelivery" ADD CONSTRAINT "PushDelivery_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "PushDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
