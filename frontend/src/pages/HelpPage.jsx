import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Phone, Search, AlertCircle, ChevronDown, ChevronUp, ArrowLeft, Globe } from 'lucide-react';

const HelpPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRegion, setExpandedRegion] = useState('emergency');

    const toggleRegion = (region) => {
        setExpandedRegion(expandedRegion === region ? null : region);
    };

    const hotlines = {
        emergency: {
            title: "🚨 Emergency / Global Help",
            color: "bg-red-500",
            items: [
                { country: "🌍 Worldwide", number: "112", description: "Europe/India/Emergencies" },
                { country: "🇺🇸 USA/Canada", number: "911", description: "Emergency Services" },
            ]
        },
        northAmerica: {
            title: "🇺🇸 North America",
            color: "bg-blue-500",
            items: [
                { country: "USA", number: "988", description: "Suicide & Crisis Lifeline (call/text)" },
                { country: "USA", number: "741741", description: "Crisis Text Line - Text 'HELLO'" },
                { country: "Canada", number: "1-833-456-4566", description: "Canada Suicide Prevention Service" },
                { country: "Canada", number: "1-800-668-6868", description: "Kids Help Phone (youth)" },
                { country: "Canada", number: "45645", description: "Text support" },
            ]
        },
        europe: {
            title: "🇪🇺 Europe",
            color: "bg-indigo-500",
            items: [
                { country: "🇬🇧 UK", number: "116 123", description: "Samaritans" },
                { country: "🇮🇪 Ireland", number: "1800 247 247", description: "Pieta House" },
                { country: "🇫🇷 France", number: "3114", description: "Suicide Prevention Helpline" },
                { country: "🇩🇪 Germany", number: "0800 111 0111", description: "TelefonSeelsorge" },
                { country: "🇳🇱 Netherlands", number: "0900-0113", description: "Suicide Prevention Line" },
                { country: "🇸🇪 Sweden", number: "020-22 00 60", description: "National helpline" },
                { country: "🇨🇭 Switzerland", number: "143", description: "La Main Tendue" },
                { country: "🇪🇸 Spain", number: "717 003 717", description: "Teléfono de la Esperanza" },
                { country: "🇮🇹 Italy", number: "199 284 284", description: "Telefono Amico" },
            ]
        },
        asia: {
            title: "🌏 Asia & South Pacific",
            color: "bg-orange-500",
            items: [
                { country: "🇮🇳 India", number: "14416", description: "Tele-MANAS (24/7)" },
                { country: "🇮🇳 India", number: "1800-891-4416", description: "Tele-MANAS (alternate)" },
                { country: "🇮🇳 India", number: "9152987821", description: "KIRAN Helpline" },
                { country: "🇮🇳 India", number: "99996 66555", description: "Vandrevala Foundation" },
                { country: "🇮🇳 India", number: "+91-22-27546669", description: "AASRA (24/7)" },
                { country: "🇮🇳 India", number: "9152987821", description: "iCALL TISS" },
                { country: "🇯🇵 Japan", number: "03-5774-0992", description: "Tokyo Befrienders" },
                { country: "🇸🇬 Singapore", number: "1800-221-4444", description: "Samaritans of Singapore" },
                { country: "🇲🇾 Malaysia", number: "03-7627-2939", description: "Befrienders Kuala Lumpur" },
                { country: "🇵🇭 Philippines", number: "1553", description: "National Center for Mental Health" },
                { country: "🇰🇷 South Korea", number: "1588-9191", description: "Lifeline Korea" },
                { country: "🇧🇩 Bangladesh", number: "01688709965", description: "Kaan Pete Roi Airtel" },
            ]
        },
        latinAmerica: {
            title: "🌎 Latin America",
            color: "bg-green-500",
            items: [
                { country: "🇲🇽 Mexico", number: "55-5558-1111", description: "Consejo Ciudadano" },
                { country: "🇧🇷 Brazil", number: "188", description: "CVV (Centro de Valorização da Vida)" },
                { country: "🇦🇷 Argentina", number: "+54-11-5275-1135", description: "Suicide Support Helpline" },
            ]
        },
        africa: {
            title: "🌍 Africa",
            color: "bg-yellow-600",
            items: [
                { country: "🇿🇦 South Africa", number: "0800 567 567", description: "SADAG (24/7)" },
                { country: "🇿🇦 South Africa", number: "0800 12 13 14", description: "Lifeline emotional support" },
                { country: "🇬🇭 Ghana", number: "233024471279", description: "National Lifeline" },
                { country: "🇪🇬 Egypt", number: "762 1602", description: "Befrienders Cairo" },
            ]
        },
        oceania: {
            title: "🌏 Oceania",
            color: "bg-teal-500",
            items: [
                { country: "🇦🇺 Australia", number: "13 11 14", description: "Lifeline Australia" },
                { country: "🇦🇺 Australia", number: "1300 659 467", description: "Suicide Callback Service" },
                { country: "🇦🇺 Australia", number: "1800 55 1800", description: "Kids Helpline" },
                { country: "🇳🇿 New Zealand", number: "0800 543 354", description: "Lifeline NZ" },
            ]
        },
        indiaDetailed: {
            title: "🇮🇳 India - Detailed Support",
            color: "bg-uprock-orange",
            items: [
                { country: "National 24/7", number: "14416", description: "Tele-MANAS" },
                { country: "National 24/7", number: "1800-891-4416", description: "Tele-MANAS (toll-free)" },
                { country: "National 24/7", number: "9152987821", description: "KIRAN Helpline" },
                { country: "NGO", number: "99996 66555", description: "Vandrevala Foundation" },
                { country: "Mumbai", number: "+91-22-27546669", description: "AASRA (24/7)" },
                { country: "NGO", number: "+91-78930 78930", description: "1Life" },
                { country: "Chennai", number: "+91-44-2464 0060", description: "Sneha" },
                { country: "Kolkata", number: "90880 30303", description: "Lifeline Foundation" },
                { country: "Kolkata", number: "033-40447437", description: "Lifeline Foundation (alt)" },
                { country: "Bangalore", number: "080-25722573", description: "Mitram Foundation" },
                { country: "Fortis", number: "8376804102", description: "Fortis Mental Health Support" },
                { country: "SAHAI", number: "080-25497777", description: "SAHAI" },
            ]
        }
    };

    const filteredHotlines = Object.entries(hotlines).reduce((acc, [key, region]) => {
        const filteredItems = region.items.filter(item =>
            item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.number.includes(searchTerm)
        );
        if (filteredItems.length > 0) {
            acc[key] = { ...region, items: filteredItems };
        }
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-warm-bg p-4 md:p-8 pt-24 md:pt-32">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-deep-brown mb-2">Immediate Help</h1>
                    <p className="text-deep-brown/70">You are not alone. Help is available 24/7.</p>
                </div>

                {/* Emergency Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel bg-gradient-to-r from-red-500 to-orange-500 p-6 md:p-8 mb-8 border-2 border-red-600"
                >
                    <div className="flex items-start gap-4">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <AlertCircle size={32} className="text-white" />
                        </motion.div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-2">🚨 In Immediate Danger?</h2>
                            <p className="text-white/90 mb-4">If you are in immediate danger or feel you might harm yourself, call your local emergency number first:</p>
                            <div className="flex flex-wrap gap-4">
                                <a href="tel:112" className="bg-white text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-50 transition-all shadow-lg">
                                    <Phone className="inline mr-2" size={20} />
                                    112 (Europe/India)
                                </a>
                                <a href="tel:911" className="bg-white text-red-600 px-6 py-3 rounded-2xl font-bold hover:bg-red-50 transition-all shadow-lg">
                                    <Phone className="inline mr-2" size={20} />
                                    911 (USA/Canada)
                                </a>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search Bar */}
                <div className="glass-panel p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-deep-brown/40" size={20} />
                        <input
                            type="text"
                            placeholder="Search by country, service, or number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/50 border-2 border-deep-brown/10 rounded-2xl focus:outline-none focus:border-uprock-orange transition-all"
                        />
                    </div>
                </div>

                {/* Hotline Regions */}
                <div className="space-y-4">
                    {Object.entries(filteredHotlines).map(([key, region]) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel overflow-hidden"
                        >
                            <button
                                onClick={() => toggleRegion(key)}
                                className="w-full p-6 flex items-center justify-between hover:bg-white/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <Globe className="text-uprock-orange" size={24} />
                                    <h3 className="text-xl font-bold text-deep-brown">{region.title}</h3>
                                    <span className="text-sm text-deep-brown/60">({region.items.length} services)</span>
                                </div>
                                {expandedRegion === key ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </button>

                            {expandedRegion === key && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-6 pb-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {region.items.map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="bg-white/50 p-4 rounded-2xl border border-deep-brown/10 hover:border-uprock-orange hover:shadow-lg transition-all"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-deep-brown mb-1">{item.country}</p>
                                                        <p className="text-sm text-deep-brown/70 mb-2">{item.description}</p>
                                                        <a
                                                            href={`tel:${item.number.replace(/\s/g, '')}`}
                                                            className="inline-flex items-center gap-2 bg-uprock-orange text-white px-4 py-2 rounded-xl font-bold hover:bg-uprock-yellow hover:text-deep-brown transition-all"
                                                        >
                                                            <Phone size={16} />
                                                            {item.number}
                                                        </a>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Footer Message */}
                <div className="mt-8 text-center glass-panel p-6">
                    <p className="text-deep-brown/70">
                        💙 Remember: Reaching out is a sign of strength, not weakness. You matter, and help is available.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
