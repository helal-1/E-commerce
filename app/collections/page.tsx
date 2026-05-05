"use client";

import Link from 'next/link';
import Image from 'next/image';

const collections = [
    {
        id: 'essentials',
        title: 'مجموعة الأساسيات',
        subtitle: 'للإطلالة اليومية الأنيقة',
        image: '/pngtree-the-clothes-are-hanging-on-rack-picture-image_16423437.jpg',
        href: '/shop?category=essentials',
        gridSpan: 'md:col-span-2'
    },
    {
        id: 'occasions',
        title: 'فساتين المناسبات',
        subtitle: 'تألقي في لحظاتكِ الخاصة',
        image: '/3f2e5d1738c222a00d35d6fcb52db56b.jpg',
        href: '/shop?category=occasions',
        gridSpan: 'md:col-span-1'
    },
    {
        id: 'new-season',
        title: 'تشكيلة الموسم',
        subtitle: 'أحدث صيحات الموضة المحتشمة',
        image: '/pngtree-row-of-colorful-robes-hanging-on-a-rack-picture-image_15858673.jpg',
        href: '/shop?category=new',
        gridSpan: 'md:col-span-3'
    }
];

export default function CollectionsPage() {
    return (
        <main className="min-h-screen bg-white pb-20" dir="rtl">
            {/* Header */}
            <header className="py-20 px-6 text-center bg-stone-50">
                <span className="text-stone-400 font-black tracking-[0.3em] text-xs uppercase block mb-4">ZELDA LINE CURATED</span>
                <h1 className="text-5xl md:text-7xl font-serif text-gray-900 italic">المجموعات</h1>
                <p className="mt-6 text-gray-500 max-w-lg mx-auto font-medium">
                    تم تصميم كل مجموعة بعناية فائقة لتناسب ذوقكِ الرفيع واحتياجاتكِ المختلفة.
                </p>
            </header>

            {/* Grid */}
            <section className="max-w-7xl mx-auto px-6 mt-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {collections.map((col) => (
                        <Link
                            key={col.id}
                            href={col.href}
                            className={`relative group overflow-hidden h-[500px] ${col.gridSpan}`}
                        >
                            {/* Image */}
                            <Image
                                src={col.image}
                                alt={col.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-500" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                                <h2 className="text-4xl font-serif mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    {col.title}
                                </h2>
                                <p className="text-sm font-light tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-700 uppercase">
                                    {col.subtitle}
                                </p>

                                {/* Button Look */}
                                <div className="mt-8 px-8 py-3 border border-white text-xs font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-700 hover:bg-white hover:text-black">
                                    اكتشفي المجموعة
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Philosophy Placeholder */}
            <section className="mt-32 text-center px-6">
                <div className="max-w-2xl mx-auto border-y border-stone-100 py-12">
                    <p className="text-xl font-serif italic text-stone-600">
                        &quot;الأناقة ليست في لفت الانتباه، بل في البقاء في الذاكرة.&quot;
                    </p>
                </div>
            </section>
        </main>
    );
}