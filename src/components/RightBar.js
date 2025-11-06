import { useState, useEffect, useRef } from 'react'
import '../styles/RightBar.css'
import RightHeader from './RightBar/Header'
import Details from './RightBar/Details'
import Share from './RightBar/Share'

export default function RightBar({ activePost }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [animationComplete, setAnimationComplete] = useState(false);
    const [currentTransform, setCurrentTransform] = useState(80);
    const [showShare, setShowShare] = useState(false);
    const searchInputRef = useRef(null);
    const recognition = useRef(null);
    const rightBarRef = useRef(null);
    const dragRef = useRef({
        isDragging: false,
        startY: 0,
        startTransform: 0
    });

    useEffect(() => {
        // Web Speech API'yi başlat
        if (window.SpeechRecognition || window.webkitSpeechRecognition) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = true;
            recognition.current.lang = 'tr-TR';

            recognition.current.onresult = (event) => {
                const current = event.resultIndex;
                const transcript = event.results[current][0].transcript;
                setTranscript(transcript);
            };

            recognition.current.onend = () => {
                setTimeout(() => {
                    setIsListening(false);
                    if (searchInputRef.current && transcript) {
                        searchInputRef.current.value = transcript;
                    }
                }, 5000);
            };
        }
    }, []);

    const startListening = () => {
        setIsListening(true);
        setTranscript('');
        if (recognition.current) {
            recognition.current.start();
            setAnimationComplete(true);
        }
    };

    const toggleExpand = () => {
        if (!isListening) {
            setIsExpanded(!isExpanded);
        }
    };

    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        dragRef.current.startY = touch.clientY;
        dragRef.current.isDragging = true;

        const el = rightBarRef.current;
        const computedStyle = window.getComputedStyle(el);
        const transform = computedStyle.transform;
        const matrix = new DOMMatrix(transform);
        const currentY = matrix.m42;
        const height = el.offsetHeight;
        dragRef.current.startTransform = (currentY / height) * 100;
    };

    const handleTouchMove = (e) => {
        if (!dragRef.current.isDragging) return;
        const touch = e.touches[0];
        const deltaY = touch.clientY - dragRef.current.startY;
        const height = rightBarRef.current.offsetHeight;
        const newTransform = dragRef.current.startTransform + (deltaY / height) * 100;
        const clampedTransform = Math.min(Math.max(newTransform, 0), 80);
        setCurrentTransform(clampedTransform);
        rightBarRef.current.style.transform = `translateY(${clampedTransform}%)`;
    };

    const handleTouchEnd = () => {
        dragRef.current.isDragging = false;
        const threshold = 40; // 40% of height
        if (currentTransform < threshold) {
            setCurrentTransform(0);
            setIsExpanded(true);
            rightBarRef.current.style.transform = 'translateY(0%)';
        } else {
            setCurrentTransform(80);
            setIsExpanded(false);
            rightBarRef.current.style.transform = 'translateY(80%)';
        }
    };

    useEffect(() => {
        const rightBar = rightBarRef.current;
        if (!rightBar) return;

        rightBar.style.transition = dragRef.current.isDragging ? 'none' : 'transform 0.3s ease-out';
    }, [dragRef.current.isDragging]);

    return(
        <>
            <div 
                ref={rightBarRef}
                className={`right-bar ${isExpanded ? 'expanded' : ''} ${isListening ? 'listening' : ''}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={toggleExpand}
            >
                <div className="drag-handle" />
                <RightHeader 
                    onMicClick={startListening} 
                    searchInputRef={searchInputRef}
                    onShareClick={() => setShowShare(true)}
                />
                <Details activePost={activePost} />
                
                {isListening && (
                    <div className="voice-recognition-overlay">
                        <div className="mic-animation-circle">
                            <span className="material-icons mic-icon">mic</span>
                            <div className="listening-waves"></div>
                        </div>
                        <p className="listening-text">Dinleniyor...</p>
                        {transcript && (
                            <p className="transcript-text">{transcript}</p>
                        )}
                    </div>
                )}
            </div>
            {showShare && (
                <Share 
                    activePost={activePost}
                    onClose={() => setShowShare(false)}
                />
            )}
        </>
    )
}