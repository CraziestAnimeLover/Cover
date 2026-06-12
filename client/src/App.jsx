import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AppRoutes from './AppRoutes';
import { setUser } from './features/auth/authSlice';

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      dispatch(setUser(JSON.parse(user)));
    }
    setLoading(false);
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;