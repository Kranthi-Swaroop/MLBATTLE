'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import styles from './discussions.module.css';

interface Discussion {
    id: string;
    title: string;
    author: string;
    authorAvatar: string;
    category: 'General' | 'Questions' | 'Ideas' | 'Datasets' | 'Code';
    content: string;
    upvotes: number;
    replies: number;
    views: number;
    createdAt: string;
    tags: string[];
    isPinned?: boolean;
}

const discussionsData: Record<string, Discussion[]> = {
    'ml-olympics-2024': [
        {
            id: '1',
            title: 'Starter Code for Medical Image Classification',
            author: 'Sarah Chen',
            authorAvatar: '🧑‍💻',
            category: 'Code',
            content: 'Hey everyone! I\'ve created a starter notebook with data loading and basic CNN architecture. Feel free to fork and improve!',
            upvotes: 142,
            replies: 28,
            views: 1205,
            createdAt: '2 days ago',
            tags: ['starter-code', 'cnn', 'pytorch'],
            isPinned: true
        },
        {
            id: '2',
            title: 'Best practices for handling imbalanced medical datasets?',
            author: 'Alex Kumar',
            authorAvatar: '👨‍⚕️',
            category: 'Questions',
            content: 'I noticed the dataset is highly imbalanced. What strategies have worked best for you? I\'ve tried SMOTE and class weights but looking for other ideas.',
            upvotes: 87,
            replies: 45,
            views: 892,
            createdAt: '1 day ago',
            tags: ['imbalanced-data', 'techniques']
        },
        {
            id: '3',
            title: 'Data Augmentation Strategies Discussion',
            author: 'Maria Rodriguez',
            authorAvatar: '🔬',
            category: 'Ideas',
            content: 'Let\'s share what augmentation techniques are working well. I\'m seeing good results with rotation, zoom, and horizontal flip. Anyone tried more advanced techniques?',
            upvotes: 65,
            replies: 32,
            views: 743,
            createdAt: '3 days ago',
            tags: ['augmentation', 'preprocessing']
        },
        {
            id: '4',
            title: 'EDA: Distribution Analysis of X-ray Images',
            author: 'David Park',
            authorAvatar: '📊',
            category: 'Datasets',
            content: 'Sharing my exploratory data analysis notebook. Found some interesting patterns in the image distributions across different disease categories.',
            upvotes: 124,
            replies: 19,
            views: 1450,
            createdAt: '4 days ago',
            tags: ['eda', 'visualization'],
            isPinned: true
        },
        {
            id: '5',
            title: 'Transfer Learning: ResNet vs EfficientNet',
            author: 'Emma Wilson',
            authorAvatar: '🤖',
            category: 'Ideas',
            content: 'Has anyone compared different pre-trained models? I\'m getting better results with EfficientNet-B5 compared to ResNet50. What about you?',
            upvotes: 98,
            replies: 56,
            views: 1120,
            createdAt: '5 days ago',
            tags: ['transfer-learning', 'models']
        },
        {
            id: '6',
            title: 'Question about validation strategy',
            author: 'James Lee',
            authorAvatar: '❓',
            category: 'Questions',
            content: 'Should we use stratified k-fold or simple train-test split? What\'s the community consensus on this?',
            upvotes: 43,
            replies: 23,
            views: 567,
            createdAt: '1 week ago',
            tags: ['validation', 'strategy']
        },
        {
            id: '7',
            title: 'Ensemble Methods Megathread',
            author: 'Lisa Zhang',
            authorAvatar: '🎯',
            category: 'General',
            content: 'Let\'s discuss ensemble strategies! Share your blending/stacking approaches and what worked best.',
            upvotes: 156,
            replies: 67,
            views: 1890,
            createdAt: '1 week ago',
            tags: ['ensemble', 'stacking', 'blending']
        },
        {
            id: '8',
            title: 'GPU Memory Optimization Tips',
            author: 'Ryan Tech',
            authorAvatar: '⚡',
            category: 'Code',
            content: 'Running into GPU memory issues? Here are some tips for training larger models with limited VRAM.',
            upvotes: 76,
            replies: 14,
            views: 634,
            createdAt: '1 week ago',
            tags: ['optimization', 'gpu']
        }
    ],
    'nlp-masters': [
        {
            id: '1',
            title: 'Which BERT variant should I use?',
            author: 'Tom Harris',
            authorAvatar: '🤔',
            category: 'Questions',
            content: 'I\'m confused between BERT, RoBERTa, ALBERT, and DistilBERT. Which one would you recommend for this competition?',
            upvotes: 54,
            replies: 32,
            views: 678,
            createdAt: '1 day ago',
            tags: ['bert', 'transformers'],
            isPinned: true
        },
        {
            id: '2',
            title: 'Tokenization strategies comparison',
            author: 'Nina Patel',
            authorAvatar: '📝',
            category: 'Ideas',
            content: 'Comparing different tokenization approaches. WordPiece vs BPE vs SentencePiece - what are your thoughts?',
            upvotes: 41,
            replies: 18,
            views: 423,
            createdAt: '3 days ago',
            tags: ['tokenization', 'preprocessing']
        }
    ],
    'vision-quest': [
        {
            id: '1',
            title: 'Pre-competition Discussion Thread',
            author: 'Vision Team',
            authorAvatar: '👁️',
            category: 'General',
            content: 'Welcome to Vision Quest 2024! Introduce yourself and share what you\'re most excited about.',
            upvotes: 89,
            replies: 124,
            views: 1567,
            createdAt: '1 week ago',
            tags: ['welcome', 'introduction'],
            isPinned: true
        }
    ],
    'beginner-bootcamp': [
        {
            id: '1',
            title: 'Complete Beginner - Where to Start?',
            author: 'NewCoder123',
            authorAvatar: '🌱',
            category: 'Questions',
            content: 'I\'m completely new to ML. Which competition should I start with and what resources do you recommend?',
            upvotes: 67,
            replies: 45,
            views: 892,
            createdAt: '2 days ago',
            tags: ['beginner', 'help'],
            isPinned: true
        },
        {
            id: '2',
            title: 'Free ML Learning Resources Compilation',
            author: 'MLMentor',
            authorAvatar: '📚',
            category: 'General',
            content: 'I\'ve compiled a list of free resources that helped me when I started. Hope this helps newcomers!',
            upvotes: 134,
            replies: 56,
            views: 1234,
            createdAt: '5 days ago',
            tags: ['resources', 'learning'],
            isPinned: true
        }
    ]
};

export default function DiscussionsPage() {
    const params = useParams();
    const eventId = params.eventId as string;
    const discussions = discussionsData[eventId] || [];

    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'most-replies'>('recent');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'General', 'Questions', 'Ideas', 'Datasets', 'Code'];

    const filteredDiscussions = discussions.filter(discussion => {
        const matchesCategory = selectedCategory === 'All' || discussion.category === selectedCategory;
        const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    }).sort((a, b) => {
        if (sortBy === 'popular') return b.upvotes - a.upvotes;
        if (sortBy === 'most-replies') return b.replies - a.replies;
        return 0; // recent - keep original order
    });

    return (
        <div className={styles.discussionsPage}>
            <div className={styles.header}>
                <div className="container">
                    <Link href={`/events/${eventId}`} className={styles.backLink}>
                        ← Back to Event
                    </Link>
                    <div className={styles.headerContent}>
                        <h1>💬 Discussions</h1>
                        <p className={styles.subtitle}>
                            Share ideas, ask questions, and collaborate with the community
                        </p>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search discussions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <button className="btn btn-primary">
                        ➕ New Discussion
                    </button>
                </div>

                <div className={styles.mainContent}>
                    <aside className={styles.sidebar}>
                        <div className={styles.filterSection}>
                            <h3>Categories</h3>
                            <div className={styles.categoryList}>
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        className={`${styles.categoryBtn} ${selectedCategory === category ? styles.active : ''}`}
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        {category}
                                        {category === 'All' && <span className={styles.count}>{discussions.length}</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.filterSection}>
                            <h3>Sort By</h3>
                            <div className={styles.sortList}>
                                <button
                                    className={`${styles.sortBtn} ${sortBy === 'recent' ? styles.active : ''}`}
                                    onClick={() => setSortBy('recent')}
                                >
                                    🕐 Most Recent
                                </button>
                                <button
                                    className={`${styles.sortBtn} ${sortBy === 'popular' ? styles.active : ''}`}
                                    onClick={() => setSortBy('popular')}
                                >
                                    🔥 Most Popular
                                </button>
                                <button
                                    className={`${styles.sortBtn} ${sortBy === 'most-replies' ? styles.active : ''}`}
                                    onClick={() => setSortBy('most-replies')}
                                >
                                    💬 Most Replies
                                </button>
                            </div>
                        </div>

                        <div className={styles.statsCard}>
                            <h3>Discussion Stats</h3>
                            <div className={styles.stat}>
                                <span className={styles.statValue}>{discussions.length}</span>
                                <span className={styles.statLabel}>Total Threads</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statValue}>
                                    {discussions.reduce((sum, d) => sum + d.replies, 0)}
                                </span>
                                <span className={styles.statLabel}>Total Replies</span>
                            </div>
                        </div>
                    </aside>

                    <div className={styles.discussionsList}>
                        {filteredDiscussions.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No discussions found. Be the first to start one!</p>
                            </div>
                        ) : (
                            filteredDiscussions.map(discussion => (
                                <DiscussionCard key={discussion.id} discussion={discussion} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DiscussionCard({ discussion }: { discussion: Discussion }) {
    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'General': 'var(--primary-500)',
            'Questions': 'var(--accent-500)',
            'Ideas': 'var(--warning)',
            'Datasets': 'var(--success)',
            'Code': '#EC4899'
        };
        return colors[category] || 'var(--primary-500)';
    };

    return (
        <div className={`${styles.discussionCard} ${discussion.isPinned ? styles.pinned : ''}`}>
            {discussion.isPinned && (
                <div className={styles.pinnedBadge}>
                    📌 Pinned
                </div>
            )}
            
            <div className={styles.cardLeft}>
                <div className={styles.avatar}>{discussion.authorAvatar}</div>
                <div className={styles.voteSection}>
                    <button className={styles.voteBtn}>▲</button>
                    <span className={styles.voteCount}>{discussion.upvotes}</span>
                    <button className={styles.voteBtn}>▼</button>
                </div>
            </div>

            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    <Link href={`#`} className={styles.discussionTitle}>
                        {discussion.title}
                    </Link>
                    <span 
                        className={styles.categoryBadge}
                        style={{ '--category-color': getCategoryColor(discussion.category) } as React.CSSProperties}
                    >
                        {discussion.category}
                    </span>
                </div>

                <p className={styles.discussionContent}>{discussion.content}</p>

                <div className={styles.cardFooter}>
                    <div className={styles.tags}>
                        {discussion.tags.map(tag => (
                            <span key={tag} className={styles.tag}>#{tag}</span>
                        ))}
                    </div>

                    <div className={styles.meta}>
                        <span className={styles.author}>{discussion.author}</span>
                        <span className={styles.separator}>•</span>
                        <span className={styles.time}>{discussion.createdAt}</span>
                        <span className={styles.separator}>•</span>
                        <span className={styles.metaItem}>
                            💬 {discussion.replies} replies
                        </span>
                        <span className={styles.separator}>•</span>
                        <span className={styles.metaItem}>
                            👁️ {discussion.views} views
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
