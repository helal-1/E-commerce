import './globals.css'
import Navbar from '@/components/Navbar'
import CartDrawer from '@/components/CartDrawer'
import WishlistDrawer from '@/components/WishlistDrawer' // استيراد دراور المفضلات

// استيراد الـ Providers
import { CartProvider } from '../app/context/CartContext';
import { WishlistProvider } from '../app/context/WishlistContext'; // استيراد بروفايدر المفضلات

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {/* الترتيب مهم: غلف الكل ببروفايدر المفضلات أولاً */}
        <WishlistProvider>
          <CartProvider>

            <Navbar />

            {/* القوائم الجانبية (المخفية) */}
            <WishlistDrawer />
            <CartDrawer />

            {/* محتوى الصفحة */}
            {children}

          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  )
}