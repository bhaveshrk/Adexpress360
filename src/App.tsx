// Build: v2.0.2 - Added BrowseAds page
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdsProvider } from './contexts/AdsContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Index } from './pages/Index';
import { Auth } from './pages/Auth';
import { PostAd } from './pages/PostAd';
import { Dashboard } from './pages/Dashboard';
import { EditAd } from './pages/EditAd';
import { Category } from './pages/Category';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';
import { BrowseAds } from './pages/BrowseAds';
import { AdDetail } from './pages/AdDetail';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <AdsProvider>
                        <ToastProvider>
                            <Routes>
                                <Route path="/" element={<Index />} />
                                <Route path="/browse" element={<BrowseAds />} />
                                <Route path="/ad/:id" element={<AdDetail />} />
                                <Route path="/auth" element={<Auth />} />
                                <Route path="/post-ad" element={<PostAd />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/edit-ad/:id" element={<EditAd />} />
                                <Route path="/category/:categoryId" element={<Category />} />
                                <Route path="/admin" element={<AdminLogin />} />
                                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                <Route path="/privacy" element={<PrivacyPolicy />} />
                                <Route path="/terms" element={<TermsConditions />} />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </ToastProvider>
                    </AdsProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
