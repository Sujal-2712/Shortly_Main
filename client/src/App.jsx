import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LinkPage from './pages/LinkPage';
import Auth from './pages/Auth';
import ResetPassword from './components/ResetPassword';
import Redirecting from './pages/Redirecting';
import { createContext, useEffect, useState } from 'react';
import { lockInSession } from './common/session';
import ProtectedRoute from './components/ProtectedRoute';
import { BeatLoader } from 'react-spinners';
import ForgotPassword from './pages/ForgotPassword';

export const UserContext = createContext();

function App() {
  const [userAuth, setUserAuth] = useState({
    access_token: null,
    profile_img: null,
    email: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInSession = lockInSession('user');
    if (userInSession) {
      const user = JSON.parse(userInSession);
      setUserAuth({
        access_token: user.token,
        profile_img: user.user.profile_img,
        email: user.user.email,
      });
    } else {
      setUserAuth({
        access_token: null,
        profile_img: null,
        email: null,
      });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <BeatLoader size={"100%"} color='36d7b7' />
        Loading...
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<Dashboard />} />}
            />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/link/:id" element={<LinkPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Redirecting route */}
          <Route path="/:id" element={<Redirecting />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
