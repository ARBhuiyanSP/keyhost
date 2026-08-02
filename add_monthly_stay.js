const { pool } = require('./backend/config/database');

async function migrate() {
  console.log('Starting Monthly Stay migration...');

  // ── 1. properties table ─────────────────────────────────────────────────
  const propertyColumns = [
    // Availability
    { name: 'monthly_rent_enabled',           def: "TINYINT(1) NOT NULL DEFAULT 0 AFTER auto_accept_bookings" },
    { name: 'monthly_stay_type',              def: "ENUM('both','monthly_only') NOT NULL DEFAULT 'both' AFTER monthly_rent_enabled" },
    { name: 'monthly_min_stay_nights',        def: "INT NOT NULL DEFAULT 30 AFTER monthly_stay_type" },
    { name: 'monthly_rent_amount',            def: "DECIMAL(12,2) DEFAULT NULL AFTER monthly_min_stay_nights" },
    { name: 'monthly_advance_amount',         def: "DECIMAL(12,2) DEFAULT NULL AFTER monthly_rent_amount" },
    // Inclusions
    { name: 'monthly_furnished',              def: "TINYINT(1) NOT NULL DEFAULT 1 AFTER monthly_advance_amount" },
    { name: 'monthly_wifi_included',          def: "TINYINT(1) NOT NULL DEFAULT 0 AFTER monthly_furnished" },
    { name: 'monthly_electricity_included',   def: "TINYINT(1) NOT NULL DEFAULT 0 AFTER monthly_wifi_included" },
    { name: 'monthly_gas_included',           def: "TINYINT(1) NOT NULL DEFAULT 0 AFTER monthly_electricity_included" },
    { name: 'monthly_water_included',         def: "TINYINT(1) NOT NULL DEFAULT 0 AFTER monthly_gas_included" },
    { name: 'monthly_cleaning_included',      def: "TINYINT(1) NOT NULL DEFAULT 0 AFTER monthly_water_included" },
    { name: 'monthly_service_charge_included',def: "TINYINT(1) NOT NULL DEFAULT 0 AFTER monthly_cleaning_included" },
    { name: 'monthly_inclusions_notes',       def: "TEXT DEFAULT NULL AFTER monthly_service_charge_included" },
    // Security deposit & policy
    { name: 'monthly_security_deposit',       def: "DECIMAL(12,2) DEFAULT NULL AFTER monthly_inclusions_notes" },
    { name: 'monthly_cancellation_policy',    def: "ENUM('flexible','moderate','strict','custom') NOT NULL DEFAULT 'moderate' AFTER monthly_security_deposit" },
    // Admin gate
    { name: 'monthly_approved',               def: "TINYINT(1) NOT NULL DEFAULT 0 AFTER monthly_cancellation_policy" },
  ];

  for (const col of propertyColumns) {
    const [existing] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'properties' AND COLUMN_NAME = ?`,
      [col.name]
    );
    if (existing.length > 0) {
      console.log(`  [SKIP] properties.${col.name} already exists`);
    } else {
      await pool.execute(`ALTER TABLE properties ADD COLUMN ${col.name} ${col.def}`);
      console.log(`  [OK]   properties.${col.name} added`);
    }
  }

  // ── 2. bookings table ────────────────────────────────────────────────────
  const bookingColumns = [
    { name: 'booking_type',      def: "ENUM('short_stay','monthly') NOT NULL DEFAULT 'short_stay' AFTER status" },
    { name: 'months_count',      def: "INT DEFAULT NULL AFTER booking_type" },
    { name: 'extra_days',        def: "INT DEFAULT NULL AFTER months_count" },
    { name: 'monthly_rate_used', def: "DECIMAL(12,2) DEFAULT NULL AFTER extra_days" },
    { name: 'advance_amount',    def: "DECIMAL(12,2) DEFAULT NULL AFTER monthly_rate_used" },
  ];

  for (const col of bookingColumns) {
    const [existing] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = ?`,
      [col.name]
    );
    if (existing.length > 0) {
      console.log(`  [SKIP] bookings.${col.name} already exists`);
    } else {
      await pool.execute(`ALTER TABLE bookings ADD COLUMN ${col.name} ${col.def}`);
      console.log(`  [OK]   bookings.${col.name} added`);
    }
  }

  console.log('\nMigration complete!');
  process.exit(0);
}

migrate().catch(e => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});
