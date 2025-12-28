import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Menu, X, LogOut, User, AlertCircle } from 'lucide-react';

const Layout = ({ children }) => {
    const { currentUser, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="relative min-h-screen overflow-hidden selection:bg-uprock-yellow/30 flex flex-col">
            {/* Navbar */}
            <nav className="absolute top-0 left-0 w-full z-50 p-6 flex justify-between items-center max-w-7xl mx-auto right-0">
                <Link to="/" className="flex items-center gap-2 font-bold text-deep-brown text-xl tracking-tight z-50">
                    <div className="w-8 h-8 bg-uprock-orange rounded-full flex items-center justify-center text-white">
                        <Sparkles size={16} />
                    </div>
                    Mindwave AI
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/" className="text-deep-brown font-medium hover:opacity-70 transition-opacity">Home</Link>
                    <Link to="/about" className="text-deep-brown font-medium hover:opacity-70 transition-opacity">About</Link>
                    <Link to="/feel-better" className="text-deep-brown font-medium hover:opacity-70 transition-opacity">Feel Better</Link>
                    <Link to="/help" className="text-red-600 font-bold hover:opacity-70 transition-opacity flex items-center gap-1">
                        <AlertCircle size={16} />
                        Help
                    </Link>

                    {currentUser ? (
                        <div className="flex items-center gap-4">
                            <Link to="/chat" className="text-deep-brown font-bold hover:underline">Chat</Link>
                            <Link to="/profile" className="text-deep-brown/60 hover:text-deep-brown flex items-center gap-1">
                                <User size={16} />
                                Profile
                            </Link>
                        </div>
                    ) : (
                        <Link to="/login" className="px-6 py-2 bg-deep-brown text-white rounded-full font-bold hover:scale-105 transition-transform">
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden z-50 text-deep-brown"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Nav Overlay */}
                {isMenuOpen && (
                    <div className="fixed inset-0 bg-white/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 text-2xl font-bold text-deep-brown">
                        <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
                        <Link to="/feel-better" onClick={() => setIsMenuOpen(false)}>Feel Better</Link>
                        <Link to="/help" onClick={() => setIsMenuOpen(false)} className="text-red-600 flex items-center gap-2">
                            <AlertCircle size={24} />
                            Help
                        </Link>
                        {currentUser ? (
                            <>
                                <Link to="/chat" onClick={() => setIsMenuOpen(false)}>Chat</Link>
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                            </>
                        ) : (
                            <Link to="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                        )}
                    </div>
                )}
            </nav>

            <div className="relative z-10 w-full h-full flex-1">
                {children}
            </div>
        </div>
    );
};

export default Layout;
