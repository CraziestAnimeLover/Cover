import dotenv from 'dotenv';
dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  let authToken = null;
  let userId = null;
  
  // 1. Health Check
  console.log('1. Testing Health Check...');
  try {
    const res = await fetch(`http://localhost:${process.env.PORT || 5000}/health`);
    const data = await res.json();
    console.log('   ✓', data);
  } catch (error) {
    console.log('   ✗ Server not running!');
    console.log('   Please start the server with: npm run dev');
    process.exit(1);
  }
  
  // 2. Register User
  console.log('\n2. Testing User Registration...');
  const testEmail = `test${Date.now()}@example.com`;
  const registerRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Student',
      email: testEmail,
      password: 'test123',
      role: 'student'
    })
  });
  const registerData = await registerRes.json();
  
  if (registerRes.status === 201) {
    console.log('   ✓ Registration successful');
    console.log('   Email:', registerData.email);
    console.log('   Role:', registerData.role);
    userId = registerData._id;
    authToken = registerData.token;
  } else {
    console.log('   ✗ Registration failed:', registerData.message);
  }
  
  // 3. Login
  if (authToken) {
    console.log('\n3. Testing Login...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'test123'
      })
    });
    const loginData = await loginRes.json();
    
    if (loginRes.status === 200) {
      console.log('   ✓ Login successful');
      console.log('   Name:', loginData.name);
      console.log('   Token:', loginData.token ? 'Received' : 'Not received');
      authToken = loginData.token;
    } else {
      console.log('   ✗ Login failed:', loginData.message);
    }
  }
  
  // 4. Get Profile
  if (authToken) {
    console.log('\n4. Testing Get Profile...');
    const profileRes = await fetch(`${API_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const profileData = await profileRes.json();
    
    if (profileRes.status === 200) {
      console.log('   ✓ Profile retrieved');
      console.log('   Name:', profileData.name);
      console.log('   Email:', profileData.email);
    } else {
      console.log('   ✗ Get profile failed:', profileData.message);
    }
  }
  
  // 5. Get Courses
  console.log('\n5. Testing Get Courses...');
  const coursesRes = await fetch(`${API_URL}/courses`);
  const coursesData = await coursesRes.json();
  
  if (coursesRes.status === 200) {
    console.log('   ✓ Courses retrieved');
    console.log('   Total:', coursesData.total || 0);
  } else {
    console.log('   ✗ Get courses failed:', coursesData.message);
  }
  
  console.log('\n✅ All tests completed!\n');
}

runTests();