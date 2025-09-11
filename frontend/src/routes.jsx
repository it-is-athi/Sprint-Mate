import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
// import other components...
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    {/* other routes */}
    </Routes>
  );
}