// src/hooks/useInfiniteScroll.js (Örnek bir dosya)
import { useState, useEffect } from 'react';

const useInfiniteScroll = (callback) => {
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        // Scroll olay dinleyicisini ekler
        window.addEventListener('scroll', handleScroll);
        
        // Temizleme fonksiyonu: Bileşen kaldırıldığında dinleyiciyi kaldırır
        return () => window.removeEventListener('scroll', handleScroll);
    }, []); // Boş dizi: Yalnızca mount ve unmount olduğunda çalışır

    useEffect(() => {
        // isFetching true olduğunda (yani scroll sonunda tetiklendiğinde)
        // dışarıdan gelen callback fonksiyonunu çağırır.
        if (!isFetching) return;
        callback();
    }, [isFetching, callback]);

    function handleScroll() {
        // Sayfanın en altına ne kadar yaklaşıldığını kontrol etme mantığı.
        // Burada 200 piksel pay bıraktık.
        if (
            window.innerHeight + document.documentElement.scrollTop >= 
            document.documentElement.offsetHeight - 200
        ) {
            setIsFetching(true);
        }
    }

    return [isFetching, setIsFetching];
};

export default useInfiniteScroll;