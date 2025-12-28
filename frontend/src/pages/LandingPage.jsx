import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Heart, Brain, Heart as HeartIcon, MessageCircle, Zap, CheckCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { currentUser } = useAuth();
    const [activeSection, setActiveSection] = useState(0);

    // Scroll to section
    const scrollToSection = (index) => {
        const section = document.getElementById(`section-${index}`);
        section?.scrollIntoView({ behavior: 'smooth' });
    };

    // Track active section on scroll using IntersectionObserver
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5 // Section is active when 50% visible
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    const index = parseInt(sectionId.split('-')[1]);
                    setActiveSection(index);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all sections
        const sections = document.querySelectorAll('.snap-section');
        sections.forEach((section) => observer.observe(section));

        return () => {
            sections.forEach((section) => observer.unobserve(section));
        };
    }, []);

    const features = [
        {
            icon: Brain,
            title: 'Emotion-Aware',
            description: 'Understands and responds to your emotional state in real-time'
        },
        {
            icon: Heart,
            title: 'Empathetic AI',
            description: 'Provides support tailored to how you\'re feeling'
        },
        {
            icon: MessageCircle,
            title: 'Natural Conversations',
            description: 'Chat naturally like you would with a close friend'
        },
        {
            icon: Zap,
            title: 'Instant Responses',
            description: 'Get thoughtful replies powered by advanced AI'
        }
    ];

    const steps = [
        {
            number: '01',
            title: 'Start Chatting',
            description: 'Begin a conversation about anything on your mind'
        },
        {
            number: '02',
            title: 'AI Detects Emotion',
            description: 'Our AI analyzes your emotional state from your messages'
        },
        {
            number: '03',
            title: 'Get Personalized Support',
            description: 'Receive responses tailored to your emotional needs'
        }
    ];

    return (
        <div className="snap-container">
            {/* Scroll Indicators */}
            <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3">
                {[0, 1, 2, 3].map((index) => (
                    <button
                        key={index}
                        onClick={() => scrollToSection(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${activeSection === index
                            ? 'bg-uprock-orange scale-125'
                            : 'bg-deep-brown/30 hover:bg-deep-brown/50'
                            }`}
                        aria-label={`Go to section ${index + 1}`}
                    />
                ))}
            </div>

            {/* Section 1: Hero */}
            <section
                id="section-0"
                className="snap-section flex flex-col items-center justify-center min-h-screen p-6 text-center relative"
            >
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

                        <Link
                            to="/feel-better"
                            className="px-8 py-4 rounded-full border-2 border-deep-brown/10 hover:bg-white/50 text-deep-brown font-semibold transition-all flex items-center gap-2"
                        >
                            <Heart className="w-5 h-5" />
                            Feel Better
                        </Link>
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-8"
                >
                    <ChevronDown className="w-8 h-8 text-deep-brown/40" />
                </motion.div>
            </section>

            {/* Section 2: Features */}
            <section
                id="section-1"
                className="snap-section flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-uprock-orange via-uprock-yellow to-uprock-orange"
            >
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="max-w-6xl w-full"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-bold text-deep-brown mb-4">
                            Why Choose <span className="text-white">Mindwave?</span>
                        </h2>
                        <p className="text-xl text-deep-brown/70 max-w-2xl mx-auto">
                            Experience the future of AI companionship with features designed for you
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="glass-panel p-8 hover:shadow-xl transition-all group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-uprock-orange to-uprock-yellow flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-deep-brown mb-3">{feature.title}</h3>
                                <p className="text-deep-brown/70 text-lg">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Section 3: How It Works */}
            <section
                id="section-2"
                className="snap-section flex flex-col items-center justify-center min-h-screen p-6 bg-white"
            >
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="max-w-6xl w-full"
                >
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-bold text-deep-brown mb-4">
                            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-uprock-orange to-uprock-yellow">Works</span>
                        </h2>
                        <p className="text-xl text-deep-brown/70 max-w-2xl mx-auto">
                            Three simple steps to start your journey with Mindwave AI
                        </p>
                    </div>

                    <div className="space-y-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="flex items-start gap-6 group"
                            >
                                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-uprock-orange to-uprock-yellow flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                                    {step.number}
                                </div>
                                <div className="flex-1 glass-panel p-6">
                                    <h3 className="text-2xl font-bold text-deep-brown mb-2">{step.title}</h3>
                                    <p className="text-deep-brown/70 text-lg">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Section 4: CTA */}
            <section
                id="section-3"
                className="snap-section flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-uprock-orange via-uprock-yellow to-uprock-orange text-white"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="max-w-4xl w-full text-center"
                >
                    <h2 className="text-5xl md:text-7xl font-bold mb-6">
                        Ready to Start?
                    </h2>
                    <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto">
                        Join thousands of users experiencing the future of AI companionship
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <Link
                            to={currentUser ? "/chat" : "/signup"}
                            className="px-10 py-5 bg-white text-uprock-orange rounded-full font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3 group"
                        >
                            {currentUser ? "Start Chatting" : "Get Started Free"}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            to="/about"
                            className="px-10 py-5 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
                        >
                            Learn More
                        </Link>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-8 flex-wrap">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-6 h-6" />
                            <span className="text-lg">Free to start</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-6 h-6" />
                            <span className="text-lg">No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-6 h-6" />
                            <span className="text-lg">Cancel anytime</span>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default LandingPage;
