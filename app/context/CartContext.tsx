"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

// 1. تعريف شكل المنتج داخل السلة (Cart Item Interface)
interface CartItem {
    id: string | number;
    name: string;
    price: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
    category?: string;
}

// 2. تعريف شكل بيانات الـ Context (Context Type)
interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: CartItem) => void;
    updateQuantity: (id: string | number, size: string, color: string, delta: number) => void;
    removeItem: (id: string | number, size: string, color: string) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    cartCount: number;
    subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // دالة الإضافة المبرمجة لاستلام (المنتج + المقاس + اللون + الكمية)
    const addToCart = (product: CartItem) => {
        setCartItems(prev => {
            // البحث عن منتج يطابق الـ ID والمقاس واللون معاً
            const exists = prev.find(item =>
                item.id === product.id &&
                item.size === product.size &&
                item.color === product.color
            );

            if (exists) {
                // لو موجود بنفس المواصفات، بنزود الكمية المختارة
                return prev.map(item =>
                    (item.id === product.id && item.size === product.size && item.color === product.color)
                        ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                        : item
                );
            }

            // لو منتج جديد بمواصفات جديدة، بنضيفه زي ما هو
            return [...prev, { ...product, quantity: product.quantity || 1 }];
        });
        setIsCartOpen(true);
    };

    // تحديث الكمية يعتمد على (ID, Size, Color)
    const updateQuantity = (id: string | number, size: string, color: string, delta: number) => {
        setCartItems(prev => prev.map(item =>
            (item.id === id && item.size === size && item.color === color)
                ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                : item
        ));
    };

    // حذف المنتج يعتمد على التلات عناصر
    const removeItem = (id: string | number, size: string, color: string) => {
        setCartItems(prev => prev.filter(item =>
            !(item.id === id && item.size === size && item.color === color)
        ));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            updateQuantity,
            removeItem,
            clearCart,
            isCartOpen,
            setIsCartOpen,
            cartCount,
            subtotal
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};