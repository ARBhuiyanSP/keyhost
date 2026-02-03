# Flight Calendar Position and Design Fix

## Objective
Fix the position and design of the flight search calendar on the search page (`/search?property_type=flight`).

## Changes Implemented

### 1. Updated `frontend/src/index.css`
- Modified `.fresh-datepicker-popper` styles to:
    - Enable **flexbox layout** (`display: flex; flex-direction: row`) for the `react-datepicker` container. This ensures that when `monthsShown={2}` is set (on desktop), the months appear side-by-side instead of stacked or broken.
    - Updated shadows and padding for a cleaner, more premium look.
    - Adjusted day cell styling (circles, hover effects) to match modern design patterns (Airbnb/Google Flights style).
    - Added media query for mobile responsiveness (stacking months vertically if needed, though usually mobile shows 1 month).
    - Fixed positioning offset with `padding-top`.
    - Removed excessive pink styling in favor of a neutral, high-contrast black/white theme with rounded corners, suitable for professional flight booking.

## Rationale
The previous styles for `.fresh-datepicker-popper` lacked flexbox properties, which likely caused the dual-month view (standard for flight searches) to render incorrectly (e.g., stacked or overflowing). The updated CSS adheres to the user's request for "position and design fix" without altering the underlying React logic.

## Verification
- Navigate to `http://localhost:3000/search?property_type=flight`.
- Click on the "Depart" or "Return" date fields.
- The calendar should now appear nicely positioned, with two months side-by-side on desktop, and styled with clean rounded selection indicators.
