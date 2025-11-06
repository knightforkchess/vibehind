import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/Section.css';

gsap.registerPlugin(ScrollTrigger);

export default function Section({ 
    id, 
    className = '', 
    children, 
    backgroundColor,
    videoSrc,
    hasOverlay = false
}) {
    const sectionRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (!sectionRef.current || !contentRef.current) return;

        const section = sectionRef.current;
        const content = contentRef.current;
        const items = content.querySelectorAll('.animate-item');

        // Create timeline for this section
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'top 20%',
                toggleActions: 'play none none reverse',
                // markers: true, // Uncomment for debugging
            }
        });

        // Animate each item
        items.forEach((item, index) => {
            tl.fromTo(
                item,
                {
                    opacity: 0,
                    y: 80,
                    scale: 0.95
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.2,
                    ease: 'power3.out',
                    clearProps: 'all'
                },
                index * 0.15 // Stagger delay
            );
        });

        // Cleanup
        return () => {
            if (tl.scrollTrigger) {
                tl.scrollTrigger.kill();
            }
            tl.kill();
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            id={id}
            className={`cinematic-section ${className}`}
            style={{ backgroundColor }}
            data-scroll-section
        >
            {videoSrc && (
                <video 
                    className="section-video" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    data-scroll
                    data-scroll-speed="-1"
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
            )}
            {hasOverlay && <div className="section-overlay" />}
            <div ref={contentRef} className="section-content">
                {children}
            </div>
        </section>
    );
}
