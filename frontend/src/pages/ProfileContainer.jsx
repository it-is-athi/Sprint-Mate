import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import ProfilePage from '../pages/ProfilePage';
import api from '../api/axios';

function ProfileContainer() {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      console.log('Updating profile:', profileData);
      const response = await api.put('/auth/profile', profileData);
      console.log('Profile updated:', response.data);
      
      // Update user context with new data
      updateUser(response.data.user);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update profile' 
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfilePage 
      user={user} 
      onUpdateProfile={updateProfile}
      loading={loading}
    />
  );
}

export default ProfileContainer;