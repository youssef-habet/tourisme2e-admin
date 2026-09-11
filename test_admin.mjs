import axios from 'axios';
import mysql from 'mysql2/promise';

async function test() {
  const api = axios.create({ baseURL: 'http://localhost:8080/api/v1' });
  const email = `test_admin_${Date.now()}@test.com`;

  try {
    // 1. Create user
    console.log('Registering user:', email);
    await api.post('/auth/register', {
      nom: 'Test',
      prenom: 'Admin',
      email: email,
      motDePasse: 'password123',
      role: 'CLIENT', 
      typeProfil: 'PARTICULIER'
    });

    // 2. Update to ADMIN in DB
    console.log('Updating to ADMIN in DB...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'tourisme2e_db'
    });
    await connection.execute('UPDATE utilisateurs SET role = ? WHERE email = ?', ['ADMIN', email]);
    await connection.end();
    console.log('User is now ADMIN');

    // 3. Login
    console.log('Logging in...');
    const loginRes = await api.post('/auth/login', { email, motDePasse: 'password123' });
    const token = loginRes.data.token;
    console.log('Got token');

    // 4. Fetch pavillons
    console.log('Fetching pavillons...');
    const pavRes = await api.get('/pavillons', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success!', pavRes.data);
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data || err.message);
  }
}

test();
