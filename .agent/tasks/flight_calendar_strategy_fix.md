# Flight Calendar Fixed Strategy

## Objective
Fix the persistent issue where the flight calendar text appears in the top-left corner (0,0) instead of anchored to the date field.

## Root Cause
The `absolute` positioning of the parent container combined with `react-datepicker`'s default `absolute` popper strategy likely causes coordinate calculation errors, especially if a parent has `overflow: hidden` or a CSS transform context. This is a known issue with Popper.js in complex layouts.

## Fix Implemented
### 1. Updated `HiddenAnchor`
- Changed height from `h-0` to `h-px`. This gives the element a physical dimension in the DOM box mode, ensuring Popper can calculate its `bottom` edge correctly.

### 2. Added `popperProps={{ strategy: 'fixed' }}`
- Forced Popper.js to use `position: fixed`.
- **Why?** This takes the popup out of the document flow and positions it relative to the viewport. This bypasses any weird stacking contexts or overflow clipping in the parent containers (`pillSectionBase`).

## Expected Outcome
The calendar should now float above everything else, perfectly positioned relative to the Anchor element coordinates, and NOT default to `(0,0)`.

## Verification
- Reload.
- Click "Depart".
- Calendar should appear centered below the date field.
