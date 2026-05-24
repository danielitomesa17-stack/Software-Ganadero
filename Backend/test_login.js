import axios from 'axios';

const testLogin = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'dani@danubio.com',
      password: 'admin123'
    });
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else {
      console.error('Network error:', error.message);
    }
  }
};

testLogin();
