"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext<any>(null);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    // تحميل المفضلات من LocalStorage عند البداية
    useEffect(() => {
        const savedWishlist = localStorage.getItem('zeldaline_wishlist');
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    }, []);

    // حفظ المفضلات عند كل تغيير
    useEffect(() => {
        localStorage.setItem('zeldaline_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (product: any) => {
        setWishlist((prev) => {
            const exists = prev.find((item) => item.id === product.id);
            if (exists) return prev.filter((item) => item.id !== product.id); // لو موجود يحذفه (Toggle)
            return [...prev, product];
        });
    };

    const removeFromWishlist = (id: string) => {
        setWishlist((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isWishlistOpen, setIsWishlistOpen }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);