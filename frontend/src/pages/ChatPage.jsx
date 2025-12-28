import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Menu, Plus, User, Sparkles, Smile, Frown, Zap, HelpCircle, AlertCircle, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
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
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [input, setInput] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentEmotion, setCurrentEmotion] = useState('neutral');
    const [loading, setLoading] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const [currentQuote, setCurrentQuote] = useState(null);
    const messagesEndRef = useRef(null);

    // Inspirational quotes collection
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

    // Select random quote on mount
    useEffect(() => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setCurrentQuote(randomQuote);

        // Hide splash after 5 seconds
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);


    // Get current chat messages
    const currentChat = chats.find(chat => chat.id === currentChatId);
    const messages = currentChat?.messages || [];

    // Load chats from localStorage on mount
    useEffect(() => {
        if (!currentUser) return;

        const chatsKey = `chats_${currentUser.uid}`;
        const currentChatKey = `currentChatId_${currentUser.uid}`;

        const savedChats = localStorage.getItem(chatsKey);
        const savedCurrentChatId = localStorage.getItem(currentChatKey);

        if (savedChats) {
            try {
                const parsedChats = JSON.parse(savedChats);
                // Convert timestamp strings back to Date objects
                const chatsWithDates = parsedChats.map(chat => ({
                    ...chat,
                    createdAt: new Date(chat.createdAt),
                    lastUpdated: new Date(chat.lastUpdated),
                    messages: chat.messages.map(msg => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp),
                        createdAt: new Date(msg.createdAt)
                    }))
                }));
                setChats(chatsWithDates);

                if (savedCurrentChatId && chatsWithDates.find(c => c.id === savedCurrentChatId)) {
                    setCurrentChatId(savedCurrentChatId);
                } else if (chatsWithDates.length > 0) {
                    setCurrentChatId(chatsWithDates[0].id);
                }
            } catch (error) {
                console.error('Error loading chats:', error);
                createNewChat();
            }
        } else {
            // Create first chat if none exist
            createNewChat();
        }
    }, [currentUser]);

    // Save chats to localStorage whenever they change
    useEffect(() => {
        if (!currentUser || chats.length === 0) return;

        const chatsKey = `chats_${currentUser.uid}`;
        const currentChatKey = `currentChatId_${currentUser.uid}`;

        try {
            localStorage.setItem(chatsKey, JSON.stringify(chats));
            if (currentChatId) {
                localStorage.setItem(currentChatKey, currentChatId);
            }
        } catch (error) {
            console.error('Error saving chats:', error);
        }
    }, [chats, currentChatId, currentUser]);

    // Update emotion when switching chats
    useEffect(() => {
        if (messages.length > 0) {
            const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai');
            if (lastAiMsg && lastAiMsg.emotion) {
                setCurrentEmotion(lastAiMsg.emotion);
            }
        } else {
            setCurrentEmotion('neutral');
        }
    }, [currentChatId, messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const generateChatTitle = (firstMessage) => {
        const text = firstMessage.substring(0, 30);
        return text.length < firstMessage.length ? text + '...' : text;
    };

    const createNewChat = () => {
        const newChat = {
            id: `chat_${Date.now()}`,
            title: 'New Chat',
            messages: [],
            createdAt: new Date(),
            lastUpdated: new Date()
        };
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        setCurrentEmotion('neutral');
    };

    const switchChat = (chatId) => {
        setCurrentChatId(chatId);
    };

    const deleteChat = (chatId, e) => {
        e.stopPropagation();

        if (!confirm('Are you sure you want to delete this chat?')) {
            return;
        }

        setChats(prev => prev.filter(chat => chat.id !== chatId));

        if (chatId === currentChatId) {
            const remainingChats = chats.filter(chat => chat.id !== chatId);
            if (remainingChats.length > 0) {
                setCurrentChatId(remainingChats[0].id);
            } else {
                createNewChat();
            }
        }
    };

    const updateCurrentChat = (updater) => {
        setChats(prev => prev.map(chat =>
            chat.id === currentChatId
                ? { ...chat, ...updater(chat), lastUpdated: new Date() }
                : chat
        ));
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || !currentUser || !currentChatId) return;

        const userText = input;
        setInput('');
        setLoading(true);

        // Add user message to current chat
        const userMessage = {
            id: Date.now().toString() + '-user',
            sender: 'user',
            text: userText,
            role: 'user',
            timestamp: new Date(),
            emotion: currentEmotion,
            createdAt: new Date()
        };

        // Update chat title if this is the first message
        updateCurrentChat(chat => {
            const newMessages = [...chat.messages, userMessage];
            const updates = { messages: newMessages };

            if (chat.title === 'New Chat' && newMessages.length === 1) {
                updates.title = generateChatTitle(userText);
            }

            return updates;
        });

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

            // Add AI response to current chat
            const aiMessage = {
                id: Date.now().toString() + '-ai',
                sender: 'ai',
                text: data.response,
                role: 'ai',
                timestamp: new Date(),
                emotion: data.emotion,
                createdAt: new Date()
            };

            updateCurrentChat(chat => ({
                messages: [...chat.messages, aiMessage]
            }));

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
            updateCurrentChat(chat => ({
                messages: [...chat.messages, errorMessage]
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Quote Splash Screen */}
            <AnimatePresence>
                {showSplash && currentQuote && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-uprock-orange via-uprock-yellow to-uprock-orange"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="max-w-4xl mx-auto px-8 text-center"
                        >
                            <Sparkles className="w-16 h-16 mx-auto mb-8 text-white animate-pulse" />
                            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                                "{currentQuote.text}"
                            </h2>
                            <p className="text-2xl md:text-3xl text-white/90 font-medium">
                                — {currentQuote.author}
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Interface */}
            <div className="flex h-screen overflow-hidden p-4 pt-24 gap-6 bg-warm-bg font-sans">
                {/* Sidebar */}
                <AnimatePresence mode="wait">
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 300, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="hidden md:flex flex-col glass-panel h-full p-6 overflow-hidden shrink-0"
                        >

                            <button
                                onClick={createNewChat}
                                className="flex items-center gap-3 w-full p-4 mb-6 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all text-deep-brown font-semibold border border-deep-brown/5"
                            >
                                <Plus size={20} className="text-uprock-orange" />
                                <span>New Chat</span>
                            </button>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {chats.map(chat => (
                                    <div
                                        key={chat.id}
                                        onClick={() => switchChat(chat.id)}
                                        className={`p-4 rounded-3xl text-deep-brown text-sm font-medium cursor-pointer transition-all group relative ${chat.id === currentChatId
                                            ? 'bg-uprock-yellow/20 border border-uprock-yellow/50'
                                            : 'bg-white/50 border border-deep-brown/5 hover:bg-white/80'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold truncate">{chat.title}</div>
                                                <div className="text-xs text-deep-brown/60 mt-1">
                                                    {new Date(chat.lastUpdated).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => deleteChat(chat.id, e)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-lg"
                                                title="Delete chat"
                                            >
                                                <Trash2 size={16} className="text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-3 mt-auto p-2">
                                <div className="w-10 h-10 rounded-full bg-deep-brown/10 flex items-center justify-center">
                                    <User size={20} className="text-deep-brown" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-deep-brown">{currentUser?.email?.split('@')[0] || 'User'}</span>
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
        </>
    );
};

export default ChatPage;
