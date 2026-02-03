# Flight Calendar Round Trip Fix

## Objective
Fix the Round Trip date selection logic to allow selecting both Depart and Return dates in a single calendar interaction flow, and ensure the calendar closes automatically after the second date is selected.

## Changes Implemented

### 1. Updated `frontend/src/components/search/FlightSearchForm.js`
- **Depart DatePicker**:
    - Changed `selectsStart` to `selectsRange={tripType === 'roundTrip'}`.
    - Updated `onChange` handler to support both single date (One Way) and range updates (Round Trip).
    - **Logic for Round Trip**:
        - Destructures `[start, end]` from the update event.
        - Sets `departDate` to `start`.
        - Sets `returnDate` to `end`.
        - **Auto-Close**: Checks `if (end)` -> `setDepartOpen(false)`. This ensures that as soon as the user picks the second date (Return), the calendar closes.
    - **Logic for One Way**:
        - Standard single date update and immediate close.

## Outcome
- **Round Trip**: User clicks "Depart", picks Date 1 (Depart set), picks Date 2 (Return set), and the calendar closes.
- **One Way / Multi City**: User clicks Date 1, and the calendar closes immediately.

## Verification
- Select "Round Trip".
- Click "Depart". Two months appear.
- Click a date (Depart). Calendar stays open.
- Click a later date (Return). Range highlights, dates update, and calendar closes.
