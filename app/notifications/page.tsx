"use client";
import { useState, useEffect } from 'react';
import { EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { GlobeIcon, TwitterIcon, InstagramIcon } from 'lucide-react';

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Countdown timer setup
  useEffect(() => {
    const target = new Date('2024-12-31T00:00:00');
    
    const timer = setInterval(() => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email address');
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubscribed(true);
      setError('');
      setEmail('');
    } catch (err) {
      setError('Subscription failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl w-full">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
          Something Awesome is Coming
        </h1>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 mb-8 animate-fade-in-up delay-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="p-4 rounded-lg bg-white/5">
                <div className="text-4xl font-bold text-white mb-2">{value}</div>
                <div className="text-sm text-white/80 uppercase tracking-wide">{unit}</div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8 animate-fade-in-up delay-200">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <EnvelopeIcon className="w-5 h-5 text-white absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Notify Me'}
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </button>
          </div>
          {error && <p className="text-red-200 text-sm mt-2">{error}</p>}
          {isSubscribed && <p className="text-green-200 text-sm mt-2">Thank you for subscribing! 🎉</p>}
        </form>

        <div className="flex justify-center space-x-6 animate-fade-in-up delay-300">
          <a href="#" className="text-white hover:text-white/80 transition-colors">
            <GlobeIcon className="w-6 h-6" />
          </a>
          <a href="#" className="text-white hover:text-white/80 transition-colors">
            <TwitterIcon className="w-6 h-6" />
          </a>
          <a href="#" className="text-white hover:text-white/80 transition-colors">
            <InstagramIcon className="w-6 h-6" />
          </a>
        </div>
      </div>
    </div>
  );
}