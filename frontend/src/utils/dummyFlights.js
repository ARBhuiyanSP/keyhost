export const DUMMY_FLIGHTS = [
    {
        airlineName: "Emirates",
        airlineCode: "EK",
        airlineLogo: "https://www.emirates.com/favicon.ico",
        legs: {
            "leg1": {
                departure: { airport: "DAC", airportName: "Dhaka", time: "2026-02-15T08:00:00" },
                arrival: { airport: "DXB", airportName: "Dubai", time: "2026-02-15T11:00:00" },
                duration: "5h 00m",
                stopovers: []
            },
            "leg2": {
                departure: { airport: "DXB", airportName: "Dubai", time: "2026-02-15T14:00:00" },
                arrival: { airport: "LHR", airportName: "London", time: "2026-02-15T18:00:00" },
                duration: "7h 00m",
                stopovers: []
            }
        },
        fare: {
            totalPrice: 850,
            currency: "USD",
            basePrice: 700,
            tax: 150,
            breakdown: {
                adult: 850,
                child: 0,
                infant: 0
            }
        },
        cabinClass: "Economy"
    },
    {
        airlineName: "Qatar Airways",
        airlineCode: "QR",
        airlineLogo: "https://www.qatarairways.com/favicon.ico",
        legs: {
            "leg1": {
                departure: { airport: "DAC", airportName: "Dhaka", time: "2026-02-15T10:00:00" },
                arrival: { airport: "DOH", airportName: "Doha", time: "2026-02-15T13:00:00" },
                duration: "5h 00m",
                stopovers: []
            }
        },
        fare: {
            totalPrice: 620,
            currency: "USD",
            basePrice: 500,
            tax: 120,
            breakdown: {
                adult: 620
            }
        },
        cabinClass: "Economy"
    }
];
