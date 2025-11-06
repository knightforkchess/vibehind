import React, { useState } from 'react';
import '../styles/NewPostButton.css';
import NewPostNav from './NewPost/NewPostNav';

export default function NewPostButton({ onClick }) {
    const [isNavOpen, setIsNavOpen] = useState(false);

    const handleButtonClick = () => {
        setIsNavOpen(!isNavOpen);
    };

    return (
        <>
            <button className="new-post-button" onClick={handleButtonClick}>
                <span className="material-icons">photo_camera</span>
            </button>
            
            <NewPostNav 
                isOpen={isNavOpen} 
                onClose={() => setIsNavOpen(false)} 
            />
        </>
    );
}
