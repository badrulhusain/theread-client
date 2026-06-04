import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Table } from '@/components/ui/table';
import { apiMessage } from '@/lib/api';
import { adminService } from '@/services/admin.service';
import type { User } from '@/types/user';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setDebounced(search);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  function load() {
    adminService.users({ page, limit: 10, search: debounced }).then((result) => {
      setUsers(result.items);
      setTotalPages(result.totalPages);
    });
  }

  useEffect(load, [debounced, page]);

  async function action(label: string, run: () => Promise<User>) {
    try {
      await run();
      toast.success(label);
      load();
    } catch (error) {
      toast.error(apiMessage(error, 'Admin action failed.'));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-semibold">Manage users</h2><Input className="max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" /></div>
      <Card>
        <CardContent>
          {users.length ? (
            <Table>
              <thead><tr className="border-b text-[#74685f]"><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{users.map((user) => {
                const blocked = user.isBlocked || user.status === 'BLOCKED';
                return <tr key={user.id} className="border-b last:border-0"><td className="py-3 font-medium">{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{blocked ? 'Blocked' : 'Active'}</td><td className="flex flex-wrap gap-2 py-2"><Button size="sm" variant="outline" disabled={user.role === 'AUTHOR'} onClick={() => void action('Promoted to author.', () => adminService.promoteToAuthor(user.id))}>Promote</Button>{blocked ? <Button size="sm" onClick={() => void action('User unblocked.', () => adminService.unblockUser(user.id))}>Unblock</Button> : <Button size="sm" variant="destructive" onClick={() => void action('User blocked.', () => adminService.blockUser(user.id))}>Block</Button>}</td></tr>;
              })}</tbody>
            </Table>
          ) : <p className="text-[#74685f]">No users found.</p>}
        </CardContent>
      </Card>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
