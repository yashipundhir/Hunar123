/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { ProblemSection } from './components/ProblemSection.tsx';
import { SolutionSection } from './components/SolutionSection.tsx';
import { BeforeAfterSection } from './components/BeforeAfterSection.tsx';
import { ArtisanSection } from './components/ArtisanSection.tsx';
import { MarketplaceSection } from './components/MarketplaceSection.tsx';
import { CorporateGiftingSection } from './components/CorporateGiftingSection.tsx';
import { DigitalMarketingSection } from './components/DigitalMarketingSection.tsx';
import { JourneyTimeline } from './components/JourneyTimeline.tsx';
import { ImpactDashboard } from './components/ImpactDashboard.tsx';
import { IncomeModelSection } from './components/IncomeModelSection.tsx';
import { SustainableBusinessModel } from './components/SustainableBusinessModel.tsx';
import { QRExperienceSection } from './components/QRExperienceSection.tsx';
import { PartnerSection } from './components/PartnerSection.tsx';
import { SDGSection } from './components/SDGSection.tsx';
import { FinalCTA } from './components/FinalCTA.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer, CartItem } from './components/CartDrawer.tsx';
import { Toast, ToastMessage } from './components/Toast.tsx';
import {
  ProductDetailModal,
  ArtisanDetailModal,
  SolutionDetailModal,
  ProductImprovementModal,
  OrderRequestModal,
  CorporateRfpModal,
  PartnerModal,
  QRExplorerModal,
  SupportHunarModal,
  JoinArtisanModal
} from './components/Modals.tsx';
import { PRODUCTS_DATA, ARTISANS_DATA, Product, Artisan, SolutionPillar } from './data/mockData.ts';
import { safeStorage, openExternalLinkSafely } from './utils/security.ts';

export default function App() {
  // Cart state with safeStorage persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    return safeStorage.getItem<CartItem[]>('hunar_cart', [
      { product: PRODUCTS_DATA[0], quantity: 1 } // Pre-seed 1 item so user can immediately inspect cart
    ]);
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Favorites state with safeStorage persistence
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    return safeStorage.getItem<string[]>('hunar_favs', ['prod-1']);
  });

  // Sync to safeStorage on change
  useEffect(() => {
    safeStorage.setItem('hunar_cart', cartItems);
  }, [cartItems]);

  useEffect(() => {
    safeStorage.setItem('hunar_favs', favoriteIds);
  }, [favoriteIds]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<SolutionPillar | null>(null);
  const [isImprovementOpen, setIsImprovementOpen] = useState(false);
  const [isOrderRequestOpen, setIsOrderRequestOpen] = useState(false);
  const [isCorporateRfpOpen, setIsCorporateRfpOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isQRExplorerOpen, setIsQRExplorerOpen] = useState(false);
  const [isSupportHunarOpen, setIsSupportHunarOpen] = useState(false);
  const [isJoinArtisanOpen, setIsJoinArtisanOpen] = useState(false);

  // Toast trigger helper
  const addToast = (type: ToastMessage['type'], title: string, description?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    addToast(
      'cart',
      `Added "${product.name}" to cart`,
      `70%+ directly reserved for ${product.artisanName}`
    );
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    addToast('info', 'Item removed from cart');
  };

  const handleToggleFavorite = (productId: string) => {
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    setFavoriteIds((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('info', `Removed from saved items`);
        return prev.filter((id) => id !== productId);
      } else {
        addToast(
          'favorite',
          `Saved to your craft collection`,
          product ? product.name : undefined
        );
        return [...prev, productId];
      }
    });
  };

  const handleWhatsAppEnquiry = (product: Product) => {
    const text = encodeURIComponent(
      `Hello HUNAR! I am interested in ordering the "${product.name}" (₹${product.price}) crafted by ${product.artisanName}. Please share lead time & delivery details.`
    );
    openExternalLinkSafely(`https://wa.me/?text=${text}`);
    addToast(
      'success',
      'WhatsApp inquiry initiated',
      `Routing to ${product.artisanName}'s cluster coordinator`
    );
  };

  // Smooth scroll to products
  const scrollToProducts = () => {
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchClick = () => {
    scrollToProducts();
    setTimeout(() => {
      const searchInput = document.getElementById('marketplace-search-input') as HTMLInputElement | null;
      if (searchInput) {
        searchInput.focus();
      }
    }, 450);
  };

  const handleSelectArtisanById = (artisanId: string) => {
    const artisan = ARTISANS_DATA.find((a) => a.id === artisanId);
    if (artisan) {
      setSelectedArtisan(artisan);
    }
  };

  const cartTotalUnits = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C241D] flex flex-col font-sans selection:bg-[#EADBCE] selection:text-[#1B382B]">
      
      {/* 1. STICKY TOPBAR */}
      <Navbar
        cartCount={cartTotalUnits}
        favoritesCount={favoriteIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSupport={() => setIsSupportHunarOpen(true)}
        onSearchClick={handleSearchClick}
        onOpenFavorites={scrollToProducts}
      />

      <main className="flex-1">
        {/* 2. CINEMATIC HERO */}
        <Hero
          onExploreProducts={scrollToProducts}
          onJoinArtisan={() => setIsJoinArtisanOpen(true)}
          onPartnerWithUs={() => setIsPartnerModalOpen(true)}
        />

        {/* 3. PROBLEM SECTION */}
        <ProblemSection />

        {/* 4. HUNAR SOLUTION (OUR MODEL) */}
        <SolutionSection onSelectPillar={(pillar) => setSelectedPillar(pillar)} />

        {/* 5. BEFORE -> AFTER PRODUCT TRANSFORMATION */}
        <BeforeAfterSection onOpenImprovementModal={() => setIsImprovementOpen(true)} />

        {/* 6. ARTISAN STORIES */}
        <ArtisanSection
          onSelectArtisan={(artisan) => setSelectedArtisan(artisan)}
          onOpenJoinModal={() => setIsJoinArtisanOpen(true)}
        />

        {/* 7. FUNCTIONAL MARKETPLACE */}
        <MarketplaceSection
          onSelectProduct={(product) => setSelectedProduct(product)}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          favoriteIds={favoriteIds}
          onEnquireProduct={handleWhatsAppEnquiry}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* 8. CORPORATE GIFTING */}
        <CorporateGiftingSection onRequestBulkOrder={() => setIsCorporateRfpOpen(true)} />

        {/* 9. DIGITAL MARKETING DEMAND ENGINE */}
        <DigitalMarketingSection
          onShopFeatured={() => setSelectedProduct(PRODUCTS_DATA[0])}
          onOpenQrModal={() => setIsQRExplorerOpen(true)}
        />

        {/* 10. ARTISAN JOURNEY TIMELINE */}
        <JourneyTimeline />

        {/* 11. IMPACT DASHBOARD */}
        <ImpactDashboard />

        {/* 12. INCOME MODEL & CALCULATOR */}
        <IncomeModelSection />

        {/* 13. SUSTAINABLE BUSINESS FLYWHEEL */}
        <SustainableBusinessModel />

        {/* 14. QR EXPERIENCE ("Scan. Discover. Support.") */}
        <QRExperienceSection onOpenQrModal={() => setIsQRExplorerOpen(true)} />

        {/* 15. PARTNERSHIP ECOSYSTEM */}
        <PartnerSection onOpenPartnerForm={() => setIsPartnerModalOpen(true)} />

        {/* 16. UN SDG ALIGNMENT */}
        <SDGSection />

        {/* 17. FINAL EMOTIONAL CTA */}
        <FinalCTA
          onExploreProducts={scrollToProducts}
          onPartnerWithUs={() => setIsPartnerModalOpen(true)}
        />
      </main>

      {/* 18. FOOTER */}
      <Footer onOpenSupport={() => setIsSupportHunarOpen(true)} />

      {/* CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onRequestCheckout={() => {
          setIsCartOpen(false);
          setIsOrderRequestOpen(true);
        }}
      />

      {/* MODALS */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p) => {
          handleAddToCart(p);
          setSelectedProduct(null);
        }}
        onEnquireWhatsApp={handleWhatsAppEnquiry}
        onSelectArtisanByName={handleSelectArtisanById}
      />

      <ArtisanDetailModal
        artisan={selectedArtisan}
        isOpen={!!selectedArtisan}
        onClose={() => setSelectedArtisan(null)}
      />

      <SolutionDetailModal
        pillar={selectedPillar}
        isOpen={!!selectedPillar}
        onClose={() => setSelectedPillar(null)}
      />

      <ProductImprovementModal
        isOpen={isImprovementOpen}
        onClose={() => setIsImprovementOpen(false)}
      />

      <OrderRequestModal
        isOpen={isOrderRequestOpen}
        onClose={() => setIsOrderRequestOpen(false)}
        items={cartItems}
        onOrderSuccess={() => {
          setCartItems([]);
          setIsOrderRequestOpen(false);
          addToast('success', 'Order request registered successfully!', 'Our team will contact you shortly.');
        }}
      />

      <CorporateRfpModal
        isOpen={isCorporateRfpOpen}
        onClose={() => setIsCorporateRfpOpen(false)}
        onSubmitSuccess={() => {
          setIsCorporateRfpOpen(false);
          addToast('success', 'Corporate RFP proposal dispatched!', 'Expect our catalogue within 24 hours.');
        }}
      />

      <PartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onSubmitSuccess={() => {
          setIsPartnerModalOpen(false);
          addToast('success', 'Partnership details received!', 'Thank you for building the ecosystem.');
        }}
      />

      <QRExplorerModal
        isOpen={isQRExplorerOpen}
        onClose={() => setIsQRExplorerOpen(false)}
        onExploreProducts={scrollToProducts}
      />

      <SupportHunarModal
        isOpen={isSupportHunarOpen}
        onClose={() => setIsSupportHunarOpen(false)}
        onSubmitSuccess={() => {
          setIsSupportHunarOpen(false);
          addToast('success', 'Support pledge received!', 'Welcome to the HUNAR community.');
        }}
      />

      <JoinArtisanModal
        isOpen={isJoinArtisanOpen}
        onClose={() => setIsJoinArtisanOpen(false)}
        onSubmitSuccess={() => {
          setIsJoinArtisanOpen(false);
          addToast('success', 'Artisan registration recorded!', 'Cluster diagnostic scheduled.');
        }}
      />

      {/* TOAST SYSTEM */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />

    </div>
  );
}
