import React, { useContext, useState } from 'react';
import { Button } from './../components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { UserContext } from './../App';
import { useNavigate } from 'react-router-dom';
import logo from "./../assets/logo.png"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./../components/ui/accordion";

const LandingPage = () => {
  const [longurl, setLongurl] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { userAuth } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!longurl) {
      toast.error("Please provide a URL to shorten!");
      return;
    }
    if (!userAuth.access_token) {
      toast.error("Please Login First!!");
      navigate("/auth");
      return;
    }

    navigate(`/dashboard?newlink=${longurl}`);
  };

  return (
    <div className="flex flex-col items-center px-5 bg-gradient-to-br  min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-500/1 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-pink-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <h1 className="my-12 sm:my-20 text-4xl sm:text-7xl lg:text-6xl bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent font-black leading-tight tracking-tight">
          The Only URL Shortener
          <br />
          <span className="bg-gradient-to-r from-blue-400 bg-clip-text text-transparent">
            you'll ever need
          </span>
        </h1>

        <p className="text-xl md:text-2xl font-medium text-slate-300 text-center mb-12 max-w-6xl mx-auto leading-relaxed">
          Transform long URLs into powerful, trackable links with our advanced URL shortener. 
          Create custom QR codes, build landing pages, and analyze engagement—all in one platform.
        </p>
      </div>

      {/* Enhanced Form with glassmorphism effect */}
      <div className="relative z-10 w-full max-w-3xl mx-auto mb-16">
        <form onSubmit={handleSubmit} className="relative">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="url"
                value={longurl}
                onChange={(e) => setLongurl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="flex-1 h-14 bg-white/90 backdrop-blur-sm border-0 text-slate-800 placeholder:text-slate-500 rounded-xl text-lg font-medium shadow-inner focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
              />
              <Button 
                className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0" 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Shortening...
                  </div>
                ) : (
                  'Shorten URL'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Enhanced Image Section with better presentation */}
      <div className="relative z-10 w-full max-w-4xl mx-auto mb-20">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600  rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <img
            src={logo}
            alt="URL Shortening Platform Preview"
            className="relative w-full rounded-xl shadow-2xl ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      </div>

      {/* Enhanced FAQ Section */}
      <div className="relative z-10 w-full max-w-4xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        <Accordion type="multiple" className="space-y-4" collapsible>
          {[
            {
              id: "item-1",
              question: "What is a URL shortener?",
              answer: "A URL shortener transforms long, complex URLs into short, manageable links that are easier to share, remember, and track across all platforms and devices."
            },
            {
              id: "item-2", 
              question: "Is the shortened URL permanent?",
              answer: "Yes, your shortened URLs are stored permanently and will continue to work indefinitely unless you choose to delete them from your account dashboard."
            },
            {
              id: "item-3",
              question: "Can I track link clicks?",
              answer: "Absolutely! Get comprehensive analytics including click counts, geographic data, device types, referral sources, and detailed engagement metrics for every link."
            },
            {
              id: "item-4",
              question: "Is the service free?",
              answer: "Yes, our core URL shortening service is completely free.features like advanced analytics, custom domains, and white-label options are available."
            },
            {
              id: "item-5",
              question: "Can I customize my shortened URL?",
              answer: "Yes, create branded, memorable links with custom aliases. Make your URLs match your brand identity and improve click-through rates with recognizable link names."
            },
            {
              id: "item-6",
              question: "Can I delete a shortened URL?",
              answer: "Yes, you have complete control over your links. Delete any shortened URL instantly from your dashboard, and the link will stop working immediately."
            }
          ].map((faq) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id}
              className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all duration-300"
            >
              <AccordionTrigger className="text-xl font-semibold text-white px-6 py-4 hover:text-blue-300 transition-colors duration-300">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-lg text-slate-300 px-6 pb-4 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default LandingPage;