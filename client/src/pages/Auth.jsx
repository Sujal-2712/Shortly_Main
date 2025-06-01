import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../components/ui/tabs";
import Login from "./../components/Login";
import Signup from './../components/Signup';

const Auth = () => {
  const [isCreated, setIsCreated] = useState(false);
  const [selectedTab, setSelectedTab] = useState('login');
  
  useEffect(() => {
    if (isCreated) {
      setSelectedTab('login');
    }
  }, [isCreated]);

  return (
    <div className="mt-8 bg-gradient-to-br flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Effects */}
      

      <div className="relative z-10 w-full max-w-md">
        <div className=" bg-white/10 border border-white/50 rounded-xl shadow-2xl overflow-hidden">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="w-full bg-white/5 border-b border-white/10 rounded-none h-14">
              <TabsTrigger 
                className="w-full h-full text-white  data-[state=active]:from-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-semibold text-lg transition-all duration-300" 
                value="login"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                className="w-full h-full text-white data-[state=active]:bg-gradient-to-r data-[state=active]:bg-blue-600 data-[state=active]:to-purple-500 data-[state=active]:text-white font-semibold text-lg transition-all duration-300" 
                value="signup"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            <div className="p-6">
              <TabsContent value="login" className="mt-0">
                <Login />
              </TabsContent>
              <TabsContent value="signup" className="mt-0">
                <Signup setIsCreated={setIsCreated} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;