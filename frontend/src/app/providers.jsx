'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { Toaster } from 'react-hot-toast';

const ChatBox = dynamic(() => import('../components/ChatBox'), {
  ssr: false,
  loading: () => null,
});

export function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#f97316',
                secondary: '#fff',
              },
            },
          }}
        />
        <ChatBox />
      </CartProvider>
    </AuthProvider>
  );
}
