import axios from 'axios';

async function test() {
  const api = axios.create({ baseURL: 'http://localhost:8080/api/v1' });
  try {
    // 1. Create a random user (using /auth/register)
    const email = `test_admin_${Date.now()}@test.com`;
    console.log('Registering user:', email);
    await api.post('/auth/register', {
      nom: 'Test',
      prenom: 'Admin',
      email: email,
      motDePasse: 'password123',
      role: 'ADMIN',
      typeProfil: 'PARTICULIER'
    });

    // 2. Login
    console.log('Logging in...');
    const loginRes = await api.post('/auth/login', { email, motDePasse: 'password123' });
    const token = loginRes.data.token;
    console.log('Got token');

    // 3. Fetch pavillons
    console.log('Fetching pavillons...');
    const pavRes = await api.get('/pavillons', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success:', pavRes.data);
  } catch (err) {
    console.error('Error fetching:', err.response?.status, err.response?.data || err.message);
  }
}

test();
