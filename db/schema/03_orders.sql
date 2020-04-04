DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
  id SERIAL PRIMARY KEY NOT NULL,

  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,

  order_date TEXT NOT NULL,
  order_time TEXT NOT NULL,
  order_quantity INTEGER DEFAULT 1,

  is_payment_correct BOOLEAN NOT NULL DEFAULT TRUE,
  is_order_complete BOOLEAN NOT NULL DEFAULT FALSE
);
