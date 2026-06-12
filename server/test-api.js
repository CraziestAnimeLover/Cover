import dotenv from 'dotenv';
dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;

// Test registration and login
async function quickTest() {
  console.log('🚀 Quick API Test\n');
  
  // Test Health
  try {
    const healthRes = await fetch(`http://localhost:${process.env.PORT || 5000}/health`);
    const healthData = await healthRes.json();
    console.log('✓ Health Check:', healthData);
  } catch (error) {
    console.log('✗ Server not running');
    return;
  }
  
  // Test Registration
  const testEmail = `test${Date.now()}@example.com`;
  const registerRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: testEmail,
      password: 'test123',
      role: 'student'
    })
  });
  
  const registerData = await registerRes.json();
  console.log('✓ Register:', registerData.message || 'Success');
  
  // Test Login
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'test123'
    })
  });
  
  const loginData = await loginRes.json();
  console.log('✓ Login:', loginData.token ? 'Success' : 'Failed');
  
  if (loginData.token) {
    // Test Get Profile
    const profileRes = await fetch(`${API_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    const profileData = await profileRes.json();
    console.log('✓ Profile:', profileData.name);
    
    // Test Get Courses
    const coursesRes = await fetch(`${API_URL}/courses`);
    const coursesData = await coursesRes.json();
    console.log('✓ Courses:', coursesData.total || 0, 'courses found');
  }
  
  console.log('\n✅ Test completed!');
}

quickTest();