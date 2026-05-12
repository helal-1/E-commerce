"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. تعريف شكل المنتج في المفضلات
interface WishlistProduct {
    id: string | number;
    name: string;
    price: number;
    images: string[];
    category?: string;
}

// 2. تعريف شكل بيانات الـ Context
interface WishlistContextType {
    wishlist: WishlistProduct[];
    addToWishlist: (product: WishlistProduct) => void;
    removeFromWishlist: (id: string | number) => void;
    isWishlistOpen: boolean;
    setIsWishlistOpen: (open: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
    // 3. التحميل من localStorage مباشرة في الـ Initial State لحل مشكلة الـ ESLint والأداء
    const [wishlist, setWishlist] = useState<WishlistProduct[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('zeldaline_wishlist');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const [isWishlistOpen, setIsWishlistOpen] = useState(false);

    // 4. حفظ المفضلات عند كل تغيير
    useEffect(() => {
        localStorage.setItem('zeldaline_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (product: WishlistProduct) => {
        setWishlist((prev) => {
            const exists = prev.find((item) => item.id === product.id);
            if (exists) {
                // لو موجود يحذفه (نظام التفضيل وإلغاء التفضيل)
                return prev.filter((item) => item.id !== product.id);
            }
            return [...prev, product];
        });
    };

    const removeFromWishlist = (id: string | number) => {
        setWishlist((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isWishlistOpen,
            setIsWishlistOpen
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};