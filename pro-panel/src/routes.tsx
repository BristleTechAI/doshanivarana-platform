import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout.tsx';
import { Login } from './pages/Login.tsx';
import { Home } from './pages/Home.tsx';
import { Schedule } from './pages/Schedule.tsx';
import { AddEditSlot } from './pages/AddEditSlot.tsx';
import { Bookings } from './pages/Bookings.tsx';
import { BookingDetail } from './pages/BookingDetail.tsx';
import { PujariManager } from './pages/PujariManager.tsx';
import { AddEditPujari } from './pages/AddEditPujari.tsx';
import { PoojaReadiness } from './pages/PoojaReadiness.tsx';
import { StreamReadiness } from './pages/StreamReadiness.tsx';
import { LiveStream } from './pages/LiveStream.tsx';
import { Recordings } from './pages/Recordings.tsx';
import { Deliveries } from './pages/Deliveries.tsx';
import { DeliveryDetail } from './pages/DeliveryDetail.tsx';
import { Queries } from './pages/Queries.tsx';
import { Feedback } from './pages/Feedback.tsx';
import { ProfileSettings } from './pages/ProfileSettings.tsx';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'schedule',
        element: <Schedule />,
      },
      {
        path: 'schedule/add',
        element: <AddEditSlot isEdit={false} />,
      },
      {
        path: 'schedule/edit/:id',
        element: <AddEditSlot isEdit={true} />,
      },
      {
        path: 'bookings',
        element: <Bookings />,
      },
      {
        path: 'bookings/:id',
        element: <BookingDetail />,
      },
      {
        path: 'pujaris',
        element: <PujariManager />,
      },
      {
        path: 'pujaris/add',
        element: <AddEditPujari isEdit={false} />,
      },
      {
        path: 'pujaris/edit/:id',
        element: <AddEditPujari isEdit={true} />,
      },
      {
        path: 'pooja-readiness/:id',
        element: <PoojaReadiness />,
      },
      {
        path: 'stream-readiness/:id',
        element: <StreamReadiness />,
      },
      {
        path: 'live-stream',
        element: <LiveStream />,
      },
      {
        path: 'recordings',
        element: <Recordings />,
      },
      {
        path: 'deliveries',
        element: <Deliveries />,
      },
      {
        path: 'deliveries/:id',
        element: <DeliveryDetail />,
      },
      {
        path: 'queries',
        element: <Queries />,
      },
      {
        path: 'feedback',
        element: <Feedback />,
      },
      {
        path: 'profile',
        element: <ProfileSettings />,
      },
    ],
  },
]);
