import axios from 'axios';

const FLIGHT_API_BASE_URL = 'http://127.0.0.1:8000/api';

const flightApi = axios.create({
    baseURL: FLIGHT_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
flightApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth-storage');
        if (token) {
            try {
                const authData = JSON.parse(token);
                if (authData.state?.token) {
                    config.headers.Authorization = `Bearer ${authData.state.token}`;
                }
            } catch (error) {
                console.error('Error parsing auth token for flightApi:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Aerotake Search Hub (New)
export const searchSabre = async (params) => {
    try {
        const response = await flightApi.post('/searchSabre', params);
        return response.data;
    } catch (error) {
        console.error('Error in searchSabre:', error);
        throw error;
    }
};

export const searchAmadeus = async (params) => {
    try {
        const response = await flightApi.post('/searchAmadeus', params);
        return response.data;
    } catch (error) {
        console.error('Error in searchAmadeus:', error);
        throw error;
    }
};

export const initiateSearch = async (params) => {
    try {
        const response = await flightApi.post('/search', params);
        return response.data;
    } catch (error) {
        console.error('Error initiating flight search:', error);
        throw error;
    }
};

export const fetchAmadeusResults = async (folder) => {
    try {
        const response = await flightApi.post('/search/amadeus', { folder });
        return response.data;
    } catch (error) {
        console.error('Error fetching Amadeus results:', error);
        throw error;
    }
};

export const fetchSabreResults = async (folder, flightType) => {
    try {
        const response = await flightApi.post('/search/sabre', { folder, flight_type: flightType });
        return response.data;
    } catch (error) {
        console.error('Error fetching Sabre results:', error);
        throw error;
    }
};

export const revalidateFlight = async (flightData) => {
    try {
        const response = await flightApi.post('/flight-revalidate', flightData);
        return response.data;
    } catch (error) {
        console.error("Revalidation Error:", error);
        throw error;
    }
};

export const bookFlight = async (bookingData) => {
    try {
        // Ensure flightData is a string as backend controller expects
        if (typeof bookingData.flightData === 'object') {
            bookingData.flightData = JSON.stringify(bookingData.flightData);
        }

        const response = await flightApi.post('/book-flight', bookingData);
        return response.data;
    } catch (error) {
        console.error("Booking Error:", error);
        throw error;
    }
};

export const fetchCountries = async () => {
    try {
        const response = await flightApi.get('/countries');
        return response.data;
    } catch (error) {
        console.error("Fetch Countries Error:", error);
        throw error; // Return empty array or throw?
    }
};

export default flightApi;
