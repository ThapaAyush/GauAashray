import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoginRequiredModal from '../components/LoginRequiredModal';
import MobileBottomNav from '../components/MobileBottomNav';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [intendedPath, setIntendedPath] = useState('/home');

  const handleCaptureClick = (e) => {
    // If user is logged in, allow all actions
    if (user) return;

    // Target element or its closest interactive parent
    const target = e.target.closest('button, a, input, select, textarea, [role="button"]');
    if (!target) return; // Allow reading text, scrolling, clicking blank area

    // Do not block elements inside the login modal itself
    if (target.closest('#login-required-modal')) return;

    // Check if element explicitly permits guest interaction
    if (target.dataset.allowGuest === 'true' || target.closest('[data-allow-guest="true"]')) {
      return;
    }

    const href = target.getAttribute('href') || '';

    // Allow navigation to auth pages, home page, or main brand logo
    if (
      href.includes('/login') ||
      href.includes('/signup') ||
      href.includes('/forgot-password') ||
      href.includes('/reset-password') ||
      href === '/' ||
      href === '/home' ||
      target.id === 'navbar-brand-logo'
    ) {
      return;
    }

    // Intercept and prevent the action
    e.preventDefault();
    e.stopPropagation();

    // Store destination if it was a link
    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
      setIntendedPath(href);
    } else {
      setIntendedPath(location.pathname);
    }

    setModalOpen(true);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F8F7F3]"
      onClickCapture={handleCaptureClick}
    >
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Modern Native-like Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Global Login Required Modal for Unauthenticated Visitors */}
      <LoginRequiredModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        intendedPath={intendedPath}
      />
    </div>
  );
}

