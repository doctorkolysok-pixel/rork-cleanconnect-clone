import Database from "better-sqlite3";

console.log("🔄 Запуск миграции базы данных...");

try {
  const sqlite = new Database("tazago.db");
  
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL DEFAULT 'client',
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT,
      rating REAL NOT NULL DEFAULT 5.0,
      balance REAL NOT NULL DEFAULT 0,
      clean_points INTEGER NOT NULL DEFAULT 50,
      level INTEGER NOT NULL DEFAULT 1,
      completed_orders INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cleaner_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      business_name TEXT NOT NULL,
      address TEXT NOT NULL,
      description TEXT,
      is_eco INTEGER NOT NULL DEFAULT 0,
      tier TEXT NOT NULL DEFAULT 'novice',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      category TEXT NOT NULL,
      photos TEXT NOT NULL,
      comment TEXT NOT NULL,
      address TEXT NOT NULL,
      price_offer REAL NOT NULL,
      urgency TEXT NOT NULL DEFAULT 'standard',
      status TEXT NOT NULL DEFAULT 'new',
      chosen_cleaner_id TEXT,
      partner_id TEXT REFERENCES users(id),
      courier_id TEXT REFERENCES users(id),
      ai_analysis TEXT,
      commission TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS offers (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      cleaner_id TEXT NOT NULL REFERENCES users(id),
      proposed_price REAL NOT NULL,
      comment TEXT NOT NULL,
      eta TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      from_id TEXT NOT NULL REFERENCES users(id),
      to_id TEXT NOT NULL REFERENCES users(id),
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      cleaner_id TEXT NOT NULL REFERENCES users(id),
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      photos TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS charity_orders (
      id TEXT PRIMARY KEY,
      donor_id TEXT NOT NULL REFERENCES users(id),
      recipient_name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS partner_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      business_name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      description TEXT,
      services TEXT NOT NULL,
      working_hours TEXT,
      is_verified INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      visibility_rating REAL NOT NULL DEFAULT 100,
      total_earnings REAL NOT NULL DEFAULT 0,
      latitude REAL,
      longitude REAL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS partner_services (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL REFERENCES users(id),
      service_name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      estimated_time TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      price_quality_indicator TEXT NOT NULL DEFAULT 'optimal',
      avg_market_price REAL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courier_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      vehicle_type TEXT NOT NULL,
      city TEXT NOT NULL,
      is_online INTEGER NOT NULL DEFAULT 0,
      is_verified INTEGER NOT NULL DEFAULT 0,
      current_latitude REAL,
      current_longitude REAL,
      total_deliveries INTEGER NOT NULL DEFAULT 0,
      total_earnings REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courier_deliveries (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      courier_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'assigned',
      pickup_address TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      pickup_latitude REAL,
      pickup_longitude REAL,
      delivery_latitude REAL,
      delivery_longitude REAL,
      estimated_time TEXT,
      actual_pickup_time TEXT,
      actual_delivery_time TEXT,
      price REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_photos (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      partner_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      comment TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_history (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      action TEXT NOT NULL,
      performed_by TEXT NOT NULL REFERENCES users(id),
      details TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS partner_finances (
      id TEXT PRIMARY KEY,
      partner_id TEXT NOT NULL REFERENCES users(id),
      order_id TEXT NOT NULL REFERENCES orders(id),
      amount REAL NOT NULL,
      platform_fee REAL NOT NULL,
      net_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      paid_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courier_finances (
      id TEXT PRIMARY KEY,
      courier_id TEXT NOT NULL REFERENCES users(id),
      delivery_id TEXT NOT NULL REFERENCES courier_deliveries(id),
      amount REAL NOT NULL,
      platform_fee REAL NOT NULL,
      net_amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      paid_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✅ База данных успешно инициализирована!");
  console.log("✅ Все таблицы созданы!");
  
  sqlite.close();
  process.exit(0);
} catch (error) {
  console.error("❌ Ошибка при миграции:", error);
  process.exit(1);
}
