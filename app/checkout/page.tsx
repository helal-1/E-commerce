"use client";
import { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    MapPin, Phone, User, Mail, ArrowRight, CheckCircle2,
    ShoppingBag, Truck, Wallet, AlertCircle, X, MessageCircle,
    Upload, ImageIcon, Loader2
} from 'lucide-react';

const WHATSAPP_SUPPORT_NUMBER = "201092882189";
const WALLET_NUMBER = "01092882189";
const RECEIPTS_BUCKET = "payment-receipts";
const MAX_RECEIPT_SIZE_MB = 5;

interface CartItem {
    id: string | number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    size: string;
    color: string;
}

export default function CheckoutPage() {
    const { cartItems, subtotal, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(false);
    const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'wallet'>('cod');
    const [copied, setCopied] = useState(false);
    
    // ✅ حفظ السعر قبل تفريغ السلة لمنع ظهور القيمة صفر
    const [savedTotal, setSavedTotal] = useState<number>(0);

    // 📸 حالة رفع الإيصال
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', city: '', address: ''
    });

    const [alertState, setAlertState] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
        show: false, msg: '', type: 'success'
    });

    const showAlert = (msg: string, type: 'success' | 'error') => {
        setAlertState({ show: true, msg, type });
        setTimeout(() => setAlertState(prev => ({ ...prev, show: false })), 5000);
    };

    const handleCopyWallet = async () => {
        try {
            await navigator.clipboard.writeText(WALLET_NUMBER);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            showAlert("تعذر نسخ الرقم، انسخه يدوياً", "error");
        }
    };

    // 📸 اختيار صورة الإيصال
    const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showAlert("الرجاء اختيار صورة فقط (JPG / JPEG / PNG)", "error");
            return;
        }
        if (file.size > MAX_RECEIPT_SIZE_MB * 1024 * 1024) {
            showAlert(`حجم الصورة لا يجب أن يتجاوز ${MAX_RECEIPT_SIZE_MB} ميجابايت`, "error");
            return;
        }

        setReceiptFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setReceiptPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleRemoveReceipt = () => {
        setReceiptFile(null);
        setReceiptPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // 🟢 إرسال الإيصال للواتساب (مع رفع للستوريدج)
    const handleSendReceipt = async () => {
        if (!receiptFile) {
            showAlert("يرجى رفع صورة إيصال التحويل أولاً", "error");
            return;
        }

        setUploadingReceipt(true);
        try {
            const ext = receiptFile.name.split('.').pop() || 'jpg';
            const safeExt = ext.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';
   
            
            const filePath = `${completedOrderId}/${Date.now()}.${safeExt}`;

          const { error: uploadError } = await supabase
    .storage
    .from(RECEIPTS_BUCKET)
    .upload(filePath, receiptFile, { // يفضل إرسال الـ file مباشرة أو كـ blob
        cacheControl: '3600',
        upsert: false,
        contentType: receiptFile.type,
    });

            if (uploadError) throw uploadError;

            const { data: publicData } = supabase
                .storage
                .from(RECEIPTS_BUCKET)
                .getPublicUrl(filePath);

            const receiptUrl = publicData.publicUrl;

            // 3) تحديث الطلب بلينك الإيصال والحفاظ على حالة 'pending_payment' لكي لا يختفي عند الـ Admin
            if (completedOrderId) {
                await supabase
                    .from('orders')
                    .update({ receipt_url: receiptUrl, status: 'pending_payment' })
                    .eq('id', completedOrderId);
            }

            const msg =
`مرحباً زيلدا لاين 👋
لقد قمت بتحويل مبلغ ${savedTotal.toLocaleString()} ج.م للطلب رقم #${completedOrderId?.slice(0, 8)}.

📎 إيصال التحويل:
${receiptUrl}`;

            window.open(
                `https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent(msg)}`,
                '_blank'
            );
            showAlert("تم رفع الإيصال بنجاح وتوجيهك للدعم ✓", "success");
        } catch (err) {
            const e = err as Error;
            showAlert(`تعذر رفع الإيصال: ${e.message}`, "error");
        } finally {
            setUploadingReceipt(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading || cartItems.length === 0) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const finalTotal = Math.round(subtotal);

            const basePayload = {
                customer_name: formData.name,
                customer_phone: formData.phone,
                customer_email: formData.email,
                city: formData.city,
                address: formData.address,
                total_price: finalTotal,
                items: cartItems,
                user_id: user?.id || null,
            };

            if (paymentMethod === 'cod') {
                const { data: orderData, error } = await supabase
                    .from('orders')
                    .insert([{ ...basePayload, status: 'pending', payment_id: 'COD' }])
                    .select('id')
                    .single();

                if (error) throw error;

                setSavedTotal(finalTotal);
                setCompletedOrderId(orderData?.id ?? null);
                setOrderCompleted(true);
                clearCart();
                setTimeout(() => router.push('/'), 5000);
            } else {
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .insert([{ ...basePayload, status: 'pending_payment', payment_id: 'WALLET_PENDING' }])
                    .select('id')
                    .single();

                if (orderError) throw orderError;

                // ✅ حفظ القيمة الإجمالية أولاً قبل تفريغ السلة ومسح المنتجات
                setSavedTotal(finalTotal);
                setCompletedOrderId(orderData?.id ?? null);
                setOrderCompleted(true);
                clearCart();
            }
        } catch (error: unknown) {
            const err = error as Error;
            showAlert(err.message, 'error');
            setLoading(false);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // ✅ شاشات النجاح
    // ═══════════════════════════════════════════════════════════
    if (orderCompleted) {
        if (paymentMethod === 'wallet') {
            return (
                <div className="min-h-screen bg-white flex items-center justify-center p-4" dir="rtl">
                    <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500 bg-[#FAFAFA] p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">

                        <div className="w-20 h-20 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto">
                            <Wallet size={40} strokeWidth={1.5} />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">طلبك مسجل وجاهز للدفع!</h1>
                            <p className="text-xs text-gray-400 font-bold">رقم الطلب: #{completedOrderId?.slice(0, 8)}</p>
                        </div>

                        {/* 📋 كارت رقم المحفظة والسعر الصحيح المحفوظ */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 text-right space-y-4 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 rounded-bl-2xl text-[9px] font-black uppercase tracking-wider">
                                فودافون كاش
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-stone-100/60">
                                <span className="text-xs font-bold text-stone-500">المبلغ المطلوب تحويله:</span>
                                <span className="text-xl font-black text-stone-900 font-serif">
                                    {savedTotal.toLocaleString()} <span className="text-xs font-black">ج.م</span>
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم المحفظة المعتمد</span>
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border mt-1">
                                    <span className="font-black text-gray-950 tracking-widest text-base">{WALLET_NUMBER}</span>
                                    <button
                                        onClick={handleCopyWallet}
                                        className="text-[10px] bg-black text-white px-3 py-1.5 rounded-lg font-black hover:bg-gray-800 transition-colors"
                                    >
                                        {copied ? "تم النسخ ✓" : "نسخ الرقم"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 📸 رفع صورة الإيصال */}
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 text-right space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    صورة إيصال التحويل
                                </span>
                                <span className="text-[9px] font-bold text-gray-300">
                                    JPG / PNG · حتى {MAX_RECEIPT_SIZE_MB}MB
                                </span>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                        accept="image/jpeg, image/jpg, image/png"
                                onChange={handleReceiptChange}
                                className="hidden"
                            />

                            {!receiptPreview ? (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-gray-200 hover:border-black hover:bg-gray-50 rounded-2xl py-6 flex flex-col items-center justify-center gap-2 transition-colors"
                                >
                                    <Upload size={22} className="text-gray-400" />
                                    <span className="text-xs font-black text-gray-700">اضغط لرفع صورة الإيصال</span>
                                    <span className="text-[10px] font-bold text-gray-400">Screenshot من تطبيق المحفظة</span>
                                </button>
                            ) : (
                                <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={receiptPreview}
                                        alt="إيصال التحويل"
                                        className="w-full max-h-64 object-contain bg-gray-50"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveReceipt}
                                        className="absolute top-2 left-2 bg-black/80 text-white rounded-full p-1.5 hover:bg-black transition-colors"
                                        aria-label="إزالة الصورة"
                                    >
                                        <X size={14} />
                                    </button>
                                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1.5">
                                        <ImageIcon size={12} className="text-gray-700" />
                                        <span className="text-[10px] font-black text-gray-700 truncate max-w-[150px]">
                                            {receiptFile?.name}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-gray-400 leading-relaxed font-bold px-4">
                            * بعد تحويل المبلغ من محفظتك، ارفع صورة الإيصال هنا واضغط الزر بالأسفل لإرسالها للدعم وتفعيل الطلب فوراً.
                        </p>

                        <button
                            onClick={handleSendReceipt}
                            disabled={!receiptFile || uploadingReceipt}
                            className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#1ebe5d] transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploadingReceipt ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    جاري رفع الإيصال...
                                </>
                            ) : (
                                <>
                                    <MessageCircle size={18} />
                                    إرسال الإيصال للدعم
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => router.push('/')}
                            className="text-xs text-gray-400 font-bold hover:text-gray-700 transition-colors"
                        >
                            العودة للرئيسية
                        </button>
                    </div>
                </div>
            );
        }

        // ✅ شاشة نجاح الـ COD
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4" dir="rtl">
                <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500 bg-[#FAFAFA] p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
                    <div className="w-20 h-20 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto">
                        <CheckCircle2 size={40} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tighter">تم تأكيد طلبك بنجاح!</h1>
                        <p className="text-xs text-gray-400 font-bold">رقم الطلب: #{completedOrderId?.slice(0, 8)}</p>
                    </div>
                    <p className="text-sm text-gray-500 font-bold leading-relaxed">
                        هيتم التواصل معاك خلال 24 ساعة لتأكيد الطلب والشحن. شكراً لثقتك في زيلدا لاين 🖤
                    </p>
                    <p className="text-[10px] text-gray-300 font-bold">سيتم تحويلك للرئيسية تلقائياً...</p>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════
    // 📝 فورم الـ Checkout
    // ═══════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-white" dir="rtl">
            {alertState.show && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-3 max-w-md w-[90%]">
                    {alertState.type === 'success' ? <CheckCircle2 className="text-green-500" size={20} /> : <AlertCircle className="text-red-500" size={20} />}
                    <p className="text-xs font-bold text-gray-800 flex-1">{alertState.msg}</p>
                    <button onClick={() => setAlertState(prev => ({ ...prev, show: false }))} className="opacity-40 hover:opacity-100 transition-opacity">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-900">
                        <ArrowRight size={20} />
                    </button>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Checkout</p>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tighter">إتمام الشراء</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* 01 — تفاصيل المستلم */}
                        <div className="bg-[#FAFAFA] p-6 rounded-3xl border border-gray-100 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black bg-black text-white px-2 py-1 rounded-md">01</span>
                                <h2 className="text-sm font-black text-gray-900 tracking-tight">تفاصيل المستلم</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الاسم الكامل</label>
                                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 gap-2">
                                        <User size={16} className="text-gray-400" />
                                        <input required type="text" placeholder="الاسم بالكامل"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="flex-1 py-3 text-sm font-bold bg-transparent outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم الكاش (أو رقم التواصل)</label>
                                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 gap-2">
                                        <Phone size={16} className="text-gray-400" />
                                        <input required type="tel" placeholder="01XXXXXXXXX"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="flex-1 py-3 text-sm font-bold bg-transparent outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">البريد الإلكتروني</label>
                                <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 gap-2">
                                    <Mail size={16} className="text-gray-400" />
                                    <input required type="email" placeholder="you@domain.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="flex-1 py-3 text-sm font-bold bg-transparent outline-none" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المحافظة / المدينة</label>
                                    <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 gap-2">
                                        <MapPin size={16} className="text-gray-400" />
                                        <input required type="text" placeholder="القاهرة"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="flex-1 py-3 text-sm font-bold bg-transparent outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">العنوان التفصيلي</label>
                                    <input required type="text" placeholder="الشارع - رقم المبنى - شقة"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* 02 — طريقة الدفع */}
                        <div className="bg-[#FAFAFA] p-6 rounded-3xl border border-gray-100 space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black bg-black text-white px-2 py-1 rounded-md">02</span>
                                <h2 className="text-sm font-black text-gray-900 tracking-tight">طريقة الدفع</h2>
                            </div>

                            <div onClick={() => !loading && setPaymentMethod('cod')}
                                className={`p-6 border-2 rounded-3xl flex justify-between items-center cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-300'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                                        <Truck size={20} className="text-gray-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">الدفع عند الاستلام (كاش)</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cash on delivery</p>
                                    </div>
                                </div>
                                {paymentMethod === 'cod' && <CheckCircle2 size={20} className="text-black" />}
                            </div>

                            <div onClick={() => !loading && setPaymentMethod('wallet')}
                                className={`p-6 border-2 rounded-3xl flex justify-between items-center cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-300'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                                        <Wallet size={20} className="text-gray-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">المحافظ الإلكترونية (فودافون كاش، اتصالات، أورنج)</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Wallets — Smart Pay</p>
                                        <p className="text-[10px] font-bold text-green-600 mt-1">
                                            هتظهرلك شاشة فيها رقم المحفظة ورفع الإيصال بضغطة زرار ✓
                                        </p>
                                    </div>
                                </div>
                                {paymentMethod === 'wallet' && <CheckCircle2 size={20} className="text-black" />}
                            </div>
                        </div>
                    </div>

                    {/* ملخص الحقيبة */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#FAFAFA] p-6 rounded-3xl border border-gray-100 space-y-5 sticky top-4">
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={18} className="text-gray-700" />
                                <h2 className="text-sm font-black text-gray-900 tracking-tight">ملخص الحقيبة</h2>
                            </div>

                            <div className="space-y-3 max-h-72 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 items-start">
                                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-gray-900 truncate">{item.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400">Size: {item.size} / Qty: {item.quantity}</p>
                                            <p className="text-xs font-black text-gray-900 mt-1">{Math.round(item.price * item.quantity).toLocaleString()} ج.م</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                <div className="flex justify-between text-xs font-bold text-gray-500">
                                    <span>المجموع</span>
                                    <span>{Math.round(subtotal).toLocaleString()} ج.م</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-gray-500">
                                    <span>الشحن</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>{Math.round(subtotal).toLocaleString()} EGP</span>
                                </div>
                            </div>

                            <button type="submit" disabled={loading || cartItems.length === 0}
                                className="w-full bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        {paymentMethod === 'wallet' ? "جاري تسجيل الطلب..." : "جاري تسجيل طلبك..."}
                                    </>
                                ) : (
                                    paymentMethod === 'wallet'
                                        ? "تأكيد الطلب وعرض بيانات الدفع"
                                        : "تأكيد طلب الدفع عند الاستلام"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}