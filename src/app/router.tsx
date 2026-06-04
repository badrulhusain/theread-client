import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { PrivateRoute } from '@/components/routes/PrivateRoute';
import { RoleRoute } from '@/components/routes/RoleRoute';
import { AuthProvider } from '@/store/authStore';

const HomePage = lazy(() => import('@/pages/public/HomePage'));
const BlogsPage = lazy(() => import('@/pages/public/BlogsPage'));
const BlogDetailPage = lazy(() => import('@/pages/public/BlogDetailPage'));
const LoginPage = lazy(() => import('@/pages/public/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/public/RegisterPage'));
const UserLayout = lazy(() => import('@/pages/user/UserLayout'));
const DashboardPage = lazy(() => import('@/pages/user/DashboardPage'));
const BlogFormPage = lazy(() => import('@/pages/user/BlogFormPage'));
const MyBlogsPage = lazy(() => import('@/pages/user/MyBlogsPage'));
const BlogStatusPage = lazy(() => import('@/pages/user/BlogStatusPage'));
const EditorLayout = lazy(() => import('@/pages/editor/EditorLayout'));
const EditorDashboardPage = lazy(() => import('@/pages/editor/EditorDashboardPage'));
const SubmittedBlogsPage = lazy(() => import('@/pages/editor/SubmittedBlogsPage'));
const ReviewBlogPage = lazy(() => import('@/pages/editor/ReviewBlogPage'));
const EditorEditBlogPage = lazy(() => import('@/pages/editor/EditorEditBlogPage'));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const ManageUsersPage = lazy(() => import('@/pages/admin/ManageUsersPage'));
const CreateStaffPage = lazy(() => import('@/pages/admin/CreateStaffPage'));
const ManageBlogsPage = lazy(() => import('@/pages/admin/ManageBlogsPage'));

function Root() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="grid min-h-screen place-items-center text-slate-500">Loading The Read...</div>}>
        <AppLayout />
      </Suspense>
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'blogs', element: <BlogsPage /> },
      { path: 'blogs/:slug', element: <BlogDetailPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        element: <PrivateRoute />,
        children: [
          {
            element: <UserLayout />,
            children: [
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'write', element: <BlogFormPage /> },
              { path: 'my-blogs', element: <MyBlogsPage /> },
              { path: 'my-blogs/:id', element: <BlogStatusPage /> },
              { path: 'my-blogs/:id/edit', element: <BlogFormPage /> },
            ],
          },
        ],
      },
      {
        element: <RoleRoute roles={['EDITOR', 'ADMIN']} />,
        children: [
          {
            element: <EditorLayout />,
            children: [
              { path: 'editor', element: <EditorDashboardPage /> },
              { path: 'editor/submissions', element: <SubmittedBlogsPage /> },
              { path: 'editor/blogs/:id/review', element: <ReviewBlogPage /> },
              { path: 'editor/blogs/:id/edit', element: <EditorEditBlogPage /> },
            ],
          },
        ],
      },
      {
        element: <RoleRoute roles={['ADMIN']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: 'admin', element: <AdminDashboardPage /> },
              { path: 'admin/users', element: <ManageUsersPage /> },
              { path: 'admin/blogs', element: <ManageBlogsPage /> },
              { path: 'admin/editors/create', element: <CreateStaffPage /> },
              { path: 'admin/admins/create', element: <CreateStaffPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
