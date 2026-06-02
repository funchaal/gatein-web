import { createBrowserRouter } from 'react-router-dom';
import LoginPage from '../screens/LoginPage/LoginPage';
import Home from '../screens/Home/Home';
import AppointmentLayouts from '../screens/AppointmentLayouts/AppointmentLayouts';
import Geofence from '../screens/Geofence/Geofence';
import CompanyInfo from '../screens/CompanyInfo/CompanyInfo';
import Users from '../screens/admin/Users/Users';
import ApiKey from '../screens/admin/ApiKey/ApiKey';
import CompanyServices from '../screens/CompanyServices/CompanyServices';
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
                element: <AppointmentLayouts />,
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
