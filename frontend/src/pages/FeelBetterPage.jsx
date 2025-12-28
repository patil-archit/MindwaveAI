import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

const FeelBetterPage = () => {
    const [activeSection, setActiveSection] = useState(0);

    const quotes = [
        {
            text: "The best way to predict the future is to create it.",
            author: "Peter Drucker"
        },
        {
            text: "Your mind is a powerful thing. When you fill it with positive thoughts, your life will start to change.",
            author: "Unknown"
        },
        {
            text: "The only way to do great work is to love what you do.",
            author: "Steve Jobs"
        },
        {
            text: "Believe you can and you're halfway there.",
            author: "Theodore Roosevelt"
        },
        {
            text: "Every moment is a fresh beginning.",
            author: "T.S. Eliot"
        },
        {
            text: "The future belongs to those who believe in the beauty of their dreams.",
            author: "Eleanor Roosevelt"
        },
        {
            text: "It always seems impossible until it's done.",
            author: "Nelson Mandela"
        },
        {
            text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
            author: "Ralph Waldo Emerson"
        },
        {
            text: "The only impossible journey is the one you never begin.",
            author: "Tony Robbins"
        },
        {
            text: "In the middle of difficulty lies opportunity.",
            author: "Albert Einstein"
        },
        {
            text: "Your limitation—it's only your imagination.",
            author: "Unknown"
        },
        {
            text: "Great things never come from comfort zones.",
            author: "Unknown"
        },
        {
            text: "The mind is everything. What you think you become.",
            author: "Buddha"
        },
        {
            text: "Happiness is not by chance, but by choice.",
            author: "Jim Rohn"
        },
        {
            text: "The journey of a thousand miles begins with one step.",
            author: "Lao Tzu"
        }
    ];

    // Track active section using IntersectionObserver
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
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
        const sections = document.querySelectorAll('.quote-section');
        sections.forEach((section) => observer.observe(section));

        return () => {
            sections.forEach((section) => observer.unobserve(section));
        };
    }, []);

    const scrollToSection = (index) => {
        const section = document.getElementById(`quote-${index}`);
        section?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="snap-container">
            {/* Scroll Indicators */}
            <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
                {quotes.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollToSection(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${activeSection === index
                                ? 'bg-uprock-orange scale-125'
                                : 'bg-deep-brown/30 hover:bg-deep-brown/50'
                            }`}
                        aria-label={`Go to quote ${index + 1}`}
                    />
                ))}
            </div>

            {/* Quote Sections */}
            {quotes.map((quote, index) => {
                const isEven = index % 2 === 0;
                const bgClass = isEven
                    ? 'bg-gradient-to-br from-uprock-orange via-uprock-yellow to-uprock-orange'
                    : 'bg-warm-bg';
                const textClass = isEven ? 'text-white' : 'text-deep-brown';
                const iconClass = isEven ? 'text-white' : 'text-uprock-orange';

                return (
                    <section
                        key={index}
                        id={`quote-${index}`}
                        className={`quote-section snap-section flex items-center justify-center min-h-screen p-6 ${bgClass}`}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            {index === 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                    className="mb-8"
                                >
                                    <Heart className={`w-16 h-16 mx-auto ${iconClass} animate-pulse`} />
                                </motion.div>
                            )}

                            {index === 0 && (
                                <h1 className={`text-4xl md:text-5xl font-bold ${textClass} mb-12`}>
                                    Feel Better
                                </h1>
                            )}

                            <Sparkles className={`w-12 h-12 mx-auto mb-8 ${iconClass} ${index !== 0 && 'animate-pulse'}`} />

                            <h2 className={`text-4xl md:text-6xl font-bold ${textClass} mb-8 leading-tight`}>
                                "{quote.text}"
                            </h2>

                            <p className={`text-2xl md:text-3xl ${textClass} ${isEven ? 'opacity-90' : 'opacity-70'} font-medium`}>
                                — {quote.author}
                            </p>

                            <div className={`mt-8 text-sm ${textClass} ${isEven ? 'opacity-70' : 'opacity-50'}`}>
                                {index + 1} / {quotes.length}
                            </div>
                        </motion.div>
                    </section>
                );
            })}
        </div>
    );
};

export default FeelBetterPage;
