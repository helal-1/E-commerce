"use client";
import { Star, ShieldCheck, Heart } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#FCFBF9] py-20 px-6 font-sans text-right" dir="rtl">
            <div className="max-w-4xl mx-auto space-y-16">
                <header className="text-center space-y-4">
                    <h1 className="text-5xl font-serif text-[#4A3E31] tracking-tighter">قصة ZELDA LINE</h1>
                    <p className="text-[#8B735B] font-medium italic">حيث تلتقي الأصالة بالفخامة العصرية</p>
                </header>

                <div className="bg-white p-10 rounded-4xl border border-[#EDEAE5] shadow-sm leading-relaxed text-[#4A3E31] space-y-6">
                    <p className="text-lg">
                        بدأت رحلتنا في **ZELDA LINE** بشغف نحو إعادة تعريف الأناقة العربية. نحن لا نصمم مجرد ملابس، بل نصنع قطعاً فنية تحكي قصة كل امرأة تسعى للتميز والاحتفاظ بهويتها في آن واحد.
                    </p>
                    <p>
                        كل خيط نستخدمه، وكل قصة نعتمدها، تمر بمراحل دقيقة من العناية لضمان أن ما ترتدينه ليس مجرد قطعة قماش، بل هو شعور بالثقة والفخر.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-[#F7F3F0] rounded-full flex items-center justify-center mx-auto text-[#8B735B]"><Star size={28} /></div>
                        <h3 className="font-serif text-xl">جودة استثنائية</h3>
                        <p className="text-sm text-gray-500">نختار أفخم الخامات لضمان ديمومة القطعة.</p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-[#F7F3F0] rounded-full flex items-center justify-center mx-auto text-[#8B735B]"><Heart size={28} /></div>
                        <h3 className="font-serif text-xl">صنع بحب</h3>
                        <p className="text-sm text-gray-500">نهتم بأدق التفاصيل من التطريز حتى التغليف.</p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-[#F7F3F0] rounded-full flex items-center justify-center mx-auto text-[#8B735B]"><ShieldCheck size={28} /></div>
                        <h3 className="font-serif text-xl">ثقة متبادلة</h3>
                        <p className="text-sm text-gray-500">رضاكم هو محركنا الأساسي في كل تشكيلة.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}