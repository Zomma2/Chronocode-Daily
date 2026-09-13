import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Signup from '@/components/Signup';

export default function SignupPage() {
  const router = useRouter();

  const handleSuccess = async (user) => {
    // Redirect to home page after successful signup
    await router.push('/');
  };

  return <Signup onSuccess={handleSuccess} />;
}
