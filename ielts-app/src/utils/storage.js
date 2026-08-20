const API_URL = 'http://localhost:5000/api';

const getUser = () => JSON.parse(localStorage.getItem('ielts_user'));

export const saveSettings = async (settings) => {
  const user = getUser();
  if (!user) return;
  try {
    await fetch(`${API_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, ...settings })
    });
  } catch (error) {
    console.error('Failed to save settings to API', error);
  }
};

export const getSettings = async () => {
  const user = getUser();
  if (!user) return { targetBand: 7.0, testDate: '' };
  try {
    const res = await fetch(`${API_URL}/settings/${user.username}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error('Failed to get settings from API', error);
  }
  return { targetBand: 7.0, testDate: '' };
};

export const saveMockResult = async (result) => {
  const user = getUser();
  if (!user) return;
  try {
    await fetch(`${API_URL}/results/mock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, id: Date.now().toString(), ...result })
    });
  } catch (error) {
    console.error('Failed to save mock result', error);
  }
};

export const getMockResults = async () => {
  const user = getUser();
  if (!user) return [];
  try {
    const res = await fetch(`${API_URL}/results/mock/${user.username}`);
    if (res.ok) return await res.json();
  } catch (error) {
    console.error('Failed to get mock results', error);
  }
  return [];
};

export const saveResult = async (section, data) => {
  const user = getUser();
  if (!user) return;
  try {
    await fetch(`${API_URL}/results/section`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user.username, section, data })
    });
  } catch (error) {
    console.error('Failed to save section result', error);
  }
};

export const getResults = async (section) => {
  const user = getUser();
  if (!user) return [];
  try {
    const res = await fetch(`${API_URL}/results/section/${user.username}/${section}`);
    if (res.ok) {
      const results = await res.json();
      return results.map(r => ({ ...r.data, date: r.date }));
    }
  } catch (error) {
    console.error('Failed to get section results', error);
  }
  return [];
};

export const getRecentActivity = async () => {
  const user = getUser();
  if (!user) return [];
  try {
    const res = await fetch(`${API_URL}/results/activity/${user.username}`);
    if (res.ok) return await res.json();
  } catch (error) {
    console.error('Failed to get recent activity', error);
  }
  return [];
};
