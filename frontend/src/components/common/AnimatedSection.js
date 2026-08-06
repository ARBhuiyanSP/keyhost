import React from 'react';
import { useInView } from 'react-intersection-observer';

const AnimatedSection = ({ children, className = '', threshold = 0.1, delay = 0 }) => {
  const { ref, inView } = useInView({
    threshold: threshold,
    triggerOnce: true, // Only animate once when it comes into view
  });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out flex-shrink-0 w-full h-full ${
        inView 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms`, willChange: 'opacity, transform' }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
