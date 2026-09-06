import { OAuth2Client } from 'google-auth-library';

export const getOAuth2Client = () => {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

export const getAuthUrl = (state?: string) => {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline', // Required to get refresh_token
    prompt: 'select_account consent', // Force account selection and consent
    scope: [
      'https://www.googleapis.com/auth/drive.file', // Scope to create files in Drive
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    state, // Used to pass through Group ID or Chat ID
  });
};

export const exchangeCodeForTokens = async (code: string) => {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  
  // Verify ID token to get user info
  client.setCredentials(tokens);
  const userInfo = await client.request({ url: 'https://www.googleapis.com/oauth2/v3/userinfo' });
  
  return {
    tokens,
    userInfo: userInfo.data as { email: string; name: string; sub?: string }
  };
};
