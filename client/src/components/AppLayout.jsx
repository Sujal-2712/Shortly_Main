import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { Toaster } from 'react-hot-toast';

// import { UserProvider } from './../pages/UserContext';

const AppLayout = () => {
  return (

    <div>
      <Toaster position='top-right' reverseOrder={false} />
      <main className='min-h-screen contianer lg:px-20 my-4'>
        <Header />
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-white py-8 mt-6">
        <div className="container mx-auto text-center">
          <p className="text-lg text-gray-400 mb-4">© {new Date().getFullYear()} Shortly. All rights reserved.</p>
          <div className="flex justify-center space-x-8 mb-1">
            <a href="#privacy" className="text-lg hover:text-indigo-500 transition duration-300">Privacy Policy</a>
            <a href="#terms" className="text-lg hover:text-indigo-500 transition duration-300">Terms of Service</a>
            <a href="#contact" className="text-lg hover:text-indigo-500 transition duration-300">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>

  );
};

export default AppLayout;
