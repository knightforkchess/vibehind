import React from 'react';

export default function Privacy({ user }) {
    return (
        <div className="privacy-section">
            <div className="privacy-option">
                <div className="option-info">
                    <span className="material-icons">visibility</span>
                    <div className="option-text">
                        <h4>Profil Görünürlüğü</h4>
                        <p>Profilini kimler görebilir</p>
                    </div>
                </div>
                <select defaultValue={user.settings?.visibility || 'public'}>
                    <option value="public">Herkes</option>
                    <option value="friends">Sadece Takipçiler</option>
                    <option value="private">Gizli</option>
                </select>
            </div>
            
            <div className="privacy-option">
                <div className="option-info">
                    <span className="material-icons">location_on</span>
                    <div className="option-text">
                        <h4>Konum Paylaşımı</h4>
                        <p>Konumunu kimler görebilir</p>
                    </div>
                </div>
                <select>
                    <option value="public">Herkes</option>
                    <option value="friends">Sadece Takipçiler</option>
                    <option value="none">Kimse</option>
                </select>
            </div>

            <div className="privacy-option">
                <div className="option-info">
                    <span className="material-icons">photo_library</span>
                    <div className="option-text">
                        <h4>Fotoğraf Görünürlüğü</h4>
                        <p>Fotoğraflarını kimler görebilir</p>
                    </div>
                </div>
                <select>
                    <option value="public">Herkes</option>
                    <option value="friends">Sadece Takipçiler</option>
                    <option value="private">Gizli</option>
                </select>
            </div>
        </div>
    );
}