"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image'; // تحسين الأداء بالصور
import { Upload, Plus, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AddProduct() {
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [alert, setAlert] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
        show: false,
        msg: '',
        type: 'success'
    });

    // استخدام useCallback لمنع تكرار الـ Effect وحل مشكلة Dependency
    const hideAlert = useCallback(() => {
        setAlert(prev => ({ ...prev, show: false }));
    }, []);

    useEffect(() => {
        if (alert.show) {
            const timer = setTimeout(hideAlert, 4000);
            return () => clearTimeout(timer);
        }
    }, [alert.show, hideAlert]);

    const showAlert = (msg: string, type: 'success' | 'error') => {
        setAlert({ show: true, msg, type });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (images.length + files.length > 3) {
                showAlert("أقصى عدد هو 3 صور فقط للقطعة الواحدة", 'error');
                return;
            }
            setImages(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const imageUrls: string[] = [];

        try {
            // 1. رفع الصور
            for (const file of images) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('products-images')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('products-images')
                    .getPublicUrl(fileName);

                imageUrls.push(urlData.publicUrl);
            }

            // 2. حفظ البيانات
            const sizesInput = formData.get('sizes') as string;
            const colorsInput = formData.get('colors') as string;

            const { error: dbError } = await supabase.from('products').insert([{
                name: formData.get('name'),
                price: parseFloat(formData.get('price') as string),
                description: formData.get('description'),
                category: formData.get('category'),
                images: imageUrls,
                sizes: sizesInput ? sizesInput.split(',').map(s => s.trim()) : [],
                colors: colorsInput ? colorsInput.split(',').map(c => c.trim()) : [],
            }]);

            if (dbError) throw dbError;

            showAlert("تمت إضافة القطعة بنجاح! تظهر الآن في المتجر", 'success');
            setImages([]);
            setPreviews([]);
            (e.target as HTMLFormElement).reset();

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
            showAlert("فشل في الإضافة: " + message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 py-16 px-6 text-right font-sans" dir="rtl">

            {/* Custom Alert */}
            {alert.show && (
                <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-100 min-w-[320px] flex items-center gap-3 p-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top duration-300 ${alert.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-red-100 text-red-800'
                    }`}>
                    {alert.type === 'success' ? <CheckCircle2 className="text-green-500" /> : <AlertCircle className="text-red-500" />}
                    <p className="text-sm font-bold flex-1">{alert.msg}</p>
                    <button onClick={hideAlert} className="opacity-50 hover:opacity-100">
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="space-y-2 border-b border-gray-100 pb-8 font-serif">
                <h1 className="text-4xl text-[#4A3E31]">إضافة قطعة فنية</h1>
                <p className="text-gray-400 font-medium">املئي التفاصيل لإدراج منتج جديد في Zelda Line</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">معرض الصور (3 صور كحد أقصى)</label>
                        <div className="grid grid-cols-3 gap-4">
                            {previews.map((src, i) => (
                                <div key={i} className="aspect-3/4 bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100 group">
                                    <Image src={src} alt="Preview" fill className="object-cover transition-transform group-hover:scale-105" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {previews.length < 3 && (
                                <label className="aspect-3/4 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-black/20 transition-all group">
                                    <Plus className="text-gray-300 group-hover:text-black transition-colors" />
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">اسم المنتج</label>
                        <input name="name" required placeholder="مثلاً: عباءة كريب ملكي" className="w-full bg-[#F7F3F0] border-transparent p-4 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all font-bold text-[#4A3E31]" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">القسم</label>
                        <select name="category" className="w-full bg-[#F7F3F0] border-transparent p-4 rounded-2xl outline-none cursor-pointer font-bold text-[#4A3E31]">
                            <option value="فساتين">فساتين</option>
                            <option value="الأساسيات">الأساسيات</option>
                            <option value="جاكيتات">جاكيتات</option>
                            <option value="جديد">جديد</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">السعر (ج.م)</label>
                        <input name="price" type="number" required placeholder="0.00" className="w-full bg-[#F7F3F0] border-transparent p-4 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all font-bold text-[#4A3E31]" />
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">الألوان (افصلي بفاصلة ,)</label>
                        <input name="colors" placeholder="Black, White, Gold" className="w-full bg-[#F7F3F0] border-transparent p-4 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all font-bold text-[#4A3E31]" />
                        <p className="text-[10px] text-gray-400 font-medium italic">* تظهر الألوان كفلاتر ذكية في المتجر.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">المقاسات (افصلي بفاصلة ,)</label>
                        <input name="sizes" placeholder="S, M, L, XL" className="w-full bg-[#F7F3F0] border-transparent p-4 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all font-bold text-[#4A3E31]" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">الوصف الفني</label>
                        <textarea name="description" rows={5} placeholder="تحدثي عن الخامة، القصة..." className="w-full bg-[#F7F3F0] border-transparent p-4 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-black/5 transition-all font-bold text-[#4A3E31] leading-relaxed" />
                    </div>

                    <button
                        disabled={loading || images.length === 0}
                        className="w-full bg-[#4A3E31] text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-black disabled:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-xl shadow-black/10 active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                <Upload size={18} />
                                نشر القطعة في المتجر
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}