import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

// Layout components
import Layout from './components/layout/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';
import PressKitList from './pages/pressKit/PressKitList';
import PressKitEditor from './pages/pressKit/PressKitEditor';
import PressKitPreview from './pages/pressKit/PressKitPreview';

// Auth context provider
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* App routes with layout */}
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="press-kits" element={<PressKitList />} />
              <Route path="press-kits/new" element={<PressKitEditor />} />
              <Route path="press-kits/edit/:id" element={<PressKitEditor />} />
              <Route path="press-kits/preview/:id" element={<PressKitPreview />} />
            </Route>
            
            {/* Public press kit view route */}
            <Route path="/view/:id" element={<PressKitPreview public={true} />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;