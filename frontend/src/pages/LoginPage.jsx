import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { Sparkles } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    // Map Firebase error codes to user-friendly messages
    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No account found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/user-disabled':
                return 'This account has been disabled. Contact support for help.';
            case 'auth/too-many-requests':
                return 'Too many failed login attempts. Please try again later.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection.';
            case 'auth/invalid-credential':
                return 'Invalid email or password. Please check your credentials.';
            default:
                return 'Failed to sign in. Please try again.';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/chat');
        } catch (err) {
            console.error('Login error:', err);
            // Check if it's the email verification error from AuthContext
            if (err.message && err.message.includes('verify your email')) {
                setError('Please verify your email address before logging in. Check your inbox for the verification link.');
            } else {
                setError(getErrorMessage(err.code));
            }
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate('/chat');
        } catch (err) {
            console.error('Google sign-in error:', err);
            setError('Failed to sign in with Google. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-uprock-yellow rounded-full flex items-center justify-center mx-auto mb-4 text-deep-brown shadow-lg">
                        <Sparkles size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-deep-brown">Welcome Back</h2>
                    <p className="text-deep-brown/60">Sign in to continue your journey.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-2xl mb-4 text-sm font-medium flex items-start gap-3">
                        <span className="text-red-500 text-lg">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-deep-brown mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full glass-input rounded-xl px-4 py-3"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-deep-brown mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full glass-input rounded-xl px-4 py-3"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full uprock-btn justify-center text-lg mt-2"
                    >
                        {loading ? 'Thinking...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 flex flex-col gap-4">
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-deep-brown/10"></div>
                        <span className="flex-shrink mx-4 text-deep-brown/40 text-sm">OR</span>
                        <div className="flex-grow border-t border-deep-brown/10"></div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full bg-white border border-deep-brown/10 text-deep-brown font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-white/70 transition-colors shadow-sm"
                    >
                        <FcGoogle size={22} />
                        Continue with Google
                    </button>
                </div>

                <div className="mt-8 text-center text-sm text-deep-brown/60">
                    Don't have an account? <Link to="/signup" className="text-uprock-orange font-bold hover:underline">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
