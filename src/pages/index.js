import React from 'react';
import { Amplify } from 'aws-amplify';
import awsmobile from '../aws-exports';

Amplify.configure(awsmobile);

export default function Home() {
  const signIn = () => {
    Amplify.Auth.federatedSignIn(); // Using Amplify.Auth instead of importing Auth separately
  };

  return (
    <div className="container">
      <h1>Welcome to Roundtable AI</h1>
      <button onClick={signIn}>Sign In / Sign Up</button>
    </div>
  );
}