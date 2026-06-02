import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme as toggleThemeAction } from '../store/slices/globalSlice';

/**
 * Custom hook for reading and toggling the application theme.
 * Reads from Redux store (global.theme) and dispatches toggleTheme.
 */
export function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.global.theme);
  const isDark = theme === 'dark';

  const toggleTheme = () => dispatch(toggleThemeAction());

  return { theme, isDark, toggleTheme };
}
