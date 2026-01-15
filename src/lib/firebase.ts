import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCDD0AsH3f7rA6rKQ63JiCUjbn0wyEKlgU",
    authDomain: "adexpress360-c67cf.firebaseapp.com",
    projectId: "adexpress360-c67cf",
    storageBucket: "adexpress360-c67cf.firebasestorage.app",
    messagingSenderId: "94799915170",
    appId: "1:94799915170:web:9a3f3cc4fd80fa3b068ffb",
    measurementId: "G-JQ7J8S9T8Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// reCAPTCHA verifier for phone auth
let recaptchaVerifier: RecaptchaVerifier | null = null;
let recaptchaWidgetId: number | null = null;

export function setupRecaptcha(containerId: string): RecaptchaVerifier {
    // If reCAPTCHA already exists and is rendered, return it
    if (recaptchaVerifier && recaptchaWidgetId !== null) {
        return recaptchaVerifier;
    }

    // Clear the container first
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }

    // Clear existing verifier if any
    if (recaptchaVerifier) {
        try {
            recaptchaVerifier.clear();
        } catch (e) {
            console.log('Could not clear reCAPTCHA:', e);
        }
        recaptchaVerifier = null;
        recaptchaWidgetId = null;
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
            console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
            console.log('reCAPTCHA expired');
            recaptchaWidgetId = null;
        }
    });

    // Render and store widget ID
    recaptchaVerifier.render().then((widgetId) => {
        recaptchaWidgetId = widgetId;
    }).catch((err) => {
        console.error('reCAPTCHA render error:', err);
    });

    return recaptchaVerifier;
}

export function clearRecaptcha() {
    if (recaptchaVerifier) {
        try {
            recaptchaVerifier.clear();
        } catch (e) {
            console.log('Could not clear reCAPTCHA:', e);
        }
        recaptchaVerifier = null;
        recaptchaWidgetId = null;
    }

    // Also clear the container
    const container = document.getElementById('recaptcha-container');
    if (container) {
        container.innerHTML = '';
    }
}

export async function sendOTP(phoneNumber: string): Promise<ConfirmationResult> {
    // Format phone number with country code
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

    if (!recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized. Please refresh and try again.');
    }

    try {
        return await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    } catch (error) {
        // Reset reCAPTCHA on error so it can be re-rendered
        clearRecaptcha();
        throw error;
    }
}

export async function verifyOTP(confirmationResult: ConfirmationResult, otp: string) {
    return confirmationResult.confirm(otp);
}

export { RecaptchaVerifier, type ConfirmationResult };
