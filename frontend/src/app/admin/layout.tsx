import AdminRoute from '@/components/AdminRoute';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 h-screen overflow-y-auto dashboard-scroll pb-10 md:pb-12">
          <div className="max-w-7xl mx-auto p-5 md:p-8 lg:p-10">{children}</div>
        </main>
      </div>
    </AdminRoute>
  );
}
