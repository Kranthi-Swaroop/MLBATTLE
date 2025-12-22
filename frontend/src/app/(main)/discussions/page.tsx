'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';
import styles from './discussions.module.css';
import Squares from '@/components/Squares';

interface Message {
    _id: string;
    content: string;
    user: string;
    userName: string;
    createdAt: string;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function DiscussionsPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserName, setCurrentUserName] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Check auth status
    useEffect(() => {
        const checkAuth = async () => {
            const token = api.getToken();
            if (token) {
                const response = await api.getUserProfile();
                if (response.success && response.data) {
                    setIsLoggedIn(true);
                    setCurrentUserId(response.data._id);
                    setCurrentUserName(response.data.name);
                }
            }
        };
        checkAuth();
    }, []);

    // Fetch messages and setup socket
    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            const response = await api.getMessages();
            if (response.success && response.data) {
                setMessages(response.data as Message[]);
            }
            setIsLoading(false);
        };

        fetchMessages();

        // Setup socket connection
        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('newMessage', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        socketRef.current.on('deleteMessage', ({ messageId }: { messageId: string }) => {
            setMessages(prev => prev.filter(m => m._id !== messageId));
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        setError('');

        const response = await api.sendMessage(newMessage.trim());

        if (response.success) {
            setNewMessage('');
            inputRef.current?.focus();
        } else {
            setError(response.message || 'Failed to send message');
        }

        setIsSending(false);
    };

    const handleDeleteMessage = async (messageId: string) => {
        const response = await api.deleteMessage(messageId);
        if (!response.success) {
            setError(response.message || 'Failed to delete message');
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;

        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            '#8B5CF6', '#EC4899', '#06B6D4', '#10B981',
            '#F59E0B', '#EF4444', '#3B82F6', '#14B8A6'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className={styles.discussionsPage}>
            <Squares
                direction="diagonal"
                speed={0.5}
                borderColor="rgba(139, 92, 246, 0.3)"
                squareSize={50}
                hoverFillColor="rgba(224, 86, 240)"
            />

            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1>💬 Global Chat</h1>
                        <p className={styles.subtitle}>
                            Real-time discussions with the MLBattle community
                        </p>
                    </div>
                    <div className={styles.headerInfo}>
                        <span className={styles.badge}>
                            🕐 Messages auto-delete after 24 hours
                        </span>
                        <span className={styles.onlineCount}>
                            {messages.length} messages
                        </span>
                    </div>
                </div>

                <div className={styles.chatContainer}>
                    <div className={styles.messagesArea}>
                        {isLoading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner}></div>
                                <p>Loading messages...</p>
                                <div className={styles.skeletonMessages}>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={styles.skeletonMessage}>
                                            <div className={styles.skeletonAvatar}></div>
                                            <div className={styles.skeletonContent}>
                                                <div className={styles.skeletonHeader}></div>
                                                <div className={styles.skeletonText}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className={styles.empty}>
                                <span className={styles.emptyIcon}>💭</span>
                                <h3>No messages yet</h3>
                                <p>Be the first to start the conversation!</p>
                            </div>
                        ) : (
                            <div className={styles.messagesList}>
                                {messages.map((msg) => (
                                    <div
                                        key={msg._id}
                                        className={`${styles.message} ${msg.user === currentUserId ? styles.ownMessage : ''}`}
                                    >
                                        <div
                                            className={styles.avatar}
                                            style={{ backgroundColor: getAvatarColor(msg.userName) }}
                                        >
                                            {getInitial(msg.userName)}
                                        </div>
                                        <div className={styles.messageBody}>
                                            <div className={styles.messageHeader}>
                                                <span className={styles.userName}>
                                                    {msg.userName}
                                                    {msg.user === currentUserId && <span className={styles.youBadge}>you</span>}
                                                </span>
                                                <span className={styles.time}>{formatTime(msg.createdAt)}</span>
                                                {msg.user === currentUserId && (
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={() => handleDeleteMessage(msg._id)}
                                                        title="Delete message"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                            <p className={styles.messageContent}>{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.inputArea}>
                        {isLoggedIn ? (
                            <form onSubmit={handleSendMessage} className={styles.inputForm}>
                                <div
                                    className={styles.inputAvatar}
                                    style={{ backgroundColor: getAvatarColor(currentUserName) }}
                                >
                                    {getInitial(currentUserName)}
                                </div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    maxLength={1000}
                                    disabled={isSending}
                                    className={styles.input}
                                />
                                <button
                                    type="submit"
                                    disabled={isSending || !newMessage.trim()}
                                    className={styles.sendButton}
                                >
                                    {isSending ? (
                                        <span className={styles.sendingSpinner}></span>
                                    ) : (
                                        'Send'
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className={styles.loginPrompt}>
                                <p>
                                    <a href="/login">Log in</a> or <a href="/signup">sign up</a> to join the conversation
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
