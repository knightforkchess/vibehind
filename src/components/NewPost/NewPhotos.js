import React, { useState, useRef } from 'react';
import '../../styles/NewPost/NewPhotos.css';

export default function NewPhotos({ onClose }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);

        // Create preview URLs
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
    };

    const handleBrowseClick = () => {
        fileInputRef.current.click();
    };

    const handleRemoveFile = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newUrls = previewUrls.filter((_, i) => i !== index);
        
        // Revoke the URL to free memory
        URL.revokeObjectURL(previewUrls[index]);
        
        setSelectedFiles(newFiles);
        setPreviewUrls(newUrls);
    };

    const handleUpload = () => {
        console.log('Uploading files:', selectedFiles);
        // Burada dosyaları backend'e yükleyebilirsiniz
        onClose();
    };

    return (
        <div className="photos-modal-overlay" onClick={onClose}>
            <div className="photos-modal" onClick={(e) => e.stopPropagation()}>
                <div className="photos-header">
                    <h2>📚 Kütüphane</h2>
                    <button className="close-btn" onClick={onClose}>
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="photos-content">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    {previewUrls.length === 0 ? (
                        <div className="upload-placeholder">
                            <span className="material-icons library-icon">photo_library</span>
                            <h3>Fotoğraf veya Video Seç</h3>
                            <p>Galerinden birden fazla dosya seçebilirsin</p>
                            <button className="browse-btn" onClick={handleBrowseClick}>
                                <span className="material-icons">add_photo_alternate</span>
                                Dosya Seç
                            </button>
                        </div>
                    ) : (
                        <div className="preview-grid">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="preview-item">
                                    {selectedFiles[index].type.startsWith('video/') ? (
                                        <video src={url} controls />
                                    ) : (
                                        <img src={url} alt={`Preview ${index + 1}`} />
                                    )}
                                    <button 
                                        className="remove-btn"
                                        onClick={() => handleRemoveFile(index)}
                                    >
                                        <span className="material-icons">close</span>
                                    </button>
                                </div>
                            ))}
                            <div className="add-more-item" onClick={handleBrowseClick}>
                                <span className="material-icons">add</span>
                                <span>Daha Fazla Ekle</span>
                            </div>
                        </div>
                    )}
                </div>

                {previewUrls.length > 0 && (
                    <div className="photos-footer">
                        <button className="cancel-btn" onClick={onClose}>
                            <span className="material-icons">close</span>
                            İptal
                        </button>
                        <button className="upload-btn" onClick={handleUpload}>
                            <span className="material-icons">cloud_upload</span>
                            Yükle ({previewUrls.length})
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
