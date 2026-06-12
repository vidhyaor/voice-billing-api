-- Categories: add timestamps
ALTER TABLE `categories`
  ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD COLUMN `description` TEXT NULL,
  ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

-- Customers: rename balance column
ALTER TABLE `customers` ADD COLUMN `outstanding_balance` DECIMAL(12, 2) NOT NULL DEFAULT 0;
UPDATE `customers` SET `outstanding_balance` = `current_balance`;
ALTER TABLE `customers` DROP COLUMN `current_balance`;

-- Invoice items: rename price to unit_price
ALTER TABLE `invoice_items` ADD COLUMN `unit_price` DECIMAL(12, 2) NULL;
UPDATE `invoice_items` SET `unit_price` = `price`;
ALTER TABLE `invoice_items`
  MODIFY `unit_price` DECIMAL(12, 2) NOT NULL,
  DROP COLUMN `price`;

-- Invoices: add status, update payment type enum
ALTER TABLE `invoices`
  ADD COLUMN `status` ENUM('DRAFT', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT';

UPDATE `invoices` SET `payment_type` = 'CASH' WHERE `payment_type` = 'BANK_TRANSFER';

ALTER TABLE `invoices`
  MODIFY `payment_type` ENUM('CASH', 'CARD', 'UPI', 'CREDIT') NOT NULL;

-- Payments: default payment date
ALTER TABLE `payments`
  MODIFY `payment_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Products: remove JSON aliases, change unit to varchar
ALTER TABLE `products` DROP COLUMN `aliases`;
ALTER TABLE `products`
  MODIFY `unit` VARCHAR(50) NOT NULL DEFAULT 'PIECE';

-- Users: active flag for auth
ALTER TABLE `users` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;

-- Refresh tokens for auth module
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `token_hash` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_token_hash_key`(`token_hash`),
    INDEX `refresh_tokens_user_id_idx`(`user_id`),
    INDEX `refresh_tokens_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `product_aliases` (
    `id` VARCHAR(191) NOT NULL,
    `alias` VARCHAR(191) NOT NULL,
    `usage_count` INTEGER NOT NULL DEFAULT 0,
    `product_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `product_aliases_product_id_idx`(`product_id`),
    UNIQUE INDEX `product_aliases_alias_key`(`alias`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `voice_learnings` (
    `id` VARCHAR(191) NOT NULL,
    `phrase` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `usage_count` INTEGER NOT NULL DEFAULT 0,
    `last_used_at` DATETIME(3) NULL,

    UNIQUE INDEX `voice_learnings_phrase_key`(`phrase`),
    INDEX `voice_learnings_product_id_idx`(`product_id`),
    INDEX `voice_learnings_last_used_at_idx`(`last_used_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `customers_outstanding_balance_idx` ON `customers`(`outstanding_balance`);
CREATE INDEX `invoices_status_idx` ON `invoices`(`status`);
CREATE INDEX `invoices_payment_type_idx` ON `invoices`(`payment_type`);
CREATE INDEX `users_is_active_idx` ON `users`(`is_active`);

ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `product_aliases` ADD CONSTRAINT `product_aliases_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `voice_learnings` ADD CONSTRAINT `voice_learnings_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
