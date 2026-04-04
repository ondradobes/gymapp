import { createBrowserRouter, RouterProvider } from 'react-router';
import Home from './pages/Home';
import TrainingDay from './pages/TrainingDay';
import History from './pages/History';
import ExerciseProgress from './pages/ExerciseProgress';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/day/:dayId', element: <TrainingDay /> },
  { path: '/history', element: <History /> },
  { path: '/exercise/:exerciseId/progress', element: <ExerciseProgress /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
