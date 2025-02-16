// pages/_app.js
import '../styles/globals.css';
import { Amplify } from 'aws-amplify';
import awsExports from '../src/aws-exports';

Amplify.configure(awsExports);

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;