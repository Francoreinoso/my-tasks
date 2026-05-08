import { useState, type ReactNode } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative flex min-h-screen text-text-primary">
      {/* Capa 1: imagen de fondo con blur sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg-anime-desk.webp)',
          filter: 'blur(4px)',
          transform: 'scale(1.05)',
        }}
      />

      {/* Capa 2: overlay oscuro + gradientes japoneses para teñir la imagen */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundColor: 'rgba(15, 14, 23, 0.80)',
          backgroundImage: [
            'radial-gradient(circle at 20% 25%, rgba(233, 69, 96, 0.10), transparent 55%)',
            'radial-gradient(circle at 80% 75%, rgba(127, 209, 185, 0.06), transparent 55%)',
            'radial-gradient(circle at 50% 100%, rgba(245, 163, 182, 0.05), transparent 50%)',
          ].join(', '),
        }}
      />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
