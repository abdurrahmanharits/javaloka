CREATE TABLE `users` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  `email_verified_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `users_email_key`(`email`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `products` (
  `id` INTEGER NOT NULL AUTO_INCREMENT, `name` VARCHAR(255) NOT NULL, `sku` VARCHAR(255) NOT NULL,
  `origin` VARCHAR(255) NOT NULL, `roast_level` VARCHAR(255) NOT NULL, `description_id` TEXT NOT NULL,
  `description_en` TEXT NOT NULL, `price` DECIMAL(15,2) NOT NULL, `weight` VARCHAR(255) NOT NULL,
  `tasting_notes` JSON NOT NULL, `image_path` VARCHAR(2048) NULL, `type` VARCHAR(255) NOT NULL DEFAULT 'single-origin',
  `stock` DECIMAL(12,2) NOT NULL DEFAULT 0, `reserved_stock` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `low_stock_threshold` DECIMAL(12,2) NOT NULL DEFAULT 5, `is_active` BOOLEAN NOT NULL DEFAULT true,
  `is_featured` BOOLEAN NOT NULL DEFAULT false, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL, UNIQUE INDEX `products_sku_key`(`sku`), PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `stock_movements` (
  `id` INTEGER NOT NULL AUTO_INCREMENT, `product_id` INTEGER NOT NULL, `type` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(12,2) NOT NULL, `stock_before` DECIMAL(12,2) NOT NULL, `stock_after` DECIMAL(12,2) NOT NULL,
  `reserved_before` DECIMAL(12,2) NOT NULL DEFAULT 0, `reserved_after` DECIMAL(12,2) NOT NULL DEFAULT 0,
  `reference` VARCHAR(255) NULL, `note` VARCHAR(255) NULL, `metadata` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updated_at` DATETIME(3) NOT NULL,
  INDEX `stock_movements_product_id_created_at_idx`(`product_id`, `created_at`), INDEX `stock_movements_type_idx`(`type`),
  PRIMARY KEY (`id`), CONSTRAINT `stock_movements_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
