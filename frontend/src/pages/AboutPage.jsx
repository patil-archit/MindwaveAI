import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Shield, Zap } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="min-h-screen py-20 px-6 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full"
            >
                <h1 className="text-5xl font-bold text-deep-brown mb-8 text-center">About Mindwave AI</h1>

                <div className="glass-panel p-10 mb-12">
                    <p className="text-xl text-deep-brown/80 leading-relaxed mb-6">
                        Mindwave AI is not just a chatbot. It's an emotion-aware companion designed to understand not just what you say, but how you feel.
                    </p>
                    <p className="text-xl text-deep-brown/80 leading-relaxed">
                        Built with advanced local and cloud AI models, Mindwave adapts its personality to your mood, providing a safe, empathetic space for your thoughts.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="glass-panel p-8 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-uprock-yellow/20 rounded-full flex items-center justify-center mb-4 text-uprock-orange">
                            <Heart size={24} fill="currentColor" />
                        </div>
                        <h3 className="text-xl font-bold text-deep-brown mb-2">Empathetic</h3>
                        <p className="text-deep-brown/60">Truly understands and validates your emotions.</p>
                    </div>

                    <div className="glass-panel p-8 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-500">
                            <Shield size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-deep-brown mb-2">Private</h3>
                        <p className="text-deep-brown/60">Your conversations are private and secure.</p>
                    </div>

                    <div className="glass-panel p-8 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-500">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-deep-brown mb-2">Intelligent</h3>
                        <p className="text-deep-brown/60">Powered by Gemini Pro for meaningful conversations.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AboutPage;
