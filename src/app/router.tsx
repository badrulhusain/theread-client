import { createBrowserRouter } from 'react-router-dom';
import { TheReadApp } from '@/features/the-read/TheReadApp';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <TheReadApp />,
    },
]);