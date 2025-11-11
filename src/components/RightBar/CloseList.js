// src/components/RightBar/CloseList.js
import React, { useState, useEffect } from 'react';
import './styles/CloseList.css';

// Yakındakiler verisi simülasyonu
const fetchNearbyUsers = () => {
    const genders = ['Kadın', 'Erkek'];
    const ages = [22, 24, 25, 26, 27, 28, 29, 30, 31, 32];
    
    return Array.from({ length: 10 }, (_, index) => {
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const age = ages[Math.floor(Math.random() * ages.length)];
        const distance = (Math.random() * 5 + 0.5).toFixed(1);
        
        return {
            id: `nearby-${index}`,
            gender,
            age,
            distance: `${distance} km uzakta`,
            thumbnail: `https://i.pravatar.cc/200?img=${index + 30}`,
        };
    });
};

export default function CloseList({ onUserClick }) {
    const [nearbyUsers] = useState(fetchNearbyUsers());
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [animateItems, setAnimateItems] = useState(false);

    useEffect(() => {
        // Animate items on mount
        setTimeout(() => setAnimateItems(true), 100);
    }, []);

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setShowPremiumModal(true);
    };

    return (
        <>
            <div className="close-list-container">
                <div className="close-list-header">
                    <h2>Yakınımdakiler</h2>
                    <span className="close-count">{nearbyUsers.length} kişi</span>
                </div>
                <div className="premium-badge-header">
                    <span className="material-icons">workspace_premium</span>
                    <span>Premium Üyelere Özel</span>
                </div>
                <ul className={`close-list ${animateItems ? 'animate' : ''}`}>
                    {nearbyUsers.map((user, index) => (
                        <li 
                            key={user.id} 
                            className="close-list-item"
                            onClick={() => handleUserClick(user)}
                            style={{
                                animationDelay: `${index * 0.1}s`
                            }}
                        >
                            <div className="close-list-thumbnail">
                                <img 
                                    src={user.thumbnail} 
                                    alt={`${user.gender}, ${user.age}`}
                                    className="close-list-blurred-image"
                                    loading="lazy"
                                />
                                <div className="close-list-premium-overlay">
                                    <span className="material-icons">lock</span>
                                </div>
                            </div>
                            <div className="close-list-info">
                                <div className="close-list-gender-age">
                                    <span className="close-list-gender">{user.gender}</span>
                                    <span className="close-list-age">{user.age}</span>
                                </div>
                                <div className="close-list-distance">
                                    <span className="material-icons">location_on</span>
                                    <span>{user.distance}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {showPremiumModal && (
                <div 
                    className="close-list-premium-overlay"
                    onClick={() => setShowPremiumModal(false)}
                >
                    <div 
                        className="close-list-premium-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="close-list-premium-header">
                            <div className="close-list-premium-icon-wrapper">
                                <span className="material-icons">workspace_premium</span>
                            </div>
                            <h2>Premium Özellik</h2>
                            <button 
                                className="close-list-premium-close-btn"
                                onClick={() => setShowPremiumModal(false)}
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                        <div className="close-list-premium-content">
                            <div className="close-list-premium-feature-icon">
                                <span className="material-icons">location_on</span>
                            </div>
                            <h3>Yakınındakileri Keşfet</h3>
                            <p className="close-list-premium-description">
                                Premium üye olarak yakınındaki kişileri görüntüleyebilir ve etkileşime geçebilirsin.
                            </p>
                            <ul className="close-list-premium-features">
                                <li>
                                    <span className="material-icons">check_circle</span>
                                    <span>Profilleri detaylı görüntüle</span>
                                </li>
                                <li>
                                    <span className="material-icons">check_circle</span>
                                    <span>Haritada konumları gör</span>
                                </li>
                                <li>
                                    <span className="material-icons">check_circle</span>
                                    <span>Mesafe bazlı filtreleme yap</span>
                                </li>
                                <li>
                                    <span className="material-icons">check_circle</span>
                                    <span>Sınırsız mesajlaşma</span>
                                </li>
                            </ul>
                            <button 
                                className="close-list-premium-upgrade-btn"
                                onClick={() => {
                                    console.log('Premium upgrade clicked');
                                    setShowPremiumModal(false);
                                }}
                            >
                                <span className="material-icons">star</span>
                                <span>Premium'a Yükselt</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

