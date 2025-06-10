// package.json
{
  "name": "prism-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.2",
    "react-query": "^3.39.3",
    "zustand": "^4.3.2",
    "react-hook-form": "^7.43.0",
    "react-hot-toast": "^2.4.0",
    "socket.io-client": "^4.5.4",
    "plyr-react": "^5.1.0",
    "react-markdown": "^8.0.5",
    "date-fns": "^2.29.3",
    "framer-motion": "^9.0.2",
    "react-icons": "^4.7.1",
    "recharts": "^2.4.3",
    "@headlessui/react": "^1.7.8",
    "@heroicons/react": "^2.0.13"
  },
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx --report-unused-disable-directives --max-warnings 0"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@types/react": "^18.0.27",
    "@types/react-dom": "^18.0.10",
    "@vitejs/plugin-react": "^3.1.0",
    "autoprefixer": "^10.4.13",
    "postcss": "^8.4.21",
    "tailwindcss": "^3.2.4",
    "vite": "^4.1.0"
  }
}

// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})

// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1A2C56',
        sky: '#6ECFF6',
        orange: '#FF8C42',
        gray: {
          50: '#F9FAFB',
          100: '#F3F3F3',
          200: '#E5E5E5',
          300: '#D1D1D1',
          400: '#B4B4B4',
          500: '#9E9E9E',
          600: '#6B6B6B',
          700: '#4A4A4A',
          800: '#2E2E2E',
          900: '#1A1A1A',
        }
      },
      fontFamily: {
        'heading': ['Montserrat', 'Poppins', 'sans-serif'],
        'body': ['Open Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}

// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Prism - Your Path to International Education</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-body text-gray-800 bg-white;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}

@layer components {
  .btn-primary {
    @apply bg-navy text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-opacity-90 hover:shadow-lg hover:scale-105 active:scale-95;
  }
  
  .btn-secondary {
    @apply bg-sky text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-opacity-90 hover:shadow-lg hover:scale-105 active:scale-95;
  }
  
  .btn-outline {
    @apply border-2 border-navy text-navy px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:bg-navy hover:text-white hover:shadow-lg hover:scale-105 active:scale-95;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300;
  }
  
  .input-field {
    @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky focus:border-transparent transition-all duration-200;
  }
  
  .badge {
    @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium;
  }
}

@layer utilities {
  .gradient-text {
    @apply bg-gradient-to-r from-navy to-sky bg-clip-text text-transparent;
  }
  
  .gradient-bg {
    @apply bg-gradient-to-br from-navy to-sky;
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-400 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}

/* Plyr custom styles */
.plyr--video {
  @apply rounded-lg overflow-hidden;
}

.plyr__control--overlaid {
  @apply bg-navy;
}

.plyr--full-ui input[type=range] {
  @apply text-sky;
}

// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Scholarships from './pages/Scholarships';
import Mentors from './pages/Mentors';
import MentorProfile from './pages/MentorProfile';
import Forum from './pages/Forum';
import PostDetail from './pages/PostDetail';
import Tasks from './pages/Tasks';
import AIAssistant from './pages/AIAssistant';
import Universities from './pages/Universities';
import UniversityDetail from './pages/UniversityDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ParentDashboard from './pages/ParentDashboard';
import AdminPanel from './pages/AdminPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/lessons" element={<Lessons />} />
                <Route path="/lessons/:id" element={<LessonDetail />} />
                <Route path="/scholarships" element={<Scholarships />} />
                <Route path="/mentors" element={<Mentors />} />
                <Route path="/mentors/:id" element={<MentorProfile />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/forum/post/:id" element={<PostDetail />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/universities" element={<Universities />} />
                <Route path="/universities/:id" element={<UniversityDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* Parent routes */}
                <Route path="/parent/dashboard" element={<ParentDashboard />} />
                
                {/* Admin routes */}
                <Route path="/admin/*" element={<AdminPanel />} />
              </Route>
            </Route>
          </Routes>
        </Router>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;