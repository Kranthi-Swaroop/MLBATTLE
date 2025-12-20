'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.navContent}`}>
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>⚔️</div>
                    <span className={styles.logoText}>MLBattle</span>
                </Link>

                <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.active : ''}`}>
                    <Link href="/events">Events</Link>
                    <Link href="/events/ml-olympics-2024/discussions">Discussions</Link>
                    <Link href="/leaderboard">Leaderboard</Link>
                    <Link href="/stats">Statistics</Link>
                    <Link href="/#features">Features</Link>
                </div>

                <div className={styles.navActions}>
                    <button className="btn btn-ghost">Sign In</button>
                    <button className="btn btn-primary">Get Started</button>
                </div>

                <button
                    className={`${styles.mobileToggle} ${mobileMenuOpen ? styles.active : ''}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
}
