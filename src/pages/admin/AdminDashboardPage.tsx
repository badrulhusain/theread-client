import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { adminService } from '@/services/admin.service';
import type { AdminStats } from '@/types/user';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({});

  useEffect(() => {
    adminService.stats().then(setStats).catch(() => setStats({}));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Admin dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Total users" value={stats.totalUsers ?? 0} />
        <Stat label="Editors" value={stats.totalEditors ?? 0} />
        <Stat label="Submitted" value={stats.submittedBlogs ?? 0} />
        <Stat label="Approved" value={stats.approvedBlogs ?? 0} />
        <Stat label="Published" value={stats.publishedBlogs ?? 0} />
      </div>
      <Card><CardContent className="flex flex-wrap gap-2"><Button asChild><Link to="/admin/users">Manage users</Link></Button><Button asChild variant="outline"><Link to="/admin/blogs">Manage blogs</Link></Button></CardContent></Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <Card><CardContent><div className="text-3xl font-semibold">{value}</div><div className="mt-1 text-sm text-slate-500">{label}</div></CardContent></Card>;
}
