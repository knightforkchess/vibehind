import api from './api';

const getCurrentUser = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

const getNearbyUsers = async (longitude = 0, latitude = 0, maxDistance = 50000) => {
  const res = await api.get(`/users/nearby/users?longitude=${longitude}&latitude=${latitude}&maxDistance=${maxDistance}`);
  return res.data;
};

const updateProfile = async ({ username, bio, profileFile, coverFile }) => {
  const form = new FormData();
  if (username) form.append('username', username);
  if (bio) form.append('bio', bio);
  if (profileFile) form.append('profilePicture', profileFile);
  if (coverFile) form.append('coverPicture', coverFile);

  const res = await api.put('/users/profile', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

const signOut = () => {
  localStorage.removeItem('token');
};

export default {
  getCurrentUser,
  getNearbyUsers,
  updateProfile,
  signOut
};
