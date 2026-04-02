import pool from './database.js';

/**
 * Initialize database tables
 * Run this on first deployment
 */
export const initializeDatabase = async () => {
  try {
    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER DEFAULT 0,
        images TEXT[] DEFAULT ARRAY[]::TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        location VARCHAR(255),
        items JSONB NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(255) PRIMARY KEY,
        order_reference VARCHAR(255) NOT NULL,
        payment_reference VARCHAR(255),
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'TZS',
        status VARCHAR(50) DEFAULT 'pending',
        customer_name VARCHAR(255),
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        channel VARCHAR(50),
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create pending orders table (temporary storage during payment)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_orders (
        order_reference VARCHAR(255) PRIMARY KEY,
        cart_items JSONB NOT NULL,
        customer_address VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * Insert default products if table is empty
 */
export const seedDefaultProducts = async () => {
  try {
    // Check if products exist
    const result = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(result.rows[0].count) > 0) {
      console.log('Products already exist in database');
      return;
    }

    const defaultProducts = [
      {
        name: 'Wireless Earbuds Pro',
        description: 'Noise-cancelling Bluetooth 5.3 earbuds with 30h battery life and IPX5 water resistance.',
        price: 49.99,
        stock: 142,
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
        ],
      },
      {
        name: 'Organic Green Tea',
        description: 'Premium loose-leaf green tea sourced from high-altitude farms. 100% natural, no additives.',
        price: 12.5,
        stock: 8,
        images: [
          'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1598318397876-e5b03cb13271?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        ],
      },
      {
        name: 'Smart Watch Series X',
        description: 'Health tracking smartwatch with ECG, SpO2, GPS, and a 7-day battery. Aluminum case.',
        price: 199.0,
        stock: 0,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1523288102202-5e614e6b4f68?w=400&h=400&fit=crop',
        ],
      },
      {
        name: 'Running Shoes Air V2',
        description: 'Lightweight running shoes with responsive cushioning and breathable mesh upper.',
        price: 84.99,
        stock: 56,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        ],
      },
      {
        name: 'Stainless Steel Bottle',
        description: 'Durable insulated water bottle keeps drinks cold for 24h or hot for 12h.',
        price: 22.0,
        stock: 5,
        images: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e9?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1602143407151-7111542de6e9?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1602143407151-7111542de6e9?w=400&h=400&fit=crop',
        ],
      },
      {
        name: 'USB-C Hub 7-in-1',
        description: '7-in-1 multi-port USB-C hub with charging, HDMI, SD card reader, and 3x USB 3.0.',
        price: 37.99,
        stock: 88,
        images: [
          'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop',
        ],
      },
      {
        name: 'Yoga Mat Premium',
        description: 'Non-slip eco-friendly yoga mat with carrying strap. 6mm thickness for comfort.',
        price: 35.0,
        stock: 23,
        images: [
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
        ],
      },
    ];

    for (const product of defaultProducts) {
      await pool.query(
        'INSERT INTO products (name, description, price, stock, images) VALUES ($1, $2, $3, $4, $5)',
        [product.name, product.description, product.price, product.stock, product.images]
      );
    }

    console.log(`✅ Seeded ${defaultProducts.length} default products`);
  } catch (error) {
    console.error('Error seeding default products:', error);
  }
};

export default { initializeDatabase, seedDefaultProducts };
