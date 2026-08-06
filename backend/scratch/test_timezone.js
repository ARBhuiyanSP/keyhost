const { format, addDays, subDays, parseISO, isSameDay, startOfDay } = require('date-fns');

// Simulating rangeDates on June 14, 2026
const startDate = startOfDay(new Date("2026-06-14T15:13:05+06:00")); // June 14
const visibleDaysCount = 14;

const getRangeDates = (start, count) => {
    const dates = [];
    for (let i = 0; i < count; i++) {
        dates.push(addDays(start, i));
    }
    return dates;
};

const rangeDates = getRangeDates(startDate, visibleDaysCount);
const rangeEndDate = rangeDates[visibleDaysCount - 1];

console.log("Start Date:", startDate.toISOString());
console.log("Range End Date:", rangeEndDate.toISOString());

// Let's test a booking from June 6 to June 30, 2026 (booking 238)
const booking_238 = {
    check_in_date: "2026-06-05T18:00:00.000Z", // June 6 midnight BD time
    check_out_date: "2026-06-29T18:00:00.000Z" // June 30 midnight BD time
};

const getBookingSpan = (booking) => {
    const ci = startOfDay(new Date(booking.check_in_date));
    const co = startOfDay(new Date(booking.check_out_date));
    
    console.log("Parsed Check-In (ci):", ci.toISOString(), ci.toString());
    console.log("Parsed Check-Out (co):", co.toISOString(), co.toString());

    if (co <= rangeDates[0] || ci >= addDays(rangeEndDate, 1)) {
        console.log("OUT OF BOUNDS!");
        return null;
    }

    let startIndex = 0;
    if (ci > rangeDates[0]) {
        const diffTime = ci - rangeDates[0];
        startIndex = Math.round(diffTime / (1000 * 60 * 60 * 24));
    }

    let endIndex = visibleDaysCount;
    if (co <= addDays(rangeEndDate, 1)) {
        const diffTime = co - rangeDates[0];
        endIndex = Math.round(diffTime / (1000 * 60 * 60 * 24));
    }

    startIndex = Math.max(0, Math.min(visibleDaysCount - 1, startIndex));
    endIndex = Math.max(1, Math.min(visibleDaysCount, endIndex));

    console.log(`startIndex: ${startIndex}, endIndex: ${endIndex}`);
    if (startIndex >= endIndex) return null;

    const leftOffset = (startIndex / visibleDaysCount) * 100;
    const width = ((endIndex - startIndex) / visibleDaysCount) * 100;

    return {
        left: leftOffset,
        width: width
    };
};

console.log("Result Booking 238:", getBookingSpan(booking_238));
