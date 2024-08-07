import React from 'react'
import { assets } from '../assets/assets'

const AddAlbum = () => {
  return (
    <form className='flex flex-col items-start gap-8 text-gray-600'>

      <div className='flex flex-col gap-4 pl-5'>
        <p>Upload Image</p>
        <input type="file" id='image' accept='image/*' hidden/>
        <label htmlFor="image">
          <img className='w-24 cursor-pointer' src={assets.upload_area} alt="" />
        </label>
      </div>
    <div className='flex flex-col gap-2.5'>
      <p>Album Name</p>
      <input className='bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw)]' type="text" placeholder='Type Here'/>
    </div>

    </form>
  )
}

export default AddAlbum
