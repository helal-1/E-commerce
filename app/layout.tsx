import './globals.css'
import Navbar from '@/components/Navbar'
import CartDrawer from '@/components/CartDrawer' // ضيف ده
// غير السطر لده
// استورد الـ Provider والـ Hook معاً من ملف الـ Context
import { CartProvider } from '../app/context/CartContext';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <CartProvider>
          <Navbar />
          <CartDrawer /> {/* السلة هتكون مستخبية في أي صفحة لحد ما تفتحها */}
          {children}
        </CartProvider>
      </body>
    </html>
  )
}