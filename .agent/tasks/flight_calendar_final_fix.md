# Flight Calendar Position Fix (Final)

## Objective
Permanently fix the calendar positioning issue where it defaults to the top-left corner due to missing DOM references.

## Root Cause
The previous "hidden input" hacks (using `className="hidden"` or `overflow-hidden`) likely caused `react-datepicker`'s internal Popper instance to fail in calculating a valid reference element (anchor). If an element has 0x0 dimensions or is not properly ref-forwarded, Popper defaults to `(0,0)`.

## Fix Implemented
### 1. Introduced `HiddenAnchor` Component
- Created a `React.forwardRef` component named `HiddenAnchor`.
- This component renders a `div` with:
    - `absolute bottom-0 left-0 w-full h-0`: Positioned exactly at the bottom visual edge of the date field.
    - **`flex justify-center`**: Ensures it has "layout" properties even if height is 0.
    - **`ref={ref}`**: CRITICAL. This passes the DOM node reference specifically to `react-datepicker`, giving it a concrete, measurable element to attach the popup to.

### 2. Updated `FlightSearchForm.js`
- Replaced the failing `className`/`wrapperClassName` props with `customInput={<HiddenAnchor />}`.
- This creates a direct connection between the DatePicker logic and the physical DOM anchor.

## Expected Outcome
The calendar will now reliably find the `HiddenAnchor` div at the bottom of the date pill and position itself relative to it (centered at the bottom), solving the "top-left" bug for good.

## Verification
- Click "Depart".
- Usage of `customInput` guarantees the popup attaches to the provided element.
- The calendar should appear centered exactly below the field.
