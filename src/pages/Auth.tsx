import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { checkPasswordStrength, isValidPhone } from '../utils/security';
import { setupRecaptcha, sendOTP, verifyOTP, clearRecaptcha, type ConfirmationResult } from '../lib/firebase';
import { Phone, Lock, User, Mail, ArrowLeft, Eye, EyeOff, Shield, CheckCircle, Loader } from 'lucide-react';

type AuthStep = 'credentials' | 'otp';

export function Auth() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // OTP State
    const [step, setStep] = useState<AuthStep>('credentials');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [otpTimer, setOtpTimer] = useState(0);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const recaptchaContainerRef = useRef<HTMLDivElement>(null);

    const { signIn, signUp, user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const passwordStrength = checkPasswordStrength(password);

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    // Cleanup reCAPTCHA on unmount
    useEffect(() => {
        return () => {
            clearRecaptcha();
        };
    }, []);

    // OTP Timer
    useEffect(() => {
        if (otpTimer > 0) {
            const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [otpTimer]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
        setError('');
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        setError('');
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = pastedData.split('');
        while (newOtp.length < 6) newOtp.push('');
        setOtp(newOtp);
        if (pastedData.length > 0) {
            otpRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    const handleSendOtp = async () => {
        if (!isValidPhone(phoneNumber)) {
            setError('Enter a valid 10-digit mobile number starting with 6-9');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Setup reCAPTCHA
            setupRecaptcha('recaptcha-container');

            // Send OTP via Firebase
            const result = await sendOTP(phoneNumber);
            setConfirmationResult(result);
            setStep('otp');
            setOtpTimer(60);
            setOtp(['', '', '', '', '', '']);

            showToast('OTP sent to your phone!', 'success');

            // Focus first OTP input
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (err: unknown) {
            console.error('OTP send error:', err);

            // Get the Firebase error code
            const firebaseError = err as { code?: string; message?: string };
            const errorCode = firebaseError.code || '';
            const errorMessage = firebaseError.message || 'Unknown error';

            console.log('Firebase error code:', errorCode);
            console.log('Firebase error message:', errorMessage);

            if (errorCode.includes('too-many-requests')) {
                setError('Too many attempts. Please try again later.');
            } else if (errorCode.includes('invalid-phone-number')) {
                setError('Invalid phone number format.');
            } else if (errorCode.includes('captcha-check-failed')) {
                setError('reCAPTCHA verification failed. Please refresh and try again.');
            } else if (errorCode.includes('app-not-authorized')) {
                setError('Firebase Phone Auth not enabled. Please enable it in Firebase Console.');
            } else if (errorCode.includes('network-request-failed')) {
                setError('Network error. Please check your internet connection.');
            } else {
                // Show actual error for debugging
                setError(`Error: ${errorCode || errorMessage}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (otpTimer > 0) return;

        setLoading(true);
        try {
            setupRecaptcha('recaptcha-container');
            const result = await sendOTP(phoneNumber);
            setConfirmationResult(result);
            setOtpTimer(60);
            setOtp(['', '', '', '', '', '']);
            showToast('OTP resent!', 'success');
            otpRefs.current[0]?.focus();
        } catch (err) {
            console.error('Resend error:', err);
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join('');

        if (enteredOtp.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        if (!confirmationResult) {
            setError('Session expired. Please request a new OTP.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Verify OTP with Firebase
            console.log('Verifying OTP...');
            await verifyOTP(confirmationResult, enteredOtp);
            console.log('OTP verified successfully!');

            // Phone verified! Now create the app account
            console.log('Creating account with phone:', phoneNumber);
            console.log('Display name:', displayName);

            const result = await signUp(phoneNumber, password, displayName, email || undefined);
            console.log('SignUp result:', result);

            if (result.error) {
                console.error('SignUp returned error:', result.error);
                setError(result.error);
            } else {
                console.log('Account created successfully!');
                showToast('Phone verified! Account created successfully!', 'success');
                navigate('/');
            }
        } catch (err: unknown) {
            console.error('OTP verify error:', err);
            const errorMessage = err instanceof Error ? err.message : 'Verification failed';

            if (errorMessage.includes('invalid-verification-code')) {
                setError('Invalid OTP. Please check and try again.');
            } else if (errorMessage.includes('code-expired')) {
                setError('OTP expired. Please request a new one.');
            } else {
                setError('Verification failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isValidPhone(phoneNumber)) {
            setError('Enter a valid 10-digit mobile number starting with 6-9');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const { error } = await signIn(phoneNumber, password);
            if (error) setError(error);
            else {
                showToast('Welcome back!', 'success');
                navigate('/');
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSignUp) {
            handleSendOtp();
        } else {
            handleSignIn(e);
        }
    };

    const resetToCredentials = () => {
        setStep('credentials');
        setOtp(['', '', '', '', '', '']);
        setConfirmationResult(null);
        setError('');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* reCAPTCHA container - invisible */}
            <div id="recaptcha-container" ref={recaptchaContainerRef}></div>

            <div className="p-4">
                {step === 'otp' ? (
                    <button
                        onClick={resetToCredentials}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                ) : (
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={18} /> Back
                    </Link>
                )}
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">A</span>
                            </div>
                        </Link>

                        {step === 'otp' ? (
                            <>
                                <h1 className="text-2xl font-bold text-gray-900">Verify Phone</h1>
                                <p className="text-gray-500 mt-1">
                                    Enter the 6-digit code sent to +91 {phoneNumber}
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                                </h1>
                                <p className="text-gray-500 mt-1">
                                    {isSignUp ? 'Sign up to start posting ads' : 'Sign in to your account'}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Security badge */}
                    <div className="flex items-center justify-center gap-2 mb-6 text-xs text-gray-500">
                        <Shield size={14} className="text-success-500" />
                        <span>Secured with Firebase Phone Auth</span>
                    </div>

                    {/* OTP Step */}
                    {step === 'otp' && (
                        <div className="card p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-xl text-danger-600 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* OTP Inputs */}
                            <div className="mb-6">
                                <label className="label text-center block mb-4">Enter OTP</label>
                                <div className="flex gap-2 justify-center">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={el => otpRefs.current[index] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            onPaste={handleOtpPaste}
                                            disabled={loading}
                                            className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all disabled:opacity-50"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                                <p className="text-xs text-green-700 text-center">
                                    📱 Real SMS OTP sent via Firebase Phone Auth
                                </p>
                            </div>

                            {/* Resend */}
                            <div className="text-center mb-4">
                                {otpTimer > 0 ? (
                                    <p className="text-gray-500 text-sm">
                                        Resend OTP in <span className="font-medium">{otpTimer}s</span>
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                        className="text-primary-600 font-medium hover:text-primary-700 text-sm disabled:opacity-50"
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleVerifyOtp}
                                disabled={loading || otp.join('').length !== 6}
                                className="btn-primary w-full btn-lg flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify & Create Account'
                                )}
                            </button>
                        </div>
                    )}

                    {/* Credentials Step */}
                    {step === 'credentials' && (
                        <div className="card p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-xl text-danger-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {isSignUp && (
                                    <div>
                                        <label className="label">Name</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                placeholder="Your name"
                                                className="input pl-10"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="label">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 border-r border-gray-200 pr-2 text-sm">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={handlePhoneChange}
                                            placeholder="9876543210"
                                            required
                                            className="input pl-[4.5rem]"
                                            autoComplete="tel"
                                        />
                                    </div>
                                    {phoneNumber && !isValidPhone(phoneNumber) && (
                                        <p className="text-danger-500 text-xs mt-1">Must start with 6-9 and be 10 digits</p>
                                    )}
                                    {isSignUp && isValidPhone(phoneNumber) && (
                                        <p className="text-success-500 text-xs mt-1 flex items-center gap-1">
                                            <CheckCircle size={12} /> Real OTP will be sent via SMS
                                        </p>
                                    )}
                                </div>

                                {isSignUp && (
                                    <div>
                                        <label className="label">
                                            Email <span className="text-gray-400">(optional)</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="input pl-10"
                                                autoComplete="email"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="label">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="input pl-10 pr-10"
                                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    {/* Password strength indicator for signup */}
                                    {isSignUp && password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <div
                                                        key={i}
                                                        className={`h-1 flex-1 rounded-full transition-colors ${i < passwordStrength.score ? '' : 'bg-gray-200'
                                                            }`}
                                                        style={{ backgroundColor: i < passwordStrength.score ? passwordStrength.color : undefined }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                                                {passwordStrength.feedback.length > 0 && (
                                                    <span className="text-gray-400">{passwordStrength.feedback[0]}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full btn-lg flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader size={18} className="animate-spin" />
                                            {isSignUp ? 'Sending OTP...' : 'Signing in...'}
                                        </>
                                    ) : (
                                        isSignUp ? 'Send OTP & Verify' : 'Sign In'
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                                <p className="text-gray-500">
                                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                                    <button
                                        onClick={() => { setIsSignUp(!isSignUp); setError(''); setPassword(''); }}
                                        className="ml-1 text-primary-600 font-medium hover:text-primary-700"
                                    >
                                        {isSignUp ? 'Sign In' : 'Sign Up'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Terms */}
                    <p className="text-xs text-gray-400 text-center mt-4">
                        By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                </div>
            </div>
        </div>
    );
}
