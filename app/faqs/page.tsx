"use client";
import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

export default function FAQs() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        { q: "كم يستغرق توصيل الطلب؟", a: "يستغرق التوصيل داخل القاهرة والجيزة من 2-3 أيام عمل، وباقي المحافظات من 4-6 أيام عمل." },
        { q: "هل يتوفر تعديل على المقاسات؟", a: "نعم، نوفر خدمة التعديل المجانية لبعض القطع قبل الشحن، ولكن يرجى العلم أن القطع المعدلة لا يمكن استرجاعها." },
        { q: "كيف أعرف مقاسي الصحيح؟", a: "نوفر جدول مقاسات تفصيلي في صفحة كل منتج، كما يمكنك التواصل معنا عبر الواتساب لمساعدتك في اختيار المقاس الأنسب." },
        { q: "هل يمكنني الدفع عند الاستلام؟", a: "نعم، نوفر خدمة الدفع عند الاستلام لجميع محافظات مصر لضمان ثقتكم وراحتكم." }
    ];

    return (
        <div className="min-h-screen bg-[#FCFBF9] py-20 px-6 font-sans text-right" dir="rtl">
            <div className="max-w-3xl mx-auto space-y-12">
                <header className="flex items-center gap-4 border-b border-[#EDEAE5] pb-8">
                    <HelpCircle className="text-[#8B735B]" size={40} />
                    <div>
                        <h1 className="text-4xl font-serif text-[#4A3E31]">الأسئلة الشائعة</h1>
                        <p className="text-gray-400 font-medium">كل ما تحتاجين معرفته عن تجربة التسوق لدينا</p>
                    </div>
                </header>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white border border-[#EDEAE5] rounded-3xl overflow-hidden shadow-sm">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-all"
                            >
                                <span className="font-bold text-[#4A3E31] text-lg">{faq.q}</span>
                                {openIndex === index ? <Minus size={20} className="text-[#8B735B]" /> : <Plus size={20} className="text-[#8B735B]" />}
                            </button>
                            {openIndex === index && (
                                <div className="p-6 pt-0 text-gray-500 leading-relaxed border-t border-gray-50 animate-in slide-in-from-top duration-300">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}