import React, { useRef, useState } from 'react';
import '../../styles/NewPost/NewCamera.css';

export default function NewCamera({ onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' },
                audio: false 
            });
            videoRef.current.srcObject = mediaStream;
            setStream(mediaStream);
            setIsCameraActive(true);
        } catch (err) {
            console.error('Kamera erişim hatası:', err);
            alert('Kamera erişimi reddedildi veya mevcut değil.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCameraActive(false);
        }
    };

    const capturePhoto = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
        stopCamera();
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        startCamera();
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    const handleSave = () => {
        console.log('Fotoğraf kaydedildi:', capturedImage);
        // Burada fotoğrafı backend'e gönderebilirsiniz
        handleClose();
    };

    return (
        <div className="camera-modal-overlay" onClick={handleClose}>
            <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
                <div className="camera-header">
                    <h2>📸 Kamera</h2>
                    <button className="close-btn" onClick={handleClose}>
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="camera-content">
                    {!isCameraActive && !capturedImage && (
                        <div className="camera-placeholder">
                            <span className="material-icons camera-icon">photo_camera</span>
                            <p>Kamerayı başlatmak için butona tıklayın</p>
                            <button className="start-camera-btn" onClick={startCamera}>
                                <span className="material-icons">videocam</span>
                                Kamerayı Aç
                            </button>
                        </div>
                    )}

                    {isCameraActive && (
                        <div className="camera-preview">
                            <video ref={videoRef} autoPlay playsInline />
                            <button className="capture-btn" onClick={capturePhoto}>
                                <span className="capture-ring"></span>
                            </button>
                        </div>
                    )}

                    {capturedImage && (
                        <div className="captured-preview">
                            <img src={capturedImage} alt="Captured" />
                            <div className="preview-actions">
                                <button className="retake-btn" onClick={retakePhoto}>
                                    <span className="material-icons">refresh</span>
                                    Yeniden Çek
                                </button>
                                <button className="save-btn" onClick={handleSave}>
                                    <span className="material-icons">check</span>
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    )}

                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
            </div>
        </div>
    );
}
