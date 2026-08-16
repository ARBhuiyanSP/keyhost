# Keyhost24 Admin Corporate HR, Expense Management & Profit & Loss Accounting Plan
> **Status:** Saved for Implementation  
> **Created:** August 12, 2026

---

## 📌 Executive Summary

Build a comprehensive financial and operational ecosystem for **Keyhost24 Corporate Administration (`/admin`)**, incorporating **Platform Expense Tracking**, **Corporate HR & Staff Management**, **Granular Permission Control**, **Corporate Payroll**, and a **Comprehensive Profit & Loss (P&L) Statement**.

---

## 🏗️ System Architecture & Modules

### Module 1: Corporate HR & Staff Management (`/admin/hr`)
- Register Keyhost24 corporate employees (Sales, Marketing, Accounts, Tech Support).
- Employee profiles: Name, NID/Passport, Designation, Department, Base Salary, Joining Date, Documents.
- Granular Permissions Matrix: Control menu visibility and action permissions per staff role.

### Module 2: Platform Expense Management (`/admin/expenses`)
- Categorized Expense Tracking:
  - 📢 Marketing & Advertising (FB Ads, Google, Banner, SMS)
  - 🏢 Office Rent & Maintenance
  - ⚡ Utilities (Electricity, Internet, Water)
  - 💻 Tech Infrastructure & Server Costs
  - 👥 Staff Salaries & Benefits (Auto-synced from Payroll)
  - ⚖️ Legal & Miscellaneous
- Attachments & Vouchers support (receipt upload, reference number, payment method).

### Module 3: Corporate Payroll & Salary Processing (Automated Accounts Hit)
- Monthly Payroll Sheet Generator (Basic Salary + Allowances - Deductions = Net Salary).
- **Direct Accounts Hit**: One-click **Pay Salary** button automatically generates a transaction in the Accounts Ledger (`admin_expenses`) under `"Staff Salaries & Benefits"`.
- Instant impact on the Profit & Loss Statement (subtracted from Gross Revenue).
- Printable official **Payslips** generation.

### Module 4: Comprehensive Profit & Loss (P&L) Statement (`/admin/reports/profit-loss`)
- 📈 **Total Platform Revenue**: Booking Commissions + HMS SaaS Subscriptions + Direct Property Revenues.
- 📉 **Total Platform Expenses**: Corporate Payroll + Marketing + Tech/Server + Office Costs.
- 📊 **Net Profit / Loss Card**: Real-time profit/loss indicator (Green = Profit, Red = Loss).
- Date Range Filters: Current Month, Previous Month, YTD, Custom Range.
- Printable P&L Statement (Letterhead format) and CSV Export.

---

## 🗄️ Database Tables to Create

1. `admin_employees` (Corporate staff directory)
2. `admin_staff_permissions` (Granular permission matrix)
3. `admin_expense_categories` (Categories for platform costs)
4. `admin_expenses` (Platform expense ledger with vouchers)
5. `admin_payrolls` (Monthly payroll disbursements)

---

## 🚀 Steps to Implement (When Ready)

1. Run database migration for `admin_employees`, `admin_staff_permissions`, `admin_expense_categories`, `admin_expenses`, `admin_payrolls`.
2. Implement backend routes: `backend/routes/admin/admin-accounting.js` and `admin-hr.js`.
3. Create frontend pages: `AdminCorporateExpenses.js`, `AdminCorporateHR.js`, `AdminProfitLossReport.js`.
4. Update `Sidebar.js` and test end-to-end P&L calculation accuracy.
