import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { editorialService } from '@/services/editorial.service';
import type { BlogStats } from '@/types/blog';

export default function EditorDashboardPage() {
  const [stats, setStats] = useState<BlogStats>({});

  useEffect(() => {
    editorialService.stats().then(setStats).catch(() => setStats({}));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">Editor dashboard</h2><Button asChild><Link to="/editor/submissions">Review queue</Link></Button></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Submitted blogs" value={stats.submittedBlogs ?? 0} />
        <Stat label="Under review by me" value={stats.underReviewByMe ?? 0} />
        <Stat label="Approved" value={stats.approved ?? 0} />
        <Stat label="Rejected/revision" value={stats.rejectedOrRevisionRequested ?? 0} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <Card><CardContent><div className="text-3xl font-semibold">{value}</div><div className="mt-1 text-sm text-slate-500">{label}</div></CardContent></Card>;
}
