import { createBrowserRouter, RouteObject } from 'react-router-dom';
import App from './App';
import { LandingPage } from './pages/LandingPage';
import { MainAppContent } from './components/MainAppContent';
import { SignIn } from './components/SignIn';
import { AuthenticatedGuard } from './components/AuthenticatedGuard';
import { AdminGuard } from './components/AdminGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SignUpPage } from './pages/SignUpPage';
import { ProfilePage } from './pages/ProfilePage';
import { PaymentSuccessPage } from './pages/payment/success';
import { IpnHandlerPage } from './pages/admin/ipn-handler';
import { AdminDashboard } from './pages/admin';
import { ApiKeysPage } from './pages/admin/api-keys';
import { SupportMessagesPage } from './pages/admin/support-messages';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'sign-in',
        element: <SignIn />,
      },
      {
        path: 'sign-up',
        element: <SignUpPage />,
      },
      {
        element: <AuthenticatedGuard />,
        children: [
          {
            path: 'app',
            element: <MainAppContent />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'payment/success',
            element: <PaymentSuccessPage />,
          },
          // Admin routes
          {
            path: 'admin',
            element: (
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            ),
          },
          {
            path: 'admin/ipn',
            element: (
              <AdminGuard>
                <IpnHandlerPage />
              </AdminGuard>
            ),
          },
          {
            path: 'admin/api-keys',
            element: (
              <AdminGuard>
                <ApiKeysPage />
              </AdminGuard>
            ),
          },
          {
            path: 'admin/support-messages',
            element: (
              <AdminGuard>
                <SupportMessagesPage />
              </AdminGuard>
            ),
          }
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
export default router;
