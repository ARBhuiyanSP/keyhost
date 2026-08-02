# Keyhost Homes — Full Project Module & Feature Status

> Last updated: 2026-07-13 | Codebase: `booking-systme`

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Zustand, TailwindCSS |
| Backend | Node.js + Express.js |
| Database | MySQL (mysql2) |
| Payment | bKash, SSLCommerz |
| Notifications | Bulk SMS (API), WhatsApp API |
| Sync | iCal / Calendar Sync |
| Deployment | cPanel (shared hosting) |

---

## 👥 User Roles

| Role | Description |
|---|---|
| `guest` | সাধারণ ব্যবহারকারী যিনি প্রোপার্টি বুক করেন |
| `property_owner` / `host` | প্রোপার্টি মালিক |
| `staff` | হোস্টের কর্মচারী |
| `admin` | সিস্টেম অ্যাডমিন |

---

## 🌐 MODULE 1 — Public / Guest-Facing Pages

| Feature | Status | Notes |
|---|---|---|
| Home Page (Hero + Search) | ✅ Complete | Airbnb-style search, category tabs, carousel |
| Property Search (Search Results) | ✅ Complete | Filters, sorting, Nearby GPS, map view |
| Property Detail Page | ✅ Complete | Gallery, amenities, reviews, booking widget, calendar |
| Property Listing (All Properties) | ✅ Complete | Grid view, filters |
| Booking Flow (Guest) | ✅ Complete | Date selection, guest count, coupon, summary |
| Payment Page | ✅ Complete | bKash + SSLCommerz supported |
| Booking Confirmation | ✅ Complete | |
| Contact Host | ✅ Complete | Messaging system |
| Help / FAQ Page | ✅ Complete | |
| Contact Page | ✅ Complete | Form + admin notification |
| About Page | ✅ Complete | |
| Terms & Conditions | ✅ Complete | |
| Privacy Policy | ✅ Complete | |
| Refund Policy | ✅ Complete | |
| Cookies Policy | ✅ Complete | |
| 404 Not Found Page | ✅ Complete | |
| Maintenance Mode | ✅ Complete | Admin-controlled, blocks non-admin users |
| Flight Search/Booking | ⚠️ Partial | UI আছে, backend integration নেই (placeholder) |
| Car Booking | ⚠️ Partial | UI আছে, functional নয় |

---

## 🔐 MODULE 2 — Authentication

| Feature | Status | Notes |
|---|---|---|
| Email Registration | ✅ Complete | |
| Email Login | ✅ Complete | |
| Google OAuth Login | ✅ Complete | |
| Forgot Password (Email) | ✅ Complete | |
| Reset Password | ✅ Complete | |
| Email Verification | ✅ Complete | |
| Phone (OTP) Verification | ⚠️ Issue | OTP পাঠানো হচ্ছে না — WhatsApp/SMS gateway sync দরকার |
| JWT + Refresh Token | ✅ Complete | Session management |
| Become a Host | ✅ Complete | |
| Protected Routes (Role-based) | ✅ Complete | Role-based access control |

---

## 👤 MODULE 3 — Guest Dashboard

| Feature | Status | Notes |
|---|---|---|
| Guest Dashboard | ✅ Complete | Stats, recent bookings |
| My Bookings | ✅ Complete | List view |
| Booking Detail | ✅ Complete | Status timeline, cancellation |
| Favorites / Wishlist | ✅ Complete | |
| Guest Profile | ✅ Complete | Edit info, photo upload |
| Phone Verification (Profile) | ⚠️ Issue | OTP পাচ্ছেন না |
| Refunds | ✅ Complete | View & track refunds |
| Rewards Points | ✅ Complete | Earn/spend, history, tiers |
| Guest Reports | ✅ Complete | Booking summary |
| Support Tickets | ✅ Complete | Create + chat |

---

## 🏠 MODULE 4 — Property Owner Dashboard

| Feature | Status | Notes |
|---|---|---|
| Owner Dashboard | ✅ Complete | KPI cards, recent activity |
| My Properties | ✅ Complete | List, status toggle |
| Add Property | ✅ Complete | Multi-step form, image upload |
| Edit Property | ✅ Complete | All fields editable |
| Property Bookings | ✅ Complete | Accept/Reject, filters |
| Booking Calendar | ✅ Complete | Availability view |
| Calendar Sync (iCal) | ✅ Complete | Import/Export iCal (Airbnb/Booking.com compat) |
| Analytics | ✅ Complete | Revenue, occupancy charts |
| Earnings Summary | ✅ Complete | |
| Property Owner Earnings | ✅ Complete | Payout history |
| Owner Profile | ✅ Complete | |
| Owner Reports | ✅ Complete | |

---

## 🏨 MODULE 5 — HMS (Hotel Management System)

### 5A. HMS Core

| Feature | Status | Notes |
|---|---|---|
| Room Inventory | ✅ Complete | Room types, floors, status |
| HMS Pricing | ✅ Complete | Season-based pricing |
| HMS Reservations | ✅ Complete | Walk-in + platform bookings |
| HMS Reservation Detail | ✅ Complete | Full guest info, extra charges |
| HMS Calendar | ✅ Complete | Room availability calendar |
| HMS Billing | ✅ Complete | Invoice generation |
| HMS Public Payment Link | ✅ Complete | Guest self-pay via secure link |
| HMS Invoice (Public printable) | ✅ Complete | |
| HMS Receipt (Public printable) | ✅ Complete | |
| HMS Staff Management | ✅ Complete | |

### 5B. HMS Housekeeping

| Feature | Status | Notes |
|---|---|---|
| Housekeeping Task Management | ✅ Complete | Assign, track, complete |
| Room Status Tracking | ✅ Complete | Clean/Dirty/Inspected |

### 5C. HMS Food & Beverage

| Feature | Status | Notes |
|---|---|---|
| Menu Management | ✅ Complete | Categories + items |
| F&B Orders | ✅ Complete | Room service orders |
| KOT (Kitchen Order Ticket) | ✅ Complete | |

### 5D. HMS Maintenance

| Feature | Status | Notes |
|---|---|---|
| Maintenance Task CRUD | ✅ Complete | |
| Task Types / Categories | ✅ Complete | |
| Recurring Tasks | ✅ Complete | |
| Maintenance Notifications | ✅ Complete | |
| Live DB Tables | ⚠️ Pending | 3টি table live-এ নেই (migration SQL প্রস্তুত) |

### 5E. HMS HR Module

| Feature | Status | Notes |
|---|---|---|
| Employee Management | ✅ Complete | |
| Departments | ✅ Complete | |
| Designations | ✅ Complete | |
| Shifts | ✅ Complete | |
| Attendance (Clock in/out) | ✅ Complete | |
| Roster | ✅ Complete | |
| Allowances | ✅ Complete | |
| Deductions | ✅ Complete | |
| Payroll | ✅ Complete | Salary calculation + slip |
| Staff Self-Service (Attendance) | ✅ Complete | `/staff/attendance` route |

### 5F. HMS Accounts

| Feature | Status | Notes |
|---|---|---|
| Accounts Dashboard | ✅ Complete | |
| Vouchers (Debit/Credit) | ✅ Complete | |
| Transactions | ✅ Complete | |

### 5G. HMS Reports

| Feature | Status | Notes |
|---|---|---|
| Room Revenue Report | ✅ Complete | |
| HMS Financial Reports | ✅ Complete | P&L, expense summary |

---

## ⚙️ MODULE 6 — Admin Panel

| Feature | Status | Notes |
|---|---|---|
| Admin Dashboard | ✅ Complete | System KPIs |
| User Management | ✅ Complete | CRUD, block/unblock |
| Property Management | ✅ Complete | Approve/Reject, edit |
| Booking Management | ✅ Complete | All platform bookings |
| Review Management | ✅ Complete | Approve/reject |
| Amenities Management | ✅ Complete | |
| Property Types | ✅ Complete | |
| Display Categories | ✅ Complete | Homepage category tabs |
| Coupon Management | ✅ Complete | Discount codes |
| Admin Earnings | ✅ Complete | Commission tracking |
| Accounting | ✅ Complete | Financial overview |
| Refund Management | ✅ Complete | Process refunds |
| Security Deposits | ✅ Complete | |
| Rewards Points Settings | ✅ Complete | Tier config, slot config |
| Analytics | ✅ Complete | Charts, trends |
| Settings (General, SMS, Payment, HMS) | ✅ Complete | Full system config |
| HMS Settings | ✅ Complete | Admin-level HMS config |
| Contact Messages | ✅ Complete | View contact form submissions |
| Owner Payout Management | ✅ Complete | |
| Reports — Bookings | ✅ Complete | |
| Reports — Financials | ✅ Complete | |
| Reports — Property Performance | ✅ Complete | |
| Reports — Payouts | ✅ Complete | |
| Reports — Cancellations | ✅ Complete | |
| Reports — Users | ✅ Complete | |
| Reports — User Analytics | ✅ Complete | |
| Reports — Property Analytics | ✅ Complete | |

---

## 💬 MODULE 7 — Messaging & Support

| Feature | Status | Notes |
|---|---|---|
| Messages (Inbox) | ✅ Complete | |
| Conversation Detail | ✅ Complete | Thread-based chat |
| Support Tickets | ✅ Complete | Guest/Owner/Admin |
| Ticket Chat | ✅ Complete | |

---

## 💳 MODULE 8 — Payments

| Feature | Status | Notes |
|---|---|---|
| bKash Payment | ✅ Complete | API integrated |
| SSLCommerz | ✅ Complete | Card/net banking |
| Payment History | ✅ Complete | |
| Refund Processing | ✅ Complete | Admin-initiated |
| Coupon / Discount | ✅ Complete | |
| Rewards Points Redemption | ✅ Complete | |
| Security Deposit | ✅ Complete | |

---

## 📲 MODULE 9 — Notifications

| Feature | Status | Notes |
|---|---|---|
| SMS (Bulk SMS API) | ✅ Complete | Booking events, alerts |
| WhatsApp | ✅ Complete | Admin-configurable gateway |
| SMS/WhatsApp Templates | ✅ Complete | Admin customizable templates |
| Email Notifications | ⚠️ Partial | Basic utility আছে, templates অসম্পূর্ণ |
| OTP via SMS/WhatsApp | ⚠️ Issue | Phone verification OTP কাজ করছে না |

---

## 🔄 MODULE 10 — System / Infrastructure

| Feature | Status | Notes |
|---|---|---|
| iCal Sync (Import/Export) | ✅ Complete | Airbnb/Booking.com compatible |
| Auto Booking Cleanup (Cron) | ✅ Complete | Expired bookings auto-cancel |
| HMS Daily Cron Jobs | ✅ Complete | Auto-checkout, maintenance notifications |
| Code Splitting / Lazy Loading | ✅ Complete | Route-based chunks |
| Version Auto-Update Detection | ✅ Complete | Cache clear on deploy |
| DB Connection Pooling | ✅ Complete | |
| DB Indexes — Local | ✅ Complete | Optimized for performance |
| DB Indexes — Live | ⚠️ Pending | 8টি index live-এ নেই (migration SQL প্রস্তুত) |
| GPS / Nearby Search | ✅ Complete | Haversine formula, 50km radius |
| Connection Error Screen | ✅ Complete | Backend unreachable হলে দেখায় |
| Maintenance Mode | ✅ Complete | |
| Image Upload / Processing | ✅ Complete | multer + sharp |
| Image Lazy Loading | ✅ Complete | |
| Mobile Responsive UI | ✅ Complete | |
| Mobile Search Modal | ✅ Complete | |
| Audit Logs | ✅ Complete | |

---

## 📊 সারসংক্ষেপ (Summary)

| Module | ✅ Complete | ⚠️ Issues | Total |
|---|---|---|---|
| Public Pages | 17 | 2 | 19 |
| Authentication | 9 | 1 | 10 |
| Guest Module | 9 | 1 | 10 |
| Owner Module | 12 | 0 | 12 |
| HMS (Core) | 9 | 0 | 9 |
| HMS (Housekeeping) | 2 | 0 | 2 |
| HMS (Food & Beverage) | 3 | 0 | 3 |
| HMS (Maintenance) | 4 | 1 | 5 |
| HMS (HR) | 10 | 0 | 10 |
| HMS (Accounts) | 3 | 0 | 3 |
| HMS (Reports) | 2 | 0 | 2 |
| Admin Panel | 28 | 0 | 28 |
| Messaging & Support | 4 | 0 | 4 |
| Payments | 7 | 0 | 7 |
| Notifications | 3 | 2 | 5 |
| System / Infrastructure | 14 | 2 | 16 |
| **TOTAL** | **136** | **9** | **145** |

---

## ⚠️ Known Issues / Pending Tasks

| # | Issue | Priority | Action |
|---|---|---|---|
| 1 | Phone OTP verification কাজ করছে না | 🔴 High | SMS/WhatsApp route auth.js দেখতে হবে |
| 2 | HMS Maintenance 3টি table live server-এ নেই | 🔴 High | `hms_maintenance_migration.sql` run করুন |
| 3 | Live DB-তে 8টি performance index নেই | 🟡 Medium | `missing_indexes_migration.sql` run করুন |
| 4 | Email notification templates অসম্পূর্ণ | 🟡 Medium | Template সিস্টেম বাড়ানো দরকার |
| 5 | Flight Booking — backend নেই | 🟢 Low | Future scope |
| 6 | Car Booking — functional নয় | 🟢 Low | Future scope |
