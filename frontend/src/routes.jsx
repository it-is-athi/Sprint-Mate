import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// Import the new modular dashboard layout and containers
import DashboardLayout from './layouts/DashboardLayout';
import HomeContainer from './pages/HomeContainer';
import SchedulesContainer from './pages/SchedulesContainer';
import TasksContainer from './pages/TasksContainer';
import ChatPage from './pages/ChatPage';
import ProfileContainer from './pages/ProfileContainer';
import ProgressContainer from './pages/ProgressContainer';
import HelpPage from './pages/HelpPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Dashboard with nested routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<HomeContainer />} />
        <Route path="home" element={<HomeContainer />} />
        <Route path="schedules" element={<SchedulesContainer />} />
        <Route path="schedules/tasks/:scheduleId" element={<TasksContainer />} />
        <Route path="progress" element={<ProgressContainer />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="profile" element={<ProfileContainer />} />
        <Route path="help" element={<HelpPage />} />
      </Route>
    </Routes>
  );
}