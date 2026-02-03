import React, { useState } from 'react';
import { Search, ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

const MemorySearchPage = () => {
    const { currentUser } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/memories/search?uid=${currentUser.uid}&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data.results || []);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-warm-bg text-deep-brown font-sans p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-deep-brown/60 hover:text-deep-brown transition-colors mb-4 relative z-50">
                        <ArrowLeft size={20} />
                        Back to Chat
                    </Link>
                    <h1 className="text-4xl font-bold flex items-center gap-3">
                        <span className="p-2 bg-uprock-orange rounded-xl text-white shadow-lg">
                            <Sparkles size={32} />
                        </span>
                        The Memory Vault
                    </h1>
                    <p className="text-lg text-deep-brown/60 mt-2 ml-16">
                        Ask deep questions about your past.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="relative mb-12">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., 'When was I last truly happy?' or 'What did I say about my dreams?'"
                        className="w-full glass-input text-xl py-6 pl-16 pr-6 shadow-xl focus:ring-uprock-orange"
                    />
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-deep-brown/40" size={24} />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-deep-brown text-white rounded-full font-bold hover:bg-deep-brown/90 disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                <div className="space-y-6">
                    {results.length > 0 ? (
                        results.map((memory, index) => (
                            <div key={index} className="glass-panel p-6 hover:scale-[1.01] transition-transform animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-white/50 rounded-lg">
                                        <Clock size={20} className="text-uprock-orange" />
                                    </div>
                                    <div>
                                        <p className="text-lg leading-relaxed font-medium">
                                            "{memory}"
                                        </p>
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-xs font-bold text-deep-brown/40 bg-deep-brown/5 px-2 py-1 rounded">RECOVERED MEMORY</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        !loading && query && (
                            <div className="text-center py-20 opacity-50">
                                <Search size={48} className="mx-auto mb-4" />
                                <p>No specific memories found for that query.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemorySearchPage;
