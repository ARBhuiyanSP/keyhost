# Flight Calendar Standard Absolute Positioning

## Objective
Fix the calendar positioning by adhering to standard CSS absolute positioning rules relative to the parent container, as explicitly requested by the user.

## Root Cause Logic
The previous attempts using `strategy: 'fixed'` or tiny/invisible anchors were conflicting with `react-datepicker`'s internal Popper configuration or the user's specific CSS context. The user identified that the calendar needs to be positioned relative to its "main container" (the pill), not the viewport (fixed) or body.

## Fix Implemented
### 1. Updated `HiddenAnchor`
- Changed to `absolute inset-0 w-full h-full z-0`.
- This creates an invisible overlay that perfectly matches the dimensions of the parent container (the Depart/Return button).
- This gives the Popper engine a FULL-SIZE target to anchor to.

### 2. Removed `strategy: 'fixed'`
- Reverted to the default strategy (absolute).
- Combined with `popperPlacement="bottom-start"`, this tells Popper to locate the calendar immediately below the start (left) of the anchor element.
- Since the anchor is now the FULL button, "bottom-start" means "bottom-left corner of the button".

### 3. Parent Context
- The parent container (`div className="flex-1 relative..."`) has `position: relative`.
- The Anchor is `absolute inset-0` (child of parent).
- The Popper (absolute) will calculate position relative to this anchor.

## Expected Outcome
The calendar will now behave like a standard dropdown menu, attached to the bottom-left of the date field.

## Verification
- Reload.
- Click "Depart".
- Calendar should appear naturally below the field.
