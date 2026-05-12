"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Package,
    CheckCircle2,
    XCircle,
    Search,
    User,
    CreditCard,
    Loader2,
    Eye,
    X
} from 'lucide-react';

// تعريف الأنواع بدقة لمنع أخطاء الـ Any
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
    created_at: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    city: string;
    address: string;
    total_price: number;
    status: string;
    items?: OrderItem[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // مودال التفاصيل

    // نظام إشعارات الديسك توب
    const sendSystemNotification = useCallback((order: Order) => {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification("طلب جديد من Zelda Line! ✨", {
                body: `العميل ${order.customer_name} طلب منتجات بقيمة ${order.total_price} ج.م`,
                icon: "/favicon.ico"
            });
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return [];
        return (data as Order[]) || [];
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (typeof window !== "undefined" && "Notification" in window) {
            Notification.requestPermission();
        }

        const loadData = async () => {
            setLoading(true);
            const data = await fetchOrders();
            if (isMounted) {
                setOrders(data);
                setLoading(false);
            }
        };

        loadData();

        const ordersChannel = supabase
            .channel('realtime-orders-admin')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
                if (!isMounted) return;
                const newOrder = payload.new as Order;
                setOrders((prev) => [newOrder, ...prev]);
                sendSystemNotification(newOrder);
                new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3').play().catch(() => { });
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                loadData(); // تحديث القائمة في أي تغيير آخر
            })
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(ordersChannel);
        };
    }, [fetchOrders, sendSystemNotification]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        setProcessingId(orderId);
        const { data, error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select().single();

        if (!error && data) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (newStatus === 'completed') {
                await fetch('/api/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customerName: data.customer_name,
                        customerEmail: data.customer_email || 'no-email@provided.com',
                        orderId: data.id,
                        totalPrice: data.total_price
                    }),
                });
            }
        }
        setProcessingId(null);
        setSelectedOrder(null);
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_phone.includes(searchTerm);
        return matchesSearch && order.status === 'pending';
    });

    return (
        <div className="p-4 md:p-8 bg-[#FAFAFA] min-h-screen text-right font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">إدارة الطلبات</h1>
                        <p className="text-gray-500 mt-1 font-medium text-sm">متابعة الطلبات الجديدة الواردة للمتجر.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث باسم العميل أو الرقم..."
                            className="w-full pr-10 pl-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm font-bold text-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                <div className="grid gap-4">
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-300" size={40} /></div>
                    ) : filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:border-black/10 transition-all">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center text-black">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-gray-900">#{order.id.slice(0, 8)} - {order.customer_name}</h3>
                                    <p className="text-xs text-gray-400 font-bold">{order.city} | {order.total_price} ج.م</p>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="flex-1 md:flex-none px-4 py-3 bg-gray-50 text-gray-600 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                                >
                                    <Eye size={16} /> التفاصيل
                                </button>
                                <button
                                    disabled={processingId === order.id}
                                    onClick={() => updateStatus(order.id, 'completed')}
                                    className="flex-1 md:flex-none px-6 py-3 bg-black text-white rounded-xl text-xs font-black hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-lg shadow-black/10"
                                >
                                    {processingId === order.id ? <Loader2 className="animate-spin" size={16} /> : "اعتماد الطلب"}
                                </button>
                                <button
                                    onClick={() => updateStatus(order.id, 'cancelled')}
                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <XCircle size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- نافذة تفاصيل المنتجات (Modal) --- */}
                {selectedOrder && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                        <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-xl font-black text-gray-900">مراجعة الطلبية #{selectedOrder.id.slice(0, 8)}</h2>
                                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} /></button>
                            </div>

                            <div className="p-8 overflow-y-auto max-h-[70vh]">
                                <div className="grid grid-cols-2 gap-8 mb-10 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">معلومات المستلم</p>
                                        <p className="text-sm font-black">{selectedOrder.customer_name}</p>
                                        <p className="text-xs text-gray-500 font-bold">{selectedOrder.customer_phone}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">مكان التوصيل</p>
                                        <p className="text-sm font-black">{selectedOrder.city}</p>
                                        <p className="text-xs text-gray-500 font-bold">{selectedOrder.address}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">القطع المختارة</p>
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="flex gap-4 p-4 border border-gray-50 rounded-2xl bg-white hover:border-black/5 transition-all">
                                            <div className="w-20 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                                <img src={item.image || item.images?.[0]} className="w-full h-full object-cover" alt={item.name} />
                                            </div>
                                            <div className="flex-1 py-1">
                                                <h4 className="font-black text-sm text-gray-900">{item.name}</h4>
                                                <div className="flex gap-3 mt-2">
                                                    <span className="text-[10px] font-black px-2 py-1 bg-gray-50 rounded-md border text-gray-400 uppercase">Size: {item.size}</span>
                                                    <span className="text-[10px] font-black px-2 py-1 bg-gray-50 rounded-md border text-amber-900/40 uppercase">Color: {item.color}</span>
                                                </div>
                                                <p className="text-xs font-black mt-3 text-gray-900">{item.price} ج.م × {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">إجمالي الحساب</p>
                                        <p className="text-2xl font-black text-gray-900">{selectedOrder.total_price} EGP</p>
                                    </div>
                                    <button
                                        onClick={() => updateStatus(selectedOrder.id, 'completed')}
                                        className="w-full md:w-auto px-10 py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
                                    >
                                        اعتماد الطلبية الآن
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && filteredOrders.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-100">
                        <CheckCircle2 size={48} className="mx-auto text-gray-100 mb-4" />
                        <p className="text-gray-400 font-bold">لا توجد طلبات جديدة حالياً.</p>
                    </div>
                )}
            </div>
        </div>
    );
}