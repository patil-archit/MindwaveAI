import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, ShieldCheck, Database, Zap, RefreshCw, Send, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const BlockchainPage = () => {
    const { currentUser } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [status, setStatus] = useState("Disconnected");

    // Simulate connecting to a wallet (Metamask style)
    const connectWallet = async () => {
        setLoading(true);
        setStatus("Connecting to Ethereum Mainnet...");

        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsConnected(true);
        setStatus("Connected");
        setBalance(1.45); // Fake Ether Balance
        setLoading(false);

        // Mock transactions
        setTransactions([
            { hash: "0x7a...4b2", type: "Store Memory", age: "2 mins ago", status: "Success" },
            { hash: "0x3c...9d1", type: "Identity Verify", age: "1 day ago", status: "Success" }
        ]);
    };

    const storeHash = async () => {
        if (!isConnected) return;
        setLoading(true);
        setStatus("Hashing Data...");

        await new Promise(resolve => setTimeout(resolve, 2000));

        setTransactions(prev => [
            { hash: `0x${Math.random().toString(16).substr(2, 8)}...`, type: "Store Memory", age: "Just now", status: "Success" },
            ...prev
        ]);
        setBalance(prev => prev - 0.002);
        setStatus("Data Immutable & Stored on Chain");
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#2D2118] font-sans p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-[#2D2118]/60 hover:text-[#2D2118] transition-colors mb-4 relative z-50">
                        <ArrowLeft size={20} />
                        Back to Headquarters
                    </Link>
                    <h1 className="text-4xl font-bold flex items-center gap-3">
                        <span className="p-2 bg-[#6366F1] rounded-xl text-white shadow-lg">
                            <Database size={32} />
                        </span>
                        Crypto Sanctuary
                    </h1>
                    <p className="text-lg text-[#2D2118]/60 mt-2 ml-16">
                        Your memories are immutable. Decentralized Identity & Storage.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Wallet Card */}
                    <div className="bg-white/50 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl flex flex-col justify-between h-80">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Wallet className="text-[#6366F1]" />
                                    Ether Wallet
                                </h2>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                    {isConnected ? 'LIVE' : 'OFFLINE'}
                                </div>
                            </div>

                            {isConnected ? (
                                <div>
                                    <div className="text-5xl font-black mb-2 flex items-baseline gap-2">
                                        {balance.toFixed(4)} <span className="text-xl font-medium text-[#2D2118]/40">ETH</span>
                                    </div>
                                    <p className="font-mono text-sm text-[#2D2118]/40 bg-[#2D2118]/5 p-2 rounded truncate">
                                        0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-10 opacity-50">
                                    <AlertTriangle className="mx-auto mb-2" size={32} />
                                    <p>Wallet not connected</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={connectWallet}
                            disabled={isConnected || loading}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isConnected
                                ? 'bg-green-500/10 text-green-700 cursor-default'
                                : 'bg-[#2D2118] text-white hover:bg-[#2D2118]/90 hover:scale-[1.02]'
                                }`}
                        >
                            {loading ? <RefreshCw className="animate-spin" /> : (isConnected ? <ShieldCheck /> : <Zap />)}
                            {isConnected ? 'Secure Connection Active' : 'Connect Metamask'}
                        </button>
                    </div>

                    {/* Actions Card */}
                    <div className="space-y-6">
                        <div className="bg-white/50 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-lg">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <ShieldCheck size={20} className="text-[#6366F1]" />
                                Smart Contract Actions
                            </h3>
                            <button
                                onClick={storeHash}
                                disabled={!isConnected}
                                className="w-full bg-[#6366F1] text-white py-3 rounded-xl font-bold hover:bg-[#6366F1]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Database size={18} />
                                {loading ? 'Mining Block...' : 'Store Memory Hash on Chain'}
                            </button>
                            <p className="text-xs text-center mt-3 text-[#2D2118]/40">
                                Gas Fee: ~0.002 ETH
                            </p>
                            <p className="text-xs text-center mt-3 text-[#2D2118]/40">
                                Gas Fee: ~0.002 ETH
                            </p>
                        </div>

                        {/* Make a Promise Section (New) */}
                        <div className="bg-white/50 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-lg">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Send size={20} className="text-[#6366F1]" />
                                Make a Promise to Yourself
                            </h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="I promise to..."
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#6366F1] outline-none"
                                />
                                <button
                                    onClick={storeHash}
                                    disabled={!isConnected}
                                    className="w-full bg-[#f8fafc] text-[#2D2118] py-3 rounded-xl font-bold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
                                >
                                    Hash & Seal Promise
                                </button>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white/50 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-lg h-40 overflow-y-auto">
                            <h3 className="font-bold text-sm text-[#2D2118]/40 uppercase tracking-widest mb-3">Recent Blocks</h3>
                            <div className="space-y-3">
                                {transactions.length > 0 ? (
                                    transactions.map((tx, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <span className="font-mono text-[#2D2118]/60">{tx.hash}</span>
                                            </div>
                                            <span className="font-bold">{tx.type}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-[#2D2118]/40 py-4">No transactions found</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlockchainPage;
