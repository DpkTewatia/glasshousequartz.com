-- GlasshouseQuartz — MySQL schema
--
-- Conventions
--   * Money is INT UNSIGNED, always in cents. Never FLOAT, never DECIMAL-as-float.
--   * Handles are the natural keys; they are what appears in URLs.
--   * utf8mb4 throughout so product titles keep punctuation and symbols.
--
-- Apply:  npm run db:setup
-- Requires MySQL 8.0+ (uses JSON columns and functional defaults).

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------- catalog

CREATE TABLE IF NOT EXISTS collections (
  handle          VARCHAR(120)  NOT NULL,
  title           VARCHAR(200)  NOT NULL,
  `group`         VARCHAR(80)   NOT NULL DEFAULT '',
  description     TEXT          NULL,
  image           VARCHAR(600)  NULL,
  sort_order      INT           NOT NULL DEFAULT 0,
  product_count   INT UNSIGNED  NOT NULL DEFAULT 0,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (handle),
  KEY idx_collections_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  handle            VARCHAR(180)  NOT NULL,
  title             VARCHAR(300)  NOT NULL,
  brand             VARCHAR(80)   NOT NULL DEFAULT 'Glasshouse',
  description       TEXT          NULL,
  description_html  MEDIUMTEXT    NULL,
  price_min         INT UNSIGNED  NULL,
  price_max         INT UNSIGNED  NULL,
  available         TINYINT(1)    NOT NULL DEFAULT 1,
  published_at      DATETIME      NULL,
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (handle),
  KEY idx_products_brand (brand),
  KEY idx_products_price (price_min),
  KEY idx_products_available (available),
  KEY idx_products_published (published_at),
  FULLTEXT KEY ft_products (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_images (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_handle  VARCHAR(180)  NOT NULL,
  src             VARCHAR(600)  NOT NULL,
  alt             VARCHAR(400)  NULL,
  width           INT UNSIGNED  NULL,
  height          INT UNSIGNED  NULL,
  position        INT           NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_images_product (product_handle, position),
  CONSTRAINT fk_images_product FOREIGN KEY (product_handle)
    REFERENCES products (handle) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_options (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_handle  VARCHAR(180)  NOT NULL,
  name            VARCHAR(120)  NOT NULL,
  values_json     JSON          NOT NULL,
  position        INT           NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_options_product (product_handle, position),
  CONSTRAINT fk_options_product FOREIGN KEY (product_handle)
    REFERENCES products (handle) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_variants (
  id                VARCHAR(64)   NOT NULL,
  product_handle    VARCHAR(180)  NOT NULL,
  sku               VARCHAR(120)  NULL,
  title             VARCHAR(300)  NOT NULL,
  price             INT UNSIGNED  NOT NULL,
  compare_at_price  INT UNSIGNED  NULL,
  available         TINYINT(1)    NOT NULL DEFAULT 1,
  option1           VARCHAR(200)  NULL,
  option2           VARCHAR(200)  NULL,
  option3           VARCHAR(200)  NULL,
  position          INT           NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_variants_product (product_handle, position),
  KEY idx_variants_sku (sku),
  CONSTRAINT fk_variants_product FOREIGN KEY (product_handle)
    REFERENCES products (handle) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_collections (
  product_handle     VARCHAR(180) NOT NULL,
  collection_handle  VARCHAR(120) NOT NULL,
  position           INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (product_handle, collection_handle),
  KEY idx_pc_collection (collection_handle, position),
  CONSTRAINT fk_pc_product FOREIGN KEY (product_handle)
    REFERENCES products (handle) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pc_collection FOREIGN KEY (collection_handle)
    REFERENCES collections (handle) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_tags (
  product_handle  VARCHAR(180) NOT NULL,
  tag             VARCHAR(120) NOT NULL,
  PRIMARY KEY (product_handle, tag),
  KEY idx_tags_tag (tag),
  CONSTRAINT fk_tags_product FOREIGN KEY (product_handle)
    REFERENCES products (handle) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- cart

CREATE TABLE IF NOT EXISTS carts (
  id          CHAR(36)    NOT NULL,
  created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_carts_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cart_lines (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cart_id         CHAR(36)      NOT NULL,
  variant_id      VARCHAR(64)   NOT NULL,
  product_handle  VARCHAR(180)  NOT NULL,
  quantity        INT UNSIGNED  NOT NULL DEFAULT 1,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cart_variant (cart_id, variant_id),
  KEY idx_lines_cart (cart_id),
  CONSTRAINT fk_lines_cart FOREIGN KEY (cart_id)
    REFERENCES carts (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- orders
--
-- Line prices are COPIED here at purchase time, never joined from the live
-- catalog. An order must stay truthful about what was charged even after the
-- product is repriced or deleted.

CREATE TABLE IF NOT EXISTS orders (
  id                CHAR(36)      NOT NULL,
  order_number      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email             VARCHAR(320)  NOT NULL,
  status            ENUM('pending','paid','fulfilled','cancelled','refunded')
                                  NOT NULL DEFAULT 'pending',
  subtotal          INT UNSIGNED  NOT NULL DEFAULT 0,
  shipping_total    INT UNSIGNED  NOT NULL DEFAULT 0,
  tax_total         INT UNSIGNED  NOT NULL DEFAULT 0,
  grand_total       INT UNSIGNED  NOT NULL DEFAULT 0,
  currency          CHAR(3)       NOT NULL DEFAULT 'USD',
  -- Set by the payment provider adapter; see src/lib/payments.ts.
  payment_provider  VARCHAR(40)   NULL,
  payment_intent_id VARCHAR(190)  NULL,
  shipping_address  JSON          NULL,
  billing_address   JSON          NULL,
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_order_number (order_number),
  UNIQUE KEY uq_payment_intent (payment_intent_id),
  KEY idx_orders_email (email),
  KEY idx_orders_status (status, created_at)
) ENGINE=InnoDB AUTO_INCREMENT=1001 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_lines (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id        CHAR(36)      NOT NULL,
  variant_id      VARCHAR(64)   NOT NULL,
  product_handle  VARCHAR(180)  NOT NULL,
  product_title   VARCHAR(300)  NOT NULL,
  variant_title   VARCHAR(300)  NOT NULL,
  unit_price      INT UNSIGNED  NOT NULL,
  quantity        INT UNSIGNED  NOT NULL,
  line_total      INT UNSIGNED  NOT NULL,
  PRIMARY KEY (id),
  KEY idx_order_lines_order (order_id),
  CONSTRAINT fk_order_lines_order FOREIGN KEY (order_id)
    REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------- marketing

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email        VARCHAR(320) NOT NULL,
  source       VARCHAR(60)  NOT NULL DEFAULT 'footer',
  confirmed    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contact_messages (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(200) NOT NULL,
  email       VARCHAR(320) NOT NULL,
  subject     VARCHAR(300) NULL,
  message     TEXT         NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contact_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
