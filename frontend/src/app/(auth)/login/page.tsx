'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

// Demo account credentials
const DEMO_EMAIL = 'demo@mlbattle.com';
const DEMO_PASSWORD = 'demo123';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
            // Store demo auth state
            localStorage.setItem('mlbattle_user', JSON.stringify({
                email: DEMO_EMAIL,
                name: 'Demo User',
                rating: 1850,
                rank: 42
            }));
            router.push('/');
        } else {
            setError('Invalid email or password. Try the demo account!');
        }
        setIsLoading(false);
    };

    const fillDemoCredentials = () => {
        setEmail(DEMO_EMAIL);
        setPassword(DEMO_PASSWORD);
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    <div className={styles.authHeader}>
                        <Link href="/" className={styles.logoLink}>
                            <span className={styles.logoIcon}>⚔️</span>
                            <span className={styles.logoText}>MLBattle</span>
                        </Link>
                        <h1>Welcome Back</h1>
                        <p>Sign in to continue your ML journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.authForm}>
                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div className={styles.formOptions}>
                            <label className={styles.checkbox}>
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <Link href="#" className={styles.forgotLink}>Forgot password?</Link>
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary btn-lg ${styles.submitBtn}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className={styles.demoSection}>
                        <p>Want to try it out?</p>
                        <button
                            type="button"
                            onClick={fillDemoCredentials}
                            className={styles.demoBtn}
                        >
                            Use Demo Account
                        </button>
                        <div className={styles.demoCredentials}>
                            <code>Email: demo@mlbattle.com</code>
                            <code>Password: demo123</code>
                        </div>
                    </div>

                    <div className={styles.authFooter}>
                        <p>Don&apos;t have an account? <Link href="/signup">Sign up</Link></p>
                    </div>
                </div>

                <div className={styles.authVisual}>
                    <div className={styles.visualContent}>
                        <div className={styles.statsCard}>
                            <div className={styles.statsIcon}>🏆</div>
                            <h3>Join 15,000+ ML Engineers</h3>
                            <p>Compete in real-world challenges and climb the global leaderboard</p>
                            <div className={styles.statsRow}>
                                <div className={styles.stat}>
                                    <span className={styles.statValue}>250+</span>
                                    <span className={styles.statLabel}>Competitions</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statValue}>$1M+</span>
                                    <span className={styles.statLabel}>Prizes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
