# Flight Calendar Manual Positioning Fix

## Objective
Fix the persistent positioning bug where the calendar appears in the top-left corner by implementing manual DOM Portal positioning as requested ("CSS absolute positioning and container relative positioning").

## Implementation Details
1.  **DOM Portals**:
    - Created `refs` (e.g., `departContainerRef`) for each date input container.
    - Used `createPortal` to render the calendar physically inside these containers instead of `document.body`.
    - This allows standard CSS absolute positioning rules to work relative to the parent div.

2.  **CSS Overrides**:
    - Updated `.fresh-datepicker-popper` in `index.css`:
        - `position: absolute !important`
        - `top: 100% !important`: Pushes the calendar below the input.
        - `left: 50% !important`: Centers it horizontally relative to the input.
        - `transform: translateX(-50%) !important`: Adjusts for the calendar's own width to perfectly center it.
        - `inset: auto !important`: Resets any inline styles Popper.js might try to inject (like `top: 0px`).

## Outcome
The calendar is now a child of the `relative` button container. Standard CSS rules force it to sit centered directly below the button, bypassing any complex coordinate calculations that were failing previously.

## Verification
- Reload the page.
- Click "Depart".
- The calendar should appear centered below the Depart button.
