import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useRestoreSessionMutation } from './services/api';
import { setTheme } from './store/slices/globalSlice';
import routes from './routes';
import LoadingState from '@/components/LoadingState';

function App() {
  const dispatch = useDispatch();
  const { isAppLoading } = useSelector((state) => state.auth);
  const [restoreSession] = useRestoreSessionMutation();

  useEffect(() => {
    // Apply persisted theme immediately to prevent flash of wrong theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    dispatch(setTheme(savedTheme));
    
    restoreSession();
  }, []);

  if (isAppLoading) {
    return <LoadingState text="Carregando aplicativo..." fullScreen />;
  }

  return <RouterProvider router={routes} />;
}

export default App;