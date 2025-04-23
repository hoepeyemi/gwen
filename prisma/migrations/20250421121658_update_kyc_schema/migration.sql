/*
  Warnings:

  - The values [CNY,CAD,PHP] on the enum `Currency` will be removed. If these variants are still used in the database, this will fail.
  - The values [CRYPTO] on the enum `CurrencyType` will be removed. If these variants are still used in the database, this will fail.
  - The values [APPROVED,DECLINED,FAILED] on the enum `TransferStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Currency_new" AS ENUM ('USD', 'EUR', 'GBP', 'MXN');
ALTER TABLE "Transfer" ALTER COLUMN "currency" TYPE "Currency_new" USING ("currency"::text::"Currency_new");
ALTER TYPE "Currency" RENAME TO "Currency_old";
ALTER TYPE "Currency_new" RENAME TO "Currency";
DROP TYPE "Currency_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CurrencyType_new" AS ENUM ('FIAT');
ALTER TABLE "Transfer" ALTER COLUMN "currencyType" TYPE "CurrencyType_new" USING ("currencyType"::text::"CurrencyType_new");
ALTER TYPE "CurrencyType" RENAME TO "CurrencyType_old";
ALTER TYPE "CurrencyType_new" RENAME TO "CurrencyType";
DROP TYPE "CurrencyType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransferStatus_new" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Transfer" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Transfer" ALTER COLUMN "status" TYPE "TransferStatus_new" USING ("status"::text::"TransferStatus_new");
ALTER TYPE "TransferStatus" RENAME TO "TransferStatus_old";
ALTER TYPE "TransferStatus_new" RENAME TO "TransferStatus";
DROP TYPE "TransferStatus_old";
ALTER TABLE "Transfer" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
