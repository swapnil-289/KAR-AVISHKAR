import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';
import Homebg from "/home_bg.jpg";
import calendarbg from "/CalendarView.jpg";
import { motion } from 'framer-motion';
export default function Home() {
  
  return (
    <motion.div className="transition-all duration-1000 p-4"
    initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1 }}>
      <h1 className="text-4xl font-bold mb-4">Welcome to Our Event Web App!</h1>
      <p className="text-lg mb-4">
        Our platform is designed to help you discover and participate in events that you're interested in. 
        Whether you're looking for music festivals, tech conferences, or community gatherings, you'll find it all here.
      </p>
      <p className="text-lg mb-4">
        If you're an event organizer, you can also use our platform to manage and promote your events. 
        You'll have access to powerful tools that make it easy to sell tickets, manage attendees, and more.
      </p>
      <p className="text-lg">
        Start exploring events or create your own today!
      </p>
      <div className='flex flex-col gap-4'>
        <div className='flex justify-center '>
        <img  src={Homebg} alt="home_bg" className="hover:scale-95  transition-all duration-300 w-full h-96 object-cover rounded-lg mt-6" />
        <Link className='absolute self-center' to='/AllEvents'><Button className='hover:scale-150 transition-all duration-300'  gradientDuoTone="purpleToBlue" outline>
            View Events
          </Button></Link>
        </div>
        <div className='flex justify-center '>
        <img  src={calendarbg} alt=" Calendar View" className="hover:scale-95  transition-all duration-300 w-full h-96 object-cover rounded-lg mt-6" />
        <Link className='absolute self-center' to='/CalendarView'><Button className='hover:scale-150 transition-all duration-300'  gradientDuoTone="greenToBlue" outline>
        Calendar View
          </Button></Link>
        </div>
      </div>
    
    </motion.div>
  );
}