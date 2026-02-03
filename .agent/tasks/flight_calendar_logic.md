# Flight Calendar Logic Update

## Objective
Update the flight search calendar logic to dynamically adjust the number of months shown based on the trip type and enable range selection for round trips.

## Changes Implemented

### 1. Updated `frontend/src/components/search/FlightSearchForm.js`
- **Depart DatePicker**:
    - Updated `monthsShown` logic: `tripType === 'roundTrip' && window.innerWidth >= 768 ? 2 : 1`. This ensures One Way shows only 1 month on all devices, while Round Trip shows 2 on desktop.
    - Added `selectsStart={tripType === 'roundTrip'}`, `startDate={departDate}`, and `endDate={returnDate}`. This enables the start of a range selection visual when in Round Trip mode.
- **Return DatePicker**:
    - Added `selectsEnd`, `startDate={departDate}`, and `endDate={returnDate}`. This completes the range visual logic.
    - Retained 2 months display for Return calendar (as it implies Round Trip).
- **Multi City DatePicker**:
    - Hardcoded `monthsShown={1}` to ensure Multi City segments always show a compact single-month calendar.

## Rationale
The user specifically requested that One Way and Multi City modes display a single calendar month, while Round Trip should display two calendars with range selection capabilities. The `react-datepicker` props `selectsStart`/`selectsEnd` along with passing both `startDate` and `endDate` achieve the highlight effect across the two separate inputs.

## Verification
- **One Way**: Select "One Way". Click "Depart". Calendar should show **1 month**. Range highlighting should be disabled.
- **Round Trip**: Select "Round Trip". Click "Depart". Calendar should show **2 months** (on desktop). Selecting a date should start a range. Click "Return". Calendar shows 2 months. Selecting a date should complete the highlighted range between Depart and Return.
- **Multi City**: Select "Multi City". Click any segment's date. Calendar should show **1 month**.
