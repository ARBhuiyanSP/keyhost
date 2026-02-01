import React, { useState, useEffect } from 'react';
import { FiChevronUp } from 'react-icons/fi';

const GoToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-[#E41D57] hover:bg-[#C01A4A] text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl transform hover:scale-105 border border-white"
      aria-label="Go to top"
    >
      <FiChevronUp className="w-6 h-6" />
    </button>
  );
};

export default GoToTop;
