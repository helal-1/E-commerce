"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, Plus, X, Loader2, Palette } from 'lucide-react';

export default function AddProduct() {
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (images.length + files.length > 3) {
                alert("أقصى عدد هو 3 صور فقط");
                return;
            }
            setImages([...images, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const imageUrls = [];

        try {
            // 1. رفع الصور
            for (const file of images) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const { data, error } = await supabase.storage
                    .from('products-images')
                    .upload(fileName, file);

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('products-images')
                    .getPublicUrl(fileName);

                imageUrls.push(publicUrl);
            }

            // 2. حفظ البيانات مع التأكد من وجود قيم للمقاسات والألوان
            const sizesInput = formData.get('sizes') as string;
            const colorsInput = formData.get('colors') as string;

            const { error: dbError } = await supabase.from('products').insert([{
                name: formData.get('name'),
                price: parseFloat(formData.get('price') as string),
                description: formData.get('description'),
                category: formData.get('category'), // ضفت خانة القسم كمان
                images: imageUrls,
                sizes: sizesInput ? sizesInput.split(',').map(s => s.trim()) : [],
                colors: colorsInput ? colorsInput.split(',').map(c => c.trim()) : [],
            }]);

            if (dbError) throw dbError;

            alert("تم بنجاح! المنتج الآن في المتجر");
            setImages([]); setPreviews([]);
            (e.target as HTMLFormElement).reset();

        } catch (error: any) {
            alert("خطأ: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-10" dir="rtl">
            <h1 className="text-3xl font-black">إضافة منتج جديد</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    {/* اختيار الصور */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400">صور المنتج (3 صور)</label>
                        <div className="grid grid-cols-3 gap-4">
                            {previews.map((src, i) => (
                                <div key={i} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-100">
                                    <img src={src} className="w-full h-full object-cover" />
                                </div>
                            ))}
                            {previews.length < 3 && (
                                <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all">
                                    <Plus className="text-gray-300" />
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400">اسم المنتج</label>
                        <input name="name" required placeholder="مثلاً: قميص كتان ملكي" className="w-full bg-white border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400">القسم</label>
                        <select name="category" className="w-full bg-white border border-gray-100 p-4 rounded-2xl outline-none cursor-pointer">
                            <option value="قمصان">قمصان</option>
                            <option value="بناطيل">بناطيل</option>
                            <option value="فساتين">فساتين</option>
                            <option value="جاكيتات">جاكيتات</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400">السعر (ر.س)</label>
                        <input name="price" type="number" required placeholder="0.00" className="w-full bg-white border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* خانة الألوان الجديدة */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400">الألوان (افصل بينها بفاصلة ,)</label>
                        <input name="colors" placeholder="black, white, navy" className="w-full bg-white border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
                        <p className="text-[10px] text-gray-400 font-medium">* اكتب اسم اللون بالإنجليزي (مثل black) عشان يظهر في فلتر المتجر.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400">المقاسات (افصل بينها بفاصلة ,)</label>
                        <input name="sizes" placeholder="S, M, L, XL" className="w-full bg-white border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-400">الوصف</label>
                        <textarea name="description" rows={4} placeholder="وصف القطعة وخامتها..." className="w-full bg-white border border-gray-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-black/5" />
                    </div>

                    <button disabled={loading || images.length === 0} className="w-full bg-black text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-zinc-800 disabled:bg-gray-200 transition-all flex items-center justify-center gap-3">
                        {loading ? <Loader2 className="animate-spin" /> : "نشر المنتج الآن"}
                    </button>
                </div>
            </form>
        </div>
    );
}