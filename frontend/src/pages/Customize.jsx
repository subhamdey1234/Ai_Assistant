import React, { useContext, useRef } from 'react'
import Cards from '../Components/Cards'
import image from '../assets/image.png'
import image1 from '../assets/image2.jpg'
import image2 from '../assets/image3.jpg'
import image3 from '../assets/image4.jpg'
import image4 from '../assets/image5.jpg'
import image5 from '../assets/image6.jpg'
import image6 from '../assets/image7.jpg'
import { RiImageAddLine } from "react-icons/ri";
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Context } from '../context/Context'

function Customize() {
const { serverUrl, frontimage, setfrontendimage, backendimage, setbackendimage, selectedimage, setselectedimage } = useContext(Context);


const inputimage=useRef();

const navigate=useNavigate();


const handleimage=(e)=>{
  const file=e.target.files[0];
setbackendimage(file);
setfrontendimage(URL.createObjectURL(file));

}

  return (
    <div className=' w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col '>
        <h1 className='text-white lg:text-4xl  text-2xl font-semibold mb-[50px]'>Select Your Virtual Assistant Model</h1>
          <div className='w-[90%]  max-w-[60%] flex flex-wrap justify-center items-center gap-[20px]'>
              <Cards image={image}/>   
              <Cards image={image1}/>
              <Cards image={image2}/>
              <Cards image={image3}/>
              <Cards image={image4}/> 
              <Cards image={image5}/>
              <Cards image={image6}/>  

              <div className={`lg:w-[130px] lg:h-[200px] w-[80px] h-[120px] rounded-2xl border-2 border-blue-950 bg-[black] overflow-hidden flex  items-center justify-center hover:border-4  hover:border-white ${selectedimage=="input"?'border-4 border-white':null}`} onClick={
                ()=>{inputimage.current.click() 
                setselectedimage("input")
              } }  >
                {!frontimage &&<RiImageAddLine className='text-white text-4xl'></RiImageAddLine> }
                {frontimage && <img src={frontimage} alt="" className='w-full h-full object-cover' />}          
                                 <input type="file" hidden  accept='image/*' onChange={handleimage} ref={inputimage} />
                 </div>
          </div>
  {selectedimage && <button className='w-[300px] h-[50px] mt-5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-sky-500/25 flex items-center justify-center' onClick={()=>navigate('/customize2')}>Next</button>
}


    </div>
  )
}

export default Customize
