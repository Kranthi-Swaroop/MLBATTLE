import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerGrid}>
                    <div className={styles.footerBrand}>
                        <div className={styles.footerLogo}>
                            <div className={styles.logoIcon}>⚔️</div>
                            <span>MLBattle</span>
                        </div>
                        <p className={styles.footerDescription}>
                            The ultimate machine learning competition platform. Compete, learn, and rise through the ranks.
                        </p>
                    </div>

                    <div className={styles.footerColumn}>
                        <h4>Platform</h4>
                        <div className={styles.footerLinks}>
                            <Link href="#">Competitions</Link>
                            <Link href="#">Leaderboard</Link>
                            <Link href="#">Datasets</Link>
                            <Link href="#">Notebooks</Link>
                        </div>
                    </div>

                    <div className={styles.footerColumn}>
                        <h4>Resources</h4>
                        <div className={styles.footerLinks}>
                            <Link href="#">Documentation</Link>
                            <Link href="#">API Reference</Link>
                            <Link href="#">Tutorials</Link>
                            <Link href="#">Blog</Link>
                        </div>
                    </div>

                    <div className={styles.footerColumn}>
                        <h4>Company</h4>
                        <div className={styles.footerLinks}>
                            <Link href="#">About Us</Link>
                            <Link href="#">Careers</Link>
                            <Link href="#">Contact</Link>
                            <Link href="#">Privacy Policy</Link>
                        </div>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <p>© 2024 MLBattle. All rights reserved.</p>
                    <div className={styles.socialLinks}>
                        <a href="#" aria-label="Twitter">𝕏</a>
                        <a href="#" aria-label="GitHub">⌘</a>
                        <a href="#" aria-label="LinkedIn">in</a>
                        <a href="#" aria-label="Discord">💬</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
