'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Building, 
  Phone,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'sales_rep';
  company?: string;
  phone?: string;
  avatar?: string;
  lastLogin?: string;
  isActive: boolean;
}

export default function LoginForm({ onLogin, onSwitchToRegister, onForgotPassword }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock authentication - in production, this would call your backend
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@rooflineiq.com',
          name: 'Admin User',
          role: 'admin',
          company: 'RooflineIQ',
          phone: '(555) 123-4567',
          isActive: true,
          lastLogin: new Date().toISOString()
        },
        {
          id: '2',
          email: 'manager@rooflineiq.com',
          name: 'Sales Manager',
          role: 'manager',
          company: 'RooflineIQ',
          phone: '(555) 123-4568',
          isActive: true,
          lastLogin: new Date().toISOString()
        },
        {
          id: '3',
          email: 'sales@rooflineiq.com',
          name: 'Sales Rep',
          role: 'sales_rep',
          company: 'RooflineIQ',
          phone: '(555) 123-4569',
          isActive: true,
          lastLogin: new Date().toISOString()
        }
      ];

      const user = mockUsers.find(u => 
        u.email === formData.email && 
        formData.password === 'password123' // Mock password
      );

      if (user) {
        // Store user in localStorage for persistence
        if (rememberMe) {
          localStorage.setItem('rooflineiq_user', JSON.stringify(user));
        }
        sessionStorage.setItem('rooflineiq_user', JSON.stringify(user));
        onLogin(user);
      } else {
        setError('Invalid email or password. Try: admin@rooflineiq.com / password123');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(''); // Clear error when user starts typing
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your RooflineIQ account</p>
        </div>

        {/* Demo Credentials */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h3>
          <div className="text-xs text-blue-800 space-y-1">
            <div><strong>Admin:</strong> admin@rooflineiq.com / password123</div>
            <div><strong>Manager:</strong> manager@rooflineiq.com / password123</div>
            <div><strong>Sales Rep:</strong> sales@rooflineiq.com / password123</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="input-field"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="input-field pr-10"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-orange-600 hover:text-orange-800"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-orange-600 hover:text-orange-800 font-medium"
              disabled={isLoading}
            >
              Create one here
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
