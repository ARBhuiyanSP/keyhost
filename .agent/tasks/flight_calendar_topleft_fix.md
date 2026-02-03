# Flight Calendar Top-Left Corner Fix

## Objective
Fix the critical bug where the flight calendar renders in the top-left corner of the screen (0,0 coordinate) instead of below the date field.

## Root Cause
The `DatePicker` input was previously styled with `absolute bottom-0 left-0`.
However, because it was rendered as a child of a Flexbox container (`pillSectionBase` uses `flex`), and potentially interfering with `react-datepicker`'s internal ref logic, the library failed to calculate the bounding box of the anchor correctly.
Specifically, `react-datepicker`'s Popper engine likely saw the collapsed/absolute input as having `0x0` dimensions at origin `(0,0)` of the viewport or stacking context, causing the "Top Left" glitch.

## Fix Implemented
### 1. Updated `frontend/src/components/search/FlightSearchForm.js`
- **Removed Absolute Positioning**: Changed the `DatePicker` `className` (input) and `wrapperClassName` to regular flow elements.
- **Used Flex Flow**:
    - `wrapperClassName="w-full h-px -mt-px"`: This creates a 1px high wrapper that sits naturally at the bottom of the flex column. Using `-mt-px` (negative margin) ensures it doesn't add extra visual height to the container.
    - `className="w-full h-px opacity-0 overflow-hidden"`: The input itself is invisible but occupies layout space in the DOM flow.
- **Reference Logic**: Since the element now exists in the document flow at the bottom of the column, Popper.js can correctly calculate its `getBoundingClientRect()`.
- **Placement**: `popperPlacement="bottom"` ensures it centers relative to this bottom anchor line.

## Expected Outcome
The calendar should now correctly identify the bottom of the "Depart" button as its reference point and render directly below it, centered.

## Verification
- Reload the page.
- Click "Depart".
- The calendar MUST render attached to the search bar, not floating in the corner.
