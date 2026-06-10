import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/pages/Dashboard";
import { Temples } from "./components/pages/Temples";
import { Priests } from "./components/pages/Priests";
import { Bookings } from "./components/pages/Bookings";
import { Festivals } from "./components/pages/Festivals";
import { Payments } from "./components/pages/Payments";
import { Users } from "./components/pages/Users";
import { Feedback } from "./components/pages/Feedback";
import { Notifications } from "./components/pages/Notifications";
import { AuditLogs } from "./components/pages/AuditLogs";
import { Settings } from "./components/pages/Settings";
import { Schedule } from "./components/pages/Schedule";
import { Analytics } from "./components/pages/Analytics";
import { Reports } from "./components/pages/Reports";
import { LiveStreamsPage } from "./components/pages/LiveStreams";
import { RecordingsPage } from "./components/pages/Recordings";
import { DeliveriesPage } from "./components/pages/Deliveries";
import { QueriesPage } from "./components/pages/Queries";
import { TempleRequestsPage } from "./components/pages/TempleRequests";
import { PROManagersPage } from "./components/pages/ProManagers";
import { PoojasPage } from "./components/pages/Poojas";
import { CategoriesPage } from "./components/pages/Categories";
import { LanguagesPage } from "./components/pages/Languages";
import { RefundsPage } from "./components/pages/Refunds";
import { RevenuePage } from "./components/pages/Revenue";
import { Login } from "./components/pages/Login";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "bookings", Component: Bookings },
      { path: "schedule", Component: Schedule },
      { path: "live-streams", Component: LiveStreamsPage },
      { path: "recordings", Component: RecordingsPage },
      { path: "deliveries", Component: DeliveriesPage },
      { path: "queries", Component: QueriesPage },
      { path: "feedback", Component: Feedback },
      { path: "temples", Component: Temples },
      { path: "temple-requests", Component: TempleRequestsPage },
      { path: "pro-managers", Component: PROManagersPage },
      { path: "priests", Component: Priests },
      { path: "poojas", Component: PoojasPage },
      { path: "festivals", Component: Festivals },
      { path: "categories", Component: CategoriesPage },
      { path: "languages", Component: LanguagesPage },
      { path: "payments", Component: Payments },
      { path: "refunds", Component: RefundsPage },
      { path: "revenue", Component: RevenuePage },
      { path: "users", Component: Users },
      { path: "notifications", Component: Notifications },
      { path: "analytics", Component: Analytics },
      { path: "reports", Component: Reports },
      { path: "audit-logs", Component: AuditLogs },
      { path: "settings", Component: Settings },
    ],
  },
]);
