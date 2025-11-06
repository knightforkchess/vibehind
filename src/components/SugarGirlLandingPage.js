import React, { useEffect, useRef, useState } from 'react';
import ReactFullpage from '@fullpage/react-fullpage';
import { gsap } from 'gsap';
import '../styles/SugarGirlLandingPage.css';

export default function SugarGirlLandingPage({ onEnter }) {
    const cursorRef = useRef(null);
    const handsRef = useRef(null);
    // const [scrollProgress, setScrollProgress] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [currentStory, setCurrentStory] = useState(0);

    useEffect(() => {
        // Check if mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        // Mobile horizontal scroll tracking
        if (!isMobile) return;

        const handleScroll = () => {
            const container = document.getElementById('fullpage');
            if (!container) return;

            const scrollLeft = container.scrollLeft;
            const sectionWidth = window.innerWidth;
            const currentSection = Math.round(scrollLeft / sectionWidth);
            
            setCurrentStory(currentSection);
        };

        const container = document.getElementById('fullpage');
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [isMobile]);

    useEffect(() => {
        // Custom cursor effect with candy theme
        const cursor = cursorRef.current;
        
        const moveCursor = (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.3,
                ease: 'power2.out'
            });
        };

        window.addEventListener('mousemove', moveCursor);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
        };
    }, []);

    const onLeave = (origin, destination, direction) => {
        const leavingSection = origin.item;
        const items = leavingSection.querySelectorAll('.animate-item');
        
        // Animate out
        gsap.to(items, {
            opacity: 0,
            y: direction === 'down' ? -50 : 50,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.in'
        });
    };

    const afterLoad = (origin, destination, direction) => {
        const currentSection = destination.item;
        const items = currentSection.querySelectorAll('.animate-item');
        
        // Update story progress for mobile
        setCurrentStory(destination.index);
        
        // Reset and animate in
        gsap.set(items, {
            opacity: 0,
            y: direction === 'down' ? 80 : -80
        });

        gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 0.3
        });

        // Hero section hands animation
        if (destination.index === 0) {
            animateHands();
        }
    };

    const animateHands = () => {
        const hands = handsRef.current;
        if (hands) {
            gsap.fromTo(hands,
                { scale: 1, opacity: 1 },
                {
                    scale: 2.5,
                    opacity: 0,
                    duration: 2,
                    ease: 'power2.out',
                    delay: 1
                }
            );
        }
    };

    return (
        <>
            <div ref={cursorRef} className="custom-cursor candy-cursor" />
            
            {/* Story Progress Indicators for Mobile */}
            {isMobile && (
                <div className="story-progress">
                    {[0, 1, 2, 3, 4].map((index) => (
                        <div key={index} className="story-progress-bar">
                            <div 
                                className="story-progress-fill" 
                                style={{ 
                                    width: currentStory >= index ? '100%' : '0%',
                                    transition: currentStory === index ? 'width 0.3s ease' : 'none'
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
            
            {/* Floating candy decorations */}
            <div className="candy-decorations">
                <div className="candy candy-1">🍬</div>
                <div className="candy candy-2">🍭</div>
                <div className="candy candy-3">🍬</div>
                <div className="candy candy-4">💝</div>
                <div className="candy candy-5">🍭</div>
            </div>

            <ReactFullpage
                licenseKey={'YOUR_KEY_HERE'}
                scrollingSpeed={800}
                navigation={true}
                navigationPosition={'right'}
                navigationTooltips={['Ana Sayfa', 'Buluşma', 'Yakınındakiler', 'Özellikler', 'Başla']}
                showActiveTooltip={true}
                scrollOverflow={false}
                autoScrolling={true}
                fitToSection={true}
                fitToSectionDelay={600}
                easing={'easeInOutCubic'}
                responsiveWidth={768}
                responsiveHeight={0}
                onLeave={onLeave}
                afterLoad={afterLoad}
                render={({ state, fullpageApi }) => {
                    return (
                        <ReactFullpage.Wrapper>
                            {/* Section 1: Hero - Vibehind Theme */}
                            <div className="section hero-section candy-gradient">
                                {/* Holding Hands Background */}
                                <div ref={handsRef} className="hands-background">
                                    <img src="/couplerbg.png" alt="Holding Hands" className="hands-image" />
                                </div>

                                <div className="floating-hearts">
                                    <div className="heart">💖</div>
                                    <div className="heart">💕</div>
                                    <div className="heart">💗</div>
                                    <div className="heart">💓</div>
                                    <div className="heart">💝</div>
                                </div>
                                
                                <div className="section-content">
                                    <div className="hero-wrapper">
                                        <div className="animate-item">
                                            <img 
                                                src="/logo.jpg" 
                                                alt="Vibehind Logo" 
                                                className="hero-logo pulse-animation"
                                            />
                                        </div>
                                        
                                        <div className="animate-item">
                                            <h1 className="hero-title candy-text">
                                                <span className="sweet-text">Vibehind</span>
                                                <span className="candy-emoji">💕</span>
                                            </h1>
                                        </div>
                                        
                                        <div className="animate-item">
                                            <p className="hero-subtitle">
                                                Tatlı Aşklar, Şeker Gibi Buluşmalar
                                            </p>
                                        </div>
                                        
                                        <div className="animate-item">
                                            <p className="hero-description">
                                                Yakınındaki özel insanlarla tanış, kalpleri birleştir 💕
                                            </p>
                                        </div>
                                        
                                        <div className="animate-item">
                                            <div className="hero-buttons">
                                                <button className="btn-candy-primary" onClick={onEnter}>
                                                    💖 Hemen Başla
                                                </button>
                                                <button className="btn-candy-secondary" onClick={onEnter}>
                                                    ✨ Keşfet
                                                </button>
                                            </div>
                                        </div>

                                        <div className="animate-item scroll-hint">
                                            <span className="scroll-emoji">👇</span>
                                            <span className="scroll-text">Aşağı Kaydır</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Dating Video & Couple Illustration */}
                            <div className="section meeting-section">
                                <video 
                                    className="section-bg-video" 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline
                                >
                                    <source src="/dating.mp4" type="video/mp4" />
                                </video>
                                <div className="section-overlay"></div>
                                
                                <div className="section-content">
                                    <div className="meeting-wrapper">
                                        <div className="couple-illustration-container animate-item">
                                            <img 
                                                src="/coupleillustration.png" 
                                                alt="Couple Illustration" 
                                                className="couple-illustration"
                                            />
                                        </div>

                                        <div className="animate-item">
                                            <h2 className="section-title gradient-text">
                                                Kalpler Buluşuyor 💕
                                            </h2>
                                        </div>
                                        
                                        <div className="animate-item">
                                            <p className="section-description light">
                                                Gerçek bağlantılar, anlamlı ilişkiler
                                            </p>
                                        </div>

                                        <div className="animate-item meeting-text">
                                            <h3>🎯 Mükemmel Eşleşme</h3>
                                            <p>Algoritmamız seni en uyumlu kişilerle buluşturuyor</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Map - Nearby Matches */}
                            <div className="section map-section">
                                <div className="section-content">
                                    <div className="map-wrapper">
                                        <div className="animate-item">
                                            <h2 className="section-title gradient-text">
                                                📍 Yakınındakilerle Eşleş
                                            </h2>
                                        </div>
                                        
                                        <div className="animate-item">
                                            <p className="section-description">
                                                Çevrende seni bekleyen özel insanları keşfet
                                            </p>
                                        </div>

                                        <div className="map-container animate-item">
                                            <div className="map-illustration">
                                                {/* Animated map pins */}
                                                <div className="map-pin pin-1">
                                                    <div className="pin-icon">📍</div>
                                                    <div className="pin-avatar">👩</div>
                                                    <div className="pin-pulse"></div>
                                                </div>
                                                <div className="map-pin pin-2">
                                                    <div className="pin-icon">📍</div>
                                                    <div className="pin-avatar">👨</div>
                                                    <div className="pin-pulse"></div>
                                                </div>
                                                <div className="map-pin pin-3">
                                                    <div className="pin-icon">📍</div>
                                                    <div className="pin-avatar">👩</div>
                                                    <div className="pin-pulse"></div>
                                                </div>
                                                <div className="map-pin pin-4">
                                                    <div className="pin-icon">📍</div>
                                                    <div className="pin-avatar">👨</div>
                                                    <div className="pin-pulse"></div>
                                                </div>
                                                <div className="map-pin pin-5">
                                                    <div className="pin-icon">📍</div>
                                                    <div className="pin-avatar">👩</div>
                                                    <div className="pin-pulse"></div>
                                                </div>
                                                
                                                {/* Your location */}
                                                <div className="map-pin your-location">
                                                    <div className="pin-icon you">📍</div>
                                                    <div className="pin-label">Sen</div>
                                                    <div className="location-pulse"></div>
                                                </div>

                                                {/* Connection lines */}
                                                <svg className="connection-lines">
                                                    <line className="connection-line line-1" x1="50%" y1="50%" x2="30%" y2="25%" />
                                                    <line className="connection-line line-2" x1="50%" y1="50%" x2="70%" y2="30%" />
                                                    <line className="connection-line line-3" x1="50%" y1="50%" x2="25%" y2="70%" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="location-stats animate-item">
                                            <div className="stat-box">
                                                <div className="stat-number">50+</div>
                                                <div className="stat-label">Yakınında</div>
                                            </div>
                                            <div className="stat-box">
                                                <div className="stat-number">2km</div>
                                                <div className="stat-label">Yarıçap</div>
                                            </div>
                                            <div className="stat-box">
                                                <div className="stat-number">95%</div>
                                                <div className="stat-label">Uyumluluk</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Features - Candy Theme */}
                            <div className="section features-section">
                                <div className="section-content">
                                    <div className="features-wrapper">
                                        <div className="animate-item">
                                            <h2 className="section-title gradient-text">
                                                ✨ Özel Özellikler
                                            </h2>
                                        </div>

                                        <div className="features-grid">
                                            <div className="animate-item feature-card">
                                                <div className="feature-icon">💬</div>
                                                <h3>Anlık Mesajlaşma</h3>
                                                <p>Eşleştiğin kişilerle anında sohbet et</p>
                                            </div>
                                            
                                            <div className="animate-item feature-card">
                                                <div className="feature-icon">🎁</div>
                                                <h3>Sanal Hediyeler</h3>
                                                <p>Özel birini şeker gibi hediyelerle mutlu et</p>
                                            </div>
                                            
                                            <div className="animate-item feature-card">
                                                <div className="feature-icon">🎯</div>
                                                <h3>Akıllı Eşleşme</h3>
                                                <p>Yapay zeka destekli mükemmel eşleşmeler</p>
                                            </div>
                                            
                                            <div className="animate-item feature-card">
                                                <div className="feature-icon">🔒</div>
                                                <h3>Güvenli & Gizli</h3>
                                                <p>Verileriniz tamamen güvende</p>
                                            </div>
                                            
                                            <div className="animate-item feature-card">
                                                <div className="feature-icon">📸</div>
                                                <h3>Hikaye Paylaş</h3>
                                                <p>Günlük anılarını paylaş, etkileşim kur</p>
                                            </div>
                                            
                                            <div className="animate-item feature-card">
                                                <div className="feature-icon">🌟</div>
                                                <h3>Premium Deneyim</h3>
                                                <p>Sınırsız beğeni ve özel rozetler</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: CTA - Call to Action */}
                            <div className="section cta-section candy-gradient">
                                <div className="floating-candies">
                                    <div className="floating-candy">🍬</div>
                                    <div className="floating-candy">🍭</div>
                                    <div className="floating-candy">🍬</div>
                                    <div className="floating-candy">💝</div>
                                </div>

                                <div className="section-content">
                                    <div className="cta-wrapper">
                                        <div className="animate-item">
                                            <img 
                                                src="/logo.jpg" 
                                                alt="Vibehind Logo" 
                                                className="cta-logo"
                                            />
                                        </div>
                                        
                                        <div className="animate-item">
                                            <h2 className="cta-title">
                                                Aşkını Bul, Mutluluğu Yakala! 💕
                                            </h2>
                                        </div>
                                        
                                        <div className="animate-item">
                                            <p className="cta-description">
                                                Binlerce mutlu çift zaten buluştu. Sıra sende!
                                            </p>
                                        </div>

                                        <div className="animate-item">
                                            <div className="success-stats">
                                                <div className="success-item">
                                                    <span className="success-emoji">💑</span>
                                                    <span className="success-number">10,000+</span>
                                                    <span className="success-label">Mutlu Çift</span>
                                                </div>
                                                <div className="success-item">
                                                    <span className="success-emoji">💖</span>
                                                    <span className="success-number">50,000+</span>
                                                    <span className="success-label">Eşleşme</span>
                                                </div>
                                                <div className="success-item">
                                                    <span className="success-emoji">⭐</span>
                                                    <span className="success-number">4.9/5</span>
                                                    <span className="success-label">Kullanıcı Puanı</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="animate-item">
                                            <button className="btn-candy-large" onClick={onEnter}>
                                                💖 Ücretsiz Başla
                                            </button>
                                        </div>

                                        <div className="animate-item">
                                            <p className="cta-note">
                                                ✨ Kredi kartı gerektirmez • Anında eşleşmeye başla
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ReactFullpage.Wrapper>
                    );
                }}
            />
        </>
    );
}
