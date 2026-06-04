import { FileText, LayoutDashboard, PenLine } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export default function UserLayout() {
  return (
    <DashboardLayout
      title="Writer space"
      subtitle="Drafts, submissions, and status."
      nav={[
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: '/write', label: 'Write Blog', icon: <PenLine className="h-4 w-4" /> },
        { to: '/my-blogs', label: 'My Blogs', icon: <FileText className="h-4 w-4" /> },
      ]}
    />
  );
}
