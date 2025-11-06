import React, { useState } from 'react';
import '../../styles/NewPost/NewPostNav.css';
import NewCamera from './NewCamera';
import NewPhotos from './NewPhotos';
import ProfilePhotos from './ProfilePhotos';

export default function NewPostNav({ isOpen, onClose }) {
    const [activeModal, setActiveModal] = useState(null);

    const handleOptionClick = (option) => {
        setActiveModal(option);
    };

    const handleCloseModal = () => {
        setActiveModal(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Navigation Menu */}
            <div className={`new-post-nav ${isOpen ? 'open' : ''}`}>
                <button 
                    className="nav-option camera"
                    onClick={() => handleOptionClick('camera')}
                >
                    <span className="material-icons">photo_camera</span>
                    <span className="option-text">Kamera</span>
                </button>

                <button 
                    className="nav-option gallery"
                    onClick={() => handleOptionClick('gallery')}
                >
                    <span className="material-icons">photo_library</span>
                    <span className="option-text">Kütüphane</span>
                </button>

                <button 
                    className="nav-option files"
                    onClick={() => handleOptionClick('files')}
                >
                    <span className="material-icons">folder</span>
                    <span className="option-text">Dosyalar</span>
                </button>
            </div>

            {/* Backdrop */}
            {isOpen && <div className="nav-backdrop" onClick={onClose} />}

            {/* Modals */}
            {activeModal === 'camera' && (
                <NewCamera onClose={handleCloseModal} />
            )}
            {activeModal === 'gallery' && (
                <NewPhotos onClose={handleCloseModal} />
            )}
            {activeModal === 'files' && (
                <ProfilePhotos onClose={handleCloseModal} />
            )}
        </>
    );
}
