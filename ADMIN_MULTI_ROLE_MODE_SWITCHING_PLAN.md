# Admin Multi-Role Mode Switching Feature Plan
> **Status:** Saved for Future Implementation (Do not execute code yet)  
> **Created:** August 12, 2026

---

## 📌 Feature Overview & Goals

Allow Super Admin users (`user_type = 'admin'`) to seamlessly switch between three operating modes from the top navigation header:

1. 🛡️ **Admin Mode (`/admin`)**:
   - Access to global platform controls, financial reports, all user accounts, system settings, and commission configurations.
2. 🏡 **Host Mode (`/property-owner`)**:
   - Access to Property Owner / HMS Dashboard. Admins can list and manage their own properties, setup HMS rooms, add extra bills, manage staff, and handle desk collections.
3. 🧳 **Guest Mode (`/guest` or `/`)**:
   - Access to the traveler portal. Admins can browse listed properties, test checkout/booking flows, and manage guest bookings.

---

## ⚙️ Technical Architecture & Scoping

### 1. Database & Owner Relationship
- When an Admin accesses **Host Mode**, the system auto-heals and verifies that a corresponding `property_owners` record exists for `user_id = req.user.id`.
- The Admin's properties and HMS rooms remain strictly scoped to `owner_id = req.user.id`.

### 2. Backend Middleware Changes (`backend/middleware/auth.js`)
- Update `requirePropertyOwner` middleware to accept `req.user.user_type === 'admin'` in addition to `'property_owner'` and `'staff'`.
- Ensure `requireHMSAccess` permits `admin` users operating in Host Mode.

### 3. Frontend Dashboard State (`frontend/src/components/layout/DashboardLayout.js`)
- Update `dashboardMode` state to handle three modes: `'admin'`, `'host'`, and `'guest'`.
- Render a 3-way Mode Switcher Dropdown in the top header:
  - `🛡️ Admin Panel` -> navigates to `/admin`
  - `🏡 Host Dashboard` -> navigates to `/property-owner`
  - `🧳 Guest Portal` -> navigates to `/guest` or `/`
- Add color-coded badges to indicate current active mode (Admin = Purple, Host = Blue, Guest = Emerald).

### 4. Public Navigation Header (`Navbar.js` & `StickySearchHeader.js`)
- Include single-click switch links in desktop & mobile headers for Admin users.

---

## 🚀 Steps to Implement (When Ready)

1. Modify `backend/middleware/auth.js` (`requirePropertyOwner`).
2. Update `DashboardLayout.js` (`dashboardMode` state, header mode switcher dropdown, profile menu).
3. Update `Navbar.js` and `StickySearchHeader.js` mode switcher links.
4. Test switching seamlessly between Admin, Host, and Guest modes.
