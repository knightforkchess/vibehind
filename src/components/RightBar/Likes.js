import React from 'react';
import './styles/Likes.css';

export default function Likes({ isOpen, onClose, likes }) {
    // Örnek beğenen kullanıcılar (gerçek uygulamada API'den gelecek)
    const likedUsers = [
        {
            id: 1,
            username: 'Ahmet Yılmaz',
            profilePhoto: 'https://i.pravatar.cc/50?img=12',
            age: 28,
            location: 'İstanbul',
            isMatched: true
        },
        {
            id: 2,
            username: 'Elif Kaya',
            profilePhoto: 'https://i.pravatar.cc/50?img=5',
            age: 25,
            location: 'Ankara',
            isMatched: false
        },
        {
            id: 3,
            username: 'Can Demir',
            profilePhoto: 'https://i.pravatar.cc/50?img=15',
            age: 30,
            location: 'İzmir',
            isMatched: true
        },
        {
            id: 4,
            username: 'Selin Öz',
            profilePhoto: 'https://i.pravatar.cc/50?img=9',
            age: 27,
            location: 'Bursa',
            isMatched: false
        },
    ];

    if (!isOpen) return null;

    return (
        <div className="likes-section">
            <div className="likes-header">
                <h2>Beğenenler</h2>
                <button className="close-button" onClick={onClose}>
                    <span className="material-icons">close</span>
                </button>
            </div>
            <div className="likes-list">
                {likedUsers.map(user => (
                    <div key={user.id} className="like-item">
                        <div className="like-user-info">
                            <div className="user-photo">
                                <img src={user.profilePhoto} alt={user.username} />
                            </div>
                            <div className="user-details">
                                <span className="username">{user.username}, {user.age}</span>
                                <span className="user-location">
                                    <span className="material-icons">location_on</span>
                                    {user.location}
                                </span>
                            </div>
                        </div>
                        <button className={`like-button ${user.isMatched ? 'matched' : ''}`}>
                            <span className="material-icons">
                                {user.isMatched ? 'favorite' : 'favorite_border'}
                            </span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}