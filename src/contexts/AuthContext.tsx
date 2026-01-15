import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// App-level user type
interface AppUser {
    id: string;
    phone_number: string;
    email?: string;
    display_name?: string;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: AppUser | null;
    loading: boolean;
    signUp: (phoneNumber: string, password: string, displayName?: string, email?: string) => Promise<{ error?: string }>;
    signIn: (phoneNumber: string, password: string) => Promise<{ error?: string }>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys for local auth (demo mode)
const USERS_KEY = 'adexpress360_users';
const SESSION_KEY = 'adexpress360_session';

// Hash password for storage
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'adexpress360_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getStoredUsers(): Record<string, { user: AppUser; passwordHash: string }> {
    try {
        const stored = localStorage.getItem(USERS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function saveUsers(users: Record<string, { user: AppUser; passwordHash: string }>): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Check local storage session first
                const stored = localStorage.getItem(SESSION_KEY);
                if (stored) {
                    const session = JSON.parse(stored);
                    setUser(session.user);
                }

                // Also check Supabase session for admin
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        setUser({
                            id: profile.id,
                            phone_number: profile.phone_number,
                            email: profile.email,
                            display_name: profile.display_name,
                            created_at: profile.created_at,
                            updated_at: profile.updated_at,
                        });
                    }
                }
            } catch (error) {
                console.error('Session error:', error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for Supabase auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                localStorage.removeItem(SESSION_KEY);
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (phoneNumber: string, password: string, displayName?: string, email?: string): Promise<{ error?: string }> => {
        try {
            // Normalize phone number - always use last 10 digits
            const normalizedPhone = phoneNumber.replace(/\D/g, '').slice(-10);

            const users = getStoredUsers();

            // Check if phone already exists
            if (users[normalizedPhone]) {
                return { error: 'An account with this phone number already exists' };
            }

            // Hash password
            const passwordHash = await hashPassword(password);

            // Create user
            const newUser: AppUser = {
                id: crypto.randomUUID(),
                phone_number: normalizedPhone,
                email: email || undefined,
                display_name: displayName || `User ${normalizedPhone.slice(-4)}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            // Save to local storage
            users[normalizedPhone] = { user: newUser, passwordHash };
            saveUsers(users);

            // Also save to Supabase for consistency (ignore errors)
            try {
                await supabase.from('profiles').upsert({
                    id: newUser.id,
                    phone_number: normalizedPhone,
                    email: email || null,
                    display_name: newUser.display_name,
                });
            } catch (e) {
                console.log('Supabase sync skipped:', e);
            }

            // Set session
            localStorage.setItem(SESSION_KEY, JSON.stringify({ user: newUser }));
            setUser(newUser);

            return {};
        } catch (error) {
            console.error('Signup error:', error);
            return { error: 'An unexpected error occurred' };
        }
    };

    const signIn = async (phoneNumber: string, password: string): Promise<{ error?: string }> => {
        try {
            // Normalize phone number - always use last 10 digits
            const normalizedPhone = phoneNumber.replace(/\D/g, '').slice(-10);

            const users = getStoredUsers();
            const storedUser = users[normalizedPhone];

            if (!storedUser) {
                return { error: 'No account found with this phone number' };
            }

            const passwordHash = await hashPassword(password);
            if (storedUser.passwordHash !== passwordHash) {
                return { error: 'Invalid password' };
            }

            // Set session
            localStorage.setItem(SESSION_KEY, JSON.stringify({ user: storedUser.user }));
            setUser(storedUser.user);

            return {};
        } catch (error) {
            console.error('Signin error:', error);
            return { error: 'An unexpected error occurred' };
        }
    };

    const signOut = async (): Promise<void> => {
        await supabase.auth.signOut();
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
    };

    const updateProfile = async (updates: Partial<AppUser>): Promise<void> => {
        if (!user) return;

        const users = getStoredUsers();
        const storedUser = users[user.phone_number];
        if (storedUser) {
            const updatedUser = { ...storedUser.user, ...updates, updated_at: new Date().toISOString() };
            users[user.phone_number] = { ...storedUser, user: updatedUser };
            saveUsers(users);

            localStorage.setItem(SESSION_KEY, JSON.stringify({ user: updatedUser }));
            setUser(updatedUser);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
