// src/pages/Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  BellIcon,
  ArrowRightIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import lessonService from '../services/lesson.service';
import taskService from '../services/task.service';
import mentorService from '../services/mentor.service';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    async () => {
      const response = await api.get('/stats/dashboard');
      return response.data.stats;
    }
  );

  // Fetch recent progress
  const { data: recentProgress } = useQuery(
    'recentProgress',
    async () => {
      const response = await lessonService.getUserProgress();
      return response.slice(0, 3);
    }
  );

  // Fetch upcoming tasks
  const { data: upcomingTasks } = useQuery(
    'upcomingTasks',
    () => taskService.getUpcomingTasks()
  );

  // Fetch upcoming bookings
  const { data: bookings } = useQuery(
    'upcomingBookings',
    async () => {
      const response = await mentorService.getUserBookings();
      return response.filter(b => 
        b.status === 'accepted' && 
        new Date(b.date) >= new Date()
      ).slice(0, 3);
    }
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statsCards = [
    {
      title: 'Lessons Progress',
      value: stats?.progressPercentage || 0,
      suffix: '%',
      description: `${stats?.completedLessons || 0} of ${stats?.totalLessons || 0} completed`,
      icon: AcademicCapIcon,
      color: 'bg-blue-500',
      link: '/lessons'
    },
    {
      title: 'Pending Tasks',
      value: stats?.pendingTasks || 0,
      description: 'Tasks to complete',
      icon: ClipboardDocumentListIcon,
      color: 'bg-orange-500',
      link: '/tasks'
    },
    {
      title: 'Upcoming Sessions',
      value: stats?.upcomingBookings || 0,
      description: 'Mentor sessions',
      icon: CalendarIcon,
      color: 'bg-purple-500',
      link: '/mentors'
    }
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${getGreeting()}, ${user?.firstName}!`}
        subtitle="Here's what's happening with your application journey"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}{stat.suffix}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Lessons */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Continue Learning</h3>
              <Link to="/lessons" className="text-sm text-sky hover:text-sky-600">
                View all <ArrowRightIcon className="inline h-4 w-4" />
              </Link>
            </div>

            {recentProgress && recentProgress.length > 0 ? (
              <div className="space-y-4">
                {recentProgress.map((progress) => (
                  <Link
                    key={progress.id}
                    to={`/lessons/${progress.lessonId}`}
                    className="block hover:bg-gray-50 -mx-2 px-2 py-3 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {progress.Lesson?.thumbnail ? (
                          <img
                            src={progress.Lesson.thumbnail}
                            alt={progress.Lesson.title}
                            className="h-16 w-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="h-16 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                            <PlayIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {progress.Lesson?.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {progress.Lesson?.category}
                        </p>
                        <div className="mt-2">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-sky h-2 rounded-full"
                                style={{ width: `${progress.progress}%` }}
                              />
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {progress.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                      {progress.completed && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={AcademicCapIcon}
                title="No lessons started"
                message="Begin your learning journey by exploring our lessons"
                action={
                  <Link to="/lessons" className="btn-primary">
                    Browse Lessons
                  </Link>
                }
              />
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Tasks */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
              <Link to="/tasks" className="text-sm text-sky hover:text-sky-600">
                View all
              </Link>
            </div>

            {upcomingTasks && upcomingTasks.length > 0 ? (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3">
                    <div className={`p-1 rounded ${
                      task.priority === 'high' ? 'bg-red-100' : 
                      task.priority === 'medium' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <ClockIcon className={`h-4 w-4 ${
                        task.priority === 'high' ? 'text-red-600' : 
                        task.priority === 'medium' ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        Due {format(new Date(task.deadline), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No upcoming deadlines</p>
            )}
          </Card>

          {/* Upcoming Sessions */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mentor Sessions</h3>
              <Link to="/mentors" className="text-sm text-sky hover:text-sky-600">
                Book session
              </Link>
            </div>

            {bookings && bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="border-l-4 border-navy pl-3">
                    <p className="text-sm font-medium text-gray-900">
                      {booking.mentor.firstName} {booking.mentor.lastName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(booking.date), 'MMM d')} at {booking.time}
                    </p>
                    <p className="text-xs text-gray-500">{booking.topic || 'General consultation'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No upcoming sessions</p>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/ai-assistant"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Ask AI Assistant</span>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                to="/scholarships"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Find Scholarships</span>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                to="/forum"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Join Discussion</span>
                <ArrowRightIcon className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card className="bg-gradient-to-r from-navy to-sky text-white">
          <div className="text-center">
            <p className="text-lg italic">
              "The future belongs to those who believe in the beauty of their dreams."
            </p>
            <p className="text-sm mt-2 opacity-90">- Eleanor Roosevelt</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;