'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../login/login.module.css';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Store user data (demo purposes)
        localStorage.setItem('mlbattle_user', JSON.stringify({
            email,
            name,
            rating: 1200,
            rank: 0
        }));

        router.push('/');
        setIsLoading(false);
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
                        <h1>Create Account</h1>
                        <p>Start your Machine Learning journey today</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.authForm}>
                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

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
                                placeholder="Create a password"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                required
                            />
                        </div>

                        <div className={styles.formOptions}>
                            <label className={styles.checkbox}>
                                <input type="checkbox" required />
                                <span>I agree to the Terms & Conditions</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary btn-lg ${styles.submitBtn}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className={styles.authFooter}>
                        <p>Already have an account? <Link href="/login">Sign in</Link></p>
                    </div>
                </div>

                <div className={styles.authVisual}>
                    <div className={styles.visualContent}>
                        <div className={styles.statsCard}>
                            <div className={styles.statsIcon}>🚀</div>
                            <h3>Start Your ML Career</h3>
                            <p>Practice with real datasets, compete with peers, and build your portfolio</p>
                            <div className={styles.statsRow}>
                                <div className={styles.stat}>
                                    <span className={styles.statValue}>Free</span>
                                    <span className={styles.statLabel}>To Start</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statValue}>1200</span>
                                    <span className={styles.statLabel}>Starting ELO</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
