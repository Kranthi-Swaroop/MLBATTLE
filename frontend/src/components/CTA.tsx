import styles from './CTA.module.css';

export default function CTA() {
    return (
        <section className={styles.cta}>
            <div className="container">
                <div className={styles.ctaContainer}>
                    <div className={styles.ctaContent}>
                        <h2>Ready to Start Your ML Journey?</h2>
                        <p>Join thousands of data scientists competing in exciting challenges. Sign up now and get started!</p>
                        <button className="btn btn-primary btn-lg">Create Free Account</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
