import React from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import theme from './theme';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderProfilePage from './pages/ProviderProfilePage';
import AccountPage from './pages/AccountPage';
import MyPlansPage from './pages/MyPlansPage';
import MyRatingsPage from './pages/MyRatingsPage';
import ManageAddressesPage from './pages/ManageAddressesPage';
import SettingsPage from './pages/SettingsPage';
import WalletPage from './pages/WalletPage';
import SubscriptionPage from './pages/SubscriptionPage';

import ProtectedRoute from './components/ProtectedRoute';
import NavigationHeader from './components/NavigationHeader';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <NavigationHeader />
            <Routes>
              <Route path='/' element={<Navigate to="/signup" />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path='/signup' element={<SignupPage />} />
              <Route path='/verify-email' element={<EmailVerificationPage />} />

              {/* Protected Routes */}
              <Route path='/dashboard' element={
                <ProtectedRoute>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              <Route path='/provider' element={
                <ProtectedRoute roles={['SERVICE_PROVIDER','ADMIN']}>
                  <ProviderDashboard />
                </ProtectedRoute>
              } />
              <Route path='/provider/profile' element={
                <ProtectedRoute roles={['SERVICE_PROVIDER','ADMIN']}>
                  <ProviderProfilePage />
                </ProtectedRoute>
              } />
              <Route path='/profile' element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path='/account' element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              } />
              <Route path='/payment' element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              } />

              {/* New Pages */}
              <Route path='/my-plans' element={
                <ProtectedRoute>
                  <MyPlansPage />
                </ProtectedRoute>
              } />
              <Route path='/my-ratings' element={
                <ProtectedRoute>
                  <MyRatingsPage />
                </ProtectedRoute>
              } />
              <Route path='/manage-addresses' element={
                <ProtectedRoute>
                  <ManageAddressesPage />
                </ProtectedRoute>
              } />
              <Route path='/settings' element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path='/wallet' element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              } />
              <Route path='/subscription' element={
                <ProtectedRoute roles={['CUSTOMER']}>
                  <SubscriptionPage />
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </MuiThemeProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
