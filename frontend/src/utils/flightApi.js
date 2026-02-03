import axios from 'axios';

const FLIGHT_API_BASE_URL = 'http://127.0.0.1:8000/api';

const flightApi = axios.create({
    baseURL: FLIGHT_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

export default flightApi;
