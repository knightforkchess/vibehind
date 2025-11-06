import React from 'react';
import './styles/SavedBookmarks.css';

export default function SavedBookmarks({ isOpen, onClose }) {
    // Örnek koleksiyonlar (gerçek uygulamada API'den gelecek)
    const collections = [
        {
            id: 1,
            name: 'Gönderiler',
            thumbnailUrl: 'https://picsum.photos/100/100',
            count: 12
        }
    ];

    if (!isOpen) return null;

    return (
        <div className="saved-bookmarks-section">
            <div className="saved-bookmarks-header">
                <div className="header-content">
                    <span className="material-icons">bookmark</span>
                    <h2>Yer İşaretlerim</h2>
                    <button className="close-button" onClick={onClose}>
                        <span className="material-icons">close</span>
                    </button>
                </div>
            </div>
            <div className="collections-grid">
                {collections.map(collection => (
                    <div key={collection.id} className="collection-item">
                        <div className="collection-thumbnail">
                            <img src={collection.thumbnailUrl} alt={collection.name} />
                        </div>
                        <div className="collection-info">
                            <span className="collection-name">{collection.name}</span>
                            <span className="collection-count">{collection.count} gönderi</span>
                        </div>
                    </div>
                ))}
                <button className="add-collection-button">
                    <span className="material-icons">add</span>
                    <span className="button-text">Yeni Koleksiyon</span>
                </button>
            </div>
        </div>
    );
}