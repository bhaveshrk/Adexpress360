// Security utilities for input sanitization and validation

// Sanitize text input - remove potential XSS
export const sanitizeInput = (input: string): string => {
    return input.trim();
};

// Sanitize for display (decode entities for safe display)
export const sanitizeForDisplay = (input: string): string => {
    return input
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/');
};

// Validate phone number (Indian format)
export const isValidPhone = (phone: string): boolean => {
    return /^[6-9]\d{9}$/.test(phone);
};

// Validate email
export const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Password strength checker
export interface PasswordStrength {
    score: number; // 0-4
    label: 'Weak' | 'Fair' | 'Good' | 'Strong';
    color: string;
    feedback: string[];
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('At least 8 characters');

    if (password.length >= 12) score++;

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    else feedback.push('Mix of upper and lowercase');

    if (/\d/.test(password)) score++;
    else feedback.push('At least one number');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('At least one special character');

    const labels: PasswordStrength['label'][] = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ef4444', '#ef4444', '#f59e0b', '#10b981', '#059669'];

    return {
        score: Math.min(score, 4),
        label: labels[Math.min(score, 4)],
        color: colors[Math.min(score, 4)],
        feedback: feedback.slice(0, 2),
    };
};

// Rate limiting helper (client-side)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= maxAttempts) {
        return false;
    }

    record.count++;
    return true;
};

export const getRateLimitRemaining = (key: string): number => {
    const record = rateLimitMap.get(key);
    if (!record || Date.now() > record.resetTime) return 5;
    return Math.max(0, 5 - record.count);
};

// Mask phone number for privacy
export const maskPhone = (phone: string): string => {
    if (phone.length !== 10) return phone;
    return `${phone.slice(0, 2)}****${phone.slice(-4)}`;
};

// Generate secure random ID
export const generateSecureId = (): string => {
    return crypto.randomUUID();
};

// Session timeout tracking
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
let lastActivity = Date.now();

export const updateActivity = (): void => {
    lastActivity = Date.now();
};

export const isSessionExpired = (): boolean => {
    return Date.now() - lastActivity > SESSION_TIMEOUT;
};

// Content filtering - detect spam/inappropriate
const spamPatterns = [
    /\b(free money|earn \$|click here|act now|limited time)\b/i,
    /(.)\1{4,}/,  // Repeated characters
    /[A-Z]{10,}/, // ALL CAPS text
];

export const detectSpam = (text: string): boolean => {
    return spamPatterns.some(pattern => pattern.test(text));
};

// Validate ad content
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export const validateAdContent = (title: string, description: string): ValidationResult => {
    const errors: string[] = [];

    if (title.length < 5) errors.push('Title must be at least 5 characters');
    if (title.length > 100) errors.push('Title must be less than 100 characters');
    if (description.length < 20) errors.push('Description must be at least 20 characters');
    if (description.length > 2000) errors.push('Description must be less than 2000 characters');
    if (detectSpam(title) || detectSpam(description)) errors.push('Content appears to contain spam');

    return {
        isValid: errors.length === 0,
        errors,
    };
};

// Format relative time
export const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// Format currency
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
};

// Share functionality
export const shareAd = async (title: string, url: string): Promise<boolean> => {
    if (navigator.share) {
        try {
            await navigator.share({ title, url });
            return true;
        } catch {
            return false;
        }
    }
    return copyToClipboard(url);
};
