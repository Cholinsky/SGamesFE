import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import PostulacionPage from "./pages/PostulacionPage";
import HorarioPage from "./pages/HorarioPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPostulaciones from "./pages/admin/AdminPostulaciones";
import AdminHorarios from "./pages/admin/AdminHorarios";
import AdminPublicaciones from "./pages/admin/AdminPublicaciones";
import AdminConfiguracion from "./pages/admin/AdminConfiguracion";
import AdminRunners from "./pages/admin/AdminRunners";
import AdminAdministradores from "./pages/admin/AdminAdministradores";
import NotFound from "./pages/NotFound";
import RunsPage from "./pages/RunsPage";
import ClipsPage from "./pages/ClipsPage";
import AdminClips from "./pages/admin/AdminClips";
import AdminStream from "./pages/admin/AdminStream";
import StreamOverlayPage from "./pages/StreamOverlayPage";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        path: "/",
        Component: PublicLayout,
        children: [
          { index: true, Component: HomePage },
          { path: "postulacion", Component: PostulacionPage },
          { path: "horario", Component: HorarioPage },
          { path: "runs", Component: RunsPage },
          { path: "clips", Component: ClipsPage },
        ],
      },
      {
        path: "/overlay/stream",
        Component: StreamOverlayPage,
      },
      {
        path: "/admin/login",
        Component: AdminLogin,
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, Component: AdminDashboard },
          { path: "postulaciones", Component: AdminPostulaciones },
          { path: "horarios", Component: AdminHorarios },
          { path: "publicaciones", Component: AdminPublicaciones },
          { path: "clips", Component: AdminClips },
          { path: "stream", Component: AdminStream },
          { path: "runners", Component: AdminRunners },
          { path: "administradores", Component: AdminAdministradores },
          { path: "configuracion", Component: AdminConfiguracion },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);