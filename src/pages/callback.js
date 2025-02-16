import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Auth } from 'aws-amplify';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        // Redirect to the dashboard once authenticated
        router.push('/dashboard');
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return <div>Processing authentication...</div>;
}