// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  SparklesIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const Landing = () => {
  const [stats, setStats] = useState({
    students: 0,
    lessons: 0,
    scholarships: 0,
    mentors: 0
  });
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    // Fetch stats
    api.get('/stats/platform').then(response => {
      setStats(response.data.stats);
    });

    // Fetch testimonials
    api.get('/admin/testimonials').then(response => {
      setTestimonials(response.data.testimonials.filter(t => t.isActive));
    }).catch(() => {
      // Use default testimonials if API fails
      setTestimonials([
        {
          id: 1,
          name: 'Dilshod Karimov',
          role: 'MIT Student',
          content: 'Prism helped me navigate the complex application process to MIT. The mentorship and resources were invaluable.',
          image: null
        },
        {
          id: 2,
          name: 'Nodira Azimova',
          role: 'Cambridge Student',
          content: 'Thanks to Prism, I secured a full scholarship to Cambridge! The platform\'s structured approach made my dream possible.',
          image: null
        }
      ]);
    });
  }, []);

  const features = [
    {
      icon: AcademicCapIcon,
      title: 'Comprehensive Lessons',
      description: 'Expert-curated video lessons covering IELTS, essays, and application strategies',
      color: 'bg-blue-500'
    },
    {
      icon: UserGroupIcon,
      title: 'Expert Mentorship',
      description: 'Connect with mentors who graduated from top universities worldwide',
      color: 'bg-purple-500'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Scholarship Finder',
      description: 'Discover and apply for scholarships matched to your profile',
      color: 'bg-green-500'
    },
    {
      icon: SparklesIcon,
      title: 'AI Assistant',
      description: 'Get instant answers to your questions with our AI-powered assistant',
      color: 'bg-orange-500'
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-navy to-sky rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="ml-3 text-2xl font-heading font-bold gradient-text">Prism</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-navy transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <h1 className="text-5xl lg:text-6xl font-bold font-heading text-gray-900 leading-tight">
                Your Path to <span className="gradient-text">International Education</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Join thousands of Uzbek students who successfully applied to top universities worldwide. 
                Get expert guidance, comprehensive resources, and personalized support.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary inline-flex items-center justify-center">
                  Start Your Journey
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
                <button className="btn-outline inline-flex items-center justify-center">
                  <PlayIcon className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>
              
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-3xl font-bold text-navy">{value}+</div>
                    <div className="text-sm text-gray-600 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky to-navy opacity-10 blur-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800"
                alt="Students studying"
                className="relative rounded-2xl shadow-2xl"
              />
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4 animate-float">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
                <p className="text-sm font-medium mt-1">IELTS 8.0</p>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4 animate-float" style={{ animationDelay: '2s' }}>
                <StarIcon className="h-8 w-8 text-yellow-500" />
                <p className="text-sm font-medium mt-1">Full Scholarship</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold font-heading text-gray-900">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Comprehensive tools and resources for your international education journey
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold font-heading text-gray-900">
              How Prism Works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Your journey to international education in 4 simple steps
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Sign Up', description: 'Create your profile and set your goals' },
              { step: 2, title: 'Learn', description: 'Access video lessons and study materials' },
              { step: 3, title: 'Get Mentored', description: 'Connect with expert mentors for guidance' },
              { step: 4, title: 'Apply & Succeed', description: 'Submit applications with confidence' }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-navy to-sky rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gray-300"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold font-heading text-gray-900">
              Success Stories
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Hear from students who achieved their dreams with Prism
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-md"
              >
                <div className="flex items-center mb-4">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-navy to-sky flex items-center justify-center">
                      <span className="text-white font-medium">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="mt-4 flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-navy to-sky">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold font-heading text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of students who are already on their path to international education
            </p>
            <Link to="/register" className="bg-white text-navy px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-100 transition-all duration-200 inline-flex items-center hover:scale-105">
              Get Started Free
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-sky to-white rounded-lg flex items-center justify-center">
                  <span className="text-navy font-bold text-xl">P</span>
                </div>
                <span className="ml-3 text-2xl font-heading font-bold">Prism</span>
              </div>
              <p className="text-gray-400">
                Empowering Uzbek students to achieve their international education dreams.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/lessons" className="hover:text-white">Lessons</Link></li>
                <li><Link to="/mentors" className="hover:text-white">Mentors</Link></li>
                <li><Link to="/scholarships" className="hover:text-white">Scholarships</Link></li>
                <li><Link to="/forum" className="hover:text-white">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">IELTS Guide</a></li>
                <li><a href="#" className="hover:text-white">Essay Templates</a></li>
                <li><a href="#" className="hover:text-white">University Rankings</a></li>
                <li><a href="#" className="hover:text-white">Visa Help</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@prism.uz</li>
                <li>Phone: +998 90 123 45 67</li>
                <li>Tashkent, Uzbekistan</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Prism. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;