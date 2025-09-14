import React from 'react'

function Cards({image}) {
  return (
    <div className='lg:w-[130px] lg:h-[200px] w-[80px] h-[120px] rounded-2xl border-2 shadow-md shadow-blue-300  hover:shadow-2xl cursor-pointer  hover:shadow-blue-950 hover:border-4 hover:border-white overflow-hidden border-[blue] bg-[#030326] ' >
      <img src={image} alt="" srcset="" className='h-full object-cover ' />

    </div>
  )
}

export default Cards
