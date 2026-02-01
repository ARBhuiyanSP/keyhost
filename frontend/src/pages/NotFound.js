import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Page Not Found</h2>
          <p className="text-gray-600 mt-2">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary inline-flex items-center"
          >
            <FiHome className="mr-2" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary inline-flex items-center ml-4"
          >
            <FiArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-500">
            If you think this is an error, please{' '}
            <Link to="/contact" className="text-primary-600 hover:text-primary-700">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
