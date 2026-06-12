import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new registration with purchase flow
    navigate('/register');
  }, [navigate]);
  
  return null;
};

export default Register;