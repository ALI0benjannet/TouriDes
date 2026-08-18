import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { AdminLayout } from "@/components/AdminLayout";
import { AdminRoute } from "@touribook/auth/guards/AdminRoute";
import { RouteError } from "@touribook/ui/components/feedback/RouteError";
import { FullPageLoader } from "@touribook/ui/components/feedback/FullPageLoader";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));
const BookingsPage = lazy(() => import("@/pages/BookingsPage"));
const ActivitiesPage = lazy(() => import("@/pages/AdminActivitiesPage"));
const ActivityFormPage = lazy(() => import("@/pages/ActivityFormPage"));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));
const PaymentsPage = lazy(() => import("@/pages/PaymentsPage"));
const ForbiddenPage = lazy(() => import("@/pages/ForbiddenPage"));

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<FullPageLoader />}>{node}</Suspense>
);

// L'app est servie sous /admin (base Vite) : les chemins internes restent relatifs.
export const router = createBrowserRouter(
  [
    {
      errorElement: <RouteError />,
      children: [
        { path: "/login", element: withSuspense(<LoginPage />) },
        { path: "/403", element: withSuspense(<ForbiddenPage />) },
        {
          element: <AdminRoute loginPath="/login" forbiddenPath="/403" />,
          children: [
            {
              element: <AdminLayout />,
              children: [
                { index: true, element: <Navigate to="/dashboard" replace /> },
                { path: "/dashboard", element: withSuspense(<DashboardPage />) },
                { path: "/users", element: withSuspense(<UsersPage />) },
                { path: "/bookings", element: withSuspense(<BookingsPage />) },
                { path: "/activities", element: withSuspense(<ActivitiesPage />) },
                { path: "/activities/new", element: withSuspense(<ActivityFormPage />) },
                { path: "/activities/:id/edit", element: withSuspense(<ActivityFormPage />) },
                { path: "/categories", element: withSuspense(<CategoriesPage />) },
                { path: "/payments", element: withSuspense(<PaymentsPage />) },
              ],
            },
          ],
        },
        { path: "*", element: <Navigate to="/dashboard" replace /> },
      ],
    },
  ],
  { basename: "/admin" },
);
