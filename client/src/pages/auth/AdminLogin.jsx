import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';
import { FiMail, FiLock } from 'react-icons/fi';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await dispatch(
        loginUser({ email, password })
      ).unwrap();

      if (result.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.role === 'instructor') {
        navigate('/agent/dashboard');
      } else {
        toast.error('Only admin or instructor can use this login');
      }
    } catch (error) {
      toast.error(error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-black">LMS</span>
            <span className="text-purple-600">Platform</span>
          </h1>

          <h2 className="text-3xl font-semibold mb-8">
            Admin / Instructor Login
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <FiMail className="absolute left-3 top-4 text-gray-400" />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-xl pl-10 py-3"
                required
              />
            </div>

            <div className="relative mb-6">
              <FiLock className="absolute left-3 top-4 text-gray-400" />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-xl pl-10 py-3"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-xl"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side */}
      <div
        className="hidden lg:flex w-1/2 items-center justify-center text-white"
        style={{
          clipPath: 'polygon(12% 0%,100% 0%,100% 100%,0% 100%)',
          background:
            'linear-gradient(135deg,#E9D5FF 0%,#8B5CF6 100%)',
        }}
      >
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-2">
            LMS Platform
          </h1>

          <p className="text-xl tracking-widest">
            Smart Study Assistant
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;