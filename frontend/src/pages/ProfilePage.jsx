import React from 'react';

function ProfilePage({ user }) {
  return (
    <div className="bg-gray-900 rounded-xl p-8 border border-yellow-600/30">
      <h3 className="text-xl font-semibold text-yellow-400 mb-6">Profile Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input
            type="text"
            value={user?.name || ''}
            readOnly
            className="w-full px-3 py-2 bg-black border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            readOnly
            className="w-full px-3 py-2 bg-black border border-gray-600 rounded-lg text-white"
          />
        </div>
        <p className="text-gray-400 text-sm mt-4">Profile editing features coming soon!</p>
      </div>
    </div>
  );
}

export default ProfilePage;