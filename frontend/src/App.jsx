import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import HelpPage from './pages/HelpPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import FeelBetterPage from './pages/FeelBetterPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MemorySearchPage from './pages/MemorySearchPage';
import PhysicalDataPage from './pages/PhysicalDataPage';
import InsightDashboard from './pages/InsightDashboard';
import FocusPage from './pages/FocusPage';
import VideoCounselor from './pages/VideoCounselor';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/feel-better" element={<FeelBetterPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/search" element={
              <PrivateRoute>
                <MemorySearchPage />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            <Route path="/chat" element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            } />
            <Route path="/physical-health" element={
              <PrivateRoute>
                <PhysicalDataPage />
              </PrivateRoute>
            } />
            <Route path="/insights" element={
              <PrivateRoute>
                <InsightDashboard />
              </PrivateRoute>
            } />
            <Route path="/focus" element={
              <PrivateRoute>
                <FocusPage />
              </PrivateRoute>
            } />
            <Route path="/video-session" element={
              <PrivateRoute>
                <VideoCounselor />
              </PrivateRoute>
            } />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
