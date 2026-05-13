"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  MessageCircle,
  Truck,
  ShieldCheck,
  Gift,
  Star,
  Plus,
  Camera,
  ArrowRight,
  Tag
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  discount?: number;
  category: string;
  images: string[];
}

const CDN_URL = "https://mcliojobvbbepdmxqchs.supabase.co/storage/v1/object/public/products-images/";

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [heroTextIndex, setHeroTextIndex] = useState(0);

  const heroWords = useMemo(() => ["عفة", "أناقة", "تميز"], []);

  const instaImages = useMemo(() => [
    "/photo-1515886657613-9f3515b0c78f.jpeg",
    "/herobanner.png",
    "/photo-1490481651871-ab68de25d43d.jpeg",
    "/photo-1539109136881-3be0616acf4b.jpeg",
    "/pngtree-row-of-colorful-robes-hanging-on-a-rack-picture-image_15858673.jpg",
    "/photo-1509631179647-0177331693ae.jpeg"
  ], []);

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return '/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${CDN_URL}${imagePath}`;
  };

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, discount, category, images')
      .limit(8)
      .order('created_at', { ascending: false });

    if (data) setProducts(data as Product[]);
    if (error) console.error("Error fetching products:", error);
  }, []);

  useEffect(() => {
    // الحل النهائي: نضع كل ما يخص الـ State داخل الاطار القادم
    const mountFrame = requestAnimationFrame(() => {
      setMounted(true);
      fetchProducts(); // استدعاء الجلب هنا يحل مشكلة الـ ESLint تماماً
    });

    const productSubscription = supabase
      .channel('realtime-products-home')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    const textInterval = setInterval(() => {
      setHeroTextIndex((prev) => (prev + 1) % heroWords.length);
    }, 3000);

    const handleMouseMove = (e: MouseEvent) => {
      window.requestAnimationFrame(() => {
        setMousePos({
          x: (e.clientX / window.innerWidth - 0.5) * 15,
          y: (e.clientY / window.innerHeight - 0.5) * 15,
        });
      });
    };

    const handleScroll = () => setShowScrollTop(window.scrollY > 500);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(mountFrame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(textInterval);
      supabase.removeChannel(productSubscription);
    };
  }, [heroWords, fetchProducts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!mounted) return null;

  return (
    <main className="w-full z-0 bg-white text-right font-sans overflow-x-hidden" dir="rtl">

      {/* Floating UI */}
      <div className="fixed bottom-8 left-8 z-30 flex flex-col gap-4">
        {showScrollTop && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all active:scale-95">
            <ArrowUp size={24} />
          </button>
        )}
        {/* <a href="https://wa.me/201092882189" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:rotate-12 hover:scale-110 transition-all">
          <MessageCircle size={32} />
        </a> */}
      </div>

      {/* 1. Hero Section */}
      <section ref={heroRef} className="relative w-full z-0 h-screen flex items-center justify-center overflow-hidden bg-black">
        <div
          className="absolute inset-0 z-0 transition-transform duration-200 ease-out"
          style={{ transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0) scale(1.05)` }}
        >
          <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" poster="/herobanner.png">
            <source src="/video.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="absolute inset-0 bg-black/60 z-1 backdrop-blur-[2px]"></div>

        <div className="relative z-10 text-center px-4 max-w-5xl">
          <div className="overflow-hidden h-8 mb-4">
            <p className="text-white/60 uppercase tracking-[0.5em] text-xs md:text-sm font-black transition-all duration-700">
              ZELDA LINE • {heroWords[heroTextIndex]}
            </p>
          </div>

          <h1 className="text-6xl md:text-[9rem] font-serif text-white mb-8 leading-none drop-shadow-2xl">
            فنُ <span className="italic font-light text-stone-300 relative">
              الحضور
              <svg className="absolute -bottom-4 left-0 w-full opacity-50" viewBox="0 0 300 20" fill="none">
                <path d="M5 15C50 5 150 5 295 15" stroke="#d6d3d1" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-white/80 text-lg md:text-2xl mb-12 font-light leading-relaxed">
            حيث يلتقي هدوء التصميم بفخامة التفاصيل.. <br /> اكتشفي مجموعة &quot;ميرا&quot; لعام 2026.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link href="/shop" className="group flex items-center gap-4 bg-white text-black px-16 py-5 text-xs font-black uppercase tracking-widest hover:bg-stone-200 transition-all shadow-2xl rounded-full">
              تسوقي الآن <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform" />
            </Link>

            <Link href="/collections" className="w-full md:w-auto border border-white/30 bg-white/10 backdrop-blur-md text-white px-16 py-5 text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all rounded-full">
              التشكيلات
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce text-white/30">
          <ChevronLeft className="-rotate-90" size={30} />
        </div>
      </section>

      {/* 2. Marquee Text Banner */}
      <div className="py-10 z-0 bg-black overflow-hidden whitespace-nowrap border-y border-white/10">
        <div className="flex animate-marquee gap-20 items-center">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="text-white text-3xl md:text-5xl font-serif italic opacity-30 px-10 uppercase tracking-widest">
              ZELDA LINE • {heroWords[i % 3]} • COLLECTION 2026
            </span>
          ))}
        </div>
      </div>

      {/* 3. Values Bar */}
      <section className="py-12 z-0 bg-white border-b border-stone-100 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <Truck size={24} />, title: "توصيل سريع", desc: "لكل المدن" },
            { icon: <ShieldCheck size={24} />, title: "جودة مضمونة", desc: "خامات فاخرة" },
            { icon: <Gift size={24} />, title: "تغليف ملكي", desc: "يصلك كهدية" },
            { icon: <Star size={24} />, title: "دفع آمن", desc: "خيارات متعددة" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 justify-center md:justify-start">
              <div className="text-stone-900">{item.icon}</div>
              <div className="text-right">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">{item.title}</h4>
                <p className="text-[10px] text-stone-400 font-bold mt-1 uppercase">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. The Curated Look */}
      <section className="py-32 z-0 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24 items-center">
          <div className="w-full lg:w-1/2 relative group">
            <div className="relative aspect-4/5 w-4/5 rounded-[4rem] overflow-hidden shadow-2xl z-10">
              <Image
                src="/photo-1515886657613-9f3515b0c78f.jpeg"
                alt="Main Look"
                fill
                priority
                sizes="(max-width: 768px) 80vw, 40vw"
                className="object-cover"
              />
              <div className="absolute top-[30%] right-[40%] group/item">
                <div className="w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center animate-pulse cursor-pointer border border-white/50">
                  <Plus size={16} className="text-white" />
                </div>
                <div className="absolute right-10 top-0 bg-white p-4 rounded-2xl shadow-xl w-48 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">عباءة &quot;لين&quot;</p>
                  <p className="text-sm font-serif">كريب كوري فاخر</p>
                  <p className="text-xs font-black mt-2">450 ر.س</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-16 -left-8 w-2/3 aspect-square rounded-[3rem] overflow-hidden shadow-2xl z-20 border-8 border-white hidden md:block">
              <Image src="/photo-1483985988355-763728e1935b.jpeg" fill sizes="30vw" className="object-cover" alt="Second Look" />
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-10 text-right pr-0 lg:pr-12">
            <span className="text-stone-400 font-black tracking-widest text-xs uppercase italic">Curated Look</span>
            <h2 className="text-5xl md:text-7xl font-serif text-gray-900 leading-tight">تنسيقُ الموسم <br /> <span className="italic text-stone-400 font-light">بأناملِ خبراؤنا</span></h2>
            <p className="text-stone-500 text-xl leading-loose font-light italic border-r-4 border-stone-100 pr-8">
              &quot;لا نبيعُ قطعاً فحسب، بل نصممُ لكِ إطلالةً متكاملة تعبرُ عن ذوقكِ الرفيع. اخترنا لكِ مزيجاً من الخامات التي تتناغمُ لتعطيكِ الحضور الذي تستحقينه.&quot;
            </p>
            <div className="pt-6">
              <Link href="/shop" className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-widest border-b-2 border-black pb-2 hover:text-stone-500 transition-all">تسوقي الإطلالة</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Categories Grid */}
      <section className="py-24 z-0 px-6 md:px-12 bg-stone-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/shop" className="relative group overflow-hidden h-150 rounded-[3rem] shadow-xl">
            <Image src="/Gemini_Generated_Image_xuxhhuxuxhhuxuxh.png" alt="Abayas" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center text-white p-12 text-center">
              <h3 className="text-4xl font-serif mb-4">العبايات</h3>
              <span className="text-[10px] font-black tracking-widest uppercase py-3 px-6 border border-white/30 rounded-full group-hover:bg-white group-hover:text-black transition-all">اكتشفي الآن</span>
            </div>
          </Link>
          <Link href="/collections" className="relative group overflow-hidden md:col-span-2 h-150 rounded-[3rem] shadow-xl">
            <Image src="/3f2e5d1738c222a00d35d6fcb52db56b.jpg" alt="Occasions" fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center text-white p-12 text-center">
              <h3 className="text-5xl font-serif mb-4">فساتين المناسبات</h3>
              <span className="text-[10px] font-black tracking-widest uppercase py-3 px-6 border border-white/30 rounded-full group-hover:bg-white group-hover:text-black transition-all">تسوقي المجموعة</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 6. Featured Products (وصلنا حديثاً) */}
      <section className="py-32 z-0 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-20 flex justify-between items-end">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 italic">وصلنا حديثاً</h2>
            <div className="h-1 w-20 bg-black"></div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => scroll('left')} className="w-14 h-14 rounded-full border border-stone-200 flex items-center justify-center bg-white hover:bg-black hover:text-white transition-all shadow-sm"><ChevronRight size={24} /></button>
            <button onClick={() => scroll('right')} className="w-14 h-14 rounded-full border border-stone-200 flex items-center justify-center bg-white hover:bg-black hover:text-white transition-all shadow-sm"><ChevronLeft size={24} /></button>
          </div>
        </div>
        <div ref={scrollRef} className="flex overflow-x-auto gap-10 px-6 md:px-12 no-scrollbar snap-x snap-mandatory scroll-smooth pb-12" style={{ scrollbarWidth: 'none' }}>
          {products.map((product) => {
            const disc = product.discount ?? 0;
            const hasDisc = disc > 0;
            const finalP = hasDisc ? product.price - (product.price * disc / 100) : product.price;

            return (
              <Link href={`/product/${product.id}`} key={product.id} className="min-w-[320px] md:min-w-100 snap-center group">
                <div className="relative aspect-3/4 overflow-hidden mb-6 rounded-[2.5rem] bg-stone-50 border border-stone-100 shadow-sm">
                  {hasDisc && (
                    <div className="absolute top-6 right-6 z-20 bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg animate-pulse">
                      خصم {disc}%
                    </div>
                  )}
                  <div className="absolute top-6 left-6 z-20 bg-white/80 backdrop-blur-md text-[#4A3E31] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border border-white/20">
                    {product.category}
                  </div>
                  <Image src={product.images && product.images.length > 0 ? getImageUrl(product.images[0]) : '/placeholder.jpg'} alt={product.name} fill sizes="(max-width: 768px) 320px, 400px" className="object-cover transition-all duration-1000 group-hover:scale-110 grayscale-20 group-hover:grayscale-0" />
                  <div className="absolute bottom-6 left-6 right-6 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl flex justify-between items-center shadow-2xl">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#8B735B]">اكتشفي القطعة</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#4A3E31]">{finalP.toLocaleString()} ج.م</span>
                          {hasDisc && <span className="text-[9px] text-gray-400 line-through">{product.price.toLocaleString()}</span>}
                        </div>
                      </div>
                      <Plus size={16} className="text-[#8B735B]" />
                    </div>
                  </div>
                </div>
                <div className="text-center px-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="font-serif text-xl text-gray-900 uppercase tracking-tighter truncate">{product.name}</h3>
                    {hasDisc && <span className="flex items-center gap-1 text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100"><Tag size={8} /> -{disc}%</span>}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-sm font-black text-[#8B735B]">{finalP.toLocaleString()} ج.م</span>
                    {hasDisc && <span className="text-[10px] text-gray-400 line-through">{product.price.toLocaleString()} ج.م</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 7. Instagram Feed Section */}
      <section className="py-24 z-0 border-y border-stone-100 bg-white overflow-hidden">
        <div className="px-6 mb-12 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Camera size={24} />
            <h2 className="text-xl md:text-2xl font-serif italic">إلهامٌ من مجتمعنا</h2>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">@ZELDALINE_SA</p>
        </div>
        <div className="flex gap-4 animate-scroll whitespace-nowrap">
          {instaImages.map((src, i) => (
            <div key={i} className="relative w-64 h-64 md:w-80 md:h-80 shrink-0 rounded-3xl overflow-hidden group">
              <Image src={src} alt="Community" fill sizes="(max-width: 768px) 256px, 320px" className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={30} className="text-white" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Brand Philosophy Section */}
      <section className="py-40 z-0 bg-white px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative h-200 w-full rounded-[4rem] overflow-hidden shadow-2xl">
            <Image src="/photo-1539109136881-3be0616acf4b.jpeg" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" alt="Brand Story" />
          </div>
          <div className="space-y-12">
            <h2 className="text-5xl md:text-7xl font-serif text-gray-900 leading-tight italic font-light">الاحتشام هو أرقى <br /> أنواع التميز</h2>
            <div className="space-y-6">
              <p className="text-stone-600 leading-loose text-xl font-light italic border-r-4 border-stone-200 pr-8">
                &quot;في زيلدا لاين، نحن لا نصمم الملابس، بل نصنع الثقة والوقار لكل امرأة تعتز بهويتها وتبحث عن التفرد.&quot;
              </p>
              <div className="w-px h-16 bg-stone-100 mr-8"></div>
            </div>
            <Link href="/collections" className="inline-block bg-black text-white px-14 py-6 text-xs font-black uppercase tracking-[0.2em] rounded-full hover:bg-stone-800 transition-all shadow-xl">اكتشفي عالمنا</Link>
          </div>
        </div>
      </section>

      {/* 9. Testimonials Section */}
      <section className="py-32 z-0 bg-stone-50 text-center px-6 border-y border-stone-100">
        <div className="max-w-4xl mx-auto">
          <Star size={24} className="mx-auto text-stone-200 mb-8" />
          <h2 className="text-3xl md:text-5xl font-serif italic mb-12 leading-relaxed text-stone-800">
            &quot;تجربة شراء استثنائية، جودة الأقمشة تفوق الوصف، والتغليف يجعلك تشعرين وكأنكِ تفتحين هدية ملكية.&quot;
          </h2>
          <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-20">— سارة الماجد، عميلة متميزة</p>

          <section className="py-32 z-0 bg-white px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Our Craft</span>
                <h3 className="text-4xl md:text-5xl font-serif italic text-stone-900">كيف تُصنعُ قطعةُ زيلدا؟</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-right">
                {[
                  { step: "01", title: "انتقاءُ النسيج", desc: "نسافرُ شرقاً وغرباً لنجلبَ لكِ أجودَ أنواع الكريب الكوري والحرير الطبيعي.", img: "/Gemini_Generated_Image_ee1zetee1zetee1z.png" },
                  { step: "02", title: "القصُّ الهندسي", desc: "بأيدي خبراءٍ يفهمون تفاصيل القوام، نعتمدُ قصاتٍ تمنحكِ الراحةَ التامة.", img: "/photo-1516914943479-89db7d9ae7f2.jpeg" },
                  { step: "03", title: "التطريزُ اليدوي", desc: "غرزةٌ تلو الأخرى، تُحاكُ التفاصيلُ بكل حبّ لتخرجَ كل قطعة كلوحةٍ فنية.", img: "/hq720.jpg" }
                ].map((item, i) => (
                  <div key={i} className="group space-y-8">
                    <div className="relative aspect-4/5 overflow-hidden rounded-[2.5rem] bg-stone-100 shadow-sm transition-all duration-700 group-hover:shadow-2xl">
                      <Image src={item.img} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" />
                      <div className="absolute top-8 right-8 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center font-serif text-xl italic shadow-xl">
                        {item.step}
                      </div>
                    </div>
                    <div className="pr-4 space-y-4">
                      <h4 className="text-2xl font-serif text-stone-900 italic">{item.title}</h4>
                      <p className="text-stone-500 text-sm leading-loose font-light">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-20 text-center">
                <Link href="/shop" className="group inline-flex items-center gap-6 px-12 py-6 border border-stone-200 rounded-full hover:bg-black hover:text-white transition-all duration-500">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">اكتشفي النتيجة النهائية</span>
                  <ArrowRight size={18} className="group-hover:-translate-x-1.25 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </section>

      <footer className="bg-white z-0 py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 text-right">
          <div className="md:col-span-2 space-y-8">
            <div className="text-4xl font-serif font-bold tracking-tighter uppercase">Zelda Line</div>
            <p className="text-stone-500 font-light leading-relaxed max-w-sm text-lg">
              وجهتكِ الأولى للملابس الإسلامية العصرية التي توازن بين الفخامة والوقار.
            </p>
          </div>
          <div>
            <h4 className="font-black mb-8 text-xs uppercase tracking-widest text-stone-900">روابط سريعة</h4>
            <ul className="space-y-4 text-stone-400 text-sm font-bold">
              <li className="hover:text-black cursor-pointer transition-colors"><Link href="/return-policy" className="hover:text-black transition-colors">سياسة الاستبدال</Link></li>
              <li className="hover:text-black cursor-pointer transition-colors"><Link href="/about" className="hover:text-black transition-colors">من نحن</Link></li>
              <li className="hover:text-black cursor-pointer transition-colors"><Link href="/faqs" className="hover:text-black transition-colors">الأسئلة الشائعة</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-8 text-xs uppercase tracking-widest text-stone-900">تواصل معنا</h4>
            <div className="space-y-4 text-stone-500 text-sm font-bold">
              <p>info@zeldaline.com</p>
              <p dir="ltr">+966 500 000 000</p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(50%); } }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-scroll { display: flex; animation: scroll 40s linear infinite; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}