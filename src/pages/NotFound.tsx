import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../hooks/usePageSEO';

const NotFoundPage: React.FC = () => {
  usePageSEO({
    title: '404 Page Not Found | Skin of Korea',
    description: 'The page you are looking for does not exist or has been moved.',
    noIndex: true,
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA] p-4">
      <div className="bg-white shadow-xs border border-neutral-200 rounded-2xl p-8 max-w-md text-center">
        <h1 className="text-6xl font-sans font-bold text-[#111111] mb-3">404</h1>
        <h2 className="text-xl font-sans font-semibold mb-3 text-neutral-800">Page Not Found</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mb-6">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition font-medium text-xs uppercase tracking-wider inline-block">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
