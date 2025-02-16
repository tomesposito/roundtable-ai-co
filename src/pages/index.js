import React from 'react';
import { Amplify } from 'aws-amplify';
import awsmobile from '../aws-exports';
import { Auth } from 'aws-amplify';

Amplify.configure(awsmobile);

export default function Home() {
  const signIn = () => {
    Auth.federatedSignIn(); // Redirects to the Cognito Hosted UI
  };

  return (
    <div className="container">
      <h1>Welcome to Roundtable AI</h1>
      <button onClick={signIn}>Sign In / Sign Up</button>
    </div>
  );
}