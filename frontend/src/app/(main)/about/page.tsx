import styles from './about.module.css';
import type { Metadata } from 'next';
import ProfileCard from '@/components/ProfileCard';
import GridScan from '@/components/GridScan';

export const metadata: Metadata = {
    title: 'About - MLBattle',
    description: 'Learn about MLBattle and the KALI Club - Knowledge in Artificial and Learning Intelligence.',
};

export default function AboutPage() {
    return (
        <div className={styles.aboutPage}>
            <div className={styles.gridBackground}>
                <GridScan
                    sensitivity={0.55}
                    lineThickness={1}
                    linesColor="#392e4e"
                    gridScale={0.12}
                    scanColor="#FF9FFC"
                    scanOpacity={0.4}
                    noiseIntensity={0.01}
                />
            </div>
            <div className={styles.container}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <h1 className={styles.title}>About MLBattle</h1>
                    <p className={styles.subtitle}>
                        Where Machine Learning Enthusiasts Compete, Learn, and Grow Together
                    </p>
                </section>

                {/* About the Platform */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>
                            <div className={styles.iconWrapper}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                                </svg>
                            </div>
                            What is MLBattle?
                        </h2>
                    </div>
                    <p className={styles.text}>
                        MLBattle is a competitive machine learning platform designed to bring together students, researchers,
                        and ML enthusiasts in exciting ML & data science competitions. Our platform provides a space where you can
                        test your skills, learn from others, and push the boundaries of what&apos;s possible with machine learning.
                    </p>
                    <p className={styles.text}>
                        Whether you&apos;re a beginner taking your first steps in ML or an experienced practitioner looking for
                        challenging problems, MLBattle offers competitions tailored to all skill levels. Compete, climb the leaderboard, and earn recognition for your achievements.
                    </p>
                </section>

                {/* About KALI Club */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>
                            <div className={styles.iconWrapper}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            KALI Club
                        </h2>
                        <h3 className={styles.subtitle}>Knowledge in Artificial Intelligence and Learning Innovation</h3>
                    </div>
                    <p className={styles.text}>
                        KALI (Knowledge in Artificial Intelligence and Learning Innovation) is a student-driven group dedicated to
                        fostering a community passionate about artificial intelligence, machine learning, and data science.
                        We believe in learning by doing, and MLBattle is our flagship platform to provide hands-on
                        competitive experience.
                    </p>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🎓</div>
                            <h4>Learn Together</h4>
                            <p>Workshops, seminars, and peer learning sessions</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🚀</div>
                            <h4>Build Projects</h4>
                            <p>Hands-on experience with real-world ML problems</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🤝</div>
                            <h4>Network</h4>
                            <p>Connect with fellow AI/ML enthusiasts</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🏆</div>
                            <h4>Compete</h4>
                            <p>Test your skills in ML competitions</p>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>
                            <div className={styles.iconWrapper}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            How MLBattle Works
                        </h2>
                    </div>

                    <div className={styles.stepsContainer}>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>1</div>
                            <div className={styles.stepContent}>
                                <h3>Create an Account</h3>
                                <p>Sign up and join the MLBattle community. Set up your profile and start exploring competitions.</p>
                            </div>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepNumber}>2</div>
                            <div className={styles.stepContent}>
                                <h3>Browse Events & Competitions</h3>
                                <p>Discover ongoing and upcoming competitions with detailed problem statements, datasets, and metrics.</p>
                            </div>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepNumber}>3</div>
                            <div className={styles.stepContent}>
                                <h3>Register & Compete</h3>
                                <p>Register for competitions that interest you. Download datasets, build your models, and submit predictions.</p>
                            </div>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepNumber}>4</div>
                            <div className={styles.stepContent}>
                                <h3>Track Your Progress</h3>
                                <p>Submit solutions and see your real-time ranking on the leaderboard with Kaggle-powered evaluation.</p>
                            </div>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepNumber}>5</div>
                            <div className={styles.stepContent}>
                                <h3>Learn & Improve</h3>
                                <p>Participate in discussions, learn from top performers, and build your ELO rating and reputation.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Integration Info */}
                <section className={styles.section}>
                    <div className={styles.infoBox}>
                        <div className={styles.infoIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                        </div>
                        <div>
                            <h3>Powered by Kaggle Integration</h3>
                            <p>
                                MLBattle leverages Kaggle&apos;s robust API for competition hosting and evaluation.
                                This integration ensures reliable scoring, fair competition, and access to industry-standard
                                ML competition infrastructure.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className={`${styles.section} ${styles.teamSection}`}>
                    <div className={styles.sectionHeader}>
                        <h2>
                            <div className={styles.iconWrapper}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            Meet the Team
                        </h2>
                    </div>
                    <div className={styles.teamGrid}>
                        <ProfileCard
                            name="Aditya Kumar Sahu"
                            role="UI/UX & Frontend Architect"
                            description="B.Tech CSE'28 NIT Raipur"
                            image="/profile1.jpg"
                            githubUrl="https://github.com/CodedByAd1"
                            twitterUrl="https://x.com/e_boyadi"
                            linkedinUrl="https://www.linkedin.com/in/aditya-kumar-sahu-329084330/"
                            email="adityasahu0204@gmail.com"
                        />
                        <ProfileCard
                            name="B. Kranthi Swaroop"
                            role="Backend & API Developer"
                            description="B.Tech CSE'28 NIT Raipur"
                            image="/profile5.png"
                            githubUrl="https://github.com/Kranthi-Swaroop"
                            twitterUrl="https://x.com/"
                            linkedinUrl="https://www.linkedin.com/in/b-kranthi-swaroop/"
                            email="kranthi203s@gmail.com"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
