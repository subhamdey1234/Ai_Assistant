import React, { useState } from 'react'
import bg from '../assets/registerbackground.jpg'
import { IoEye } from "react-icons/io5";
import { IoMdMail } from "react-icons/io";
import { IoEyeOff } from "react-icons/io5";
import { useContext } from 'react';
import { Context } from '../context/Context';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  const { login } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await login(formData.email, formData.password);
      if (result.success) {
        // If the user was redirected to login from a protected route, go back there
        const redirectTo = '/customize';
        navigate(redirectTo, { replace: true });
            } else {
                setError(result.message || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during login');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div>
   <div style={{backgroundImage:`url(${bg})`, backgroundRepeat:'no-repeat',backgroundPosition:'center'}} className="flex justify-center items-center w-full h-[100vh]  min-h-screen bg-cover">
    
    <form onSubmit={handleSubmit} className='w-[90%] h-auto max-w-[500px] flex flex-col items-center p-8 justify-center gap-6 bg-black/50 backdrop-blur-md rounded-2xl border-[2px]  border-sky-400 shadow-sm shadow-amber-50'>
    
     <h1 className='text-white text-[30px] font-semibold '>Login to <span className='text-sky-500'> Virtual Assistant</span></h1>
     
     {error && (
       <div className="w-full text-center text-white bg-red-700/40 px-4 py-2 rounded-lg">
         {error}!!
       </div>
     )}
     
     <div className='w-full relative flex items-center'>
     <input 
       type="email" 
       name="email"
       value={formData.email}
       onChange={handleChange}
       placeholder='Enter the Email' 
       className='text-white w-full placeholder:text-white/80 h-[50px] px-[30px] py-[20px] bg-white/5 border border-sky-500 outline-none focus:border-white focus:ring-2 focus:ring-sky-500/50 transition-all duration-300 rounded-full' 
       required
     />
     <IoMdMail className='absolute right-4 text-white/80 hover:text-white cursor-grab text-xl transition-colors duration-300'/>
     </div>

    <div className='w-full relative flex items-center'>
     <input 
       type={showPassword ? "text" : "password"}
       name="password"
       value={formData.password}
       onChange={handleChange}
       placeholder='Enter the Password' 
       className='text-white w-full placeholder:text-white/80 h-[50px] px-[30px] py-[20px] bg-white/5 border border-sky-500 outline-none focus:border-white focus:ring-2 focus:ring-sky-500/50 transition-all duration-300 rounded-full'
       required 
     />
     <div 
       onClick={() => setShowPassword(!showPassword)} 
       className='absolute right-4 text-white/80 hover:text-white cursor-pointer text-xl transition-colors duration-300'
     >
       {showPassword ? <IoEyeOff /> : <IoEye />}
     </div>
    </div>

    <div className="w-full flex justify-end">
      <a href="/forgot-password" className="text-red-500 hover:text-red-800 text-sm transition-colors duration-300 hover:underline">Forgot Password?</a>
    </div>

    <button 
      type="submit" 
      disabled={loading}
      className={`w-full h-[50px] bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-sky-500/25 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>
      ) : (
        'Login'
      )}
    </button>

    <div className="flex gap-2 text-white/80">
      <span>Don't have an account?</span>
      <a href="/signup" className="text-sky-400 hover:text-sky-300 transition-colors duration-300 hover:underline">Register</a>
    </div>

    </form>    
    </div>   

    </div>
  )
}


export default Login
