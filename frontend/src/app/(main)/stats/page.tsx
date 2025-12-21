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
                    gridScale={0.1}
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
                        Where Machine Learning Enthusiasts Compete, Learn, and Grow
                    </p>
                </section>

                {/* About the Platform */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.iconWrapper}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </div>
                        <h2>What is MLBattle?</h2>
                    </div>
                    <p className={styles.text}>
                        MLBattle is a competitive machine learning platform designed to bring together students, researchers, 
                        and ML enthusiasts in exciting data science competitions. Our platform provides a space where you can 
                        test your skills, learn from others, and push the boundaries of what's possible with machine learning.
                    </p>
                    <p className={styles.text}>
                        Whether you're a beginner taking your first steps in ML or an experienced practitioner looking for 
                        challenging problems, MLBattle offers competitions tailored to all skill levels. Compete individually 
                        or form teams, climb the leaderboard, and earn recognition for your achievements.
                    </p>
                </section>

                {/* About KALI Club */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.iconWrapper}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h2>KALI Club</h2>
                        <h3 className={styles.subtitle}>Knowledge in Artificial and Learning Intelligence</h3>
                    </div>
                    <p className={styles.text}>
                        KALI (Knowledge in Artificial and Learning Intelligence) is a student-driven club dedicated to 
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
                            <p>Connect with fellow AI/ML enthusiasts and experts</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🏆</div>
                            <h4>Compete</h4>
                            <p>Test your skills in exciting ML competitions</p>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.iconWrapper}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <h2>How MLBattle Works</h2>
                    </div>
                    
                    <div className={styles.stepsContainer}>
                        <div className={styles.step}>
                            <div className={styles.stepNumber}>1</div>
                            <div className={styles.stepContent}>
                                <h3>Create an Account</h3>
                                <p>Sign up and join the MLBattle community. Set up your profile and start exploring.</p>
                            </div>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepNumber}>2</div>
                            <div className={styles.stepContent}>
                                <h3>Browse Events & Competitions</h3>
                                <p>Discover ongoing and upcoming competitions. Each event comes with detailed problem statements, datasets, and evaluation metrics.</p>
                            </div>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepNumber}>3</div>
                            <div className={styles.stepContent}>
                                <h3>Register & Compete</h3>
                                <p>Register for competitions that interest you. Download datasets, build your models, and submit your predictions.</p>
                            </div>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepNumber}>4</div>
                            <div className={styles.stepContent}>
                                <h3>Track Your Progress</h3>
                                <p>Submit your solutions and see how you rank on the leaderboard. Your submissions are evaluated in real-time using Kaggle integration.</p>
                            </div>
                        </div>

                        <div className={styles.step}>
                            <div className={styles.stepNumber}>5</div>
                            <div className={styles.stepContent}>
                                <h3>Learn & Improve</h3>
                                <p>Participate in discussions, learn from top performers, and continuously improve your skills. Build your ELO rating and reputation.</p>
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
                                MLBattle leverages Kaggle's robust API for competition hosting and evaluation. 
                                This integration ensures reliable scoring, fair competition, and access to industry-standard 
                                ML competition infrastructure.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.iconWrapper}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h2>Meet the Team</h2>
                    </div>
                    <div className={styles.teamGrid}>
                        <ProfileCard
                            name="Aditya Kumar Sahu"
                            role="UI/UX & Frontend Architecture"
                            description="B.Tech CSE'28 NIT Raipur"
                            image="/profile1.jpg"
                            githubUrl="https://github.com/CodedByAd1"
                            twitterUrl="https://x.com/e_boyadi"
                            instagramUrl="https://www.instagram.com/aditya._.245/"
                            email="adityasahu0204@gmail.com"
                        />
                        <ProfileCard
                            name="B. Kranthi Swaroop"
                            role="Server & API Development"
                            description="B.Tech CSE'28 NIT Raipur"
                            image="/Ai_profile1.jpg"
                            githubUrl="https://github.com"
                            twitterUrl="https://x.com/e_boyadi"
                            instagramUrl="https://instagram.com"
                            email="backend@mlbattle.com"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
