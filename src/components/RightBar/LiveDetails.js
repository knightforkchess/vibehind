// src/components/RightBar/LiveDetails.js
import React, { useState } from 'react';
import SendGift from '../Feed/SendGift';
import './styles/LiveDetails.css';

const gifts = [
    { name: 'Gül', icon: '🌹', price: 50 },
    { name: 'Çiçek Buketi', icon: '💐', price: 150 },
    { name: 'Çikolata', icon: '🍫', price: 75 },
    { name: 'Kahve', icon: '☕', price: 60 },
    { name: 'Elmas', icon: '💎', price: 500 },
    { name: 'Taç', icon: '👑', price: 1000 },
    { name: 'Yüzük', icon: '💍', price: 300 },
    { name: 'Kalp', icon: '💖', price: 200 }
];

export default function LiveDetails({ live, onClose }) {
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [selectedGift, setSelectedGift] = useState(null);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    if (!live) return null;

    const handleGiftClick = () => {
        setShowGiftModal(true);
    };

    const handleGiftSelect = (gift) => {
        setSelectedGift(gift);
        setShowGiftModal(false);
    };

    const handleCloseSendGift = () => {
        setSelectedGift(null);
    };

    const handlePrivateLiveClick = () => {
        setShowPremiumModal(true);
    };

    return (
        <>
            <div className="live-details-container">
                <div className="live-details-header">
                    <div className="live-details-user">
                        <img 
                            src={live.thumbnail && live.thumbnail.trim() !== '' ? live.thumbnail : '/logo192.png'} 
                            alt={live.fullName || 'User'}
                            className="live-details-avatar"
                        />
                        <div className="live-details-user-info">
                            <h2 className="live-details-name">
                                {live.fullName}
                                {live.isPrivate && (
                                    <span className="material-icons private-icon">lock</span>
                                )}
                            </h2>
                            <p className="live-details-city">
                                <span className="material-icons">location_on</span>
                                {live.city}
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button 
                            className="live-details-close-btn"
                            onClick={onClose}
                            aria-label="Kapat"
                        >
                            <span className="material-icons">close</span>
                        </button>
                    )}
                </div>

                <div className="live-details-stats">
                    <div className="live-stat">
                        <span className="material-icons">visibility</span>
                        <div className="stat-info">
                            <span className="stat-value">{live.viewers.toLocaleString()}</span>
                            <span className="stat-label">İzleyici</span>
                        </div>
                    </div>
                    <div className="live-stat">
                        <span className="material-icons">favorite</span>
                        <div className="stat-info">
                            <span className="stat-value">{Math.floor(live.viewers * 0.1)}</span>
                            <span className="stat-label">Beğeni</span>
                        </div>
                    </div>
                    <div className="live-stat">
                        <span className="material-icons">chat_bubble</span>
                        <div className="stat-info">
                            <span className="stat-value">{Math.floor(live.viewers * 0.05)}</span>
                            <span className="stat-label">Yorum</span>
                        </div>
                    </div>
                </div>

                <div className="live-details-content">
                    <h3 className="live-details-title">{live.title}</h3>
                    {live.tags && live.tags.length > 0 && (
                        <div className="live-details-tags">
                            {live.tags.map((tag, index) => (
                                <span key={index} className="live-tag">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="live-details-actions">
                    <button 
                        className="live-action-btn gift-action-btn"
                        onClick={handleGiftClick}
                    >
                        <span className="material-icons">card_giftcard</span>
                        <span>Hediye Gönder</span>
                    </button>
                    <button 
                        className="live-action-btn private-live-btn"
                        onClick={handlePrivateLiveClick}
                    >
                        <span className="material-icons">videocam</span>
                        <span>Özel Canlı Yayın</span>
                    </button>
                </div>
            </div>

            {/* Gift Selection Modal */}
            {showGiftModal && !selectedGift && (
                <div className="gift-selection-modal-overlay" onClick={() => setShowGiftModal(false)}>
                    <div className="gift-selection-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="gift-selection-header">
                            <h2>Hediye Gönder</h2>
                            <button 
                                className="close-btn"
                                onClick={() => setShowGiftModal(false)}
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="gift-selection-grid">
                            {gifts.map((gift, index) => (
                                <button 
                                    key={index}
                                    className="gift-selection-item"
                                    onClick={() => handleGiftSelect(gift)}
                                >
                                    <span className="gift-selection-emoji">{gift.icon}</span>
                                    <span className="gift-selection-name">{gift.name}</span>
                                    <span className="gift-selection-price">{gift.price} ₺</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Send Gift Payment */}
            {selectedGift && (
                <SendGift 
                    gift={selectedGift}
                    recipient={live.fullName}
                    onClose={handleCloseSendGift}
                />
            )}

            {/* Premium Modal */}
            {showPremiumModal && (
                <div className="premium-modal-overlay" onClick={() => setShowPremiumModal(false)}>
                    <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="premium-modal-header">
                            <div className="premium-icon-wrapper">
                                <span className="material-icons">workspace_premium</span>
                            </div>
                            <h2>Premium Özellik</h2>
                            <button 
                                className="premium-close-btn"
                                onClick={() => setShowPremiumModal(false)}
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="premium-modal-content">
                            <div className="premium-feature-icon">
                                <span className="material-icons">videocam</span>
                            </div>
                            <h3>Özel Canlı Yayın</h3>
                            <p className="premium-description">
                                Özel canlı yayın özelliği premium üyelere özeldir. Bu özellik ile:
                            </p>
                            <ul className="premium-features">
                                <li>
                                    <span className="material-icons">check_circle</span>
                                    <span>Özel canlı yayın başlatabilirsiniz</span>
                                </li>
                                <li>
                                    <span className="material-icons">check_circle</span>
                                    <span>Sadece seçtiğiniz kişilerle özel yayın yapabilirsiniz</span>
                                </li>
                                <li>
                                    <span className="material-icons">check_circle</span>
                                    <span>Gelişmiş gizlilik ayarları</span>
                                </li>
                                <li>
                                    <span className="material-icons">check_circle</span>
                                    <span>Özel yayın geçmişi</span>
                                </li>
                            </ul>
                            <button 
                                className="premium-upgrade-btn"
                                onClick={() => {
                                    console.log('Premium upgrade clicked');
                                    setShowPremiumModal(false);
                                }}
                            >
                                <span className="material-icons">star</span>
                                <span>Premium'a Geç</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

