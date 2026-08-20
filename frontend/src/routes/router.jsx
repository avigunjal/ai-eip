import { createBrowserRouter } from 'react-router';
import AppShell from '../layouts/AppShell.jsx';
import RequireAuth from '../components/auth/RequireAuth.jsx';
import Login from '../pages/Login/index.jsx';
import NotFound from '../pages/NotFound.jsx';
import Overview from '../pages/Overview/index.jsx';
import Projects from '../pages/Projects/index.jsx';
import ProjectDetail from '../pages/ProjectDetail/index.jsx';
import Risks from '../pages/Risks/index.jsx';
import Knowledge from '../pages/Knowledge/index.jsx';
import KnowledgeDetail from '../pages/KnowledgeDetail/index.jsx';
import TransferPlans from '../pages/TransferPlans/index.jsx';
import Teams from '../pages/Teams/index.jsx';
import TeamDetail from '../pages/TeamDetail/index.jsx';
import Composer from '../pages/Composer/index.jsx';
import Recognition from '../pages/Recognition/index.jsx';
import PersonProfile from '../pages/PersonProfile/index.jsx';
import Insights from '../pages/Insights/index.jsx';
import Settings from '../pages/Settings/index.jsx';

/**
 * React Router v7 data router.
 *
 * `handle.title` drives the browser document title and the TopBar breadcrumb.
 * Every detail route is a child of AppShell so the sidebar/topbar persist.
 * AppShell is wrapped in RequireAuth, which sends anonymous users to /login.
 * A catch-all `*` redirects to the dashboard rather than crashing.
 */
const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Overview />, handle: { title: 'Overview' } },
      { path: 'projects', element: <Projects />, handle: { title: 'Projects' } },
      {
        path: 'projects/:projectId',
        element: <ProjectDetail />,
        handle: { title: 'Project detail' },
      },
      { path: 'risks', element: <Risks />, handle: { title: 'Risks' } },
      { path: 'knowledge', element: <Knowledge />, handle: { title: 'Knowledge' } },
      {
        path: 'knowledge/transfer-plans',
        element: <TransferPlans />,
        handle: { title: 'Transfer plans' },
      },
      {
        path: 'knowledge/:systemId',
        element: <KnowledgeDetail />,
        handle: { title: 'Knowledge detail' },
      },
      { path: 'teams', element: <Teams />, handle: { title: 'Teams' } },
      {
        path: 'teams/:teamId',
        element: <TeamDetail />,
        handle: { title: 'Team detail' },
      },
      { path: 'composer', element: <Composer />, handle: { title: 'AI Composer' } },
      { path: 'recognition', element: <Recognition />, handle: { title: 'Recognition' } },
      {
        path: 'people/:personId',
        element: <PersonProfile />,
        handle: { title: 'Person' },
      },
      { path: 'insights', element: <Insights />, handle: { title: 'Insights' } },
      { path: 'settings', element: <Settings />, handle: { title: 'Settings' } },
      { path: '*', element: <Overview />, handle: { title: 'Not found' } },
    ],
  },
]);

export default router;
