import React from 'react';
import { useSearchParams } from 'react-router-dom';
import FlightSearchResults from '../components/search/FlightSearchResults';
import SEO from '../components/common/SEO';

const FlightResultsPage = () => {
    const [searchParams] = useSearchParams();
    const filters = Object.fromEntries([...searchParams]);

    return (
        <div className="min-h-screen bg-[#F4F6F9]">
            <SEO
                title="Flight Search Results | Keyhost"
                description="Find the best flight deals with Keyhost."
            />
            <div className="pt-0"> {/* Form is inside FlightSearchResults component as a collapsible header */}
                <FlightSearchResults searchParams={filters} />
            </div>
        </div>
    );
};

export default FlightResultsPage;
