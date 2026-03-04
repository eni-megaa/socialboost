import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Zap, 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  Star,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-3' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'glass rounded-full px-6 py-3' : ''}`}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">SocialBoost</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium hover:text-blue-600 transition-colors">Services</a>
            <a href="#why-us" className="text-sm font-medium hover:text-blue-600 transition-colors">Why Us</a>
            <a href="#pricing" className="text-sm font-medium hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-blue-600 transition-colors">Reviews</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-sm font-semibold px-4 py-2">Log in</button>
            <button className="bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all">
              Get Started — It's Free
            </button>
          </div>

          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 md:hidden flex flex-col gap-4 shadow-xl"
          >
            <a href="#services" className="text-lg font-medium">Services</a>
            <a href="#why-us" className="text-lg font-medium">Why Us</a>
            <a href="#pricing" className="text-lg font-medium">Pricing</a>
            <a href="#testimonials" className="text-lg font-medium">Reviews</a>
            <hr className="border-gray-100" />
            <button className="w-full py-3 font-semibold">Log in</button>
            <button className="w-full bg-black text-white py-3 rounded-xl font-semibold">Get Started</button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#E9EAEB] rounded-[40px] overflow-hidden relative min-h-[600px] flex flex-col md:flex-row items-center p-8 md:p-16">
          {/* Left Content */}
          <div className="flex-1 z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-8 h-8 rounded-full border-2 border-white" alt="user" referrerPolicy="no-referrer" />
                ))}
              </div>
              <div className="text-sm font-medium">
                <span className="font-bold">50k+ Users</span> Read Our <a href="#" className="underline">Success Stories</a>
              </div>
            </div>

            <h1 className="font-display text-7xl md:text-8xl font-bold tracking-tighter leading-none mb-8">
              Scale<span className="text-blue-600">+</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-md mb-10 leading-relaxed">
              Drive Social Growth, And Harness AI-Powered Engagement Content — Up To 50× Faster.
            </p>

            <div className="flex items-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-white/20">
                <img src="https://i.pravatar.cc/100?img=32" className="w-6 h-6 rounded-full" alt="user" referrerPolicy="no-referrer" />
                <span className="text-xs font-medium">Loved the performance / 100% Satisfied</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold">4.9</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <button className="bg-black text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2">
                Start Boosting — It's Free
              </button>
              <button className="font-bold flex items-center gap-2 hover:gap-3 transition-all">
                Our Services <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Visuals (Inspired by the image) */}
          <div className="flex-1 relative mt-12 md:mt-0 w-full h-[400px] md:h-[500px]">
            {/* Main Image Container */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[80%] h-[90%] bg-orange-500 rounded-[32px] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover mix-blend-overlay opacity-80"
                alt="Growth"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              
              {/* Play Button Overlay */}
              <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-black border-b-[10px] border-b-transparent ml-1" />
              </button>
            </div>

            {/* Floating Cards */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-10 right-[-20px] glass p-4 rounded-2xl w-48 shadow-2xl z-20"
            >
              <div className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-wider">— UP TO</div>
              <div className="text-4xl font-display font-bold">85%</div>
              <div className="text-xs text-gray-600">More engagement this week</div>
            </motion.div>

            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-10 left-0 glass p-4 rounded-2xl w-64 shadow-2xl z-20 flex gap-4 items-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Service" referrerPolicy="no-referrer" />
              </div>
              <div>
                <div className="text-sm font-bold">Premium Followers</div>
                <div className="text-lg font-display font-bold">$12.99</div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold">4.8</span>
                </div>
              </div>
            </motion.div>

            {/* Chat Bubbles */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9 }}
              className="absolute top-1/4 left-[-40px] glass rounded-full px-4 py-2 flex items-center gap-2 shadow-lg z-20"
            >
              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold">Real-time delivery?</span>
            </motion.div>

            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.1 }}
              className="absolute top-[35%] left-[-20px] glass rounded-full px-4 py-2 flex items-center gap-2 shadow-lg z-20"
            >
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold">Guaranteed results</span>
            </motion.div>
          </div>
        </div>

        {/* Social Proof Logos */}
        <div className="mt-12 flex flex-wrap justify-between items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <span className="text-2xl font-bold font-display">Rakuten</span>
          <span className="text-2xl font-bold font-display">NCR</span>
          <span className="text-2xl font-bold font-display">monday.com</span>
          <span className="text-2xl font-bold font-display">Disney</span>
          <span className="text-2xl font-bold font-display">Dropbox</span>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "Instant Delivery",
      description: "Our automated system processes your orders immediately. See results in minutes, not days."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      title: "Secure & Private",
      description: "We never ask for your password. Your account safety is our top priority with encrypted processing."
    },
    {
      icon: <Users className="w-8 h-8 text-orange-600" />,
      title: "Real Engagement",
      description: "Get high-quality interactions from active profiles that look natural and boost your authority."
    }
  ];

  return (
    <section id="services" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Everything you need to dominate social media</h2>
          <p className="text-gray-600 text-lg">Powerful tools and services designed to give you an unfair advantage in the digital landscape.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 rounded-[32px] bg-[#F8F9FA] border border-gray-100"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyBetter = () => {
  return (
    <section id="why-us" className="py-24 px-6 bg-black text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-8 leading-tight">
              Why we're the <span className="text-blue-500 italic">#1 choice</span> for creators
            </h2>
            <div className="space-y-8">
              {[
                { title: "AI-Powered Optimization", desc: "Our algorithms analyze the best times to deliver engagement for maximum impact." },
                { title: "24/7 Priority Support", desc: "Real humans ready to help you with any order or question, anytime." },
                { title: "Competitive Pricing", desc: "The highest quality services at the lowest possible market rates." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-blue-600/20 rounded-full blur-[120px] absolute inset-0" />
            <div className="relative glass-dark p-8 rounded-[40px] border-white/10">
              <div className="flex items-center justify-between mb-12">
                <div className="text-2xl font-bold">Live Stats</div>
                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  SYSTEM ONLINE
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { label: "Orders Processed", value: "1.2M+", color: "bg-blue-500" },
                  { label: "Active Campaigns", value: "45.2k", color: "bg-purple-500" },
                  { label: "Success Rate", value: "99.9%", color: "bg-emerald-500" }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400 text-sm">{stat.label}</span>
                      <span className="font-bold">{stat.value}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                        className={`h-full ${stat.color}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-white" />
                  </div>
                  <div className="font-bold">Growth Projection</div>
                </div>
                <div className="text-sm text-gray-400">Our users see an average of <span className="text-white font-bold">340% increase</span> in organic reach within the first 30 days.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PaymentSection = () => {
  return (
    <section className="py-24 px-6 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto">
        <div className="glass p-12 md:p-20 rounded-[48px] flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Seamless payments, global reach</h2>
            <p className="text-gray-600 text-lg mb-10">We support all major payment methods, ensuring you can boost your presence from anywhere in the world with total security.</p>
            
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: <CreditCard className="text-blue-600" />, label: "Credit Cards" },
                { icon: <Zap className="text-orange-600" />, label: "Crypto (BTC/ETH)" },
                { icon: <ShieldCheck className="text-emerald-600" />, label: "PayPal Secure" },
                { icon: <Clock className="text-purple-600" />, label: "Apple/Google Pay" }
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  {p.icon}
                  <span className="font-bold text-sm">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full max-w-md">
            <div className="bg-white p-8 rounded-[32px] shadow-2xl border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-xl">Quick Order</span>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Instagram className="w-4 h-4" /></div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Twitter className="w-4 h-4" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Select Service</label>
                  <select className="w-full p-4 bg-gray-50 rounded-xl border-none font-medium">
                    <option>Instagram Followers (HQ)</option>
                    <option>TikTok Views (Viral)</option>
                    <option>Twitter Retweets</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Quantity</label>
                  <input type="number" placeholder="1,000" className="w-full p-4 bg-gray-50 rounded-xl border-none font-medium" />
                </div>
                <div className="pt-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-500">Total Price</span>
                    <span className="text-2xl font-display font-bold">$14.50</span>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                    Pay & Boost Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const reviews = [
    {
      name: "Sarah Jenkins",
      role: "Lifestyle Influencer",
      text: "SocialBoost changed the game for me. My engagement rate tripled in just two weeks, and the followers are actually high quality.",
      avatar: "https://i.pravatar.cc/100?img=44"
    },
    {
      name: "Marcus Chen",
      role: "E-commerce Founder",
      text: "The instant delivery is real. I used them for a product launch and the social proof helped us close 40% more sales.",
      avatar: "https://i.pravatar.cc/100?img=12"
    },
    {
      name: "Elena Rodriguez",
      role: "Music Producer",
      text: "Reliable, fast, and secure. I've tried other panels but none have the consistency that SocialBoost offers.",
      avatar: "https://i.pravatar.cc/100?img=25"
    }
  ];

  const [active, setActive] = useState(0);

  return (
    <section id="testimonials" className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-5xl font-display font-bold mb-6">Trusted by 50,000+ creators worldwide</h2>
            <p className="text-gray-600 text-lg">Don't just take our word for it. Here's what our community has to say about their growth journey.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setActive((active - 1 + reviews.length) % reviews.length)}
              className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all"
            >
              <ChevronLeft />
            </button>
            <button 
              onClick={() => setActive((active + 1) % reviews.length)}
              className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        <div className="relative h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={active}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="absolute inset-0 flex flex-col md:flex-row gap-12 items-center"
            >
              <div className="w-full md:w-1/3 aspect-square rounded-[40px] overflow-hidden shadow-2xl">
                <img src={reviews[active].avatar} className="w-full h-full object-cover" alt="Avatar" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1">
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-3xl md:text-4xl font-medium leading-tight mb-8 italic text-gray-800">
                  "{reviews[active].text}"
                </p>
                <div>
                  <div className="text-2xl font-bold">{reviews[active].name}</div>
                  <div className="text-gray-500 font-medium">{reviews[active].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white pt-24 pb-12 px-6 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Zap className="text-white w-6 h-6 fill-current" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">SocialBoost</span>
            </div>
            <p className="text-gray-500 max-w-sm mb-8">The world's most advanced SMM panel. Helping creators and brands scale their presence with AI-powered engagement.</p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"><Instagram className="w-5 h-5" /></div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"><Twitter className="w-5 h-5" /></div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"><Youtube className="w-5 h-5" /></div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"><Facebook className="w-5 h-5" /></div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Services</h4>
            <ul className="space-y-4 text-gray-500">
              <li><a href="#" className="hover:text-black transition-colors">Instagram Growth</a></li>
              <li><a href="#" className="hover:text-black transition-colors">TikTok Viral</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Twitter Authority</a></li>
              <li><a href="#" className="hover:text-black transition-colors">YouTube Views</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-gray-500">
              <li><a href="#" className="hover:text-black transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-400 text-sm">© 2024 SocialBoost Inc. All rights reserved.</div>
          <div className="flex gap-8 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-black transition-colors">Support</a>
            <a href="#" className="hover:text-black transition-colors">API Docs</a>
            <a href="#" className="hover:text-black transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 800);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
        >
          <div className="glass-dark p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="text-white w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Ready to scale?</div>
                <div className="text-gray-400 text-xs">Join 50k+ creators today</div>
              </div>
            </div>
            <button className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
              Get Started
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function LandingPage() {
  return (
    <div className="relative">
      <Navbar />
      <Hero />
      <Features />
      <WhyBetter />
      <PaymentSection />
      <Testimonials />
      <Footer />
      <StickyCTA />
    </div>
  );
}
