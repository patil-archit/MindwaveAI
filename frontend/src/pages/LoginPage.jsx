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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/chat');
        } catch (err) {
            setError('Failed to sign in. Check email/password.');
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
            setError('Failed to sign in with Google.');
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

                {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}

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
