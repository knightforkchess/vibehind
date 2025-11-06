// src/components/Feed/Content.js
import React, { useEffect, useState, useRef } from 'react';
import '../styles/Feed/Content.css';
import SendGift from './SendGift';

export default function Content({ post, onSwipe, onLike, onDislike, isActive }) {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [showVideoIntro, setShowVideoIntro] = useState(false);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [selectedGift, setSelectedGift] = useState(null);
    const cardRef = useRef(null);
    const startPos = useRef({ x: 0, y: 0 });

    // Reset media index when post changes
    useEffect(() => {
        setCurrentMediaIndex(0);
        setDragOffset({ x: 0, y: 0 });
        setSwipeDirection(null);
    }, [post.id]);


    const handlePrevMedia = () => {
        if (currentMediaIndex > 0) {
            setCurrentMediaIndex(currentMediaIndex - 1);
        }
    };

    const handleNextMedia = () => {
        if (currentMediaIndex < post.media.length - 1) {
            setCurrentMediaIndex(currentMediaIndex + 1);
        }
    };

    const handleDotClick = (index) => {
        setCurrentMediaIndex(index);
    };

    // Card swipe handlers
    const handleDragStart = (e) => {
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        startPos.current = { x: clientX, y: clientY };
        setIsDragging(true);
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - startPos.current.x;
        const deltaY = clientY - startPos.current.y;
        
        setDragOffset({ x: deltaX, y: deltaY });
        
        // Show swipe direction indicator
        if (Math.abs(deltaX) > 50) {
            setSwipeDirection(deltaX > 0 ? 'right' : 'left');
        } else if (deltaY < -50) {
            setSwipeDirection('up');
        } else {
            setSwipeDirection(null);
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        
        const threshold = 100;
        
        // Swipe right = Like
        if (dragOffset.x > threshold) {
            animateSwipeOut('right');
            setTimeout(() => onLike?.(), 300);
        }
        // Swipe left = Dislike
        else if (dragOffset.x < -threshold) {
            animateSwipeOut('left');
            setTimeout(() => onDislike?.(), 300);
        }
        // Swipe up = Next profile
        else if (dragOffset.y < -threshold) {
            animateSwipeOut('up');
            setTimeout(() => onSwipe?.('up'), 300);
        }
        // Return to center
        else {
            setDragOffset({ x: 0, y: 0 });
            setSwipeDirection(null);
        }
    };

    const animateSwipeOut = (direction) => {
        const multiplier = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
        setDragOffset({
            x: multiplier * window.innerWidth,
            y: direction === 'up' ? -window.innerHeight : 0
        });
    };

    const rotation = dragOffset.x / 20;
    const opacity = 1 - Math.abs(dragOffset.x) / 300;

    return (
        <div 
            ref={cardRef}
            className={`tinder-card ${isDragging ? 'dragging' : ''}`}
            style={{
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
                opacity: opacity,
                transition: isDragging ? 'none' : 'all 0.3s ease-out'
            }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
        >
            {/* Swipe Direction Indicators */}
            {swipeDirection === 'right' && (
                <div className="swipe-indicator like">
                    <span className="material-icons">favorite</span>
                    <span>BEĞENDİM</span>
                </div>
            )}
            {swipeDirection === 'left' && (
                <div className="swipe-indicator nope">
                    <span className="material-icons">close</span>
                    <span>HAYIR</span>
                </div>
            )}
            {swipeDirection === 'up' && (
                <div className="swipe-indicator next">
                    <span className="material-icons">arrow_upward</span>
                    <span>SONRAKİ</span>
                </div>
            )}

            {/* Media Gallery */}
            <div className="card-media">
                <div 
                    className="media-slider"
                    style={{ transform: `translateX(-${currentMediaIndex * 100}%)` }}
                >
                    {post.media.map((item, index) => (
                        <div key={item.id} className="media-slide">
                            {item.type === 'video' ? (
                                <video>
                                    <source src={item.url} type="video/mp4" />
                                </video>
                            ) : (
                                <img src={item.url} alt={`${post.username} ${index + 1}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Media Progress Bars */}
                {post.media.length > 1 && (
                    <div className="media-progress-bars">
                        {post.media.map((_, index) => (
                            <div 
                                key={index} 
                                className={`progress-bar ${index === currentMediaIndex ? 'active' : index < currentMediaIndex ? 'completed' : ''}`}
                            />
                        ))}
                    </div>
                )}

                {/* Media Navigation Zones */}
                {post.media.length > 1 && (
                    <>
                        <div className="nav-zone left" onClick={handlePrevMedia} />
                        <div className="nav-zone right" onClick={handleNextMedia} />
                    </>
                )}
            </div>

            {/* Profile Info Overlay */}
            <div className="card-info">
                <div className="profile-quick-info">
                    <h2>
                        {post.username}, {post.age}
                        {post.verified && <span className="material-icons verified">verified</span>}
                    </h2>
                    <p className="location">
                        <span className="material-icons">location_on</span>
                        {post.location} • {post.distance}
                    </p>
                    <p className="bio-preview">{post.bio}</p>
                </div>

                {/* Special Features */}
                <div className="special-actions">
                    <button 
                        className="special-btn video-intro"
                        onClick={() => setShowVideoIntro(true)}
                    >
                        <span className="material-icons">videocam</span>
                        <span>Video Tanıtım</span>
                    </button>
                    <button 
                        className="special-btn send-gift"
                        onClick={() => setShowGiftModal(true)}
                    >
                        <span className="material-icons">redeem</span>
                        <span>Hediye Gönder</span>
                    </button>
                </div>
            </div>

            {/* Video Intro Modal */}
        {showVideoIntro && (
            <div className="video-intro-modal" onClick={() => setShowVideoIntro(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-modal" onClick={() => setShowVideoIntro(false)}>
                        <span className="material-icons">close</span>
                    </button>
                    <h3>📹 {post.username} Kendini Tanıtıyor</h3>
                    <div className="video-placeholder">
                        <span className="material-icons">play_circle</span>
                        <p>15 saniyelik video tanıtım</p>
                    </div>
                </div>
            </div>
        )}

        {/* Gift Modal */}
        {showGiftModal && !selectedGift && (
            <div className="gift-modal" onClick={() => setShowGiftModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-modal" onClick={() => setShowGiftModal(false)}>
                        <span className="material-icons">close</span>
                    </button>
                    <h3>🎁 Hediye Gönder</h3>
                    <div className="gift-options">
                        <button className="gift-item" onClick={() => setSelectedGift({ name: 'Gül', icon: '🌹', price: 50 })}>🌹 Gül</button>
                        <button className="gift-item" onClick={() => setSelectedGift({ name: 'Çiçek Buketi', icon: '💐', price: 150 })}>💐 Çiçek Buketi</button>
                        <button className="gift-item" onClick={() => setSelectedGift({ name: 'Çikolata', icon: '🍫', price: 75 })}>🍫 Çikolata</button>
                        <button className="gift-item" onClick={() => setSelectedGift({ name: 'Kahve', icon: '☕', price: 60 })}>☕ Kahve</button>
                        <button className="gift-item" onClick={() => setSelectedGift({ name: 'Elmas', icon: '💎', price: 500 })}>💎 Elmas</button>
                        <button className="gift-item" onClick={() => setSelectedGift({ name: 'Taç', icon: '👑', price: 1000 })}>👑 Taç</button>
                    </div>
                </div>
            </div>
        )}

        {/* Send Gift Payment */}
        {selectedGift && (
            <SendGift 
                gift={selectedGift}
                recipient={post.username}
                onClose={() => {
                    setSelectedGift(null);
                    setShowGiftModal(false);
                }}
            />
        )}
    </div>
);
}