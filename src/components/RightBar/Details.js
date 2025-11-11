import React, { useState, useEffect } from 'react';
import './styles/Details.css';
import Comments from './Comments';
import Likes from './Likes';
import SavedBookmarks from './SavedBookmarks';
import Toast from '../Toast';
import socketService from '../../services/socket';

export default function Details({ activePost }) {
    const [isLiked, setIsLiked] = useState(false);
    const [showFullBio, setShowFullBio] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showLikes, setShowLikes] = useState(false);
    const [showBookmarks, setShowBookmarks] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [userOnlineStatus, setUserOnlineStatus] = useState(activePost?.online || false);

    useEffect(() => {
        if (activePost) {
            setUserOnlineStatus(activePost.online || false);
        }
    }, [activePost]);

    useEffect(() => {
        // Listen for online/offline status changes
        let unsubscribe = () => {};
        
        try {
            unsubscribe = socketService.onOnlineStatusChange((userId, isOnline) => {
                if (activePost && activePost._id === userId) {
                    setUserOnlineStatus(isOnline);
                }
            });
        } catch (error) {
            console.error('Failed to subscribe to online status:', error);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [activePost]);

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleSuperLike = () => {
        console.log('Super like!');
    };

    const handlePass = () => {
        console.log('Pass');
    };

    if (!activePost) return null;

    return (
        <div className='dating-profile-container'>
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-name-section">
                    <h1 className="profile-name">
                        {activePost.username}
                        {activePost.verified && (
                            <span className="verified-badge">
                                <span className="material-icons">verified</span>
                            </span>
                        )}
                    </h1>
                    <div className="profile-meta">
                        {activePost.age && <span className="profile-age">{activePost.age}</span>}
                        {userOnlineStatus && (
                            <span className="online-indicator">
                                <span className="online-dot"></span>
                                Çevrimiçi
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Location & Distance */}
            {activePost.location && (
                <div className="profile-location">
                    <span className="material-icons">location_on</span>
                    <span>{activePost.location}</span>
                    {activePost.distance && <span className="distance">{activePost.distance}</span>}
                </div>
            )}

            {/* Bio Section */}
            <div className="profile-bio">
                <h2 className="section-title">Hakkında</h2>
                <p className={`bio-text ${showFullBio ? 'expanded' : ''}`}>
                    {activePost.bio}
                </p>
                {activePost.bio && activePost.bio.length > 80 && (
                    <button className="show-more-btn" onClick={() => setShowFullBio(!showFullBio)}>
                        {showFullBio ? 'Daha az göster' : 'Devamını oku'}
                    </button>
                )}
            </div>

            {/* Interests Section */}
            <div className="profile-interests">
                <h2 className="section-title">İlgi Alanları</h2>
                <div className="interests-grid">
                    {activePost.interests && activePost.interests.map((interest, index) => (
                        <span key={index} className="interest-tag">
                            {interest}
                        </span>
                    ))}
                </div>
            </div>

            {/* Social Stats Section */}
            <div className="social-stats">
                <button className="stat-btn" onClick={() => setShowLikes(true)}>
                    <span className="material-icons">favorite</span>
                    <div className="stat-info">
                        <span className="stat-value">{activePost.likes || 0}</span>
                        <span className="stat-label">Beğeni</span>
                    </div>
                </button>
                <button className="stat-btn" onClick={() => setShowComments(true)}>
                    <span className="material-icons">chat_bubble</span>
                    <div className="stat-info">
                        <span className="stat-value">{activePost.comments || 0}</span>
                        <span className="stat-label">Yorum</span>
                    </div>
                </button>
                <button 
                    className={`stat-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={() => {
                        if (!isBookmarked) {
                            setIsBookmarked(true);
                            setShowToast(true);
                        } else {
                            setIsBookmarked(false);
                        }
                    }}
                >
                    <span className="material-icons">
                        {isBookmarked ? 'bookmark' : 'bookmark_border'}
                    </span>
                    <div className="stat-info">
                        <span className="stat-label">Kaydet</span>
                    </div>
                </button>
            </div>

            {/* Action Buttons */}
            <div className="dating-actions">
                <button className="action-btn pass-btn" onClick={handlePass}>
                    <span className="material-icons">close</span>
                </button>
                <button className="action-btn super-like-btn" onClick={handleSuperLike}>
                    <span className="material-icons">star</span>
                </button>
                <button 
                    className={`action-btn like-btn ${isLiked ? 'liked' : ''}`} 
                    onClick={handleLike}
                >
                    <span className="material-icons">{isLiked ? 'favorite' : 'favorite_border'}</span>
                </button>
            </div>

            {/* Modals */}
            <Comments 
                isOpen={showComments} 
                onClose={() => setShowComments(false)}
                post={activePost}
            />
            <Likes 
                isOpen={showLikes} 
                onClose={() => setShowLikes(false)}
                likes={activePost.likes}
            />
            <SavedBookmarks 
                isOpen={showBookmarks} 
                onClose={() => setShowBookmarks(false)}
            />

            {/* Toast Notification */}
            {showToast && (
                <Toast 
                    message="Yer işaretlerine eklendi!"
                    link={() => setShowBookmarks(true)}
                    linkText="Diğer işaretleri gör"
                    onClose={() => setShowToast(false)}
                    duration={3000}
                />
            )}
        </div>
    );
}