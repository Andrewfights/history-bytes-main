import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { Menu } from 'lucide-react';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 lg:hidden bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="font-editorial text-lg font-bold text-foreground">Admin Panel</h1>
      </div>

      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6 overflow-auto pt-16 lg:pt-6">
        <Outlet />
      </main>
    </div>
  );
}
