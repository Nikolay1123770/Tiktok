-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  telegram_id BIGINT UNIQUE,
  username VARCHAR(255),
  password_hash VARCHAR(255),
  subscription VARCHAR(50) DEFAULT 'free',
  videos_left INTEGER DEFAULT 1,
  subscription_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Videos table
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  original_filename VARCHAR(255),
  processed_filename VARCHAR(255),
  file_size BIGINT,
  duration FLOAT,
  status VARCHAR(50) DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'RUB',
  status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(255) UNIQUE,
  subscription_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_telegram ON users(telegram_id);
CREATE INDEX idx_videos_user ON videos(user_id);
CREATE INDEX idx_payments_user ON payments(user_id);