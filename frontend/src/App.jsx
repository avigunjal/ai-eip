import { RouterProvider } from 'react-router';
import ThemeProvider from './providers/ThemeProvider.jsx';
import router from './routes/router.jsx';
import Toaster from './components/ui/Toaster.jsx';

/**
 * App root: MUI theme + baseline, an accessible skip link, the data router,
 * and the global toast host.
 */
const App = () => (
  <ThemeProvider>
    <a href="#main-content" className="skip-link">
      Skip to content
    </a>
    <RouterProvider router={router} />
    <Toaster />
  </ThemeProvider>
);

export default App;
