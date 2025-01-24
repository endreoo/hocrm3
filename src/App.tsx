import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import { useLocation } from './hooks/useLocation';
import Dashboard from './pages/dashboard/Dashboard';
import Bookings from './pages/bookings/Bookings';
import Hotels from './pages/hotels/Hotels';
import Guests from './pages/guests/Guests';
import Finance from './pages/finance/Finance';
import GuestProfile from './pages/guests/GuestProfile';
import Contacts from './pages/contacts/Contacts';
import Tickets from './pages/tickets/Tickets';
import Users from './pages/users/Users';
import { useAuth } from './contexts/AuthContext';
import Tools from './pages/tools/Tools';

function getGuestIdFromPath(path: string): string | null {
  const match = path.match(/^\/guests\/([^/]+)$/);
  return match ? match[1] : null;
}

function getComponent(pathname: string, guestId: string | null, hasPermission: (permission: string) => boolean) {
  // Check permissions for the route
  const routePermissions: Record<string, string> = {
    '/guests': 'view:guests',
    '/finance': 'view:finance',
    '/hotels': 'view:hotels',
    '/contacts': 'view:contacts',
    '/tickets': 'view:tickets',
    '/users': 'manage:users',
    '/bookings': 'view:bookings',
    '/tools': 'admin'
  };

  const requiredPermission = routePermissions[pathname];
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (guestId) {
    return <GuestProfile guestId={guestId} />;
  }

  switch (pathname) {
    case '/':
      return <Dashboard />;
    case '/guests':
      return <Guests />;
    case '/finance':
      return <Finance />;
    case '/hotels':
      return <Hotels />;
    case '/contacts':
      return <Contacts />;
    case '/tickets':
      return <Tickets />;
    case '/users':
      return <Users />;
    case '/bookings':
      return <Bookings />;
    case '/tools':
      return <Tools />;
    default:
      return <Dashboard />;
  }
}

function App() {
  const location = useLocation();
  const guestId = getGuestIdFromPath(location.pathname);
  const { hasPermission } = useAuth();

  return (
    <Layout>
      {getComponent(location.pathname, guestId, hasPermission)}
    </Layout>
  );
}

export default App;
