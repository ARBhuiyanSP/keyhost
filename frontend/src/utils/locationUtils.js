import { State, City } from 'country-state-city';

// Bangladesh has an issue in country-state-city where divisions are mislabeled as districts
// and there are numerous empty districts. This filters and fixes the formatting.
export const getStatesForCountry = (countryCode) => {
    let states = State.getStatesOfCountry(countryCode);

    if (countryCode === 'BD') {
        // These 8 ISO codes actually contain the cities mapping for Bangladesh
        const bdDivisionsIsoCodes = ['06', 'B', '13', '27', '34', '54', '55', '60'];
        states = states.filter(s => bdDivisionsIsoCodes.includes(s.isoCode));

        // Rename 'District' to 'Division' for better UX
        states = states.map(s => ({
            ...s,
            name: s.name.replace('District', 'Division')
        }));
    }

    return states.map(s => ({ value: s.isoCode, label: s.name }));
};

export const getCitiesForState = (countryCode, stateCode) => {
    return City.getCitiesOfState(countryCode, stateCode).map(c => ({ value: c.name, label: c.name }));
};
