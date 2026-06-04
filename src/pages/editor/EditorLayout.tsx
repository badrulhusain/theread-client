import { Inbox, LayoutDashboard } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export default function EditorLayout() {
  return (
    <DashboardLayout
      title="Editor desk"
      subtitle="Pick, edit, and decide submissions."
      nav={[
        { to: '/editor', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { to: '/editor/submissions', label: 'Submissions', icon: <Inbox className="h-4 w-4" /> },
      ]}
    />
  );
}
