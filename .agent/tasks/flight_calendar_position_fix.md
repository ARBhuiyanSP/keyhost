# Flight Calendar Position Fix

## Objective
Fix the calendar positioning so it appears **exactly** at the bottom of the date selection pill/field.

## Changes Implemented

### 1. Updated `frontend/src/components/search/FlightSearchForm.js`
- **Replaced `className="hidden"`**:
    - Previously, the input was hidden (display: none), causing the Popper.js engine to lose its reference geometry or anchor to an incorrect position (like top-left or fallback).
- **New Classes**:
    - `className="w-full h-px opacity-0 absolute bottom-0 left-0"`: This renders an invisible 1px-height line at the bottom of the date pill container. It acts as the **geometric anchor** for the popper.
    - `wrapperClassName="w-full h-px absolute bottom-0 left-0"`: Ensures the wrapper `div` (which React DatePicker creates) also sits at the exact bottom of the container.
- **Logic**:
    - By anchoring the `DatePicker` component to the bottom edge of the parent `relative` container, `popperPlacement="bottom-start"` now correctly calculates the position starting from that bottom edge.

## Outcome
The calendar popup should now appear anchored to the bottom-left of the date pill, looking like a natural dropdown.

## Verification
- Click on "Depart" or "Return".
- The calendar should open strictly below the field, aligned to the left, without large gaps or strange offsets.
