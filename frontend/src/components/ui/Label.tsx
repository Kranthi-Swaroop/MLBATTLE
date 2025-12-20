import React from 'react';
import styles from './Label.module.css';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
}

export function Label({ className = '', children, ...props }: LabelProps) {
    const classes = `${styles.label} ${className}`.trim();
    
    return (
        <label className={classes} {...props}>
            {children}
        </label>
    );
}
