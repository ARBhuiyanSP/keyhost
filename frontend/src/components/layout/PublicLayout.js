import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileFooter from './MobileFooter';
import SEO from '../common/SEO';
import ScrollToTop from '../common/ScrollToTop';
import GoToTop from '../common/GoToTop';

const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-beige-100">
            <SEO />
            <ScrollToTop />
            <Navbar />
            <main className="min-h-screen">
                <Outlet />
            </main>
            <Footer />
            <MobileFooter />
            <GoToTop />
        </div>
    );
};

export default PublicLayout;
