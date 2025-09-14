import React, { useState, useContext } from 'react'
import bg from '../assets/loginbackground.png'
import { IoEye, IoEyeOff } from "react-icons/io5";
import { IoMdMail } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { Context } from '../context/Context';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';


function Signup() {
  const context = useContext(Context);
  const serverUrl = context?.serverUrl;
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear general error when user starts typing
    if (error) setError(null);

    // Check password match when either password or confirm password changes
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'confirmPassword' && value !== formData.password) {
        setPasswordError("Passwords don't match");
      } else if (name === 'password' && value !== formData.confirmPassword && formData.confirmPassword) {
        setPasswordError("Passwords don't match");
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${serverUrl}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.data) {
        // Optionally store token if your API returns it
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        // Redirect to login page after successful signup
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during signup');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{backgroundImage:`url(${bg})`, backgroundRepeat:'no-repeat',backgroundPosition:'center'}} 
           className="flex justify-center items-center w-full h-[100vh] min-h-screen bg-cover">
        
        <form onSubmit={handleSubmit} 
              className='w-[90%] h-auto max-w-[500px] flex flex-col items-center p-8 justify-center gap-6 bg-black/50 backdrop-blur-xl rounded-2xl border-[2px] border-sky-400 shadow-sm shadow-amber-50'>
          
          <h1 className='text-white text-[30px] font-semibold'>Sign Up to <span className='text-sky-500'>Virtual Assistant</span></h1>
          
          {error && (
            <div className="w-full text-center text-white bg-red-700/40 px-4 py-2 rounded-lg">
              {error}!!
            </div>
          )}
          {/* Name Input */}
          <div className='w-full relative flex items-center'>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder='Enter your Name' 
              className='text-white w-full placeholder:text-white/80 h-[50px] px-[30px] py-[20px] bg-white/5 border border-sky-500 outline-none focus:border-white focus:ring-2 focus:ring-sky-500/50 transition-all duration-300 rounded-full' 
            />
            <FaUser className='absolute right-4 text-white/80 hover:text-white cursor-default text-xl transition-colors duration-300'/>
          </div>

          {/* Email Input */}
          <div className='w-full relative flex items-center'>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder='Enter your Email' 
              className='text-white w-full placeholder:text-white/80 h-[50px] px-[30px] py-[20px] bg-white/5 border border-sky-500 outline-none focus:border-white focus:ring-2 focus:ring-sky-500/50 transition-all duration-300 rounded-full' 
            />
            <IoMdMail className='absolute right-4 text-white/80 hover:text-white cursor-default text-xl transition-colors duration-300'/>
          </div>

          {/* Password Input */}
          <div className='w-full relative flex items-center'>
            <input 
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder='Enter Password' 
              className='text-white w-full placeholder:text-white/80 h-[50px] px-[30px] py-[20px] bg-white/5 border border-sky-500 outline-none focus:border-white focus:ring-2 focus:ring-sky-500/50 transition-all duration-300 rounded-full' 
            />
            <div 
              onClick={() => setShowPassword(!showPassword)} 
              className='absolute right-4 text-white/80 hover:text-white cursor-pointer text-xl transition-colors duration-300'
            >
              {showPassword ? <IoEye /> : <IoEyeOff />}
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className='w-full relative flex items-center'>
            <input 
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder='Confirm Password' 
              className='text-white w-full placeholder:text-white/80 h-[50px] px-[30px] py-[20px] bg-white/5 border border-sky-500 outline-none focus:border-white focus:ring-2 focus:ring-sky-500/50 transition-all duration-300 rounded-full' 
            />
            <div 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              className='absolute right-4 text-white/80 hover:text-white cursor-pointer text-xl transition-colors duration-300'
            >
              {showConfirmPassword ? <IoEye /> : <IoEyeOff />}
            </div>
          </div>

          {/* Password Error Message */}
          {passwordError && (
            <div className="text-red-400 text-sm w-full text-center">
              {passwordError}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full h-[50px] bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-sky-500/25 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
            ) : (
              'Sign Up'
            )}
          </button>

          {/* Login Link */}
          <div className="flex gap-2 text-white/80">
            <span>Already have an account?</span>
            <a href="/login" className="text-sky-400 hover:text-sky-300 transition-colors duration-300 hover:underline">
              Login
            </a>
          </div>

        </form>
      </div>
    </div>
  );
}

export default Signup;
