
import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="w-full text-center p-4 mt-auto text-sm text-slate-500 dark:text-slate-400">
            <p>Pàgina creada per Lucas © {currentYear}</p>
        </footer>
    );
};

export default Footer;
