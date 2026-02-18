import { createBrowserRouter, redirect } from 'react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskForm from './pages/TaskForm';
import Approvals from './pages/Approvals';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import OrganizationalUnits from './pages/OrganizationalUnits';
import Roles from './pages/Roles';
import Layout from './components/Layout';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        loader: () => redirect('/dashboard'),
      },
      {
        path: 'register',
        Component: Register,
      },
      {
        path: 'dashboard',
        Component: Dashboard,
      },
      {
        path: 'tasks',
        loader: () => redirect('/tasks/new'),
      },
      {
        path: 'tasks/new',
        Component: TaskForm,
      },
      {
        path: 'tasks/:id',
        Component: TaskForm,
      },
      {
        path: 'approvals',
        Component: Approvals,
      },
      {
        path: 'reports',
        Component: Reports,
      },
      {
        path: 'organizational-units',
        Component: OrganizationalUnits,
      },
      {
        path: 'roles',
        Component: Roles,
      },
      {
        path: 'profile',
        Component: Profile,
      },
    ],
  },
]);