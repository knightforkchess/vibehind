// src/components/Feed/Content.js
import React, { useEffect, useState, useRef } from 'react';
import '../../styles/Feed/Content.css';
import api from '../../services/api';
import socketService from '../../services/socket';

export default function Content({ onProfileChange }) {
    const [profiles, setProfiles] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const cardRef = useRef(null);
    const startPosRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        fetchProfiles();

        // Listen for online/offline status changes
        let unsubscribe = () => {};
        
        try {
            unsubscribe = socketService.onOnlineStatusChange((userId, isOnline) => {
                setProfiles(prevProfiles => 
                    prevProfiles.map(profile => 
                        profile._id === userId 
                            ? { ...profile, online: isOnline }
                            : profile
                    )
                );
            });
        } catch (error) {
            console.error('Failed to subscribe to online status:', error);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const fetchProfiles = async () => {
        try {
            const response = await api.get('/users/feed/profiles');
            const profilesWithDefaults = response.data.map(profile => ({
                ...profile,
                username: profile.username || 'Kullanıcı',
                profilePicture: profile.profilePicture || '/logo192.png',
                bio: profile.bio || 'Bu kullanıcı henüz bir biyografi eklemedi.',
                interests: profile.interests || [],
                age: profile.age || null,
                location: profile.location?.coordinates ? 
                    `${profile.location.coordinates[1].toFixed(2)}, ${profile.location.coordinates[0].toFixed(2)}` : 
                    'Konum belirtilmemiş',
                distance: profile.distance || null,
                verified: profile.verified || false,
                online: profile.isOnline || false,
                likes: profile.likesCount || 0,
                comments: 0
            }));
            setProfiles(profilesWithDefaults);
            setCurrentIndex(0);
            // İlk profili parent'a bildir
            if (profilesWithDefaults.length > 0 && onProfileChange) {
                onProfileChange(profilesWithDefaults[0]);
            }
        } catch (error) {
            console.error('Failed to fetch profiles:', error);
        }
    };

    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        startPosRef.current = { x: touch.clientX, y: touch.clientY };
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - startPosRef.current.x;
        const deltaY = touch.clientY - startPosRef.current.y;

        if (cardRef.current) {
            cardRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${deltaX * 0.1}deg)`;
        }

        if (Math.abs(deltaX) > 50) {
            setSwipeDirection(deltaX > 0 ? 'like' : 'nope');
        } else {
            setSwipeDirection(null);
        }
    };

    const handleTouchEnd = (e) => {
        setIsDragging(false);
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - startPosRef.current.x;

        if (Math.abs(deltaX) > 100) {
            // Swipe completed
            if (deltaX > 0) {
                handleLike();
            } else {
                handleNope();
            }
        } else {
            // Reset position
            if (cardRef.current) {
                cardRef.current.style.transform = '';
            }
        }
        setSwipeDirection(null);
    };

    const handleMouseDown = (e) => {
        startPosRef.current = { x: e.clientX, y: e.clientY };
        setIsDragging(true);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startPosRef.current.x;
        const deltaY = e.clientY - startPosRef.current.y;

        if (cardRef.current) {
            cardRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${deltaX * 0.1}deg)`;
        }

        if (Math.abs(deltaX) > 50) {
            setSwipeDirection(deltaX > 0 ? 'like' : 'nope');
        } else {
            setSwipeDirection(null);
        }
    };

    const handleMouseUp = (e) => {
        setIsDragging(false);
        const deltaX = e.clientX - startPosRef.current.x;

        if (Math.abs(deltaX) > 100) {
            if (deltaX > 0) {
                handleLike();
            } else {
                handleNope();
            }
        } else {
            if (cardRef.current) {
                cardRef.current.style.transform = '';
            }
        }
        setSwipeDirection(null);
    };

    const handleLike = async () => {
        const currentProfile = profiles[currentIndex];
        console.log('Liked:', currentProfile);
        
        try {
            const response = await api.post('/matches/swipe', {
                targetUserId: currentProfile._id,
                type: 'like'
            });
            
            if (response.data.matched) {
                // Eşleşme oldu! Bildirim göster
                console.log('🎉 Eşleşme oldu!', response.data.match);
                // TODO: Eşleşme bildirimi göster
            }
        } catch (error) {
            console.error('Like error:', error);
        }
        
        nextProfile();
    };

    const handleNope = async () => {
        const currentProfile = profiles[currentIndex];
        console.log('Noped:', currentProfile);
        
        try {
            await api.post('/matches/swipe', {
                targetUserId: currentProfile._id,
                type: 'nope'
            });
        } catch (error) {
            console.error('Nope error:', error);
        }
        
        nextProfile();
    };

    const nextProfile = () => {
        if (currentIndex < profiles.length - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            if (cardRef.current) {
                cardRef.current.style.transform = '';
            }
            // Yeni profili parent'a bildir
            if (onProfileChange && profiles[newIndex]) {
                onProfileChange(profiles[newIndex]);
            }
        } else {
            // Reload profiles when we reach the end
            fetchProfiles();
        }
    };

    if (profiles.length === 0) {
        return (
            <div className="tinder-container">
                <p className="loading-text">Profiller yükleniyor...</p>
            </div>
        );
    }

    const currentProfile = profiles[currentIndex];

    return (
        <div className="tinder-container">
            <div
                ref={cardRef}
                className={`tinder-card ${isDragging ? 'dragging' : ''}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => {
                    if (isDragging) {
                        setIsDragging(false);
                        if (cardRef.current) {
                            cardRef.current.style.transform = '';
                        }
                        setSwipeDirection(null);
                    }
                }}
            >
                {swipeDirection && (
                    <div className={`swipe-indicator ${swipeDirection}`}>
                        {swipeDirection === 'like' && (
                            <>
                                <span className="material-icons">favorite</span>
                                <span>LIKE</span>
                            </>
                        )}
                        {swipeDirection === 'nope' && (
                            <>
                                <span className="material-icons">close</span>
                                <span>NOPE</span>
                            </>
                        )}
                    </div>
                )}

                <div className="card-image">
                    {currentProfile.online && (
                        <div className="online-badge">
                            Çevrimiçi
                        </div>
                    )}
                    <img
                        src={currentProfile.profilePicture || '/logo192.png'}
                        alt={currentProfile.username}
                        onError={(e) => { e.target.src = '/logo192.png'; }}
                    />
                </div>

                <div className="card-info">
                    <div className="profile-header">
                        <h2>{currentProfile.username}</h2>
                        {currentProfile.location?.coordinates && currentProfile.location.coordinates[0] !== 0 && (
                            <p className="location">
                                <span className="material-icons">location_on</span>
                                {currentProfile.location.coordinates[1].toFixed(2)}, {currentProfile.location.coordinates[0].toFixed(2)}
                            </p>
                        )}
                    </div>
                    <p className="bio">{currentProfile.bio || 'Bu kullanıcı henüz bir biyografi eklemedi.'}</p>
                    {currentProfile.interests && currentProfile.interests.length > 0 && (
                        <div className="interests">
                            {currentProfile.interests.map((interest, index) => (
                                <span key={index} className="interest-tag">{interest}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="action-buttons">
                <button className="action-btn nope" onClick={handleNope}>
                    <span className="material-icons">close</span>
                </button>
                <button className="action-btn like" onClick={handleLike}>
                    <span className="material-icons">favorite</span>
                </button>
            </div>

            <div className="profile-counter">
                {currentIndex + 1} / {profiles.length}
            </div>
        </div>
    );
}