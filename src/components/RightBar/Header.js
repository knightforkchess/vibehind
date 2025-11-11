import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import '../styles/RightBar/Header.css'
import Filters from './Filters';

export default function RightHeader({ onMicClick, searchInputRef }) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef(null);
    const suggestionsRef = useRef(null);

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (!isSearchOpen) {
            setSearchQuery('');
            setSearchResults([]);
            setShowSuggestions(false);
        }
    };

    // Search users with debounce
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setShowSuggestions(false);
            return;
        }

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                setIsSearching(true);
                const response = await api.get(`/search/users?query=${encodeURIComponent(searchQuery)}`);
                setSearchResults(response.data.users);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms debounce

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleUserSelect = (user) => {
        console.log('Selected user:', user);
        setShowSuggestions(false);
        setSearchQuery('');
        // TODO: Navigate to user profile or open chat
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
                <div className="search-input-wrapper" ref={suggestionsRef}>
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        className="search-input"
                        placeholder="Kullanıcı ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                    />
                    
                    {/* Search Suggestions */}
                    {showSuggestions && (
                        <div className="search-suggestions">
                            {isSearching ? (
                                <div className="search-suggestion-item loading">
                                    <span>Aranıyor...</span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((user) => (
                                    <button
                                        key={user._id}
                                        className="search-suggestion-item"
                                        onClick={() => handleUserSelect(user)}
                                    >
                                        <img 
                                            src={user.profilePicture && user.profilePicture.trim() !== '' ? user.profilePicture : '/logo192.png'} 
                                            alt={user.username}
                                            className="suggestion-avatar"
                                        />
                                        <div className="suggestion-info">
                                            <span className="suggestion-username">{user.username}</span>
                                            {(user.firstName || user.lastName) && (
                                                <span className="suggestion-fullname">
                                                    {user.firstName} {user.lastName}
                                                </span>
                                            )}
                                        </div>
                                        {user.isOnline && (
                                            <span className="online-indicator"></span>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="search-suggestion-item no-results">
                                    <span className="material-icons">search_off</span>
                                    <span>Sonuç bulunamadı</span>
                                </div>
                            )}
                        </div>
                    )}
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