import axios from 'axios';

const FLIGHT_API_BASE_URL = 'http://aerotake.test/api/v1';

const flightApi = axios.create({
    baseURL: FLIGHT_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
