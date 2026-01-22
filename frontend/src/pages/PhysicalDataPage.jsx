import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Scale, User, Pill, AlertCircle, TrendingUp, CheckCircle, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

const PhysicalDataPage = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);

    const [formData, setFormData] = useState({
        email: '',
        height: '',
        weight: '',
        age: '',
        gender: 'Not specified',
        present_illnesses: '',
        medications: '',
        allergies: ''
    });

    useEffect(() => {
        if (currentUser) {
            loadHistory();
            // Auto-fill email if available
            if (currentUser.email) {
                setFormData(prev => ({ ...prev, email: currentUser.email }));
            }
        }
    }, [currentUser]);

    const loadHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health/${currentUser.uid}`);
            const data = await response.json();
            setHistory(data);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(`${API_BASE_URL}/health/assess`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.uid,
                    email: formData.email,
                    height: parseFloat(formData.height),
                    weight: parseFloat(formData.weight),
                    age: parseInt(formData.age),
                    gender: formData.gender,
                    present_illnesses: formData.present_illnesses,
                    medications: formData.medications,
                    allergies: formData.allergies
                })
            });

            if (!response.ok) throw new Error('Assessment failed');

            const data = await response.json();
            setResult(data);
            loadHistory();
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to assess health. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getBMIColor = (category) => {
        switch (category) {
            case 'Normal weight': return 'text-green-600 bg-green-100';
            case 'Underweight': return 'text-blue-600 bg-blue-100';
            case 'Overweight': return 'text-yellow-600 bg-yellow-100';
            case 'Obese': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-warm-bg p-4 pt-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-deep-brown mb-2">Physical Health Assessment</h1>
                        <p className="text-deep-brown/60">Track your health metrics and get AI-powered insights</p>
                    </div>
                    <Link to="/" className="px-6 py-3 bg-deep-brown text-white rounded-full hover:bg-deep-brown/90 transition-colors">
                        Back to Chat
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-8"
                    >
                        <h2 className="text-2xl font-bold text-deep-brown mb-6 flex items-center gap-2">
                            <Activity className="text-uprock-orange" />
                            Enter Your Data
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-bold text-deep-brown mb-2">
                                    <Mail size={16} className="inline mr-1" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full glass-input"
                                    placeholder="your@email.com"
                                />
                            </div>

                            {/* Basic Metrics */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-deep-brown mb-2">
                                        <Scale size={16} className="inline mr-1" />
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        className="w-full glass-input"
                                        placeholder="70.5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-deep-brown mb-2">
                                        <TrendingUp size={16} className="inline mr-1" />
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={formData.height}
                                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                        className="w-full glass-input"
                                        placeholder="175"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-deep-brown mb-2">
                                        <User size={16} className="inline mr-1" />
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        className="w-full glass-input"
                                        placeholder="25"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-deep-brown mb-2">
                                        Gender
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full glass-input"
                                    >
                                        <option>Not specified</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Medical Info */}
                            <div>
                                <label className="block text-sm font-bold text-deep-brown mb-2">
                                    <AlertCircle size={16} className="inline mr-1" />
                                    Present Illnesses (Optional)
                                </label>
                                <textarea
                                    value={formData.present_illnesses}
                                    onChange={(e) => setFormData({ ...formData, present_illnesses: e.target.value })}
                                    className="w-full glass-input"
                                    rows="2"
                                    placeholder="e.g., Diabetes, Hypertension..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-deep-brown mb-2">
                                    <Pill size={16} className="inline mr-1" />
                                    Current Medications (Optional)
                                </label>
                                <textarea
                                    value={formData.medications}
                                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                                    className="w-full glass-input"
                                    rows="2"
                                    placeholder="e.g., Metformin 500mg..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-deep-brown mb-2">
                                    <Heart size={16} className="inline mr-1" />
                                    Allergies (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.allergies}
                                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                    className="w-full glass-input"
                                    placeholder="e.g., Penicillin, Peanuts..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-deep-brown text-white rounded-full font-bold text-lg hover:bg-deep-brown/90 transition-all disabled:opacity-50 shadow-lg"
                            >
                                {loading ? 'Analyzing...' : 'Get AI Health Assessment'}
                            </button>
                        </form>
                    </motion.div>

                    {/* Results */}
                    <div className="space-y-6">
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-panel p-8"
                            >
                                <h2 className="text-2xl font-bold text-deep-brown mb-6">Your Results</h2>

                                {/* BMI Card */}
                                <div className="bg-white/50 rounded-3xl p-6 mb-6 border border-deep-brown/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-deep-brown/60 font-medium">Body Mass Index (BMI)</span>
                                        <span className="text-4xl font-bold text-deep-brown">{result.bmi}</span>
                                    </div>
                                    <div className={`inline-block px-4 py-2 rounded-full font-bold ${getBMIColor(result.bmi_category)}`}>
                                        {result.bmi_category}
                                    </div>
                                </div>

                                {/* AI Analysis */}
                                <div className="bg-gradient-to-br from-uprock-orange/10 to-uprock-yellow/10 rounded-3xl p-6 mb-6 border border-uprock-orange/20">
                                    <h3 className="font-bold text-deep-brown mb-3 flex items-center gap-2">
                                        <Activity className="text-uprock-orange" />
                                        AI Health Analysis
                                    </h3>
                                    <p className="text-deep-brown/80 leading-relaxed whitespace-pre-line">{result.analysis}</p>
                                </div>

                                {/* Recommendations */}
                                {result.recommendations && result.recommendations.length > 0 && (
                                    <div className="bg-white/50 rounded-3xl p-6 border border-deep-brown/10">
                                        <h3 className="font-bold text-deep-brown mb-4 flex items-center gap-2">
                                            <CheckCircle className="text-green-600" />
                                            Recommendations
                                        </h3>
                                        <ul className="space-y-2">
                                            {result.recommendations.map((rec, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-deep-brown/80">
                                                    <span className="text-uprock-orange mt-1">•</span>
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* History */}
                        {history.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass-panel p-6"
                            >
                                <h3 className="font-bold text-deep-brown mb-4">Assessment History</h3>
                                <div className="space-y-3">
                                    {history.slice(0, 5).map((item, idx) => (
                                        <div key={idx} className="bg-white/50 rounded-2xl p-4 border border-deep-brown/5">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="font-bold text-deep-brown">BMI: {item.bmi}</span>
                                                    <span className={`ml-3 px-2 py-1 rounded-full text-xs font-bold ${getBMIColor(item.bmi_category)}`}>
                                                        {item.bmi_category}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-deep-brown/60">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhysicalDataPage;
