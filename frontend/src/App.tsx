import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import OtpVerification from './components/auth/OtpVerification';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import ChatInterface from './components/chat/ChatInterface';
import ScheduleView from './components/schedule/ScheduleView';
import ProgressDashboard from './components/progress/ProgressDashboard';
import ProfileSettings from './components/profile/ProfileSettings';
import Dashboard from './components/dashboard/Dashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

type AuthView = 'login' | 'register' | 'otp' | 'forgot' | 'reset';
type AppTab = 'dashboard' | 'chat' | 'schedule' | 'progress' | 'profile';

const AuthFlow: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [pendingEmail, setPendingEmail] = useState('');

  const handleNeedOtpVerification = (email: string) => {
    setPendingEmail(email);
    setCurrentView('otp');
  };

  const handleNeedPasswordReset = (email: string) => {
    setPendingEmail(email);
    setCurrentView('reset');
  };

  const handleResetSuccess = () => {
    setCurrentView('login');
    setPendingEmail('');
  };

  const renderAuthView = () => {
    switch (currentView) {
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={() => setCurrentView('login')}
            onNeedOtpVerification={handleNeedOtpVerification}
          />
        );
      case 'otp':
        return (
          <OtpVerification
            email={pendingEmail}
            onBack={() => setCurrentView('login')}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordForm
            onBack={() => setCurrentView('login')}
            onNeedPasswordReset={handleNeedPasswordReset}
          />
        );
      case 'reset':
        return (
          <ResetPasswordForm
            email={pendingEmail}
            onBack={() => setCurrentView('login')}
            onSuccess={handleResetSuccess}
          />
        );
      default:
        return (
          <LoginForm
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToForgotPassword={() => setCurrentView('forgot')}
            onNeedOtpVerification={handleNeedOtpVerification}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      {renderAuthView()}
    </div>
  );
};

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard onTabChange={setActiveTab} />}
      {activeTab === 'chat' && <ChatInterface />}
      {activeTab === 'schedule' && <ScheduleView />}
      {activeTab === 'progress' && <ProgressDashboard />}
      {activeTab === 'profile' && <ProfileSettings />}
    </Layout>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  if (loading) {
    return <LoadingSpinner />;
  }

  return user ? <MainApp /> : <AuthFlow />;
};
      {activeTab === 'dashboard' && <Dashboard onTabChange={setActiveTab} />}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;