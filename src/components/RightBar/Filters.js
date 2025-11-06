import React, { useState } from 'react';
import '../styles/RightBar/Filters.css';

export default function Filters({ isOpen, onClose }) {
    const [ageRange, setAgeRange] = useState([18, 35]);
    const [distance, setDistance] = useState(50);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [gender, setGender] = useState('all');
    const [showOnline, setShowOnline] = useState(false);
    const [showVerified, setShowVerified] = useState(false);

    const interests = [
        { id: 1, name: 'Müzik', icon: '🎵' },
        { id: 2, name: 'Spor', icon: '⚽' },
        { id: 3, name: 'Seyahat', icon: '✈️' },
        { id: 4, name: 'Yemek', icon: '🍕' },
        { id: 5, name: 'Sanat', icon: '🎨' },
        { id: 6, name: 'Kitap', icon: '📚' },
        { id: 7, name: 'Film', icon: '🎬' },
        { id: 8, name: 'Fotoğraf', icon: '📷' },
        { id: 9, name: 'Dans', icon: '💃' },
        { id: 10, name: 'Yoga', icon: '🧘' },
        { id: 11, name: 'Teknoloji', icon: '💻' },
        { id: 12, name: 'Moda', icon: '👗' }
    ];

    const toggleInterest = (interestId) => {
        if (selectedInterests.includes(interestId)) {
            setSelectedInterests(selectedInterests.filter(id => id !== interestId));
        } else {
            setSelectedInterests([...selectedInterests, interestId]);
        }
    };

    const handleApply = () => {
        const filters = {
            ageRange,
            distance,
            interests: selectedInterests,
            gender,
            showOnline,
            showVerified
        };
        console.log('Applied filters:', filters);
        onClose();
    };

    const handleReset = () => {
        setAgeRange([18, 35]);
        setDistance(50);
        setSelectedInterests([]);
        setGender('all');
        setShowOnline(false);
        setShowVerified(false);
    };

    if (!isOpen) return null;

    return (
        <div className="filters-overlay" onClick={onClose}>
            <div className="filters-modal" onClick={(e) => e.stopPropagation()}>
                <div className="filters-header">
                    <h2>Filtreler</h2>
                    <button className="close-btn" onClick={onClose}>
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="filters-content">
                    {/* Age Range */}
                    <div className="filter-section">
                        <div className="filter-label">
                            <span className="material-icons">cake</span>
                            <h3>Yaş Aralığı</h3>
                        </div>
                        <div className="age-display">
                            {ageRange[0]} - {ageRange[1]} yaş
                        </div>
                        <div className="range-inputs">
                            <input
                                type="range"
                                min="18"
                                max="80"
                                value={ageRange[0]}
                                onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                                className="range-slider"
                            />
                            <input
                                type="range"
                                min="18"
                                max="80"
                                value={ageRange[1]}
                                onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                                className="range-slider"
                            />
                        </div>
                    </div>

                    {/* Distance */}
                    <div className="filter-section">
                        <div className="filter-label">
                            <span className="material-icons">location_on</span>
                            <h3>Maksimum Mesafe</h3>
                        </div>
                        <div className="distance-display">
                            {distance} km
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={distance}
                            onChange={(e) => setDistance(parseInt(e.target.value))}
                            className="range-slider"
                        />
                    </div>

                    {/* Gender */}
                    <div className="filter-section">
                        <div className="filter-label">
                            <span className="material-icons">people</span>
                            <h3>Cinsiyet</h3>
                        </div>
                        <div className="gender-options">
                            <button
                                className={`gender-btn ${gender === 'all' ? 'active' : ''}`}
                                onClick={() => setGender('all')}
                            >
                                Hepsi
                            </button>
                            <button
                                className={`gender-btn ${gender === 'female' ? 'active' : ''}`}
                                onClick={() => setGender('female')}
                            >
                                Kadın
                            </button>
                            <button
                                className={`gender-btn ${gender === 'male' ? 'active' : ''}`}
                                onClick={() => setGender('male')}
                            >
                                Erkek
                            </button>
                        </div>
                    </div>

                    {/* Interests */}
                    <div className="filter-section">
                        <div className="filter-label">
                            <span className="material-icons">favorite</span>
                            <h3>İlgi Alanları</h3>
                        </div>
                        <div className="interests-grid">
                            {interests.map((interest) => (
                                <button
                                    key={interest.id}
                                    className={`interest-chip ${selectedInterests.includes(interest.id) ? 'selected' : ''}`}
                                    onClick={() => toggleInterest(interest.id)}
                                >
                                    <span className="interest-icon">{interest.icon}</span>
                                    <span>{interest.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Additional Filters */}
                    <div className="filter-section">
                        <div className="filter-label">
                            <span className="material-icons">tune</span>
                            <h3>Ek Filtreler</h3>
                        </div>
                        <div className="toggle-options">
                            <label className="toggle-option">
                                <input
                                    type="checkbox"
                                    checked={showOnline}
                                    onChange={(e) => setShowOnline(e.target.checked)}
                                />
                                <span className="toggle-text">
                                    <span className="material-icons">circle</span>
                                    Sadece Çevrimiçi
                                </span>
                            </label>
                            <label className="toggle-option">
                                <input
                                    type="checkbox"
                                    checked={showVerified}
                                    onChange={(e) => setShowVerified(e.target.checked)}
                                />
                                <span className="toggle-text">
                                    <span className="material-icons">verified</span>
                                    Sadece Onaylı Profiller
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="filters-footer">
                    <button className="reset-btn" onClick={handleReset}>
                        <span className="material-icons">refresh</span>
                        Sıfırla
                    </button>
                    <button className="apply-btn" onClick={handleApply}>
                        <span className="material-icons">check</span>
                        Uygula
                    </button>
                </div>
            </div>
        </div>
    );
}
