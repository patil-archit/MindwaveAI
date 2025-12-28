import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, verifyEmail, logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        try {
            setError('');
            setLoading(true);
            const userCredential = await signup(email, password);
            await verifyEmail(userCredential.user);
            await logout(); // Force logout so they can't access chat
            setError('Success! Verification email sent. Please check your inbox before logging in.');
        } catch (err) {
            setError('Failed to create an account: ' + err.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-uprock-orange rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                        <Sparkles size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-deep-brown">Join Mindwave</h2>
                    <p className="text-deep-brown/60">Create your safe space.</p>
                </div>

                {error && <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${error.startsWith('Success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{error}</div>}

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
                    <div>
                        <label className="block text-sm font-bold text-deep-brown mb-1">Confirm Password</label>
                        <input
                            type="password"
                            className="w-full glass-input rounded-xl px-4 py-3"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="w-full uprock-btn justify-center text-lg mt-2"
                    >
                        {loading ? 'Creating...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-deep-brown/60">
                    Already have an account? <Link to="/login" className="text-uprock-orange font-bold hover:underline">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
