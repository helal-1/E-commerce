"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Package,
    CheckCircle2,
    XCircle,
    Search,
    User,
    MapPin,
    CreditCard
} from 'lucide-react';

interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    customer_phone: string;
    city: string;
    address: string;
    total_price: number;
    status: string;
    items?: any[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // دالة إرسال إشعار للنظام (Mobile/Desktop Notification)
    const sendSystemNotification = (order: Order) => {
        if (!("Notification" in window)) return;

        if (Notification.permission === "granted") {
            const notification = new Notification("Zelda Line - طلب جديد! ✨", {
                body: `وصل طلب جديد من ${order.customer_name} بقيمة ${order.total_price} ج.م`,
                icon: "/favicon.ico", // تأكد من وجود أيقونة للموقع
                badge: "/favicon.ico",
                tag: "new-order" // لمنع تكرار الإشعارات لنفس الحدث
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    };

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setOrders(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        // طلب إذن الإشعارات من الأدمن عند فتح الصفحة
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        fetchOrders();

        const ordersChannel = supabase
            .channel('realtime-orders-admin')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('طلب جديد وصل:', payload);
                    const newOrder = payload.new as Order;

                    // 1. إضافة الطلب للقائمة
                    setOrders((prev) => [newOrder, ...prev]);

                    // 2. إرسال إشعار للنظام
                    sendSystemNotification(newOrder);

                    // 3. تنبيه صوتي اختياري (اختياري: يمكنك إضافة ملف صوتي)
                    const audio = new Audio('/notification.mp3');
                    audio.play().catch(e => console.log("Audio play blocked"));
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                (payload) => {
                    setOrders((prev) =>
                        prev.map((order) =>
                            order.id === payload.new.id ? (payload.new as Order) : order
                        )
                    );
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'orders' },
                (payload) => {
                    setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(ordersChannel);
        };
    }, [fetchOrders]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        const { data, error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select()
            .single();

        if (error) {
            alert("خطأ في التحديث: " + error.message);
            return;
        }

        if (data) {
            setOrders(prevOrders =>
                prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order)
            );

            if (newStatus === 'completed') {
                const phoneNumber = data.customer_phone.replace(/\s+/g, '');
                const orderIdShort = data.id.slice(0, 8);
                const message = `مرحباً أ/ ${data.customer_name} ✨%0a%0a` +
                    `يسعدنا إبلاغك بأنه تم تأكيد طلبك رقم *#${orderIdShort}* بنجاح من *Zelda Line* 🛍️%0a%0a` +
                    `نحن الآن نقوم بتجهيز القطعة بكل حب، وسنقوم بالتواصل معكِ قريباً لتحديد موعد التسليم الدقيق.%0a%0a` +
                    `شكراً لثقتك بنا 🙏❤️`;

                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
                window.open(whatsappUrl, '_blank');
            }
        }
    };

    const filteredOrders = orders.filter(order => {
        const name = order.customer_name?.toLowerCase() || "";
        const phone = order.customer_phone || "";
        const matchesSearch = name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm);
        const isPending = order.status === 'pending';
        return matchesSearch && isPending;
    });

    return (
        <div className="p-4 md:p-8 bg-[#FAFAFA] min-h-screen" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight tracking-tighter">إدارة الطلبات</h1>
                        <p className="text-gray-500 mt-1 font-medium text-sm">تابع طلبات العملاء وحالات الشحن لحظة بلحظة.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="بحث باسم العميل أو الرقم..."
                            className="w-full pr-10 pl-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Desktop View Table */}
                <div className="hidden md:block bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">الطلب</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">العميل</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">التفاصيل</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">الإجمالي</th>
                                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-10 text-center text-gray-400 font-bold">جاري التحميل...</td></tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors animate-in fade-in duration-500">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-black">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">#{order.id.slice(0, 8)}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">
                                                    {new Date(order.created_at).toLocaleDateString('ar-EG')}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 font-bold text-sm">{order.customer_name}<br /><span className="text-xs text-gray-400 font-medium">{order.customer_phone}</span></td>
                                    <td className="p-6">
                                        <p className="text-xs text-gray-600 truncate max-w-50 font-medium">{order.city} - {order.address}</p>
                                        <p className="text-[10px] font-black text-black mt-1">{order.items?.length || 0} منتجات</p>
                                    </td>
                                    <td className="p-6 font-black text-sm text-gray-900">{order.total_price} EGP</td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => updateStatus(order.id, 'completed')} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"><CheckCircle2 size={18} /></button>
                                            <button onClick={() => updateStatus(order.id, 'cancelled')} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><XCircle size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Cards */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="text-center p-10 text-gray-400 font-bold">جاري التحميل...</div>
                    ) : filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="p-2 bg-black/5 rounded-lg text-black"><Package size={16} /></span>
                                    <span className="font-black text-sm">#{order.id.slice(0, 8)}</span>
                                </div>
                                <span className="text-[10px] bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-black">قيد الانتظار</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-2 border-y border-gray-50">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><User size={10} /> العميل</p>
                                    <p className="text-xs font-bold">{order.customer_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1"><CreditCard size={10} /> المبلغ</p>
                                    <p className="text-xs font-black">{order.total_price} EGP</p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button onClick={() => updateStatus(order.id, 'completed')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-xs font-bold"><CheckCircle2 size={16} /> اعتماد</button>
                                <button onClick={() => updateStatus(order.id, 'cancelled')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold"><XCircle size={16} /> إلغاء</button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredOrders.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white rounded-4xl border border-gray-50 mt-4">
                        <Package size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold">لا توجد طلبات جديدة بانتظارك حالياً</p>
                    </div>
                )}
            </div>
        </div>
    );
}