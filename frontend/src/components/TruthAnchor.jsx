import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Shield, Lock, CheckCircle, X, Link as LinkIcon, ExternalLink } from 'lucide-react';

const TruthAnchor = ({ onClose }) => {
    const [promiseText, setPromiseText] = useState('');
    const [status, setStatus] = useState('idle'); // idle, mining, confirmed
    const [txHash, setTxHash] = useState(null);
    const [blockNumber, setBlockNumber] = useState(null);

    const anchorTruth = async () => {
        if (!promiseText) return;

        setStatus('mining');

        // Simulate Network Delay / Mining
        setTimeout(() => {
            // Cryptographic Proof (Real Hash)
            const timestamp = Date.now();
            const data = `${promiseText}-${timestamp}`;
            const hash = ethers.id(data); // Keccak-256

            setTxHash(hash);
            setBlockNumber(Math.floor(Math.random() * 1000000) + 15000000); // Mock block
            setStatus('confirmed');
        }, 3000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-deep-brown/10 font-sans relative">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full text-deep-brown/40 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="bg-deep-brown p-8 text-center">
                    <div className="w-16 h-16 bg-uprock-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-uprock-yellow">
                        <LinkIcon size={32} className="text-uprock-yellow" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">The Truth Anchor</h2>
                    <p className="text-white/60 text-sm">Create an immutable record of your will.</p>
                </div>

                <div className="p-8">
                    {status === 'idle' && (
                        <>
                            <label className="block text-xs font-bold uppercase tracking-wider text-deep-brown/50 mb-2">
                                I Solemnly Promise To...
                            </label>
                            <textarea
                                value={promiseText}
                                onChange={(e) => setPromiseText(e.target.value)}
                                placeholder="e.g., Run a marathon this year."
                                className="w-full h-32 p-4 bg-warm-bg rounded-xl resize-none text-lg font-medium text-deep-brown placeholder-deep-brown/30 outline-none focus:ring-2 focus:ring-uprock-orange/50 transition-all"
                            />
                            <button
                                onClick={anchorTruth}
                                disabled={!promiseText}
                                className="w-full mt-6 py-4 bg-deep-brown text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <Lock size={18} />
                                Cryptographically Sign
                            </button>
                        </>
                    )}

                    {status === 'mining' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 border-4 border-uprock-orange border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-deep-brown mb-2">Mining Truth...</h3>
                            <p className="text-deep-brown/60 text-sm animate-pulse">Hashing data to the ledger</p>
                        </div>
                    )}

                    {status === 'confirmed' && (
                        <div className="text-center animate-fade-in-up">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-deep-brown mb-2">Immutable.</h3>
                            <p className="text-deep-brown/60 text-sm mb-6">Your promise has been anchored forever.</p>

                            <div className="bg-black/5 p-4 rounded-xl text-left font-mono text-xs text-deep-brown/80 break-all border border-deep-brown/10">
                                <div className="mb-2">
                                    <span className="font-bold text-deep-brown/40">HASH:</span>
                                    <br />{txHash}
                                </div>
                                <div>
                                    <span className="font-bold text-deep-brown/40">BLOCK:</span> #{blockNumber}
                                </div>
                            </div>

                            <a
                                href={`https://etherscan.io/tx/${txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-uprock-orange hover:underline text-sm font-bold mt-6"
                            >
                                <ExternalLink size={14} />
                                View on Explorer (Simulated)
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TruthAnchor;
