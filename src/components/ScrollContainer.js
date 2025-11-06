import React, { useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

export default function ScrollContainer({ children }) {
    const scrollRef = useRef(null);
    const locomotiveScrollRef = useRef(null);

    useEffect(() => {
        if (!scrollRef.current) return;

        // Initialize Locomotive Scroll
        locomotiveScrollRef.current = new LocomotiveScroll({
            el: scrollRef.current,
            smooth: true,
            smoothMobile: true,
            multiplier: 1.0,
            lerp: 0.1, // Linear interpolation intensity (0-1)
            class: 'is-inview',
            smartphone: {
                smooth: true,
                breakpoint: 767
            },
            tablet: {
                smooth: true,
                breakpoint: 1024
            }
        });

        // Update on window resize
        const handleResize = () => {
            if (locomotiveScrollRef.current) {
                locomotiveScrollRef.current.update();
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            if (locomotiveScrollRef.current) {
                locomotiveScrollRef.current.destroy();
            }
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div 
            ref={scrollRef} 
            data-scroll-container
            className="scroll-container"
        >
            {children}
        </div>
    );
}
