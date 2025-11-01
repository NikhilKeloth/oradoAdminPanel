import React from 'react'
function Categorylist({catgoryImage,restaurantName}) {
  return (
    <div className="w-[12.5em] h-full flex-shrink-0 text-center bg-gray-100 rounded-xl">

     <div className="h-[90%]">
        <img src={catgoryImage} alt="" className="rounded-t-xl w-full h-full object-cover" />
      </div>
     <div>

        <h3 className='font-bold'>{restaurantName}</h3>
        <h5 className='text-[#EA4424]'>21 Restaurants</h5>

     </div>
    </div>
  )
}

export default Categorylist