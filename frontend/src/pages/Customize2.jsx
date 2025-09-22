import React from 'react'
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useContext } from 'react';
import { Context } from '../context/Context';
import axios from 'axios';
function Customize2() {
  const {userdata,backendimage,selectedimage,serverUrl,setUserdata}= useContext(Context);

  const navigate = useNavigate();
  const [name,setname]=useState(userdata?.assistantName || "");


const handleupdateassistant = async () => {
  try {
    const formdata = new FormData();
    formdata.append("assistantname", name);
    if (backendimage) {
      formdata.append("assistantimage", backendimage);
    } else {
      formdata.append("imgUrl", selectedimage);
    }

    const result = await axios.post(`${serverUrl}/api/user/update`, formdata, { withCredentials: true });

    // Backend responds with { message: 'Assistant updated successfully', user }
    if (result?.data?.user) {
      // Update context immediately so Home re-renders with new image
      setUserdata(result.data.user);
       navigate("/");
      return { success: true, user: result.data.user };
    }


    console.warn('Unexpected update response:', result.data);
  
    return { success: false };
     
  } catch (error) {
    console.error('Update assistant error:', error);
    return { success: false, error };
  }
};
  
  

  return (
    <div className="min-h-screen w-full bg-gradient-to-t from-black to-[#030353] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-8">
        <div className="flex items-center lg:gap-[60px] gap-[30px] mb-6">
          <button
            onClick={() => navigate('/customize')}
            aria-label="Back to customize"
            className="p-2 rounded-full bg-white/6 hover:bg-white/10 transition-colors text-white"
          >
            <IoMdArrowRoundBack size={22} />
          </button>

          <h1  className="text-white  font-bold text-2xl">Enter your <span className="text-sky-400">Assistant's Name</span></h1>
        </div>

        <p className="text-gray-300 mb-4 text-center">Give your virtual assistant a friendly name that reflects its personality.</p>

        <div className="flex flex-col items-center">
          <input
            type="text"
            placeholder="eg. Alexa.."
            className="w-full lg:w-3/4 text-white bg-transparent border-2 border-white/20 placeholder-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
            onChange={(e)=>setname(e.target.value)}
          value={name}      
          />

{name &&   <button
            className="mt-6 w-40 h-12 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-all duration-200 shadow-lg"
            onClick={async () => {
              const res = await handleupdateassistant();
              // Only navigate when update succeeded so Home shows the new image immediately
              if (res?.success) {
                navigate('/', { replace: true });
              }
            }}
          >
            Let's Create
          </button>}
        
        </div>
      </div>
    </div>
  )
}

export default Customize2
