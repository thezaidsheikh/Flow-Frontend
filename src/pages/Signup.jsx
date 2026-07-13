import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Workflow, Mail, Lock, User, Zap } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, firstName, lastName);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.apiError?.message ||
          err.response?.data?.message ||
          'Registration failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50 px-4">
      <div className="max-w-md w-full animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-2xl mb-4 shadow-lg animate-bounce-slight">
            <Workflow size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent">
            Flow
          </h1>
          <p className="text-gray-600 mt-2 flex items-center justify-center gap-2">
            <Zap size={16} className="text-accent-500" />
            Workflow Automation Platform
          </p>
        </div>

        <div className="card p-8 bg-white/80 backdrop-blur-sm shadow-xl border border-white/20">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Create Account
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className="grid grid-cols-2 gap-4 animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input pl-10 border-gray-300 focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input pl-10 border-gray-300 focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>

            <div
              className="animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10 border-gray-300 focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div
              className="animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 border-gray-300 focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div
              className="animate-slide-up"
              style={{ animationDelay: '0.4s' }}
            >
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-10 border-gray-300 focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full bg-gradient-to-r from-secondary-600 to-secondary-500 hover:from-secondary-700 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg animate-slide-up"
              style={{ animationDelay: '0.5s' }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p
            className="text-center text-gray-600 mt-6 animate-slide-up"
            style={{ animationDelay: '0.6s' }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
