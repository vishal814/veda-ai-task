'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the main dashboard app component, disabling SSR to avoid hydration conflicts with extensions.
const DashboardApp = dynamic(() => import('../components/DashboardApp'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <div style={{
        width: '24px',
        height: '24px',
        border: '2.5px solid rgba(0,0,0,0.1)',
        borderRadius: '50%',
        borderTopColor: '#111827',
        animation: 'spin 0.8s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  ),
});

export default function Home() {
  return <DashboardApp />;
}
