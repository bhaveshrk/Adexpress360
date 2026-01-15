import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

const SESSION_KEY = 'adexpress360_session';

// Simple password hashing (in production, use bcrypt on server)
async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'adexpress360_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Normalize phone number to 10 digits
function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '').slice(-10);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                // Check local storage session
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
            const normalizedPhone = normalizePhone(phoneNumber);
            const passwordHash = await hashPassword(password);

            console.log('Attempting signup for phone:', normalizedPhone);

            // Check if phone already exists in Supabase
            const { data: existingUser, error: checkError } = await supabase
                .from('user_accounts')
                .select('id')
                .eq('phone_number', normalizedPhone)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error('Error checking existing user:', checkError);
            }

            if (existingUser) {
                return { error: 'An account with this phone number already exists' };
            }

            // Create user in Supabase
            const newUser = {
                id: crypto.randomUUID(),
                phone_number: normalizedPhone,
                password_hash: passwordHash,
                display_name: displayName || `User ${normalizedPhone.slice(-4)}`,
                email: email || null,
            };

            console.log('Inserting new user:', { ...newUser, password_hash: '***' });

            const { data: insertedData, error: insertError } = await supabase
                .from('user_accounts')
                .insert(newUser)
                .select();

            if (insertError) {
                console.error('Supabase insert error:', insertError);
                return { error: `Failed to create account: ${insertError.message}` };
            }

            console.log('User created successfully:', insertedData);

            // Create session
            const appUser: AppUser = {
                id: newUser.id,
                phone_number: newUser.phone_number,
                display_name: newUser.display_name,
                email: email || undefined,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            localStorage.setItem(SESSION_KEY, JSON.stringify({ user: appUser }));
            setUser(appUser);

            return {};
        } catch (error) {
            console.error('Signup exception:', error);
            return { error: 'An unexpected error occurred' };
        }
    };

    const signIn = async (phoneNumber: string, password: string): Promise<{ error?: string }> => {
        try {
            const normalizedPhone = normalizePhone(phoneNumber);
            const passwordHash = await hashPassword(password);

            // Find user in Supabase
            const { data: storedUser, error: fetchError } = await supabase
                .from('user_accounts')
                .select('*')
                .eq('phone_number', normalizedPhone)
                .single();

            if (fetchError || !storedUser) {
                return { error: 'No account found with this phone number' };
            }

            if (storedUser.password_hash !== passwordHash) {
                return { error: 'Invalid password' };
            }

            // Create session
            const appUser: AppUser = {
                id: storedUser.id,
                phone_number: storedUser.phone_number,
                display_name: storedUser.display_name,
                email: storedUser.email || undefined,
                created_at: storedUser.created_at,
                updated_at: storedUser.updated_at,
            };

            localStorage.setItem(SESSION_KEY, JSON.stringify({ user: appUser }));
            setUser(appUser);

            return {};
        } catch (error) {
            console.error('Signin error:', error);
            return { error: 'An unexpected error occurred' };
        }
    };

    const signOut = async (): Promise<void> => {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
