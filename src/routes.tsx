import type { ReactNode } from 'react';
import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import Search from './pages/Search';
import Detail from './pages/Detail';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />,
    public: true,
  },
  {
    name: 'Movies',
    path: '/movies',
    element: <Movies />,
    public: true,
  },
  {
    name: 'Series',
    path: '/series',
    element: <Series />,
    public: true,
  },
  {
    name: 'Search',
    path: '/search',
    element: <Search />,
    public: true,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <Dashboard />,
    public: true,
  },
  {
    name: 'Favorites',
    path: '/favorites',
    element: <Favorites />,
    public: true,
  },
  {
    name: 'Detail',
    path: '/:type/:id',
    element: <Detail />,
    public: true,
  },
];
