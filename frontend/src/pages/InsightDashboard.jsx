import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Brain, Heart, Zap, Activity, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

const InsightDashboard = () => {
    const { currentUser } = useAuth();
    const [moodData, setMoodData] = useState([]);
    const [stats, setStats] = useState({ logic: 50, empathy: 50, motivation: 50 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const fetchInsights = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/insights?uid=${currentUser.uid}`);
                const data = await res.json();

                if (data.mood_data && data.mood_data.length > 0) {
                    setMoodData(data.mood_data);
                }
                if (data.stats) {
                    setStats(data.stats);
                }
            } catch (e) {
                console.error("Failed to load insights", e);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [currentUser]);

    return (
        <div className="min-h-screen bg-warm-bg p-6 md:p-12 font-sans text-deep-brown pb-24">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/chat" className="p-3 bg-white/50 rounded-full hover:bg-white transition-all shadow-sm">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold text-deep-brown">Insight Dashboard</h1>
                        <p className="text-deep-brown/60">Your emotional & cognitive analytics for this week.</p>
                    </div>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-sm flex items-center gap-4"
                    >
                        <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl">
                            <Brain size={32} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold">{stats.logic}%</div>
                            <div className="text-sm opacity-60">Logic Score</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-sm flex items-center gap-4"
                    >
                        <div className="p-4 bg-pink-100 text-pink-600 rounded-2xl">
                            <Heart size={32} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold">{stats.empathy}%</div>
                            <div className="text-sm opacity-60">Empathy Score</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-sm flex items-center gap-4"
                    >
                        <div className="p-4 bg-yellow-100 text-yellow-600 rounded-2xl">
                            <Zap size={32} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold">{stats.motivation}%</div>
                            <div className="text-sm opacity-60">Motivation Level</div>
                        </div>
                    </motion.div>
                </div>

                {/* Main Charts Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Mood Trend Chart */}
                    <div className="p-8 bg-white/80 rounded-3xl shadow-sm border border-white/50">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity size={20} className="text-uprock-orange" />
                            <h2 className="text-xl font-bold">Emotional Velocity</h2>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={moodData}>
                                    <defs>
                                        <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="day" />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="mood" stroke="#8884d8" fillOpacity={1} fill="url(#colorMood)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Action Plan */}
                    <div className="p-8 bg-deep-brown text-white rounded-3xl shadow-xl flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Daily Action Plan</h2>
                            <p className="text-white/60 mb-6">Based on your recent graph patterns.</p>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 p-3 bg-white/10 rounded-xl">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-green-400" />
                                    <div>
                                        <div className="font-bold">Micro-Journaling</div>
                                        <div className="text-sm opacity-70">Write 3 bullet points about your coding wins.</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 p-3 bg-white/10 rounded-xl">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-400" />
                                    <div>
                                        <div className="font-bold">Strategic Pause</div>
                                        <div className="text-sm opacity-70">Take a 5 min walk before debugging complex React errors.</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 p-3 bg-white/10 rounded-xl">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-purple-400" />
                                    <div>
                                        <div className="font-bold">Connect</div>
                                        <div className="text-sm opacity-70">Call your mom this weekend (High Priority Node).</div>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <button className="mt-8 w-full py-4 bg-white text-deep-brown font-bold rounded-xl hover:bg-gray-100 transition-colors">
                            Refresh Analysis
                        </button>
                    </div>

                    {/* Graph Explanation (New Request) */}
                    <div className="col-span-1 lg:col-span-2 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                        <h3 className="text-lg font-bold text-deep-brown mb-2">📊 Understanding Your Emotional Velocity</h3>
                        <p className="text-deep-brown/70 leading-relaxed">
                            The purple "Emotional Velocity" graph above visualizes the <strong>rate of change</strong> in your emotional state over time.
                            Peaks indicate moments of high energy or positive breakthrough, while valleys may suggest periods of rest or introspection.
                            Mindwave uses this to tailor its advice—suggesting calming exercises during high velocity or motivation during lows.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default InsightDashboard;
