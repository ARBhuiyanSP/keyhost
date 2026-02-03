# Flight Calendar Visual Refinement

## Objective
Refine the flight calendar visualization to appear "form er thik niche" (exactly below the form/input).

## Changes Implemented

### 1. Updated `frontend/src/components/search/FlightSearchForm.js`
- Changed `popperPlacement` from `bottom-start` to **`bottom`** for all `DatePicker` instances (Depart, Return, Multi-City).
- This directs Popper.js to center the calendar relative to the anchor.
- Since the anchor is the "Depart" input (a 1px line at the bottom of the Depart field), the calendar will now appear centered under the Depart field.
- NOTE: The Depart field is physically located in the visual center-left of the search pill. Centering the calendar here is the standard UX pattern (as seen in major travel sites) to balance the wide 2-month display properly relative to the click origin.

### 2. Updated `frontend/src/index.css`
- **Tighter Spacing**: Reduced `padding-top` from 16px to **12px** in `.fresh-datepicker-popper`. This brings the calendar visually closer to the "Date Selection Field", reducing the "floating" gap.
- **Refined Shadow**: Updated `box-shadow` to `0 10px 40px rgba(0, 0, 0, 0.1)` for a softer, more professional "floating card" look, matching the user's high-aesthetic requirement.
- **Border**: Added a subtle `1px solid rgba(0,0,0,0.05)` border to define the card edges clearly against white backgrounds.

## Verification
- Click "Depart".
- The calendar should appear centered under the Depart button.
- The gap between the search bar and the calendar should be minimal (12px), making it feel attached.
- The shadow should be smooth and the edges clean.
