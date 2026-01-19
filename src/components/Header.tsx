import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdsContext';
import { ThemeToggleButton } from './ThemeToggle';
import { CITIES_BY_STATE, City } from '../types';
import { Search, User, LogOut, Plus, Menu, X, MapPin, ChevronDown } from 'lucide-react';

export function Header() {
    const { user, signOut } = useAuth();
    const { filter, setFilter } = useAds();
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState(filter.searchQuery);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [citySearch, setCitySearch] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setFilter({ searchQuery: searchInput });
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleCitySelect = (city: City | 'all') => {
        setFilter({ city });
        setShowCityDropdown(false);
        setCitySearch('');
    };

    // Filter cities based on search
    const filteredCities = Object.entries(CITIES_BY_STATE).reduce((acc, [state, cities]) => {
        const filtered = cities.filter(city =>
            city.toLowerCase().includes(citySearch.toLowerCase()) ||
            state.toLowerCase().includes(citySearch.toLowerCase())
        );
        if (filtered.length > 0) acc[state] = filtered;
        return acc;
    }, {} as Record<string, string[]>);

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
            <div className="container-app">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
                            adexpress<span className="text-primary-600 dark:text-primary-400">360</span>
                        </span>
                    </Link>

                    {/* Search - desktop */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search ads..."
                                className="input pl-12 py-2.5"
                            />
                        </div>
                    </form>

                    {/* City selector - desktop */}
                    <div className="hidden lg:block relative">
                        <button
                            onClick={() => setShowCityDropdown(!showCityDropdown)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <MapPin size={16} className="text-gray-400" />
                            <span>{filter.city === 'all' ? 'All India' : filter.city}</span>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showCityDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowCityDropdown(false)} />
                                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-100 dark:border-gray-700 z-20 animate-fade-in">
                                    <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                                        <input
                                            type="text"
                                            value={citySearch}
                                            onChange={(e) => setCitySearch(e.target.value)}
                                            placeholder="Search city or state..."
                                            className="input py-2 text-sm"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-80 overflow-y-auto p-2">
                                        <button
                                            onClick={() => handleCitySelect('all')}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${filter.city === 'all' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            🇮🇳 All India
                                        </button>
                                        {Object.entries(filteredCities).map(([state, cities]) => (
                                            <div key={state} className="mt-2">
                                                <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    {state}
                                                </div>
                                                {cities.map(city => (
                                                    <button
                                                        key={city}
                                                        onClick={() => handleCitySelect(city)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filter.city === city ? 'bg-primary-50 text-primary-700 font-medium' : 'hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {city}
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggleButton />
                        <Link to="/post-ad" className="btn-primary">
                            <Plus size={18} />
                            Post Ad
                        </Link>
                        {user ? (
                            <div className="flex items-center gap-2">
                                <Link to="/dashboard" className="btn-ghost">
                                    <User size={18} />
                                    Dashboard
                                </Link>
                                <button onClick={handleSignOut} className="btn-ghost p-2.5" title="Sign Out">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Link to="/auth" className="btn-secondary">
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile search */}
                <div className="md:hidden pb-3">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search ads..."
                            className="input pl-10 py-2"
                        />
                    </form>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 animate-fade-in">
                    <div className="container-app py-4 space-y-3">
                        {/* City selector */}
                        <select
                            value={filter.city}
                            onChange={(e) => setFilter({ city: e.target.value as City | 'all' })}
                            className="select"
                        >
                            <option value="all">🇮🇳 All India</option>
                            {Object.entries(CITIES_BY_STATE).map(([state, cities]) => (
                                <optgroup key={state} label={state}>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>

                        {/* Theme toggle for mobile */}
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                            <ThemeToggleButton />
                        </div>

                        <Link to="/post-ad" className="btn-primary w-full" onClick={() => setMobileMenuOpen(false)}>
                            <Plus size={18} /> Post Ad
                        </Link>

                        {user ? (
                            <>
                                <Link to="/dashboard" className="btn-secondary w-full" onClick={() => setMobileMenuOpen(false)}>
                                    <User size={18} /> Dashboard
                                </Link>
                                <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="btn-ghost w-full">
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </>
                        ) : (
                            <Link to="/auth" className="btn-secondary w-full" onClick={() => setMobileMenuOpen(false)}>
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
