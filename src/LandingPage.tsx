import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
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
  X,
  Send,
  Music2,
  Smartphone,
  Wallet
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { LogoCloud } from './components/ui/logo-cloud-3';

// --- Components ---

const Navbar = () => {
  const { user, profile } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getLogoPath = () => {
    if (!user) return "/";
    return profile?.role === 'admin' ? "/admin" : "/dashboard";
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-3' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'glass rounded-full px-6 py-3' : ''}`}>
          <Link to={getLogoPath()} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center shadow-lg shadow-brand/30">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-brand">Famestack</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/services" className="text-sm font-medium hover:text-brand transition-colors">Services</Link>
            <a href="#why-us" className="text-sm font-medium hover:text-brand transition-colors">Why Us</a>
            <a href="#testimonials" className="text-sm font-medium hover:text-brand transition-colors">Reviews</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold px-4 py-2 hover:text-brand transition-colors">Login</Link>
            <Link to="/register" className="bg-brand text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-brand-light transition-all shadow-lg shadow-brand/30">
              Get Started — Sign up
            </Link>
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
            <Link to="/services" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
            <a href="#why-us" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>Why Us</a>
            <a href="#testimonials" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>Reviews</a>
            <hr className="border-gray-100" />
            <Link to="/login" className="w-full py-3 font-semibold text-center">Log in</Link>
            <Link to="/register" className="w-full bg-brand text-white py-3 rounded-xl font-semibold text-center">Get Started</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const [heroImageUrl, setHeroImageUrl] = useState("https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800");

  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('id, value')
          .eq('id', 'hero_image_url');

        if (data && data.length > 0) {
          setHeroImageUrl(data[0].value);
        }
      } catch (e) {
        console.error("Error fetching hero settings:", e);
      }
    };
    fetchHeroSettings();
  }, []);

  return (
    <section className="pt-32 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-brand-subtle via-white to-white border border-brand/10 rounded-[40px] overflow-hidden relative min-h-[600px] flex flex-col md:flex-row items-center p-8 md:p-16">
          {/* Left Content */}
          <div className="flex-1 z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-8 h-8 rounded-full border-2 border-white" alt="user" referrerPolicy="no-referrer" />
                ))}
              </div>
              <div className="text-sm font-medium">
                <span className="font-bold">2k+ Users</span> Read Our <a href="#" className="underline">Testimonials</a>
              </div>
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none mb-8">
              <span className="text-brand">Fame</span><span className="text-black">stack</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-md mb-10 leading-relaxed">
              Ready to dominate your social feed?. Accelerate your social presence with premium SMM services. Get real followers, likes, views. and watch your engagements sky-rocket.
            </p>

            <div className="flex items-center gap-4 mb-12">
              <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-white/20">
                <img src="https://i.pravatar.cc/100?img=32" className="w-6 h-6 rounded-full" alt="user" referrerPolicy="no-referrer" />
                <span className="text-xs font-medium">Love the reliability.</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold">4.9</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link to="/register" className="bg-brand text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-xl shadow-brand/30">
                Get Started
              </Link>
              <a href="#services" className="font-bold flex items-center gap-2 hover:gap-3 transition-all">
                See available services <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Visuals (Dynamic Image) */}
          <div className="flex-1 relative mt-12 md:mt-0 w-full h-[400px] md:h-[500px]">
            {/* Main Image Container */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-full md:w-[90%] md:h-[90%] bg-brand/5 rounded-[32px] overflow-hidden shadow-2xl">
              <img
                src={heroImageUrl}
                className="w-full h-full object-cover"
                alt="Social Boost Expansion"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
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

            {/* Smaller Floating Card */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-10 left-0 glass px-4 py-3 rounded-2xl shadow-2xl z-20 flex flex-col items-center justify-center min-w-[140px]"
            >
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Premium Service</div>
              <div className="text-sm font-bold truncate">Premium Followers</div>
              <div className="text-xl font-display font-bold text-brand">₦12.99</div>
            </motion.div>

            {/* Chat Bubbles */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9 }}
              className="absolute top-1/4 left-[-40px] glass rounded-full px-4 py-2 flex items-center gap-2 shadow-lg z-20"
            >
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
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
              <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold">Guaranteed results</span>
            </motion.div>
          </div>
        </div>

        {/* Brand Scrolling Marquee removed */}
      </div>
    </section>
  );
};



const Features = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-brand" />,
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
    <section id="services" className="py-12 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Everything you need to dominate social media</h2>
          <p className="text-gray-600 text-lg">Powerful tools and services from a trusted and legit panel designed to help influencers, brands, and businesses scale up, fast and efficiently.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 rounded-[32px] bg-[#F8F9FA] border border-brand"
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
    <section id="why-us" className="pb-24 pt-5 pl-5 pr-5 bg-brand text-white overflow-hidden rounded-t-[0px]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div>
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-8 leading-tight">
              Why we're the <span className="text-white italic">Top choice</span> for creators
            </h2>
            <div className="space-y-8">
              {[
                { title: "AI-Powered Optimization", desc: "Our algorithms analyze the best times to deliver engagement for maximum impact." },
                { title: "Ticket Support system", desc: "Real humans ready to help you with any order or question, anytime just open a ticket." },
                { title: "Competitive Pricing", desc: "The highest quality services at the lowest possible market rates." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-white">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-brand/20 rounded-full blur-[120px] absolute inset-0" />
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
                  { label: "Orders Processed", value: "26k+", color: "bg-brand" },
                  { label: "Active Campaigns", value: "8.2k", color: "bg-purple-500" },
                  { label: "Success Rate", value: "98.9%", color: "bg-emerald-500" }
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
                  <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-white" />
                  </div>
                  <div className="font-bold">Growth Projection</div>
                </div>
                <div className="text-sm text-gray-400">Our users see an average of <span className="text-white font-bold">70% increase</span> in organic reach within the first 30 days.</div>
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
        <div className="glass p-6 md:p-20 rounded-3xl md:rounded-[48px] flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8">Easy to use, Seamless payments</h2>
            <p className="text-gray-600 text-lg mb-10">We support most major payment methods in africa, ensuring you can boost your presence with total security.</p>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: <CreditCard className="text-brand" />, label: "Paystack" },
                { icon: <Zap className="text-orange-600" />, label: "Flutterwave" },
                { icon: <Smartphone className="text-emerald-600" />, label: "OPay" },
                { icon: <Wallet className="text-purple-600" />, label: "Paga" }
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
                    <span className="text-2xl font-display font-bold">₦14.50</span>
                  </div>
                  <button className="w-full bg-brand text-white py-4 rounded-xl font-bold hover:bg-brand-light transition-colors shadow-lg shadow-brand/30">
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
      name: "Ifunaya",
      role: "Lifestyle Influencer",
      text: "Famestack changed the game for me. My engagement rate tripled in just a month .",
      avatar: "https://i.pravatar.cc/100?img=44",
      rating: 5
    },
    {
      name: "David",
      role: "E-commerce Founder",
      text: "The delivery is ideal. I used them for a product launch and the social proof closed 40% more sales.",
      avatar: "https://i.pravatar.cc/100?img=12",
      rating: 5
    },
    {
      name: "Blessing",
      role: "Music Producer",
      text: "Secure, fast, and easy. I've tried other panels but none have the consistency that Famestack offers.",
      avatar: "https://i.pravatar.cc/100?img=25",
      rating: 5
    },
    {
      name: "Obinna",
      role: "Digital Marketer",
      text: "Incredible value for the price. Support is always fast to resolve issues.",
      avatar: "https://i.pravatar.cc/100?img=33",
      rating: 4
    }
  ];

  return (
    <section id="testimonials" className="py-16 px-6 relative bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-brand-subtle/30 to-white/0 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Dont trust our words, hear from our customers</h2>
          <p className="text-gray-600">listen to the stories of our satisfied customers.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col h-full hover:-translate-y-1 transition-transform">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className={`w-4 h-4 ${idx < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-6 flex-1">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <img src={r.avatar} className="w-10 h-10 rounded-full bg-gray-100" alt={r.name} referrerPolicy="no-referrer" />
                <div>
                  <div className="text-sm font-bold">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white pt-24 pb-12 px-6 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center shadow-lg shadow-brand/30">
                <Zap className="text-white w-6 h-6 fill-current" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-brand">Famestack</span>
            </div>
            <p className="text-gray-500 max-w-sm mb-8">Top competitor among SMM panels in Nigeria/Africa. Helping creators and brands scale their presence with the highest quality services on the market. Look no further than FameStack, we empower growth.</p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-brand-subtle hover:text-brand transition-colors cursor-pointer"><Instagram className="w-5 h-5" /></div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-brand-subtle hover:text-brand transition-colors cursor-pointer"><Twitter className="w-5 h-5" /></div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-brand-subtle hover:text-brand transition-colors cursor-pointer"><Youtube className="w-5 h-5" /></div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-brand-subtle hover:text-brand transition-colors cursor-pointer"><Facebook className="w-5 h-5" /></div>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Services</h4>
            <ul className="space-y-4 text-gray-500">
              <li><a href="#" className="hover:text-black transition-colors">Instagram services</a></li>
              <li><a href="#" className="hover:text-black transition-colors">TikTok services</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Twitter services</a></li>
              <li><a href="#" className="hover:text-black transition-colors">YouTube services</a></li>
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
          <div className="text-gray-400 text-sm">© 2024 Famestack Inc. All rights reserved.</div>
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


const FAQSection = () => {
  const faqs = [
    { q: "Are the followers and likes real?", a: "Yes, we prioritize high-quality, real-looking engagement to ensure your account remains safe and looks authentic." },
    { q: "How quickly would i see results?", a: "Most services start within minutes of order placement. Full delivery time depends on the quantity ordered." },
    { q: "Is it safe for my account?", a: "Absolutely. We use secure methods that comply with platform guidelines, preventing any risk to your social media accounts. Also we will never ask for your password or login details." },
    { q: "Do you offer a refill guarantee?", a: "Yes, we provide a 30-day refill guarantee on all drops for some services. If any numbers decrease, we'll restore them for free." },
    { q: "How do i start?", a: "Create an account, add funds, browse for the service you want, then pay it's that easy." },
  ];
  return (
    <section className="py-24 px-6 bg-[#F8F9FA]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-display font-bold mb-10 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group p-6 rounded-2xl cursor-pointer border border-brand/50 bg-white shadow-sm hover:shadow-md transition-shadow">
              <summary className="flex justify-between items-center font-bold text-lg list-none">
                {faq.q}
                <span className="transition group-open:rotate-90">
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </span>
              </summary>
              <p className="text-gray-600 mt-4 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

const MostPurchasedServices = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopServices();
  }, []);

  const getIconForService = (name: string) => {
    const l = name.toLowerCase();
    if (l.includes('instagram') || l.includes('ig')) return <Instagram className="w-6 h-6 text-pink-500" />;
    if (l.includes('tiktok')) return <Zap className="w-6 h-6 text-black" />;
    if (l.includes('youtube')) return <Youtube className="w-6 h-6 text-red-500" />;
    if (l.includes('twitter') || l.includes('x')) return <Twitter className="w-6 h-6 text-blue-400" />;
    if (l.includes('facebook')) return <Facebook className="w-6 h-6 text-blue-600" />;
    return <Zap className="w-6 h-6 text-brand" />;
  };

  const fetchTopServices = async () => {
    try {
      // Fetch 4 active services to showcase
      const { data } = await supabase.from('services').select('*').eq('status', 'active').limit(4);
      if (data) {
        const formatted = data.map((s, i) => ({
          title: s.name,
          icon: getIconForService(s.name),
          price: `₦${(s.rate / 1).toFixed(2)}`,
          unit: 'per 1k',
          popular: i === 0 || i === 2
        }));
        setServices(formatted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Most Purchased Services</h2>
          <p className="text-gray-600 text-lg">Our top-trending services used by creators to instantly boost social growth.</p>
        </div>
        {loading ? (
          <div className="flex justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <div key={i} className={`relative p-8 rounded-3xl border ${s.popular ? 'border-brand shadow-xl shadow-brand/10 z-10' : 'border-gray-100'} bg-white flex flex-col hover:scale-105 transition-transform`}>
                {s.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Top Seller</div>}
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">{s.icon}</div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-3xl font-display font-bold">{s.price}</span>
                  <span className="text-gray-500 text-sm mb-1">{s.unit}</span>
                </div>
                <Link to="/dashboard/order" className={`mt-auto w-full py-3 rounded-xl font-bold transition-colors text-center ${s.popular ? 'bg-brand text-white hover:bg-brand-800 shadow-lg shadow-black/20' : 'bg-gray-100 text-black hover:bg-gray-200'}`}>
                  Buy Now
                </Link>
              </div>
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
          <Link to="/services" className="inline-flex items-center gap-2 bg-gray-50 text-gray-900 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors border border-gray-200">
            View All Services <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default function LandingPage() {
  return (
    <div className="relative">
      <Navbar />
      <Hero />
      <Features />
      <MostPurchasedServices />
      <WhyBetter />
      <PaymentSection />
      <Testimonials />
      <FAQSection />
      <Footer />
    </div>
  );
}
