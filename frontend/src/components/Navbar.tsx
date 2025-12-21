'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import styles from './Navbar.module.css';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        
        // Check if user is logged in
        checkAuthStatus();

        // Listen for storage changes (login/logout from other tabs)
        const handleStorageChange = () => {
            checkAuthStatus();
        };
        
        // Listen for custom auth-change event
        const handleAuthChange = () => {
            console.log('Auth change detected, rechecking status...');
            checkAuthStatus();
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('auth-change', handleAuthChange);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-change', handleAuthChange);
        };
    }, []);

    // Re-check auth status when route changes
    useEffect(() => {
        checkAuthStatus();
    }, [pathname]);

    const checkAuthStatus = async () => {
        const token = api.getToken();
        console.log('Checking auth status, token:', token ? 'exists' : 'none');
        
        if (token) {
            const response = await api.getUserProfile();
            console.log('Profile response:', response);
            
            if (response.success && response.data) {
                setIsLoggedIn(true);
                setUserName(response.data.name);
                console.log('User logged in:', response.data.name);
            } else {
                setIsLoggedIn(false);
                api.clearToken();
                console.log('Invalid token, clearing...');
            }
        } else {
            setIsLoggedIn(false);
            console.log('No token found');
        }
    };

    const handleLogout = () => {
        api.clearToken();
        setIsLoggedIn(false);
        setUserName('');
        window.dispatchEvent(new Event('auth-change'));
        router.push('/');
    };

    const handleProfileClick = () => {
        router.push('/profile');
    };

    const handleSignInClick = () => {
        router.push('/login');
    };

    const handleGetStartedClick = () => {
        router.push('/signup');
    };

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            <div className={`container ${styles.navContent}`}>
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>⚔️</div>
                    <span className={styles.logoText}>MLBattle</span>
                </Link>

                <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.active : ''}`}>
                    <Link href="/">Home</Link>
                    <Link href="/stats">About</Link>
                    <Link href="/events">Events</Link>
                    <Link href="/events/ml-olympics-2024/discussions">Discussions</Link>
                    <Link href="/leaderboard">Leaderboard</Link>
                    <Link href="/#features">Features</Link>
                </div>

                <div className={styles.navActions}>
                    {isLoggedIn ? (
                        <>
                            <button onClick={handleProfileClick} className="btn btn-ghost">
                                👤 {userName}
                            </button>
                            <button onClick={handleLogout} className="btn btn-primary">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleSignInClick} className="btn btn-ghost">Sign In</button>
                            <button onClick={handleGetStartedClick} className="btn btn-primary">Get Started</button>
                        </>
                    )}
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
