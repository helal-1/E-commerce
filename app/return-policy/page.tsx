"use client";
import { RefreshCcw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReturnPolicy() {
    return (
        <div className="min-h-screen bg-[#FCFBF9] py-20 px-6 font-sans text-right" dir="rtl">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="border-b border-[#EDEAE5] pb-8">
                    <h1 className="text-4xl font-serif text-[#4A3E31]">سياسة الاستبدال والاسترجاع</h1>
                    <p className="text-[#8B735B] mt-2 font-bold uppercase tracking-widest text-xs">Returns & Exchanges</p>
                </div>

                <div className="grid gap-6">
                    <div className="bg-white p-8 rounded-3xl border border-[#EDEAE5] flex items-start gap-6">
                        <RefreshCcw className="text-[#8B735B] shrink-0" size={32} />
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-[#4A3E31]">المدة الزمنية</h3>
                            <p className="text-gray-500 leading-relaxed">يمكنكم استبدال أو استرجاع المنتج خلال **3 أيام** من تاريخ استلام الطلب، بشرط أن تكون القطعة بحالتها الأصلية.</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-[#EDEAE5] flex items-start gap-6">
                        <CheckCircle2 className="text-green-600 shrink-0" size={32} />
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-[#4A3E31]">شروط القبول</h3>
                            <ul className="text-gray-500 space-y-2 list-disc pr-5 font-medium">
                                <li>أن يكون المنتج غير مستخدم وبتاغ البراند الأصلي.</li>
                                <li>عدم وجود أي روائح عطرية أو آثار مساحيق تجميل.</li>
                                <li>المنتجات التي تم تعديل مقاساتها بناءً على طلب العميل لا تُرد ولا تُستبدل.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-red-50/30 p-8 rounded-3xl border border-red-100 flex items-start gap-6">
                        <AlertCircle className="text-red-500 shrink-0" size={32} />
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-red-900">رسوم الشحن</h3>
                            <p className="text-red-700/70">يتحمل العميل تكلفة الشحن لعملية الاسترجاع أو الاستبدال، إلا في حال وجود عيب مصنعي في القطعة.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}