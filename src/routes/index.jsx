import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../screens/LoginPage/LoginPage';
import Home from '../screens/Home/Home';
import LayoutsBridge from '../screens/LayoutsBridge';
import TicketLayouts from '../screens/TicketLayouts/TicketLayouts';
import Geofence from '../screens/Geofence/Geofence';
import CompanyInfo from '../screens/CompanyInfo/CompanyInfo';
import Users from '../screens/admin/Users/Users';
import ApiKey from '../screens/admin/ApiKey/ApiKey';
import CompanyServices from '../screens/CompanyServices/CompanyServices';
import Announcements from '../screens/Announcements/Announcements';
import ProtectedRoute from '../components/ProtectedRoute';
import NotFound from '../screens/NotFound/NotFound';
import Layout from '../components/Layout';

const routes = createBrowserRouter([
    {
        path: '/',
        element: <ProtectedRoute><Layout /></ProtectedRoute>,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'layouts',
                element: <LayoutsBridge />,
            },
            {
                path: 'ticket-layouts',
                element: <TicketLayouts />,
            },
            {
                path: 'geofence',
                element: <Geofence />,
            },
            {
                path: 'company',
                element: <CompanyInfo />,
            },
            {
                path: 'users',
                element: <Users />,
            },
            {
                path: 'services',
                element: <CompanyServices />,
            },
            {
                path: 'announcements',
                element: <Announcements />,
            },
            {
                path: 'api-keys',
                element: <ApiKey />,
            },
        ],
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '*',
        element: <NotFound />,
    },
]);

export default routes;
