import { useState } from 'react';
import Link from 'next/link';
import Avatar, { genConfig } from 'react-nice-avatar';

export default function Signup({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Avatar customization state
  const [sex, setSex] = useState('man');
  const [avatarConfig, setAvatarConfig] = useState(() => genConfig({ sex: 'man' }));

  const updateAvatar = (newSex) => {
    setSex(newSex);
    setAvatarConfig(genConfig({ sex: newSex }));
  };

  const generateRandomAvatar = () => {
    setAvatarConfig(genConfig());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          password,
          confirmPassword,
          avatarConfig,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(data.user);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Chronocode Daily
        </h1>
        <p className="text-center text-gray-600 mb-8">Join the challenge! Create your account and pick your avatar</p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left side - Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="your_username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-center text-gray-600 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  Login here
                </Link>
              </p>
            </div>
          </form>

          {/* Right side - Avatar Customization */}
          <div className="flex flex-col items-center gap-6 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900">Customize Avatar</h3>
            
            <div className="relative">
              <Avatar
                className="w-40 h-40"
                shape="circle"
                {...avatarConfig}
              />
            </div>

            <div className="space-y-3 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => updateAvatar('man')}
                    className={`flex-1 py-2 rounded-lg font-medium transition ${
                      sex === 'man'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAvatar('woman')}
                    className={`flex-1 py-2 rounded-lg font-medium transition ${
                      sex === 'woman'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={generateRandomAvatar}
                className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition"
              >
                Random Avatar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
