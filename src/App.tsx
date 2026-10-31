import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layout Components
import { TopBar } from './components/layout/TopBar';
import { Header } from './components/layout/Header';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { WhatsAppFloating } from './components/layout/WhatsAppFloating';
import { CookieConsent } from './components/common/CookieConsent';
import { CartDrawer } from './components/cart/CartDrawer';

// Pages
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { MyAccountPage } from './pages/MyAccountPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';
import { ReturnsPolicyPage } from './pages/ReturnsPolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminSettings } from './pages/admin/AdminSettings';

const queryClient = new QueryClient();

// Public Layout wrapper with Header, Navbar, Footer and Drawers
const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <div className="sticky top-0 z-40 shadow-md">
        <Header />
        <Navbar />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloating />
      <CookieConsent />
      <CartDrawer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                {/* PUBLIC STORE ROUTES */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/produtos" element={<CatalogPage />} />
                  <Route path="/categorias" element={<CatalogPage />} />
                  <Route path="/produto/:slug" element={<ProductDetailPage />} />
                  <Route path="/carrinho" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/pedido/confirmado/:orderNumber" element={<OrderSuccessPage />} />
                  <Route path="/minha-conta" element={<MyAccountPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/cadastro" element={<RegisterPage />} />
                  <Route path="/sobre" element={<AboutPage />} />
                  <Route path="/contato" element={<ContactPage />} />
                  <Route path="/privacidade" element={<PrivacyPage />} />
                  <Route path="/termos" element={<TermsPage />} />
                  <Route path="/politica-de-frete" element={<ShippingPolicyPage />} />
                  <Route path="/trocas-e-devolucoes" element={<ReturnsPolicyPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* ADMIN PANEL ROUTES */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="produtos" element={<AdminProducts />} />
                  <Route path="categorias" element={<AdminCategories />} />
                  <Route path="pedidos" element={<AdminOrders />} />
                  <Route path="clientes" element={<AdminCustomers />} />
                  <Route path="cupons" element={<AdminCoupons />} />
                  <Route path="banners" element={<AdminBanners />} />
                  <Route path="configuracoes" element={<AdminSettings />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
