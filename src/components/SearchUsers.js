import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './SearchUsers.css';

export default function SearchUsers({ onSelectUser }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const searchUsers = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
                setResults(response.data);
            } catch (err) {
                console.error('Search failed:', err);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (user) => {
        onSelectUser?.(user);
        setShowResults(false);
        setQuery('');
    };

    return (
        <div className="search-users" ref={searchRef}>
            <div className="search-input-wrapper">
                <span className="material-icons">search</span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowResults(true)}
                    placeholder="Kullanıcı ara..."
                    className="search-input"
                />
                {isLoading && <span className="material-icons spinning">refresh</span>}
            </div>
            
            {showResults && (query.trim() || results.length > 0) && (
                <div className="search-results">
                    {results.length > 0 ? (
                        results.map(user => (
                            <div 
                                key={user._id} 
                                className="search-result-item"
                                onClick={() => handleSelect(user)}
                            >
                                <img 
                                    src={user.profilePicture || '/logo192.png'} 
                                    alt={user.username}
                                    className="result-avatar" 
                                />
                                <div className="result-info">
                                    <div className="result-name">
                                        {user.username}
                                        {user.verified && (
                                            <span className="material-icons verified">verified</span>
                                        )}
                                    </div>
                                    {user.bio && (
                                        <div className="result-bio">{user.bio}</div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            {query.trim() ? 'Kullanıcı bulunamadı' : 'Aramaya başla...'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}