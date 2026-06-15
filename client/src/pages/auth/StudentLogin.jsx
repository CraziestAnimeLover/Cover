import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../features/auth/authSlice";
import { FaApple, FaDiscord, FaGoogle } from "react-icons/fa";
import { FiUser, FiLock, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const StudentLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await dispatch(
        loginUser({
          email: username,
          password,
        })
      ).unwrap();

      toast.success(`Welcome back, ${result.name}!`);

      switch (result.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "instructor":
          navigate("/agent/dashboard");
          break;
        case "agent":
          navigate("/agent/dashboard");
          break;
        case "affiliate":
          navigate("/affiliate/dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] items-center justify-center p-4 lg:p-8 font-sans selection:bg-orange-500/20 relative">
      {/* Premium Content Split Card */}
      <div className="w-full max-w-5xl bg-white rounded-[24px] shadow-[0_24px_70px_rgba(15,23,42,0.08)] overflow-hidden flex min-h-[660px] relative">
        
        {/* Close Button */}
      <button
  onClick={handleClose}
  className="absolute top-4 right-4 z-20 p-2.5 text-slate-900 hover:text-white hover:bg-rose-500 rounded-full transition-all duration-300 ease-out hover:scale-110 hover:rotate-90 focus:outline-none group"
  aria-label="Close"
>
  <FiX 
    size={22} 
    className="transition-transform duration-300 group-hover:rotate-90" 
  />
</button>

        {/* Left Section: Professional Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 sm:px-16">
          <div className="w-full max-w-sm">
            {/* Minimalist Tech Brand Logo */}
            <div className="mb-10 flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md shadow-orange-500/20">
                L
              </div>
              <h1 className="text-xl font-black tracking-wider text-slate-900">
                LMS Platform
              </h1>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">
                Please enter your credentials to access your dashboard.
              </p>
            </div>

            {/* Social Authentication Matrix (commented out) */}
            {/* ... */}

            {/* Clean Horizontal Divider */}
            <div className="flex items-center mb-6">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-3.5 text-slate-400 text-xs font-bold uppercase tracking-widest">Or</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Control */}
              <div className="relative">
                <label className="text-[11px] font-bold text-orange-600 uppercase tracking-wider bg-white px-1.5 absolute -top-2 left-3.5 z-10">
                  User Name
                </label>
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="name@domain.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-12 border-2 border-slate-200 focus:border-orange-500 rounded-xl pl-12 pr-4 outline-none text-sm text-slate-900 font-medium transition-all"
                  required
                />
              </div>

              {/* Password Control */}
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 border border-slate-200 focus:border-orange-500 rounded-xl pl-12 pr-4 outline-none text-sm text-slate-900 font-medium transition-all bg-slate-50/40"
                  required
                />
              </div>

              {/* Functional Modifiers */}
              <div className="flex justify-between items-center pt-1 text-xs font-semibold">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                    className="w-4 h-4 accent-orange-600 rounded border-slate-300 transition"
                  />
                  Remember session
                </label>

                <Link
                  to="/forgot-password"
                  className="text-slate-500 hover:text-orange-600 transition"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Form Actions */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-orange-500/20 tracking-wide text-sm mt-2"
              >
                {loading ? "Verifying..." : "Sign In"}
              </button>
            </form>

            {/* Registration Prompt Link */}
            <div className="text-center mt-8 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700 transition">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Seamless Full Image Matched Gradient Panel */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-b from-[#ff512f] to-[#f09819] relative flex-col items-center justify-between select-none overflow-hidden">
          
          {/* Subtle Dynamic Geometric Overlay Elements to bring depth */}
          <div className="absolute top-[-5%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="absolute top-[30%] left-[-10%] w-72 h-72 bg-amber-400/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          {/* Brand Identifier Block - Positioned elegantly over background */}
          <div className="text-center max-w-xs pt-12 px-4 z-10">
            <h3 className="text-white text-2xl font-black tracking-wide drop-shadow-sm">LMS Platform</h3>
            <p className="text-white text-[11px] font-bold uppercase tracking-[0.25em] mt-1.5 bg-white/15 px-4 py-1 rounded-full border border-white/20 backdrop-blur-sm inline-block shadow-sm">
              Smart Study Assistant
            </p>
          </div>

          {/* Full-bleed Container Layer */}
          <div className="w-full flex justify-center items-end mt-4 relative h-full">
            <img 
              src="/img/Lms.png" 
              alt="LMS Platform Student Workspace" 
              className="w-full h-auto max-h-[490px] object-cover object-top filter contrast-[1.02]"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentLogin;