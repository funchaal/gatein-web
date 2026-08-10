import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import LoadingState from '../components/LoadingState';

const LoginPage = lazy(() => import('../screens/LoginPage/LoginPage'));
const Home = lazy(() => import('../screens/Home/Home'));
const LayoutsBridge = lazy(() => import('../screens/LayoutsBridge'));
const TicketLayouts = lazy(() => import('../screens/TicketLayouts/TicketLayouts'));
const Geofence = lazy(() => import('../screens/Geofence/Geofence'));
const CompanyInfo = lazy(() => import('../screens/CompanyInfo/CompanyInfo'));
const Users = lazy(() => import('../screens/admin/Users/Users'));
const ApiKey = lazy(() => import('../screens/admin/ApiKey/ApiKey'));
const StagingPassword = lazy(() => import('../screens/admin/StagingPassword/StagingPassword'));
const CreateFakeDriver = lazy(() => import('../screens/admin/CreateFakeDriver/CreateFakeDriver'));
const CompanyServices = lazy(() => import('../screens/CompanyServices/CompanyServices'));
const Announcements = lazy(() => import('../screens/Announcements/Announcements'));
const SubmissionTypes = lazy(() => import('../screens/SubmissionTypes/SubmissionTypes'));
const Submissions = lazy(() => import('../screens/Submissions/Submissions'));
const NotFound = lazy(() => import('../screens/NotFound/NotFound'));

const routes = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingState text="Carregando..." />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'layouts',
        element: (
          <Suspense fallback={<LoadingState text="Carregando..." />}>
            <LayoutsBridge />
          </Suspense>
        ),
      },
      {
        path: 'ticket-layouts',
        element: (
          <ProtectedRoute module="ticket_layouts">
            <Suspense fallback={<LoadingState text="Carregando..." />}>
              <TicketLayouts />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'geofence',
        element: (
          <ProtectedRoute module="geofence">
            <Suspense fallback={<LoadingState text="Carregando..." />}>
              <Geofence />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'company',
        element: (
          <ProtectedRoute module="company_information">
            <Suspense fallback={<LoadingState text="Carregando..." />}>
              <CompanyInfo />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'services',
        element: (
          <ProtectedRoute module="services">
            <Suspense fallback={<LoadingState text="Carregando..." />}>
              <CompanyServices />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'announcements',
        element: (
          <ProtectedRoute module="announcements">
            <Suspense fallback={<LoadingState text="Carregando..." />}>
              <Announcements />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'submission-types',
        element: (
          <ProtectedRoute module="submissions">
            <Suspense fallback={<LoadingState text="Carregando..." />}>
              <SubmissionTypes />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'submissions',
        element: (
          <ProtectedRoute module="submissions">
            <Suspense fallback={<LoadingState text="Carregando..." />}>
              <Submissions />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requireAdmin={true}>
            <Suspense fallback={<LoadingState text="Carregando..." />}>
              <Users />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'api-keys',
        element: (
          <ProtectedRoute requireAdmin={true}>
            <Suspense fallback={<LoadingState text="Carregando..." />}>
              <ApiKey />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'staging-password',
        element: (
          <ProtectedRoute requireAdmin={true}>
            <Suspense fallback={<LoadingState text="Carregando..." />}>
              <StagingPassword />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'create-fake-driver',
        element: (
          <ProtectedRoute requireAdmin={true}>
            <Suspense fallback={<LoadingState text="Carregando..." />}>
              <CreateFakeDriver />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingState text="Carregando..." />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingState text="Carregando..." />}>
        <NotFound />
      </Suspense>
    ),
  },
]);

export default routes;
