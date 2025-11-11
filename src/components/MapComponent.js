import React, { useState, useRef, useEffect } from 'react';
import '../styles/MapComponent.css';

const MapComponent = () => {
    const mapRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [markers] = useState([
        { id: 1, type: 'hidden', top: '30%', left: '40%' },
        { id: 2, type: 'hidden', top: '50%', left: '60%' },
        { id: 3, type: 'hidden', top: '70%', left: '20%' },
    ]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartPos({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        const newX = e.clientX - startPos.x;
        const newY = e.clientY - startPos.y;
        
        // Add boundaries to prevent dragging too far
        const boundX = Math.min(Math.max(newX, -500), 500);
        const boundY = Math.min(Math.max(newY, -500), 500);
        
        setPosition({ x: boundX, y: boundY });
        mapRef.current.style.transform = `translate(${boundX}px, ${boundY}px)`;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch events for mobile
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        setIsDragging(true);
        setStartPos({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y
        });
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        
        const newX = touch.clientX - startPos.x;
        const newY = touch.clientY - startPos.y;
        
        const boundX = Math.min(Math.max(newX, -500), 500);
        const boundY = Math.min(Math.max(newY, -500), 500);
        
        setPosition({ x: boundX, y: boundY });
        mapRef.current.style.transform = `translate(${boundX}px, ${boundY}px)`;
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, startPos]);

    return (
        <div className="map-container">
            <div 
                ref={mapRef}
                className={`map ${isDragging ? 'dragging' : ''}`}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {markers.map((marker) => (
                    <div
                        key={marker.id}
                        className={`map-marker marker-hidden-profile ${isDragging ? 'no-animation' : ''}`}
                        style={{ top: marker.top, left: marker.left }}
                    >
                        <div className="marker-ripple"></div>
                        <div className="marker-icon">
                            <span className="material-icons">person</span>
                        </div>
                    </div>
                ))}
                <div className="map-marker marker-user-location">
                    <div className="marker-ripple user-ripple"></div>
                    <div className="marker-icon user-icon">
                        <span className="material-icons">my_location</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapComponent;