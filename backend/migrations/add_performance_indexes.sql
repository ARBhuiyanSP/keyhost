-- Performance Optimization Indexes for Keyhost Homes Database
-- Running these queries will build indexes in the background to speed up high-frequency search, availability, and reporting queries.

-- 1. Indexing bookings for faster availability lookup and reservation searches
-- Prevents full table scans when checking dates on properties
ALTER TABLE bookings ADD INDEX idx_bookings_availability (property_id, check_in_date, check_out_date, status);
ALTER TABLE bookings ADD INDEX idx_bookings_guest_status (guest_id, status);

-- 2. Indexing properties to speed up home page searches and filters
-- Speeds up active filtering, owner dashboard loading, and category listings
ALTER TABLE properties ADD INDEX idx_properties_owner_status (owner_id, status);
ALTER TABLE properties ADD INDEX idx_properties_monthly_search (monthly_rent_enabled, monthly_approved);
ALTER TABLE properties ADD INDEX idx_properties_created_sort (status, created_at DESC);

-- 3. Indexing property_images to load gallery sliders instantly
ALTER TABLE property_images ADD INDEX idx_property_images_main (property_id, image_type, is_active);

-- 4. Indexing accounting ledger transactions to speed up Financial Reports compilations
-- Prevents lagging when calculating consolidated reports or specific date range balances
ALTER TABLE hms_accounts_transactions ADD INDEX idx_hms_accounts_tx_report (host_id, property_id, date);
ALTER TABLE hms_accounts_transactions ADD INDEX idx_hms_accounts_tx_head (account_head_id, date);
