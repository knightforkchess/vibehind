import React, { useState, useRef, useEffect } from 'react';
import '../../styles/Feed/BeforeLive.css';
import api from '../../services/api';

export default function BeforeLive({ onLiveStart }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Sohbet');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [micEnabled, setMicEnabled] = useState(true);
    const [showSettings, setShowSettings] = useState(true);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const categories = ['Sohbet', 'Müzik', 'Oyun', 'Eğlence', 'Diğer'];

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: true
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            
            streamRef.current = stream;
            setCameraEnabled(true);
        } catch (err) {
            console.error('Camera access error:', err);
            setError('Kamera erişimi reddedildi. Lütfen tarayıcı izinlerini kontrol edin.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const toggleCamera = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setCameraEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleMic = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setMicEnabled(audioTrack.enabled);
            }
        }
    };

    const handleStartLive = async () => {
        if (!title.trim()) {
            setError('Lütfen bir başlık girin');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await api.post('/livestreams/start', {
                title: title.trim(),
                description: description.trim(),
                category
            });

            // Yayın başlatıldı, parent component'e bildir
            if (onLiveStart) {
                onLiveStart(response.data, streamRef.current);
            }
        } catch (err) {
            console.error('Start live error:', err);
            setError(err.response?.data?.message || 'Yayın başlatılamadı');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="before-live-container">
            <div className="before-live-layout">
                {/* Camera Preview */}
                <div className="camera-preview-section">
                    <div className="camera-preview">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="preview-video"
                        />
                        {!cameraEnabled && (
                            <div className="camera-off-overlay">
                                <span className="material-icons">videocam_off</span>
                                <p>Kamera Kapalı</p>
                            </div>
                        )}

                        {/* Settings Toggle Button */}
                        <button 
                            className="settings-toggle-btn"
                            onClick={() => setShowSettings(!showSettings)}
                            title="Yayın Ayarları"
                        >
                            <span className="material-icons">edit</span>
                        </button>
                    </div>
                    
                    <div className="camera-controls">
                        <button 
                            className={`control-btn ${cameraEnabled ? 'active' : 'inactive'}`}
                            onClick={toggleCamera}
                            title={cameraEnabled ? 'Kamerayı Kapat' : 'Kamerayı Aç'}
                        >
                            <span className="material-icons">
                                {cameraEnabled ? 'videocam' : 'videocam_off'}
                            </span>
                        </button>
                        <button 
                            className={`control-btn ${micEnabled ? 'active' : 'inactive'}`}
                            onClick={toggleMic}
                            title={micEnabled ? 'Mikrofonu Kapat' : 'Mikrofonu Aç'}
                        >
                            <span className="material-icons">
                                {micEnabled ? 'mic' : 'mic_off'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Settings Form */}
                {showSettings && (
                <div className="settings-section">
                    <button 
                        className="close-popup-btn"
                        onClick={() => setShowSettings(false)}
                        title="Kapat"
                    >
                        <span className="material-icons">close</span>
                    </button>

                    <div className="before-live-header">
                        <h2>Yayın Ayarları</h2>
                        <p>Yayınınızı başlatmadan önce bilgileri doldurun</p>
                    </div>

                    <div className="before-live-form">
                        <div className="form-group">
                            <label>
                                <span className="material-icons">title</span>
                                Yayın Başlığı
                            </label>
                            <input
                                type="text"
                                placeholder="Örn: Akşam Sohbeti"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                            />
                            <span className="char-count">{title.length}/100</span>
                        </div>

                        <div className="form-group">
                            <label>
                                <span className="material-icons">description</span>
                                Açıklama (Opsiyonel)
                            </label>
                            <textarea
                                placeholder="Yayınınız hakkında kısa bir açıklama..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={500}
                                rows={4}
                            />
                            <span className="char-count">{description.length}/500</span>
                        </div>

                        <div className="form-group">
                            <label>
                                <span className="material-icons">category</span>
                                Kategori
                            </label>
                            <div className="category-grid">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        className={`category-btn ${category === cat ? 'active' : ''}`}
                                        onClick={() => setCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                <span className="material-icons">error</span>
                                {error}
                            </div>
                        )}

                        <div className="before-live-tips">
                            <h3>
                                <span className="material-icons">lightbulb</span>
                                İpuçları
                            </h3>
                            <ul>
                                <li>İyi bir aydınlatma kullanın</li>
                                <li>Mikrofonunuzun çalıştığından emin olun</li>
                                <li>İnternet bağlantınızı kontrol edin</li>
                                <li>Saygılı ve pozitif olun</li>
                            </ul>
                        </div>

                        <button
                            className="start-live-btn"
                            onClick={handleStartLive}
                            disabled={loading || !title.trim() || !cameraEnabled}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Başlatılıyor...
                                </>
                            ) : (
                                <>
                                    <span className="material-icons">play_circle_filled</span>
                                    Canlı Yayını Başlat
                                </>
                            )}
                        </button>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}
