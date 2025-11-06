// src/components/Feed.js
import React, { useState, useEffect } from 'react';
import useInfiniteScroll from './Feed/useInfiniteScroll';
import Content from './Feed/Content';
import '../styles/Feed.css';

// Dating profil verisi simülasyonu
const fetchPosts = (page) => {
    const users = ['Ayşe', 'Zeynep', 'Elif', 'Selin', 'Deniz', 'Ece', 'Merve', 'Burcu'];
    const locations = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bodrum', 'Çeşme'];
    const ages = [22, 24, 25, 26, 27, 28, 29, 30];
    const bios = [
        'Hayatı dolu dolu yaşamayı seven biriyim 🌟',
        'Seyahat etmeyi ve yeni yerler keşfetmeyi seviyorum ✈️',
        'Müzik ve sanat tutkunu 🎨',
        'Doğa yürüyüşleri ve macera arıyorum 🏔️',
        'Kahve içmeyi ve kitap okumayı seviyorum ☕📚',
        'Yoga ve meditasyon ile huzur buluyorum 🧘‍♀️',
        'Yemek yapmayı ve yeni tarifler denemeyi seviyorum 👩‍🍳',
        'Dans etmeyi ve eğlenmeyi seviyorum 💃'
    ];
    const interests = [
        ['Seyahat', 'Fotoğrafçılık', 'Yoga'],
        ['Müzik', 'Konser', 'Dans'],
        ['Kitap', 'Kahve', 'Sanat'],
        ['Doğa', 'Kamp', 'Yürüyüş'],
        ['Yemek', 'Şarap', 'Gastronomi'],
        ['Spor', 'Fitness', 'Koşu'],
        ['Sinema', 'Dizi', 'Tiyatro'],
        ['Teknoloji', 'Oyun', 'Müzik']
    ];
    
    return new Array(5).fill(null).map((_, index) => {
        const mediaCount = Math.floor(Math.random() * 4) + 1; // 1-4 media items
        const media = Array.from({ length: mediaCount }, (_, i) => ({
            type: Math.random() > 0.7 ? 'video' : 'image',
            url: Math.random() > 0.7 
                ? 'https://example.com/sample-video.mp4' 
                : `https://picsum.photos/1080/1350?random=${page * 5 + index + i}`,
            id: `${page * 5 + index}-${i}`
        }));

        const userIndex = Math.floor(Math.random() * users.length);
        return {
            id: page * 5 + index,
            username: users[userIndex],
            userPhoto: `https://i.pravatar.cc/150?img=${page * 5 + index + 1}`,
            location: locations[Math.floor(Math.random() * locations.length)],
            age: ages[Math.floor(Math.random() * ages.length)],
            bio: bios[userIndex],
            interests: interests[userIndex],
            media: media, // Multiple images/videos
            likes: Math.floor(Math.random() * 1000) + 100,
            distance: `${Math.floor(Math.random() * 10) + 1} km uzakta`,
            verified: Math.random() > 0.5,
            online: Math.random() > 0.6,
            timestamp: `${Math.floor(Math.random() * 23) + 1} SAAT ÖNCE`
        };
    });
};

export default function Feed({ onPostSelect }) {
    const [posts, setPosts] = useState(fetchPosts(0));
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [activePost, setActivePost] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // useInfiniteScroll hook'u, sayfanın dibine gelindiğinde bu fonksiyonu çağırır.
    const [isFetching, setIsFetching] = useInfiniteScroll(loadMorePosts);

    // Aktif postu RightBar'a ilet
    useEffect(() => {
        if (posts.length > 0) {
            setActivePost(posts[0]);
            onPostSelect?.(posts[0]);
        }
    }, [posts, onPostSelect]);

    // Post değiştiğinde parent component'i bilgilendir
    useEffect(() => {
        if (activePost) {
            onPostSelect?.(activePost);
        }
    }, [activePost, onPostSelect]);

    // Yeni gönderileri yükleme fonksiyonu
    function loadMorePosts() {
        if (isLoading) return; // Zaten yükleniyorsa tekrar tetiklemeyi engelle

        setIsLoading(true);

        // API'den veri çekme simülasyonu (delay ekleyelim)
        setTimeout(() => {
            const newPosts = fetchPosts(page);
            
            setPosts(prevPosts => [...prevPosts, ...newPosts]);
            setPage(prevPage => prevPage + 1);
            
            setIsLoading(false);
            setIsFetching(false); // Yükleme bitti, scroll dinleyicisini sıfırla
        }, 1000); // 1 saniye bekleme simülasyonu
    }

    const handleSwipe = (direction) => {
        if (direction === 'up' && currentIndex < posts.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setActivePost(posts[currentIndex + 1]);
            if (currentIndex + 1 >= posts.length - 2) {
                loadMorePosts();
            }
        }
    };

    const handleLike = () => {
        console.log('Liked:', posts[currentIndex]);
        handleSwipe('up');
    };

    const handleDislike = () => {
        console.log('Disliked:', posts[currentIndex]);
        handleSwipe('up');
    };

    return (
        <div className="feed">
            {posts.length > 0 && currentIndex < posts.length && (
                <Content 
                    key={posts[currentIndex].id} 
                    post={posts[currentIndex]}
                    onSwipe={handleSwipe}
                    onLike={handleLike}
                    onDislike={handleDislike}
                    isActive={true}
                />
            )}
            {isLoading && <div className="loading">Yükleniyor...</div>}
        </div>
    );
}