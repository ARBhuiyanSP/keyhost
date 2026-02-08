# Flight Calendar Auto-Close Fix

## Objective
Fix the issue where the flight calendar would not close after selecting a date, even though the logic instructed it to.

## Root Cause
The `DatePicker` component is nested inside a container `div` that has an `onClick` handler designated to **open** the calendar (`setDepartOpen(true)`). 
Because React Portals propagate events up the React component tree (regardless of DOM position), clicking a date in the calendar `Popper` caused the click event to bubble up to the parent `div`.
So, the sequence was:
1. User clicks date -> `onChange` fires -> Sets `open` to `false`.
2. Event bubbles to parent `div` -> `onClick` fires -> Sets `open` to `true`.
Result: Calendar appeared to never close.

## Fix Implemented
Updated the `onChange` handlers for all 3 DatePicker instances (Depart, Return, Multi-City) to:
1. Accept the `event` object as the second argument.
2. Call `event.stopPropagation()` immediately.

This stops the click event from reaching the parent `div`, allowing the `setOpen(false)` state update to persist.

## Verification
- **One Way/Single Trip**: Click date -> Calendar closes immediately.
- **Round Trip**: Click Depart -> Click Return date -> Calendar closes immediately.
- **Multi City**: Click date -> Calendar closes immediately.
