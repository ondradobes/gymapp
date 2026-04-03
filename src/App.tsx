import { createBrowserRouter, RouterProvider } from 'react-router';
import Home from './pages/Home';
import TrainingDay from './pages/TrainingDay';
import History from './pages/History';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/day/:dayId', element: <TrainingDay /> },
  { path: '/history', element: <History /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
