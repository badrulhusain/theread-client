import { FileText, UploadCloud, UserCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export default function UserLayout() {
  return (
    <DashboardLayout
      title="Blog submissions"
      subtitle="Upload drafts and track submitted blogs."
      nav={[
        { to: '/write', label: 'Upload Blog', icon: <UploadCloud className="h-4 w-4" /> },
        { to: '/my-blogs', label: 'My Blogs', icon: <FileText className="h-4 w-4" /> },
        { to: '/profile', label: 'Profile', icon: <UserCircle className="h-4 w-4" /> },
      ]}
    />
  );
}
