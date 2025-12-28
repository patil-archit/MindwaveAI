import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="max-w-4xl w-full flex flex-col items-center"
            >
                <div className="mb-8 inline-flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-sm text-sm font-semibold tracking-wide uppercase text-uprock-orange">
                    <Sparkles size={16} />
                    <span>Next Gen Companion</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight text-deep-brown leading-[0.9]">
                    Mindwave <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-uprock-orange to-uprock-yellow">AI.</span>
                </h1>

                <p className="text-xl md:text-2xl text-deep-brown/70 mb-12 leading-relaxed max-w-2xl font-medium">
                    An emotion-aware AI that remembers not just what you said, but how you felt.
                </p>

                <div className="flex flex-col md:flex-row gap-6">
                    <Link
                        to="/chat"
                        className="uprock-btn text-lg"
                    >
                        Start Talking
                        <ArrowRight className="w-5 h-5" />
                    </Link>

                    <button className="px-8 py-4 rounded-full border-2 border-deep-brown/10 hover:bg-white/50 text-deep-brown font-semibold transition-all flex items-center gap-2">
                        <Play className="w-5 h-5 fill-current" />
                        Watch Demo
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
