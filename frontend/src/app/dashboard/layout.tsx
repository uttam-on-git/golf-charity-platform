import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex w-full h-screen overflow-hidden bg-[#0a0a0a] text-white">
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto pb-24 md:pb-12 scroll-smooth dashboard-scroll">
          <div className="max-w-6xl mx-auto p-5 md:p-8 lg:p-10">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
