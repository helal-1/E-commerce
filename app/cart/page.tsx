        "use client";

        import { useState, useEffect } from 'react';
        import { supabase } from '@/lib/supabase';
        import {
            Search, ShoppingBag, Plus, Minus, Trash2, X, Loader2
        } from 'lucide-react';

        export default function ShopPage() {
            const [products, setProducts] = useState<any[]>([]);
            const [loading, setLoading] = useState(true);
            const [category, setCategory] = useState('الكل');
            const [searchQuery, setSearchQuery] = useState('');
            const [isCartOpen, setIsCartOpen] = useState(false);
            const [cartItems, setCartItems] = useState<any[]>([]);

            // 1. تعريف الدالة أولاً (قبل الـ useEffect) لتجنب الخطأ
            const fetchProducts = async () => {
                setLoading(true);
                try {
                    console.log("جاري محاولة جلب البيانات...");
                    const { data, error } = await supabase
                        .from('products')
                        .select('*');

                    if (error) {
                        console.error("خطأ صريح من سوبابيس:", error.message);
                        console.error("كود الخطأ:", error.code);
                        return;
                    }

                    console.log("النتيجة اللي رجعت من الجدول:", data);
                    setProducts(data || []);
                } catch (error: any) {
                    console.error("خطأ في الكود نفسه:", error.message);
                } finally {
                    setLoading(false);
                }
            };

            // 2. تشغيل الجلب عند تحميل الصفحة
            useEffect(() => {
                fetchProducts();
            }, []);

            // --- منطق الفلترة ---
            const filteredProducts = products.filter(p => {
                const matchesCategory = category === 'الكل' || p.category === category;
                const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
            });

            // --- منطق السلة ---
            const addToCart = (product: any) => {
                setCartItems(prev => {
                    const exists = prev.find(item => item.id === product.id);
                    if (exists) {
                        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
                    }
                    return [...prev, { ...product, quantity: 1 }];
                });
                setIsCartOpen(true);
            };

            const updateQuantity = (id: any, delta: number) => {
                setCartItems(prev => prev.map(item =>
                    item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
                ));
            };

            const removeItem = (id: any) => {
                setCartItems(prev => prev.filter(item => item.id !== id));
            };

            const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            if (loading) return (
                <div className="h-screen flex items-center justify-center">
                    <Loader2 className="animate-spin text-gray-300" size={40} />
                </div>
            );

            return (
                <main className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12" dir="rtl">
                    <div className="max-w-[1600px] mx-auto">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-gray-100 pb-8 gap-6">
                            <div className="flex items-center gap-8 w-full md:w-auto">
                                <h1 className="text-4xl md:text-5xl font-serif text-gray-900">المجموعة</h1>
                                <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-black text-white rounded-full">
                                    <ShoppingBag size={20} />
                                    {cartItems.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                            {cartItems.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="relative w-full md:w-80">
                                <input
                                    type="text"
                                    placeholder="ابحث عن قطعة..."
                                    className="w-full bg-[#F9F9F9] py-4 px-12 rounded-full text-sm outline-none text-right"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="absolute right-4 top-4 text-gray-400" size={18} />
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-16">
                            {/* Sidebar */}
                            <aside className="w-full lg:w-64 space-y-10">
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-gray-400">التصنيفات</h3>
                                    <div className="flex flex-wrap lg:flex-col gap-2">
                                        {['الكل', 'فساتين', 'قمصان', 'بناطيل', 'جاكيتات'].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setCategory(cat)}
                                                className={`text-sm px-6 py-3 rounded-xl border transition-all ${category === cat ? 'bg-black text-white' : 'border-gray-100 text-gray-500 hover:border-black'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </aside>

                            {/* Grid */}
                            <div className="flex-1 grid gap-x-8 gap-y-16 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="group cursor-pointer">
                                        <div className="relative aspect-[3/4] bg-[#F9F9F9] overflow-hidden mb-6 rounded-[2rem]">
                                            <img
                                                src={product.images?.[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="absolute bottom-6 left-6 right-6 bg-white py-4 rounded-2xl text-[10px] font-black opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl hover:bg-black hover:text-white"
                                            >
                                                إضافة للسلة +
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center px-2">
                                            <p className="font-black text-zinc-900">{product.price} ر.س</p>
                                            <h3 className="font-serif text-lg text-zinc-800">{product.name}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- SIDE CART DRAWER --- */}
                    <div className={`fixed inset-0 z-[200] ${isCartOpen ? 'visible' : 'invisible'}`}>
                        <div
                            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0'}`}
                            onClick={() => setIsCartOpen(false)}
                        />
                        <div className={`absolute left-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-500 transform ${isCartOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                            <div className="flex flex-col h-full">
                                <div className="p-8 border-b flex justify-between items-center">
                                    <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                                        <X size={24} />
                                    </button>
                                    <h2 className="text-xl font-serif">سلة التسوق ({cartItems.length})</h2>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                    {cartItems.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                            <ShoppingBag size={48} strokeWidth={1} />
                                            <p>السلة فارغة حالياً</p>
                                        </div>
                                    ) : (
                                        cartItems.map((item) => (
                                            <div key={item.id} className="flex gap-6">
                                                <div className="w-24 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                    <img src={item.images?.[0]} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between py-1 text-right">
                                                    <div className="flex justify-between items-start">
                                                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <div>
                                                            <h4 className="font-bold text-sm">{item.name}</h4>
                                                            <p className="text-xs text-gray-400">{item.category}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-4">
                                                        <div className="flex items-center gap-4 bg-gray-50 px-3 py-1 rounded-lg">
                                                            <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-black text-gray-400"><Plus size={14} /></button>
                                                            <span className="text-sm font-bold">{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-black text-gray-400"><Minus size={14} /></button>
                                                        </div>
                                                        <p className="font-black text-sm">{item.price * item.quantity} ر.س</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {cartItems.length > 0 && (
                                    <div className="p-8 border-t space-y-6">
                                        <div className="flex justify-between items-center font-black text-lg">
                                            <span>{subtotal} ر.س</span>
                                            <span className="font-serif">المجموع الفرعي</span>
                                        </div>
                                        <button className="w-full bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl">
                                            إتمام عملية الشراء
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            );
        }