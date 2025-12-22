"use client";

import styles from './ProfileCard.module.css';
import Image from 'next/image';

interface ProfileCardProps {
    name: string;
    role: string;
    description: string;
    image?: string;
    githubUrl?: string;
    twitterUrl?: string;
    linkedinUrl?: string;
    email?: string;
}

export default function ProfileCard({
    name,
    role,
    description,
    image,
    githubUrl,
    twitterUrl,
    linkedinUrl,
    email
}: ProfileCardProps) {
    return (
        <div className={styles.card}>

            <div className={styles.profilePic}>
                {image ? (
                    <Image src={image} alt={name} fill style={{ objectFit: 'cover' }} />
                ) : (
                    <svg version="1.1" id="svg2" width="666.66669" height="666.66669" viewBox="0 0 666.66669 666.66669" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1.3333333,0,0,-1.3333333,0,666.66667)">
                            <g transform="scale(0.1)">
                                <path d="M 0,0 H 5000 V 5000 H 0 Z" style={{ fill: '#fff8f6', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}></path>
                                <path d="M 0,1126.2 H 4487.25 V 5000 H 0 Z" style={{ fill: '#fef0ef', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}></path>
                                <path d="M 5000,561.691 4487.25,1126.2 V 5000 H 5000 V 561.691" style={{ fill: '#fde4e1', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}></path>
                                <path d="M 4487.25,1146.2 5000,590.422 V 530.859 L 4487.25,1106.22 0,1106.2 v 40 h 4487.25" style={{ fill: '#fcd0ce', fillOpacity: 1, fillRule: 'nonzero', stroke: 'none' }}></path>
                            </g>
                        </g>
                    </svg>
                )}
            </div>
            <div className={styles.bottom}>
                <div className={styles.content}>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.role}>{role}</span>
                    <span className={styles.aboutMe}>{description}</span>
                </div>
                <div className={styles.bottomBottom}>
                    <div className={styles.socialLinksContainer}>
                        {linkedinUrl && (
                            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                                </svg>
                            </a>
                        )}
                        {twitterUrl && (
                            <a href={twitterUrl} target="_blank" rel="noopener noreferrer">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path>
                                </svg>
                            </a>
                        )}
                        {githubUrl && (
                            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                                    <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
                                </svg>
                            </a>
                        )}
                    </div>
                    <button className={styles.button} onClick={() => email && window.open(`mailto:${email}`, '_blank')}>Contact Me</button>
                </div>
            </div>
        </div>
    );
}
