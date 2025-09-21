import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ProfilePage from '../pages/ProfilePage';

function ProfileContainer() {
  const { user } = useContext(AuthContext);

  return (
    <ProfilePage user={user} />
  );
}

export default ProfileContainer;