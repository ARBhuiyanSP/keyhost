-- ================================================================
-- LIVE DATABASE UPDATE SCRIPT
-- Generated: 2026-08-16T08:19:32.339Z
-- Apply this on: keyhhhpg_keyhost_db (cPanel live database)
-- ================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── SECTION 1: CREATE MISSING TABLES ─────────────────────────────
CREATE TABLE `admin_employees` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `designation` varchar(100) NOT NULL,
  `department` varchar(100) DEFAULT 'General',
  `base_salary` decimal(12,2) NOT NULL DEFAULT 0.00,
  `joining_date` date DEFAULT NULL,
  `blood_group` varchar(10) DEFAULT NULL,
  `nid_number` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `nid_document_url` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','on_leave') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `admin_expenses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `category_id` int(11) unsigned NOT NULL,
  `title` varchar(200) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `expense_date` date NOT NULL,
  `voucher_no` varchar(100) DEFAULT NULL,
  `payment_method` enum('cash','bank_transfer','bkash','nagad','card','cheque') NOT NULL DEFAULT 'cash',
  `receipt_url` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_expense_date` (`expense_date`),
  CONSTRAINT `fk_admin_exp_cat` FOREIGN KEY (`category_id`) REFERENCES `admin_expense_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `admin_expense_categories` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(50) DEFAULT 'FiDollarSign',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `admin_payrolls` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) unsigned NOT NULL,
  `month` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `base_salary` decimal(12,2) NOT NULL,
  `bonus_allowance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `deduction` decimal(12,2) NOT NULL DEFAULT 0.00,
  `net_salary` decimal(12,2) NOT NULL,
  `payment_status` enum('pending','paid') NOT NULL DEFAULT 'pending',
  `payment_date` datetime DEFAULT NULL,
  `expense_id` bigint(20) unsigned DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_emp_month_year` (`employee_id`,`month`,`year`),
  CONSTRAINT `fk_admin_payroll_emp` FOREIGN KEY (`employee_id`) REFERENCES `admin_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `admin_staff_permissions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` bigint(20) unsigned NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`permissions`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_employee_id` (`employee_id`),
  CONSTRAINT `fk_admin_staff_perm_emp` FOREIGN KEY (`employee_id`) REFERENCES `admin_employees` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── SECTION 2: ADD MISSING COLUMNS ───────────────────────────────
ALTER TABLE `orders` ADD COLUMN `gateway_fee` decimal(10,2) NULL DEFAULT '0.00';
ALTER TABLE `orders` ADD COLUMN `gateway_channel` varchar(50) NULL DEFAULT NULL;
ALTER TABLE `payments` ADD COLUMN `gateway_fee` decimal(10,2) NULL DEFAULT '0.00';
ALTER TABLE `payments` ADD COLUMN `gateway_channel` varchar(50) NULL DEFAULT NULL;

-- ── SECTION 4: INSERT MISSING SYSTEM_SETTINGS ────────────────────
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('platform_name', 'Keyhost Homes');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('default_currency', 'BDT');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('commission_rate', '10');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('max_guests_per_property', '20');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('booking_advance_days', '365');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('cancellation_hours', '24');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('support_email', 'info@keyhost24.com');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('support_phone', '+8801730353300');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('timezone', 'Asia/Dhaka');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('maintenance_mode', 'false');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('registration_enabled', 'true');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('email_verification_required', 'true');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('phone_verification_required', 'false');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('site_logo', 'data:image/png;base64,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');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('site_name', 'KeyHost 24');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('contact_email', 'info@keyhost24.com');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('site_favicon', 'data:image/png;base64,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');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('admin_commission_rate', '10');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('admin_tax_rate', '0');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('commission_calculation_method', 'percentage');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('minimum_payout_amount', '100');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('payout_frequency', 'monthly');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_enabled', 'true');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_merchant_id', 'KeyHost');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_merchant_key', '4f6o0cjiki2rfm34kfdadl1eqq');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_merchant_secret', '2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_api_url', 'https://tokenized.sandbox.bka.sh/v1.2.0-beta');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_callback_url', 'http://localhost:3000/payment/callback');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_currency', 'BDT');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_intent', 'sale');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_mode', 'sandbox');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_success_url', 'http://localhost:3000/payment/success');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_fail_url', 'http://localhost:3000/payment/fail');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('enable_bkash', 'true');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('enable_nagad', 'false');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sms_sender_id', '01844015754');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sms_api_key', 'b4a37e3c2c368a44');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sms_secret_key', '7e0ba143');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('payment_time_limit_minutes', '30');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sms_enabled', 'true');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('primary_color', '#E41D57');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('secondary_color', '#E41D57');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('site_description', 'Find Your Comfort');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('enable_sslcommerz', 'true');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sslcommerz_store_id', 'testbox');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sslcommerz_store_password', 'qwerty');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('google_client_id', '82849880523-pdlo06m2e6n46eunf951sfv4cgt4a8kb.apps.googleusercontent.com');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('google_client_secret', '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');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('smtp_host', 'smtp.gmail.com');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('smtp_port', '465');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('smtp_encryption', 'ssl');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('smtp_username', 'arbhuiyan.pits@gmail.com');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('smtp_password', 'zgnd avpj klry ygpt');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('mail_from_address', 'arbhuiyan.pits@gmail.com');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('mail_from_name', 'Keyhost Homes');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sslcommerz_is_live', 'false');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('google_maps_api_key', 'AIzaSyBaZ6hlAV5zVfCzQZqY4KGrQqqv8zjrbu0');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('contact_phone', '+8801730353300');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('site_address', 'Rupayan Centre(8th Floor), 72
Mohakhali C/A, Dhaka-1212, Bangladesh');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('terms_of_service', 'KeyHost24 Ã¢â‚¬â€ Terms & Conditions  

Welcome to KeyHost24. By accessing our website and booking our services, you agree to comply with and be bound by the following Terms & Conditions.

---

### 1. About Us
KeyHost24 provides short-term rental and accommodation management services for guests seeking comfortable and reliable stays.

---

### 2. Booking & Payments
- All bookings must be confirmed with advance or full payment.  
- Prices are subject to availability, seasonal demand, and promotional offers.  
- Payments can be made via approved methods including cards, mobile financial services, and online payment gateways.  

---

### 3. Check-in & Check-out
- Standard Check-in Time: [Insert Time]  
- Standard Check-out Time: [Insert Time]  
- Early check-in or late check-out is subject to availability and may incur additional charges.  

---

### 4. Guest Responsibilities
Guests agree to:
- Provide valid identification at check-in  
- Maintain the property in good condition  
- Follow all house rules and regulations  
- Avoid illegal, unsafe, or disruptive behavior  

---

### 5. Property Use
- The property must be used only for residential purposes  
- Subletting or unauthorized guests are not allowed  
- Parties or events are strictly prohibited unless approved  

---

### 6. Damage & Loss
- Guests are responsible for any damage caused during their stay  
- Costs for repair or replacement will be charged or deducted from the security deposit  

---

### 7. Cancellation & Refund
All cancellations, refunds, and rescheduling are governed by our Refund & Cancellation Policy available on the website.

---

### 8. Security Deposit
- A refundable security deposit may be required  
- The deposit will be returned after inspection at checkout  
- Deductions may apply for damages or violations  

---

### 9. Limitation of Liability
KeyHost24 shall not be held responsible for:
- Loss or theft of personal belongings  
- Injuries or accidents occurring during the stay  
- Delays or disruptions caused by external factors beyond our control  

---

### 10. Privacy & Data Protection
We respect your privacy. All personal information is handled according to our Privacy Policy.

---

### 11. Third-Party Services
- We may use third-party services (e.g., payment gateways) for processing transactions  
- KeyHost24 is not responsible for failures or issues arising from third-party services  

---

### 12. Website Use
- Users agree not to misuse the website or attempt unauthorized access  
- All content on the website is the property of KeyHost24 and may not be copied or reused without permission  

---

### 13. Policy Updates
KeyHost24 reserves the right to modify these Terms & Conditions at any time without prior notice. Updated versions will be posted on the website.

---

### 14. Governing Law
These Terms & Conditions are governed by the laws of Bangladesh.

---

### 15. Contact Information
For any inquiries, please contact:

KeyHost24 Support Team  
Email: info@keyhost24.com  
Phone/WhatsApp: [01730353300]

---

By booking with KeyHost24, you confirm that you have read, understood, and agreed to these Terms & Conditions.');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('privacy_policy', '----');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('refund_policy', 'KeyHost24 Ã¢â‚¬â€ Refund, Cancellation & Rescheduling Policy  

At KeyHost24, we strive to provide a reliable and transparent booking experience. This policy outlines the conditions for cancellations, refunds, and booking modifications.

---

### 1. Booking Confirmation
All reservations are confirmed only after receiving a partial or full payment. By confirming a booking, the guest agrees to all policies stated herein.

---

### 2. Cancellation Policy

a. Standard Cancellation (Flexible Rate)  
- Free cancellation up to 48 hours before check-in  
- 100% refund of advance payment  

b. Late Cancellation  
- Cancellations within 48 hours of check-in are non-refundable

c. No-Show  
- Failure to check in on the scheduled date will result in full booking charge with no refund

---

### 3. Non-Refundable Bookings (If Applicable)
Certain promotional or discounted bookings may be marked as Non-Refundable.  
- No refund will be provided under any circumstances  
- Date changes may not be permitted  

---

### 4. Early Check-Out
- No refund will be issued for unused nights after check-in  
- Full stay amount remains payable

---

### 5. Refund Processing Timeline
- All approved refunds will be processed within 7Ã¢â‚¬â€œ10 working days  
- Refunds will be issued via the original mode of payment  
- Delays caused by banks, payment gateways, or mobile financial services are beyond our control  

---

### 6. Rescheduling / Date Modification
- Changes are allowed if requested at least 48 hours before check-in  
- Subject to availability  
- Rate differences may apply  

---

### 7. Security Deposit (If Applicable)
- Refundable upon checkout after inspection  
- Deductions may apply for:
  - Damages  
  - Missing items  
  - Rule violations  

---

### 8. Host-Initiated Cancellation
In rare cases where KeyHost24 must cancel:
- Full refund will be issued, OR  
- Alternative accommodation of similar or higher standard will be provided  

---

### 9. Force Majeure / Exceptional Circumstances
Refunds or credits may be considered in events beyond control, including:
- Natural disasters  
- Government restrictions  
- Medical emergencies  

(Valid documentation required)

---

### 10. Third-Party & Data Responsibility
- KeyHost24 does not share customer data with unauthorized third parties  
- Any integrated third-party service complies with applicable data protection standards  
- KeyHost24 is not responsible for external service disruptions beyond its control  

---

### 11. Policy Acceptance
During checkout, guests must confirm that they have read and agreed to:
- Terms & Conditions  
- Privacy Policy  
- Refund & Cancellation Policy  

---

### 12. Contact Information
For any queries regarding cancellations or refunds:

KeyHost24 Support Team  
Email: info@keyhost24.com  
Phone/WhatsApp: [01730353300]

---

Note: KeyHost24 reserves the right to update this policy at any time without prior notice.');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('pending_booking_timeout_minutes', '30');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sms_template_booking_request_host', 'New booking request {booking_ref} for {property_name}. Guest: {guest_name}. Check-in: {check_in_date}. Review & accept here: {booking_url}');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sms_template_booking_accepted_guest', 'Hello {guest_name}, your booking request {booking_ref} for {property_name} has been accepted! Please pay {amount} within {payment_limit} mins (before {deadline}) to confirm your stay.');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sms_template_booking_paid_host', 'Payment Confirmed! Booking {booking_ref} for {property_name} has been paid successfully. Guest: {guest_name}. Check-in: {check_in_date}.');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sms_template_booking_paid_guest', 'Thank you {guest_name}! Payment of {amount} for booking {booking_ref} ({property_name}) was successful. Your stay is confirmed. Check-in: {check_in_date}.');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sms_template_checkout_guest', 'Hi {guest_name}, thank you for choosing {property_name}. Your checkout for booking {booking_ref} is complete. We hope you had a wonderful stay!');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sms_template_refund_guest', 'Refund processed! Hi {guest_name}, a refund of {amount} for booking {booking_ref} at {property_name} has been credited. Reason: {reason}.');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sms_template_refund_host', 'Refund Notification: A refund of {amount} for booking {booking_ref} at {property_name} has been processed. Reason: {reason}.');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('auto_approve_reviews', 'true');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('facebook_url', 'https://www.facebook.com/keyhosthomes');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('sms_gateway_type', 'whatsapp');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_is_live', 'false');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_username', 'sandboxTokenizedUser02');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_password', 'sandboxTokenizedUser02@12345');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_api_associated_email', '');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('nagad_is_live', 'false');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('nagad_api_url', 'http://sandbox.mymoid.com:9090');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('nagad_merchant_id', '');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('nagad_private_key', '');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('nagad_public_key', '');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('nagad_merchant_private_key', '');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('google_places_enabled', 'true');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('google_api_associated_email', '');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('facebook_pixel_id', '1086408337394401');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('meta_access_token', 'EAAgCvZAZB3rQkBSIaAIJJBZAEYfGZAmG6GeCGrZAN5EvZAOd7PmSdyZAz6XMJrftmZBwZC14qZBBxrC1KtoKOfQKeJZBnAZBQz2gXGQYyisqPT6y0ztvXCobpiVIWctOwNk9pyXuZAAzViDxF9AWKU5bRuM2YZC1LLEoEm9PZAUrdppIU7c5IKLydsaBOLtDAYx89Re4vosPwZDZD');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('meta_advanced_matching', 'true');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('meta_capi_enabled', 'true');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('meta_test_event_code', 'TEST28073');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('censor_banned_words', '["0","1","2"]');
INSERT IGNORE INTO `system_settings` (`setting_key`, `setting_value`) VALUES ('bkash_charge_rate', '1.5');

SET FOREIGN_KEY_CHECKS = 1;
-- ================================================================
-- END OF UPDATE SCRIPT
-- ================================================================