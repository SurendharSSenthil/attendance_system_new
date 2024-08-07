import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Attendance from './pages/Attendance';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import HomeLayout from './HomeLayout';

const App = () => {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDataString = localStorage.getItem('user');
  
    if (token) {
      setAuth(true);
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser({});
        }
      } else {
        setUser({});
      }
    } else {
      setAuth(false);
    }
  }, []);
  

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={auth ? <Navigate to="/" /> : <Auth setAuth={setAuth} setUser={setUser} />} />
        <Route
          path="/"
          element={auth ? <HomeLayout setAuth={setAuth} user={user} /> : <Navigate to="auth" />}
        >
          <Route index element={<Attendance setAuth={setAuth} user={user} />} />
          <Route path="dashboard" element={<Dashboard setAuth={setAuth} user={user} />} />
          <Route path="students" element={<Students setAuth={setAuth} user={user} />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
