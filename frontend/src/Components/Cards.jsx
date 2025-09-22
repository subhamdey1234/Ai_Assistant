import React from 'react'
import { useContext } from 'react'
import { Context } from '../context/Context'

function Cards({image}) {
const {serverurl,frontimage,setfrontendimage,backendimage,setbackendimage,selectedimage,setselectedimage}=useContext(Context);


  return (
    <div className={`w-20 h-[120px] sm:w-[90px] sm:h-32 md:w-32 md:h-40 lg:w-[130px] lg:h-[200px] rounded-2xl border-2 shadow-md shadow-blue-300 hover:shadow-2xl cursor-pointer hover:shadow-blue-950 hover:border-4 hover:border-white overflow-hidden bg-[#030326] ${selectedimage==image? 'border-4 border-white':'' } `}
     onClick={()=>{
    setselectedimage(image);
    setbackendimage(null);
    setfrontendimage(null);
     }}
    >
      <img src={image} alt="" srcSet="" className='w-full h-full object-cover' />

    </div>
  )
}

export default Cards
