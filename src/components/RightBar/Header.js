import React, { useState } from 'react';
import '../styles/RightBar/Header.css'
import Filters from './Filters';

export default function RightHeader({ onMicClick, searchInputRef }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    return (
        <div className={`right-header-container ${isSearchOpen ? 'search-mode' : ''}`}>
            {/* Normal Header */}
            <div className="right-header">
                <div className="logo-container">
                    <img src="/favv.png" alt="Vibehind Logo" className="header-logo" />
                </div>
                <div className="header-actions">
                    <button className="icon-button" onClick={toggleSearch}>
                        <span className="material-icons">search</span>
                    </button>
                    <button className="icon-button" onClick={() => setIsFiltersOpen(true)}>
                        <span className="material-icons">tune</span>
                    </button>
                </div>
            </div>

            {/* Search Header */}
            <div className="search-header">
                <button className="icon-button" onClick={toggleSearch}>
                    <span className="material-icons">close</span>
                </button>
                <button className="icon-button" onClick={onMicClick}>
                    <span className="material-icons">mic</span>
                </button>
                <div className="search-input-wrapper">
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        className="search-input"
                        placeholder="İsim, ilgi alanı ara..."
                    />
                </div>
                <button className="icon-button">
                    <span className="material-icons">search</span>
                </button>
            </div>

            {/* Filters Modal */}
            <Filters 
                isOpen={isFiltersOpen} 
                onClose={() => setIsFiltersOpen(false)} 
            />
        </div>   
    )
}