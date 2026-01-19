import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🔍</span>
                </div>
                <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
                <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-6">Page not found</h2>
                <Link to="/" className="btn-primary">
                    <Home size={18} />
                    Go Home
                </Link>
            </div>
        </div>
    );
}
