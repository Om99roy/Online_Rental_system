/*
  Warnings:

  - You are about to alter the column `role` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `organizationId` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `profileImageUrl` VARCHAR(191) NULL,
    MODIFY `role` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE `Organization` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `logoUrl` VARCHAR(191) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrganizationSettings` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `defaultDepositType` ENUM('FIXED', 'PERCENTAGE') NOT NULL DEFAULT 'FIXED',
    `defaultDepositValue` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `lateFeeEnabled` BOOLEAN NOT NULL DEFAULT true,
    `lateFeeType` ENUM('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY') NOT NULL DEFAULT 'DAILY',
    `lateFeeValue` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `gracePeriodMinutes` INTEGER NOT NULL DEFAULT 0,
    `maximumLateFee` DECIMAL(10, 2) NULL,
    `allowOnlinePayment` BOOLEAN NOT NULL DEFAULT true,
    `allowStorePickup` BOOLEAN NOT NULL DEFAULT true,
    `allowDelivery` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OrganizationSettings_organizationId_key`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `addressLine1` VARCHAR(191) NOT NULL,
    `addressLine2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `postalCode` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'India',
    `phone` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Address_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NULL,
    `qrCode` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `brand` VARCHAR(191) NULL,
    `manufacturer` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED') NOT NULL DEFAULT 'ACTIVE',
    `stock` INTEGER NOT NULL DEFAULT 1,
    `securityDeposit` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Product_organizationId_idx`(`organizationId`),
    INDEX `Product_status_idx`(`status`),
    INDEX `Product_category_idx`(`category`),
    INDEX `Product_barcode_idx`(`barcode`),
    UNIQUE INDEX `Product_organizationId_sku_key`(`organizationId`, `sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductVariant` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NULL,
    `manufacturer` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `sku` VARCHAR(191) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductVariant_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RentalPeriod` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `duration` INTEGER NOT NULL,
    `unit` ENUM('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY') NOT NULL,
    `description` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RentalPeriod_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceList` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `validFrom` DATETIME(3) NULL,
    `validTo` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PriceList_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceListItem` (
    `id` VARCHAR(191) NOT NULL,
    `priceListId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `rentalPeriodId` VARCHAR(191) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PriceListItem_priceListId_idx`(`priceListId`),
    INDEX `PriceListItem_productId_idx`(`productId`),
    UNIQUE INDEX `PriceListItem_priceListId_productId_rentalPeriodId_key`(`priceListId`, `productId`, `rentalPeriodId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rental` (
    `id` VARCHAR(191) NOT NULL,
    `rentalNumber` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `actualPickupAt` DATETIME(3) NULL,
    `actualReturnAt` DATETIME(3) NULL,
    `pickupMethod` ENUM('DELIVERY', 'STORE_PICKUP') NOT NULL DEFAULT 'STORE_PICKUP',
    `deliveryAddressId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PENDING', 'CONFIRMED', 'READY_FOR_PICKUP', 'PICKED_UP', 'ACTIVE', 'OVERDUE', 'RETURNED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `tax` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `securityDeposit` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `lateFee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `refundAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Rental_rentalNumber_key`(`rentalNumber`),
    INDEX `Rental_organizationId_idx`(`organizationId`),
    INDEX `Rental_customerId_idx`(`customerId`),
    INDEX `Rental_status_idx`(`status`),
    INDEX `Rental_startDate_idx`(`startDate`),
    INDEX `Rental_endDate_idx`(`endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RentalItem` (
    `id` VARCHAR(191) NOT NULL,
    `rentalId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `pricePerUnit` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RentalItem_rentalId_idx`(`rentalId`),
    INDEX `RentalItem_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `rentalId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `method` ENUM('CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'ONLINE') NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `transactionId` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Payment_rentalId_idx`(`rentalId`),
    INDEX `Payment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SecurityDeposit` (
    `id` VARCHAR(191) NOT NULL,
    `rentalId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `deductedAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `refundedAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'HELD', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FORFEITED') NOT NULL DEFAULT 'PENDING',
    `collectedAt` DATETIME(3) NULL,
    `settledAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SecurityDeposit_rentalId_key`(`rentalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pickup` (
    `id` VARCHAR(191) NOT NULL,
    `rentalId` VARCHAR(191) NOT NULL,
    `scheduledAt` DATETIME(3) NULL,
    `status` ENUM('SCHEDULED', 'READY', 'PICKED_UP', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `confirmedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Pickup_rentalId_key`(`rentalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Return` (
    `id` VARCHAR(191) NOT NULL,
    `rentalId` VARCHAR(191) NOT NULL,
    `scheduledAt` DATETIME(3) NULL,
    `returnedAt` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'INSPECTING', 'COMPLETED', 'DAMAGED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `condition` ENUM('GOOD', 'DAMAGED', 'MISSING_ACCESSORIES', 'REPAIR_REQUIRED') NULL,
    `damageNotes` TEXT NULL,
    `missingAccessories` TEXT NULL,
    `lateByMinutes` INTEGER NOT NULL DEFAULT 0,
    `lateFee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Return_rentalId_key`(`rentalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DamageReport` (
    `id` VARCHAR(191) NOT NULL,
    `returnId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `type` ENUM('DAMAGE', 'MISSING_ACCESSORY', 'LOSS', 'REPAIR') NOT NULL,
    `description` TEXT NULL,
    `repairCost` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `resolved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DamageReport_returnId_idx`(`returnId`),
    INDEX `DamageReport_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `rentalId` VARCHAR(191) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `tax` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_PAID', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `issuedAt` DATETIME(3) NULL,
    `dueAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Invoice_invoiceNumber_key`(`invoiceNumber`),
    UNIQUE INDEX `Invoice_rentalId_key`(`rentalId`),
    INDEX `Invoice_organizationId_idx`(`organizationId`),
    INDEX `Invoice_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quotation` (
    `id` VARCHAR(191) NOT NULL,
    `quotationNumber` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `rentalId` VARCHAR(191) NULL,
    `templateId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `validUntil` DATETIME(3) NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `tax` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(10, 2) NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Quotation_quotationNumber_key`(`quotationNumber`),
    UNIQUE INDEX `Quotation_rentalId_key`(`rentalId`),
    INDEX `Quotation_organizationId_idx`(`organizationId`),
    INDEX `Quotation_customerId_idx`(`customerId`),
    INDEX `Quotation_createdById_idx`(`createdById`),
    INDEX `Quotation_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuotationItem` (
    `id` VARCHAR(191) NOT NULL,
    `quotationId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `rentalDays` INTEGER NOT NULL DEFAULT 1,
    `pricePerUnit` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    INDEX `QuotationItem_quotationId_idx`(`quotationId`),
    INDEX `QuotationItem_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuotationTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `header` TEXT NULL,
    `footer` TEXT NULL,
    `termsAndConditions` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `QuotationTemplate_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('RENTAL_CONFIRMED', 'PICKUP_REMINDER', 'RETURN_REMINDER', 'OVERDUE', 'PAYMENT', 'DEPOSIT', 'SYSTEM') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_read_idx`(`read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `User_organizationId_idx` ON `User`(`organizationId`);

-- CreateIndex
CREATE INDEX `User_role_idx` ON `User`(`role`);

-- CreateIndex
CREATE INDEX `User_status_idx` ON `User`(`status`);

-- AddForeignKey
ALTER TABLE `OrganizationSettings` ADD CONSTRAINT `OrganizationSettings_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductVariant` ADD CONSTRAINT `ProductVariant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RentalPeriod` ADD CONSTRAINT `RentalPeriod_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceList` ADD CONSTRAINT `PriceList_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceListItem` ADD CONSTRAINT `PriceListItem_priceListId_fkey` FOREIGN KEY (`priceListId`) REFERENCES `PriceList`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceListItem` ADD CONSTRAINT `PriceListItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceListItem` ADD CONSTRAINT `PriceListItem_rentalPeriodId_fkey` FOREIGN KEY (`rentalPeriodId`) REFERENCES `RentalPeriod`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rental` ADD CONSTRAINT `Rental_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rental` ADD CONSTRAINT `Rental_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rental` ADD CONSTRAINT `Rental_deliveryAddressId_fkey` FOREIGN KEY (`deliveryAddressId`) REFERENCES `Address`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RentalItem` ADD CONSTRAINT `RentalItem_rentalId_fkey` FOREIGN KEY (`rentalId`) REFERENCES `Rental`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RentalItem` ADD CONSTRAINT `RentalItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_rentalId_fkey` FOREIGN KEY (`rentalId`) REFERENCES `Rental`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SecurityDeposit` ADD CONSTRAINT `SecurityDeposit_rentalId_fkey` FOREIGN KEY (`rentalId`) REFERENCES `Rental`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pickup` ADD CONSTRAINT `Pickup_rentalId_fkey` FOREIGN KEY (`rentalId`) REFERENCES `Rental`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Return` ADD CONSTRAINT `Return_rentalId_fkey` FOREIGN KEY (`rentalId`) REFERENCES `Rental`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DamageReport` ADD CONSTRAINT `DamageReport_returnId_fkey` FOREIGN KEY (`returnId`) REFERENCES `Return`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DamageReport` ADD CONSTRAINT `DamageReport_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_rentalId_fkey` FOREIGN KEY (`rentalId`) REFERENCES `Rental`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_rentalId_fkey` FOREIGN KEY (`rentalId`) REFERENCES `Rental`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quotation` ADD CONSTRAINT `Quotation_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `QuotationTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuotationItem` ADD CONSTRAINT `QuotationItem_quotationId_fkey` FOREIGN KEY (`quotationId`) REFERENCES `Quotation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuotationItem` ADD CONSTRAINT `QuotationItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuotationTemplate` ADD CONSTRAINT `QuotationTemplate_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
