"use client";
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import {
    Truck,
    MessageCircle,
    Trash2,
    MapPin,
    User,
    Package,
    Loader2
} from 'lucide-react';

interface OrderItem {
    name: string;
    image?: string;
    images?: string[];
    size: string;
    color: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    customer_name: string;
    customer_phone: string;
    city: string;
    address: string;
    total_price: number;
    items: OrderItem[];
}

export default function ShippingPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState<{ show: boolean, id: string | null }>({ show: false, id: null });

    // 1. الدالة الأساسية لجلب البيانات
    const fetchShippingOrders = useCallback(async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'completed')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error.message);
            return [];
        }
        return (data as Order[]) || [];
    }, []);

    // 2. الـ useEffect المعدل لحل مشكلة setState synchronously
    useEffect(() => {
        let isMounted = true; // لمنع تحديث الحالة لو الصفحة اتقفلت

        const loadData = async () => {
            setLoading(true);
            const data = await fetchShippingOrders();
            if (isMounted) {
                setOrders(data);
                setLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [fetchShippingOrders]);

    const removeOrder = async () => {
        if (!showConfirm.id) return;

        const orderId = showConfirm.id;
        const { error: deleteError } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (!deleteError) {
            setOrders(prev => prev.filter(o => o.id !== orderId));
            setShowConfirm({ show: false, id: null });
        } else {
            alert("حدث خطأ أثناء الحذف: " + deleteError.message);
        }
    };

    return (
        <div className="p-4 md:p-8 bg-[#FAFAFA] min-h-screen text-right font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center gap-4 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-14 h-14 bg-black text-white rounded-3xl flex items-center justify-center shadow-2xl">
                        <Truck size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">قائمة الشحن</h1>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Shipping Management</p>
                    </div>
                </header>

                <main className="grid gap-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-gray-300">
                            <Loader2 className="animate-spin mb-4" size={40} />
                            <p className="font-bold">جاري تحميل الشحنات...</p>
                        </div>
                    ) : orders.map((order, index) => (
                        <div key={order.id}
                            style={{ animationDelay: `${index * 100}ms` }}
                            className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <User size={14} />
                                        <span className="text-[10px] font-black uppercase">Recipient</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-lg text-gray-900 mb-2">{order.customer_name}</p>
                                        <p className="text-sm font-bold text-gray-400">{order.customer_phone}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <MapPin size={14} />
                                        <span className="text-[10px] font-black uppercase">Destination</span>
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-gray-900 mb-1">{order.city}</p>
                                        <p className="text-xs text-gray-400 font-medium leading-relaxed">{order.address}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 lg:col-span-1">
                                    <div className="flex items-center gap-2 text-gray-300 mb-2">
                                        <Package size={14} />
                                        <span className="text-[10px] font-black uppercase">Items</span>
                                    </div>
                                    <div className="space-y-3">
                                        {order.items?.map((item, i) => (
                                            <div key={`${order.id}-${i}`} className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-50 group hover:bg-white transition-all">
                                                <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm relative">
                                                    <Image
                                                        src={(item.image || item.images?.[0]) || '/placeholder.png'}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-gray-800 line-clamp-1">{item.name}</span>
                                                    <div className="flex gap-2 mt-1.5">
                                                        <span className="text-[9px] font-black px-2 py-0.5 bg-white rounded-md border border-gray-100 text-gray-400 italic">M: {item.size}</span>
                                                        <span className="text-[9px] font-black px-2 py-0.5 bg-white rounded-md border border-gray-100 text-amber-900/40 uppercase">C: {item.color}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-300 uppercase">Total</span>
                                        <p className="font-black text-sm text-black">{order.total_price} EGP</p>
                                    </div>
                                </div>

                                <div className="flex lg:flex-col justify-center gap-4">
                                    <a
                                        href={`https://wa.me/${order.customer_phone.replace(/\s+/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-3 bg-green-500 text-white py-5 rounded-3xl font-black text-xs hover:bg-green-600 transition-all shadow-xl shadow-green-500/20 active:scale-95"
                                    >
                                        <MessageCircle size={20} /> تواصل واتساب
                                    </a>
                                    <button
                                        onClick={() => setShowConfirm({ show: true, id: order.id })}
                                        className="flex-1 flex items-center justify-center gap-3 bg-white text-red-500 border-2 border-red-50 py-5 rounded-3xl font-black text-xs hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                    >
                                        <Trash2 size={20} /> إزالة الشحنة
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </main>
            </div>

            {showConfirm.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowConfirm({ show: false, id: null })} />
                    <div className="relative bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">حذف نهائي؟</h3>
                        <p className="text-gray-500 text-sm mt-2 mb-6">سيتم مسح البيانات تماماً من السجل.</p>
                        <div className="flex gap-3">
                            <button onClick={removeOrder} className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black text-xs hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all">احذف</button>
                            <button onClick={() => setShowConfirm({ show: false, id: null })} className="flex-1 bg-gray-50 text-gray-400 py-4 rounded-2xl font-black text-xs">تراجع</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}