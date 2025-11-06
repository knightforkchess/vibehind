import React, { useState, useRef } from 'react';
import '../../styles/NewPost/ProfilePhotos.css';

export default function ProfilePhotos({ onClose }) {
    const [photos, setPhotos] = useState([
        { id: 1, url: 'https://picsum.photos/400/500?random=1', isPrimary: true },
        { id: 2, url: 'https://picsum.photos/400/500?random=2', isPrimary: false },
        { id: 3, url: 'https://picsum.photos/400/500?random=3', isPrimary: false },
        { id: 4, url: 'https://picsum.photos/400/500?random=4', isPrimary: false },
    ]);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const fileInputRef = useRef(null);

    const handleAddPhoto = (e) => {
        const files = Array.from(e.target.files);
        const newPhotos = files.map((file, index) => ({
            id: Date.now() + index,
            url: URL.createObjectURL(file),
            isPrimary: false
        }));
        setPhotos([...photos, ...newPhotos]);
    };

    const handleRemovePhoto = (id) => {
        setPhotos(photos.filter(photo => photo.id !== id));
    };

    const handleSetPrimary = (id) => {
        setPhotos(photos.map(photo => ({
            ...photo,
            isPrimary: photo.id === id
        })));
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newPhotos = [...photos];
        const draggedPhoto = newPhotos[draggedIndex];
        newPhotos.splice(draggedIndex, 1);
        newPhotos.splice(index, 0, draggedPhoto);
        
        setPhotos(newPhotos);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleSave = () => {
        console.log('Profil fotoğrafları kaydedildi:', photos);
        // Backend'e gönder
        onClose();
    };

    return (
        <div className="profile-photos-overlay" onClick={onClose}>
            <div className="profile-photos-modal" onClick={(e) => e.stopPropagation()}>
                <div className="profile-photos-header">
                    <h2>📁 Profil Fotoğrafları</h2>
                    <button className="close-btn" onClick={onClose}>
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="profile-photos-content">
                    <div className="info-banner">
                        <span className="material-icons">info</span>
                        <div>
                            <strong>İpucu:</strong> Fotoğrafları sürükleyerek sıralayabilirsin. 
                            İlk fotoğraf profil fotoğrafın olacak.
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAddPhoto}
                        style={{ display: 'none' }}
                    />

                    <div className="photos-grid">
                        {photos.map((photo, index) => (
                            <div
                                key={photo.id}
                                className={`photo-card ${photo.isPrimary ? 'primary' : ''} ${draggedIndex === index ? 'dragging' : ''}`}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                            >
                                <img src={photo.url} alt={`Profile ${index + 1}`} />
                                
                                {photo.isPrimary && (
                                    <div className="primary-badge">
                                        <span className="material-icons">star</span>
                                        Ana Fotoğraf
                                    </div>
                                )}

                                <div className="photo-overlay">
                                    <div className="photo-number">{index + 1}</div>
                                    <div className="photo-actions">
                                        {!photo.isPrimary && (
                                            <button 
                                                className="action-btn primary-btn"
                                                onClick={() => handleSetPrimary(photo.id)}
                                                title="Ana fotoğraf yap"
                                            >
                                                <span className="material-icons">star</span>
                                            </button>
                                        )}
                                        <button 
                                            className="action-btn delete-btn"
                                            onClick={() => handleRemovePhoto(photo.id)}
                                            title="Sil"
                                        >
                                            <span className="material-icons">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="drag-handle">
                                    <span className="material-icons">drag_indicator</span>
                                </div>
                            </div>
                        ))}

                        {photos.length < 9 && (
                            <div 
                                className="add-photo-card"
                                onClick={() => fileInputRef.current.click()}
                            >
                                <span className="material-icons">add_a_photo</span>
                                <span>Fotoğraf Ekle</span>
                                <span className="photo-limit">{photos.length}/9</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-photos-footer">
                    <div className="footer-info">
                        <span className="material-icons">photo_library</span>
                        <span>{photos.length} fotoğraf</span>
                    </div>
                    <div className="footer-actions">
                        <button className="cancel-btn" onClick={onClose}>
                            <span className="material-icons">close</span>
                            İptal
                        </button>
                        <button className="save-btn" onClick={handleSave}>
                            <span className="material-icons">check</span>
                            Kaydet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
