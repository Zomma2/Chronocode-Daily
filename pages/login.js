import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Login from '@/components/Login';

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = async (user) => {
    // Redirect to home page after successful login
    await router.push('/');
  };

  return <Login onSuccess={handleSuccess} />;
}
