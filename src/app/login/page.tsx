'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

const Logo = (
  props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) => (
  <svg
    fill="currentColor"
    height="48"
    viewBox="0 0 40 48"
    width="40"
    {...props}
  >
    <clipPath id="a">
      <path d="m0 0h40v48h-40z" />
    </clipPath>
    <g clipPath="url(#a)">
      <path d="m25.0887 5.05386-3.933-1.05386-3.3145 12.3696-2.9923-11.16736-3.9331 1.05386 3.233 12.0655-8.05262-8.0526-2.87919 2.8792 8.83271 8.8328-10.99975-2.9474-1.05385625 3.933 12.01860625 3.2204c-.1376-.5935-.2104-1.2119-.2104-1.8473 0-4.4976 3.646-8.1436 8.1437-8.1436 4.4976 0 8.1436 3.646 8.1436 8.1436 0 .6313-.0719 1.2459-.2078 1.8359l10.9227 2.9267 1.0538-3.933-12.0664-3.2332 11.0005-2.9476-1.0539-3.933-12.0659 3.233 8.0526-8.0526-2.8792-2.87916-8.7102 8.71026z" />
      <path d="m27.8723 26.2214c-.3372 1.4256-1.0491 2.7063-2.0259 3.7324l7.913 7.9131 2.8792-2.8792z" />
      <path d="m25.7665 30.0366c-.9886 1.0097-2.2379 1.7632-3.6389 2.1515l2.8794 10.746 3.933-1.0539z" />
      <path d="m21.9807 32.2274c-.65.1671-1.3313.2559-2.0334.2559-.7522 0-1.4806-.102-2.1721-.2929l-2.882 10.7558 3.933 1.0538z" />
      <path d="m17.6361 32.1507c-1.3796-.4076-2.6067-1.1707-3.5751-2.1833l-7.9325 7.9325 2.87919 2.8792z" />
      <path d="m13.9956 29.8973c-.9518-1.019-1.6451-2.2826-1.9751-3.6862l-10.95836 2.9363 1.05385 3.933z" />
    </g>
  </svg>
);

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { companyName, companyLogo } = useSettings();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = login(username, password);

    if (!success) {
      setError('Invalid credentials. Use admin/admin123');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center space-x-1.5">
            {companyLogo ? (
              <img
                alt={companyName}
                className="h-7 w-7 object-contain"
                src={companyLogo}
              />
            ) : (
              <Logo
                aria-hidden={true}
                className="h-7 w-7 text-foreground dark:text-foreground"
              />
            )}
            <p className="font-medium text-foreground text-lg dark:text-foreground">
              {companyName}
            </p>
          </div>
          <h3 className="mt-6 font-semibold text-foreground text-lg dark:text-foreground">
            Sign in to your account
          </h3>
          <p className="mt-2 text-muted-foreground text-sm dark:text-muted-foreground">
            Welcome back! Access your technical support management platform.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div>
              <Label
                className="font-medium text-foreground text-sm dark:text-foreground"
                htmlFor="username"
              >
                Username
              </Label>
              <Input
                autoComplete="username"
                className="mt-2"
                id="username"
                name="username"
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                type="text"
                value={username}
              />
            </div>
            <div>
              <Label
                className="font-medium text-foreground text-sm dark:text-foreground"
                htmlFor="password"
              >
                Password
              </Label>
              <Input
                autoComplete="current-password"
                className="mt-2"
                id="password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                type="password"
                value={password}
              />
            </div>
            {error && (
              <div className="text-center text-red-500 text-sm">{error}</div>
            )}
            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center text-gray-500 text-xs">
            Demo credentials: admin / admin123
          </div>
        </div>
      </div>
    </div>
  );
}
