import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../types';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 mt-auto">
            <div className="container-app py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">A</span>
                            </div>
                            <span className="font-bold text-xl text-white">
                                adexpress<span className="text-primary-400">360</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Your trusted classifieds platform. Post and discover opportunities across India.
                        </p>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Categories</h4>
                        <ul className="space-y-2">
                            {CATEGORIES.slice(0, 5).map(category => (
                                <li key={category.id}>
                                    <Link
                                        to={`/?category=${category.id}`}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {category.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Browse Ads
                                </Link>
                            </li>
                            <li>
                                <Link to="/post-ad" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Post an Ad
                                </Link>
                            </li>
                            <li>
                                <Link to="/auth" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    My Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>support@adexpress360.in</li>
                            <li>+91 1800-XXX-XXXX</li>
                            <li>Mumbai, India</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-800">
                <div className="container-app py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
                    <p>© {currentYear} adexpress360. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms & Conditions</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
