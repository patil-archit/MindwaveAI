import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Menu, Plus, User, Sparkles, Smile, Frown, Zap, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Emotion icons mapping
const EmotionIcon = ({ emotion }) => {
    switch (emotion) {
        case 'happy': return <Smile size={20} className="text-uprock-yellow" />;
        case 'sad': return <Frown size={20} className="text-blue-400" />;
        case 'angry': return <Zap size={20} className="text-red-500" />;
        case 'curious': return <HelpCircle size={20} className="text-purple-500" />;
        default: return <Sparkles size={20} className="text-uprock-orange" />;
    }
};

const ChatPage = () => {
    const { currentUser, logout } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentEmotion, setCurrentEmotion] = useState('neutral');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Load messages from Firestore (disabled - using local state instead)
    useEffect(() => {
        // Firestore integration disabled - messages are stored in local state
        // Uncomment this section if you want to enable Firestore persistence
        /*
        if (!currentUser) return;

        const q = query(
            collection(db, 'users', currentUser.uid, 'chats'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            if (msgs.length > 0) {
                // Determine emotion from last AI message or default
                const lastAiMsg = [...msgs].reverse().find(m => m.sender === 'ai');
                if (lastAiMsg && lastAiMsg.emotion) setCurrentEmotion(lastAiMsg.emotion);
            }
        });

        return unsubscribe;
        */
    }, [currentUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || !currentUser) return;

        const userText = input;
        setInput('');
        setLoading(true);

        // Add user message to local state immediately
        const userMessage = {
            id: Date.now().toString() + '-user',
            sender: 'user',
            text: userText,
            role: 'user',
            timestamp: new Date(),
            emotion: currentEmotion,
            createdAt: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            // Prepare History for Backend (Last 10 messages)
            const history = messages.slice(-10).map(m => ({
                role: m.sender === 'user' ? 'user' : 'ai',
                content: m.text
            }));

            // Call Backend
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: history.concat([{ role: 'user', content: userText }]),
                    uid: currentUser.uid,
                    history: history
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Add AI response to local state
            const aiMessage = {
                id: Date.now().toString() + '-ai',
                sender: 'ai',
                text: data.response,
                role: 'ai',
                timestamp: new Date(),
                emotion: data.emotion,
                createdAt: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            setCurrentEmotion(data.emotion);

        } catch (error) {
            console.error("Error sending message:", error);
            // Add error message to chat
            const errorMessage = {
                id: Date.now().toString() + '-error',
                sender: 'ai',
                text: `Sorry, I encountered an error: ${error.message}`,
                role: 'ai',
                timestamp: new Date(),
                emotion: 'neutral',
                createdAt: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden p-4 gap-6 bg-warm-bg font-sans">
            {/* Sidebar */}
            <AnimatePresence mode="wait">
                {isSidebarOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 300, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="hidden md:flex flex-col glass-panel h-full p-6 overflow-hidden shrink-0"
                    >
                        <div className="flex items-center gap-2 mb-8 text-deep-brown font-bold text-xl">
                            <div className="w-8 h-8 rounded-full bg-uprock-orange flex items-center justify-center text-white">
                                <Sparkles size={16} />
                            </div>
                            Mindwave AI
                        </div>

                        <button className="flex items-center gap-3 w-full p-4 mb-6 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all text-deep-brown font-semibold border border-deep-brown/5">
                            <Plus size={20} className="text-uprock-orange" />
                            <span>New Memory</span>
                        </button>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            <div className="p-4 rounded-3xl bg-uprock-yellow/20 text-deep-brown text-sm font-medium cursor-pointer border border-uprock-yellow/50">
                                Current Conversation
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-auto p-2">
                            <div className="w-10 h-10 rounded-full bg-deep-brown/10 flex items-center justify-center">
                                <User size={20} className="text-deep-brown" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-deep-brown">{currentUser?.email?.split('@')[0] || 'User'}</span>
                                <span className="text-xs text-deep-brown/60">Free Plan</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col glass-panel h-full relative overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-deep-brown/5 bg-white/40 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-white/50 rounded-full transition-colors md:hidden"
                        >
                            <Menu size={24} className="text-deep-brown" />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-deep-brown">Mindwave AI</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${currentEmotion === 'angry' ? 'bg-red-100 text-red-600' :
                                currentEmotion === 'happy' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-slate-100 text-deep-brown/60'
                                }`}>
                                {currentEmotion}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth">
                    {messages.length === 0 && (
                        <div className="text-center text-deep-brown/40 mt-20">
                            <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Start a new conversation...</p>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex flex-col max-w-[80%] md:max-w-[60%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                {msg.sender === 'ai' && (
                                    <span className="text-xs font-bold text-deep-brown/40 mb-2 ml-4">Companion</span>
                                )}
                                <div className={`p-6 md:p-8 text-base md:text-lg leading-relaxed ${msg.sender === 'user' ? 'bubble-user' : 'bubble-ai'
                                    }`}>
                                    <ReactMarkdown
                                        components={{
                                            strong: ({ node, ...props }) => <span className="font-bold text-deep-brown" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 block my-2" {...props} />,
                                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0 block" {...props} />
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                                {msg.sender === 'ai' && (
                                    <div className="mt-2 ml-4 p-1.5 bg-white/50 rounded-full w-fit shadow-sm">
                                        <EmotionIcon emotion={msg.emotion} />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="p-6 rounded-t-4xl rounded-br-4xl rounded-bl-lg bg-white/50 text-deep-brown/60 text-sm flex items-center gap-2">
                                <Sparkles size={16} className="animate-pulse text-uprock-orange" />
                                Thinking...
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 md:p-8 bg-white/40 backdrop-blur-md">
                    <form onSubmit={sendMessage} className="relative max-w-4xl mx-auto flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your thoughts..."
                            className="w-full glass-input pr-16 text-lg"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-2 p-3 bg-deep-brown rounded-full text-white shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
