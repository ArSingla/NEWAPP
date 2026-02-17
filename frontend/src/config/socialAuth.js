// Social Authentication Configuration
export const SOCIAL_AUTH_CONFIG = {
  GOOGLE: {
    CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
    REDIRECT_URI: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
    SCOPE: 'email profile',
    AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth'
  },
  FACEBOOK: {
    APP_ID: process.env.REACT_APP_FACEBOOK_APP_ID || 'your-facebook-app-id',
    REDIRECT_URI: process.env.REACT_APP_FACEBOOK_REDIRECT_URI || 'http://localhost:3000/auth/facebook/callback',
    SCOPE: 'email public_profile',
    AUTH_URL: 'https://www.facebook.com/v12.0/dialog/oauth'
  },
  INSTAGRAM: {
    CLIENT_ID: process.env.REACT_APP_INSTAGRAM_CLIENT_ID || 'your-instagram-client-id',
    REDIRECT_URI: process.env.REACT_APP_INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/auth/instagram/callback',
    SCOPE: 'user_profile user_media',
    AUTH_URL: 'https://api.instagram.com/oauth/authorize'
  }
};

// Helper function to generate OAuth URLs
export const generateOAuthURL = (provider, state = '') => {
  const config = SOCIAL_AUTH_CONFIG[provider.toUpperCase()];
  if (!config) return null;

  const params = new URLSearchParams({
    client_id: config.CLIENT_ID || config.APP_ID,
    redirect_uri: config.REDIRECT_URI,
    scope: config.SCOPE,
    response_type: 'code',
    state: state
  });

  return `${config.AUTH_URL}?${params.toString()}`;
};

// Note: In production, you'll need to:
// 1. Set up OAuth apps in Google, Facebook, and Instagram developer consoles
// 2. Add the actual client IDs and app IDs to your environment variables
// 3. Implement proper OAuth callback handling
// 4. Validate tokens with the respective providers
