-- SQL script to insert missing system settings on live database
-- Generated on 2026-06-07T04:19:00.059Z

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('site_name', 'KeyHost 24', 'string', '', 1) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('contact_email', 'info@keyhost24.com', 'string', '', 1) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('site_favicon', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAACslBMVEUAAAD////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+/v79/f37+/v5+fn////+/v74+PjR0dGioqJ6enpdXV1aWlpbW1uhoaHQ0ND4+Pj6+vq0tLRNTU0AAAAAAAAODg4oKCgpKSlKSkqxsbHe3t5QUFAxMTFDQ0NAQEA9PT06Ojo6OjpAQEAyMjJQUFDc3NzNzc0AAAArKytEREQ5OTk2NjY3NzdEREQqKioAAADFxcXS0tIAAAA+Pj49PT08PDxBQUEAAADMzMzt7e0MDAw4ODg7OzsAAADo6Oj///+CgoI/Pz8LCwt2dnb////a2tpFRUXR0dGSkpI+Pj6FhYX39/dFRUUzMzM5OTkuLi7v7+/e3t4AAABCQkLU1NTKysoAAAA/Pz+8vLy/v7+tra3///+/v783NzeKioqWlpaTk5OUlJSXl5eEhIQuLi6urq43Nzf29vbr6+s3Nzfv7+/8/Pzl5eXw8PDn5+fm5ub////////////////w8PDy8vJxcXF6enp4eHhsbGwyMjIZGRkKCgoPDw8ICAgeHh48PDw7Ozv///////84ODhBQUHAwMBISEg+Pj7x8fEQEBCvr6////+9vb0AAAAdHR0AAADw8PDl5eUAAAAPDw8aGhqrq6v19fXn5+fp6eno6Ojp6en8/Pzo6Ojn5+fz8/P////////////e2BDzAAAA5nRSTlMAAQMEDCpNcI+qwNHh8Pn+JFmSw+j/Ag1Kk9L8+/0HpOmL4ka1Usn6BUfKtolD3pEp1FuMsg7NF90b5BjlzrNcRIor///3+0j+9fDx9PT5+fHx9PPs9v3/////9ejr7////v/+////8uzw+P///v///v/65e38//7+//nr7vX//vfv9+3+//D27f/r7v7y9Pb///j08fv/7/D+//H47dP//vf39/f39f3v+vfw+/r/8vnx8kxvq+769vj4+Pf+//////////jv/v7///35+/C3+vb28vjv8Pj26fXp6+vq++nq7+rQ4LQL0RoAAAZkSURBVHgBtNLVQsMwGIbhLw0dnmAvlgSH4nPB7/+qsOP52ueoml81C5NZ/VnKa8srq2vrG5vOe7e5sb62urJcy5f0x2ZGlTD2P/rW9s7uHkPt7e5sb0mStUZl27eSDg6PjgN/QowxhOQBfAr/t/wJx0eHB5LsvsqUZdJJ7fQMIMaQGCqFGAHOTmsn//+UxRopP78AQkyesXyKAbg4zyVjSwt/efUf3TMVHwNwdSkZW0rzr2+AIjGDVAA31wsPwtxKd/dTFj+kDfd30q3R3KyUP0AMzCVEeMglO3/5t48QAnMLAR5v52xCJj09Q2QhEZ6fpEwzu5XqUHgW5AuoS7eajbFqNAmBEoRAsyFrNIN9o1bCURJHasnszzT+NkRKE6E9wyJYmQ4xUaIU6ezLTrt+3R7OUyrv6HV1O138/gBH6RyD/jQZWL284qiA4/VFdnL8t3cKKlHw/iY7af+7AwoqUvDcVaYx9rX/gaMyjo997WskY/SJo0KOTxmjUazaOCrlaMtqhFt9EalY5Eu3GipTI5GoWCI1hi+ikZpEKhdpSmboAOo4qJ6jPmwIVk8EfogtBy3dkSgKn5/jqdZuJWm7B48wSNq2bdvG2LZ5bVvPdY1WTipX+V6gvrXPXnvVU0HBm+TZfoCU156ewGsp5Np2gLeQjKdEMt7aegQ3vQ0hYIEuCSwQAm+Te4tAOlT+cUOHNLohwKEifbOAh1L5AggD0JIzMqXISNYAXkFFFnk2VTCNFciGyMnNyy8oLCq0pKiwIL+4pFRDNtvDNHJtDCCRPYCBsvKKyqrqmlopaqqrKuvqy9gQVCSSZ0MASVwAumhorGpqbmlta5eirbWjubOqqxsQTARJDyJwUzz3voGe3r7+gcEhGwwODI+Mjqk6GIN4ct8XSIDKvD8+MTnFPG+iMD0zOweDuUHCPYFQ8jEbkI35hcUl9n0T2iaXV5DNbIGPQu9WMNZ8BAVW16pamPeZDNbfefc96OZzGEueOw2MioNmHsD7o/3M+6zBBxMfmkegIS6KXLcD8DMN0JM/qlofekg+rvokGUwL/OS5LRBtLiDw6WefDzyswOIXX34FYS4QfUvARWEx3AW+/qZj6KH5duI77gYxYeQiN4UzI2Dg+x++HXrAZMePFnS0bhSo+gkGMwXh5CYPRbAj8PMmgSoJvhi6z0zVL4KbgojbJfiVTeC3qg0Cv//x519/s/z1z7//fbFB4H/BJfAr3SRAgZATWBzctVtoFmDP7KSkgIASQESBUCErsHcfDJ1lPw5IC0BFIBG9jmR5gYPQwZKNQ/ICyXidiIKhPFaBw/ICCoKJvCHQnBLQEOIlHyCcEhCAj45AhVMCUHCEjiLZOYFkHKVnnRV4lp5z8gQqjtHzUJzswPP0grMCL9CL0ODUEkLDi3QcwobACSsB3VYCAsfpZTsCu05qCo8qVmwJvExbn+f/A6dOn7Hg9Nlzi9ICgLAnMHT+QjXPxUuXF4dsCGjyJ7jNlVZLrg7JCwhcs1NC+9wgxg4NAIShGIii63Hsv0A7A3Mhn8Td3+BE+5PcP8DrG7YAvqFDlAI4RGsWYAmjFEAYieMWQByfWYBz7ck38NxbKU0PkVKqlqenWC03TMowMkxMszqOTTPjtCskxql53lYy85ygSEspQUHRpAAUDUmVApBUNF0KQNMRlSUAUUnVpgBULVmdApDVdH0NQNd/1Zs1XsdAFITz4wC4a4VLg0uF3yC3oExNyxWoaKlzBtzdgifnwAeHWeRl4NXZ3fm7zPfdFxaGAUhhgcrGLgCpbFBapR2grKAeAVDbmQXgzSWKS5sAtLhEdWsVgN8BKK9ZgLmxabeP4ymsmEcAUl6jvn8vwIK/GDzMZLC07HAPrEwEmEV/9VUAnL/mZRCAAQHWNzY3MONb2zzAzu7eBmZ/4wAB3gUYOMKRVXB4FB0/zskpC5BVMHT2tCA6vygYIAgHgVjIeXzBAIVYCMYzMPp8eIBXC7JcMB48CLlpgUy5Xt1fRLnkMJse59MCjUA622RIJ6DWDluotePmCIL1tiixXi3YjJdCd58V2t3X7QKX13m9VnB7L86X4/0UcC8UCg56xUMvueg1H4hOub8lOuUS0UmseullN73uR4THGoHwKFA+ifTaKJBeBdovEZ9DV/H5siqE+KxXv/+5/E70/ziZvdX/Z5P4B/r/NUij3vg/fOcVAAAAAElFTkSuQmCC', 'string', 'Setting for site_favicon', 1) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('admin_commission_rate', '10', 'number', 'Default admin commission rate percentage', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('admin_tax_rate', '0', 'number', 'Tax rate on admin commission', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('commission_calculation_method', 'percentage', 'string', 'Commission calculation method (percentage or fixed)', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('minimum_payout_amount', '100', 'number', 'Minimum amount required for payout', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('payout_frequency', 'monthly', 'string', 'Payout frequency (weekly, monthly, quarterly)', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('bkash_enabled', 'true', 'boolean', 'Enable bKash payment gateway', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('bkash_merchant_id', 'DEMO_MERCHANT_001', 'string', 'bKash merchant ID', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('bkash_merchant_key', 'DEMO_MERCHANT_KEY_123', 'string', 'bKash merchant key', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('bkash_merchant_secret', 'DEMO_MERCHANT_SECRET_456', 'string', 'bKash merchant secret', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('bkash_api_url', 'https://tokenized.pay.bka.sh/v1.2.0-beta', 'string', 'bKash API base URL', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('bkash_callback_url', 'http://localhost:3000/payment/callback', 'string', 'bKash payment callback URL', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('bkash_currency', 'BDT', 'string', 'bKash payment currency', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('bkash_intent', 'sale', 'string', 'bKash payment intent', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('bkash_mode', 'sandbox', 'string', 'bKash payment mode (sandbox/live)', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('bkash_success_url', 'http://localhost:3000/payment/success', 'string', 'bKash payment success redirect URL', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('bkash_fail_url', 'http://localhost:3000/payment/fail', 'string', 'bKash payment failure redirect URL', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('enable_bkash', 'false', 'boolean', 'Setting for enable_bkash', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('enable_nagad', 'false', 'boolean', 'Setting for enable_nagad', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sms_sender_id', '01844015754', 'string', 'Setting for sms_sender_id', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sms_api_key', 'b4a37e3c2c368a44', 'string', 'Setting for sms_api_key', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sms_secret_key', '7e0ba143', 'string', 'Setting for sms_secret_key', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('payment_time_limit_minutes', '20', 'number', 'Setting for payment_time_limit_minutes', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sms_enabled', 'true', 'boolean', 'Setting for sms_enabled', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('primary_color', '#E41D57', 'string', 'Setting for primary_color', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('secondary_color', '#E41D57', 'string', 'Setting for secondary_color', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('site_description', 'Find Your Comfort', 'string', 'Setting for site_description', 1) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('enable_sslcommerz', 'true', 'boolean', 'Setting for enable_sslcommerz', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sslcommerz_store_id', 'testbox', 'string', 'Setting for sslcommerz_store_id', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sslcommerz_store_password', 'qwerty', 'string', 'Setting for sslcommerz_store_password', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('google_client_id', '82849880523-pdlo06m2e6n46eunf951sfv4cgt4a8kb.apps.googleusercontent.com', 'string', 'Google Client ID', 1) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('google_client_secret', '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', 'string', 'Google Client Secret', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('smtp_host', 'smtp.gmail.com', 'string', 'SMTP Server', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('smtp_port', '465', 'string', 'SMTP Port', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('smtp_encryption', 'ssl', 'string', 'SMTP Encryption', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('smtp_username', 'arbhuiyan.pits@gmail.com', 'string', 'SMTP Username', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('smtp_password', 'zgnd avpj klry ygpt', 'string', 'SMTP Password', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('mail_from_address', 'arbhuiyan.pits@gmail.com', 'string', 'Mail From Address', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('mail_from_name', 'Keyhost Homes', 'string', 'Mail From Name', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sslcommerz_is_live', 'false', 'boolean', 'Setting for sslcommerz_is_live', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('google_maps_api_key', 'AIzaSyBaZ6hlAV5zVfCzQZqY4KGrQqqv8zjrbu0', 'string', 'Setting for google_maps_api_key', 1) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('contact_phone', '+8801730353300', 'string', 'Setting for contact_phone', 1) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('site_address', 'Rupayan Centre(8th Floor), 72
Mohakhali C/A, Dhaka-1212, Bangladesh', 'string', 'Setting for site_address', 1) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sms_template_booking_request_host', '[Keyhost] New booking request {booking_ref} for {property_name}. Guest: {guest_name}. Check-in: {check_in_date}. Review & accept here: {booking_url}', 'string', 'Test booking request SMS template', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sms_template_booking_accepted_guest', '[Keyhost] Hello {guest_name}, your booking request {booking_ref} for {property_name} has been accepted! Please pay {amount} within {payment_limit} mins (before {deadline}) to confirm your stay.', 'string', 'SMS template setting for booking accepted guest', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sms_template_booking_paid_host', '[Keyhost] Payment Confirmed! Booking {booking_ref} for {property_name} has been paid successfully. Guest: {guest_name}. Check-in: {check_in_date}.', 'string', 'SMS template setting for booking paid host', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sms_template_booking_paid_guest', 'Thank you {guest_name}! Payment of {amount} for booking {booking_ref} ({property_name}) was successful. Your stay is confirmed. Check-in: {check_in_date}.', 'string', 'SMS template setting for booking paid guest', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sms_template_checkout_guest', 'Hi {guest_name}, thank you for choosing {property_name}. Your checkout for booking {booking_ref} is complete. We hope you had a wonderful stay!', 'string', 'SMS template setting for checkout guest', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sms_template_refund_guest', 'Refund processed! Hi {guest_name}, a refund of {amount} for booking {booking_ref} at {property_name} has been credited. Reason: {reason}.', 'string', 'SMS template setting for refund guest', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`, `is_public`) 
VALUES ('sms_template_refund_host', 'Refund Notification: A refund of {amount} for booking {booking_ref} at {property_name} has been processed. Reason: {reason}.', 'string', 'SMS template setting for refund host', 0) 
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

