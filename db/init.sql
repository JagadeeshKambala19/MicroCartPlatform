CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

CREATE USER IF NOT EXISTS 'app'@'%' IDENTIFIED BY 'app_password';
GRANT ALL PRIVILEGES ON ecommerce.* TO 'app'@'%';
FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_cart_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

INSERT INTO products (name, description, price, image_url) VALUES
  ('iPhone Pro (Sample)', 'A stunning, minimalist phone experience with pro-grade performance.', 999.00, '/images/iphone.svg'),
  ('MacBook Air (Sample)', 'Ultra-light, ultra-capable laptop for work and creativity.', 1299.00, '/images/macbook.svg'),
  ('Apple Watch (Sample)', 'Health, fitness, and notifications with a refined feel.', 399.00, '/images/watch.svg'),
  ('AirPods Pro (Sample)', 'Immersive sound with noise cancellation in a tiny form.', 249.00, '/images/airpods.svg'),
  ('iPad Pro (Sample)', 'A powerful canvas for ideas, sketching, and multitasking.', 799.00, '/images/ipad.svg');

