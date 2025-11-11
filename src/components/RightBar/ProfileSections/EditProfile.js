import React from 'react';

export default function EditProfile({ user }) {
    return (
        <div className="edit-profile-section">
            <div className="edit-field">
                <label>Kullanıcı Adı</label>
                <div className="field-input">
                    <input type="text" defaultValue={user.username} />
                    <span className="material-icons">edit</span>
                </div>
            </div>
            <div className="edit-field">
                <label>Hakkımda</label>
                <div className="field-input">
                    <textarea defaultValue={user.bio} />
                    <span className="material-icons">edit</span>
                </div>
            </div>
            <div className="edit-field">
                <label>İlgi Alanları</label>
                <div className="interests-editor">
                    {user.interests.map((interest, index) => (
                        <span key={index} className="interest-tag">
                            {interest}
                            <span className="material-icons remove-icon">close</span>
                        </span>
                    ))}
                    <button className="add-interest-btn">
                        <span className="material-icons">add</span>
                        Ekle
                    </button>
                </div>
            </div>
            <button className="save-profile-btn">
                <span className="material-icons">save</span>
                Değişiklikleri Kaydet
            </button>
        </div>
    );
}