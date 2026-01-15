// Ad Category types
export type AdCategory =
    | 'jobs'
    | 'rentals'
    | 'sales'
    | 'services'
    | 'vehicles'
    | 'matrimonial'
    | 'general';

// Category configuration
export interface CategoryConfig {
    id: AdCategory;
    label: string;
    icon: string;
    description: string;
}

export const CATEGORIES: CategoryConfig[] = [
    { id: 'jobs', label: 'Jobs', icon: '💼', description: 'Employment opportunities' },
    { id: 'rentals', label: 'Rentals', icon: '🏠', description: 'Houses, PG, commercial spaces' },
    { id: 'sales', label: 'For Sale', icon: '🏷️', description: 'Property, electronics, furniture' },
    { id: 'services', label: 'Services', icon: '🔧', description: 'Tutors, repairs, professionals' },
    { id: 'vehicles', label: 'Vehicles', icon: '🚗', description: 'Cars, bikes, commercial' },
    { id: 'matrimonial', label: 'Matrimonial', icon: '💍', description: 'Marriage proposals' },
    { id: 'general', label: 'General', icon: '📢', description: 'Miscellaneous listings' },
];

// All major Indian cities organized by state/UT
export const CITIES_BY_STATE: Record<string, string[]> = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Rajahmundry', 'Kakinada', 'Kadapa', 'Anantapur'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Arrah', 'Bihar Sharif'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad', 'Morbi', 'Mehsana', 'Bharuch'],
    'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Sonipat', 'Rohtak', 'Hisar', 'Yamunanagar', 'Panchkula'],
    'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Kullu', 'Manali', 'Baddi'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Hazaribagh', 'Deoghar', 'Giridih'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere', 'Shimoga', 'Tumkur', 'Udupi', 'Hassan'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha', 'Kottayam', 'Palakkad', 'Malappuram'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Amravati', 'Navi Mumbai', 'Sangli', 'Malegaon', 'Jalgaon', 'Akola', 'Latur', 'Ahmednagar'],
    'Manipur': ['Imphal', 'Thoubal', 'Bishnupur'],
    'Meghalaya': ['Shillong', 'Tura', 'Jowai'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Champhai'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Pathankot'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bhilwara', 'Alwar', 'Sikar', 'Sri Ganganagar'],
    'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Nagercoil'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam', 'Secunderabad'],
    'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Mathura', 'Ayodhya'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rishikesh', 'Nainital', 'Mussoorie'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Kharagpur', 'Haldia'],
    'Delhi': ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Karol Bagh', 'Lajpat Nagar', 'Connaught Place'],
    'Chandigarh': ['Chandigarh'],
    'Puducherry': ['Puducherry', 'Karaikal'],
    'Jammu & Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore'],
    'Ladakh': ['Leh', 'Kargil'],
    'Andaman & Nicobar': ['Port Blair'],
    'Dadra & Nagar Haveli': ['Silvassa'],
    'Daman & Diu': ['Daman', 'Diu'],
    'Lakshadweep': ['Kavaratti'],
};

// Flat list of all cities for dropdown
export const CITIES = Object.values(CITIES_BY_STATE).flat().sort();

export type City = string;

// Duration options
export interface DurationOption {
    days: number;
    label: string;
    price: string;
    available: boolean;
}

export const DURATION_OPTIONS: DurationOption[] = [
    { days: 7, label: '1 Week', price: 'Free', available: true },
    { days: 14, label: '2 Weeks', price: '₹49', available: true },
    { days: 30, label: '1 Month', price: '₹99', available: true },
    { days: 90, label: '3 Months', price: '₹249', available: true },
];

// User profile
export interface User {
    id: string;
    phone_number: string;
    email?: string;
    display_name?: string;
    created_at: string;
    updated_at: string;
}

// Ad type
export interface Ad {
    id: string;
    user_id: string;
    title: string;
    subject: string;
    description: string;
    sub_description?: string;
    phone_number: string;
    category: AdCategory;
    city: City;
    location?: string;
    created_at: string;
    expires_at: string;
    is_active: boolean;
    views_count: number;
    calls_count: number;
    is_featured: boolean;
    approval_status?: 'pending' | 'approved' | 'rejected';
    approved_by?: string;
    approved_at?: string;
    rejection_reason?: string;
}

// Form data
export interface AdFormData {
    title: string;
    subject: string;
    description: string;
    sub_description?: string;
    phone_number: string;
    category: AdCategory;
    city: City;
    location?: string;
    duration_days: number;
    is_featured: boolean;
}

// Session
export interface Session {
    access_token: string;
    user: User;
}

// Filter state
export interface AdsFilter {
    city: City | 'all';
    category: AdCategory | 'all';
    searchQuery: string;
}

// Toast
export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

// Validation helpers
export const validatePhone = (phone: string): boolean => /^[6-9]\d{9}$/.test(phone);
export const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
