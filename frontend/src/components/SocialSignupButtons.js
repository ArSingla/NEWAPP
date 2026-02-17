import React, { useState } from 'react';
import { Button, Box, Typography, Divider, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import axios from 'axios';
import { setCookie } from '../utils/cookieUtils';

const SocialSignupButtons = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSocialAuth = async (provider, endpoint) => {
    setLoading(true);
    setError('');
    
    try {
      // For demo purposes, we'll simulate the OAuth flow
      // In production, you would integrate with actual OAuth providers
      
      // Simulate getting user data from OAuth provider
      const mockUserData = {
        token: `mock_${provider.toLowerCase()}_token_${Date.now()}`,
        email: `user_${Date.now()}@${provider.toLowerCase()}.com`,
        name: `User from ${provider}`
      };
      
      const response = await axios.post(`http://localhost:8080/api/auth/${endpoint}`, mockUserData);
      
      // Set authentication cookies
      setCookie('authToken', response.data.token, 7);
      setCookie('userEmail', response.data.email, 7);
      setCookie('userRole', response.data.role, 7);
      setCookie('userName', response.data.name, 7);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
    } catch (err) {
      const errorMessage = err.response?.data || `${provider} authentication failed`;
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => handleSocialAuth('Google', 'google');
  const handleFacebookSignup = () => handleSocialAuth('Facebook', 'facebook');
  const handleInstagramSignup = () => handleSocialAuth('Instagram', 'instagram');

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Or sign up with
        </Typography>
      </Divider>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignup}
          disabled={loading}
          sx={{
            borderColor: '#DB4437',
            color: '#DB4437',
            '&:hover': {
              borderColor: '#C1351D',
              backgroundColor: 'rgba(219, 68, 55, 0.04)'
            }
          }}
        >
          {loading ? 'Processing...' : 'Continue with Google'}
        </Button>
        
        <Button
          variant="outlined"
          fullWidth
          startIcon={<FacebookIcon />}
          onClick={handleFacebookSignup}
          disabled={loading}
          sx={{
            borderColor: '#4267B2',
            color: '#4267B2',
            '&:hover': {
              borderColor: '#365899',
              backgroundColor: 'rgba(66, 103, 178, 0.04)'
            }
          }}
        >
          {loading ? 'Processing...' : 'Continue with Facebook'}
        </Button>
        
        <Button
          variant="outlined"
          fullWidth
          startIcon={<InstagramIcon />}
          onClick={handleInstagramSignup}
          disabled={loading}
          sx={{
            borderColor: '#E4405F',
            color: '#E4405F',
            '&:hover': {
              borderColor: '#C13584',
              backgroundColor: 'rgba(228, 64, 95, 0.04)'
            }
          }}
        >
          {loading ? 'Processing...' : 'Continue with Instagram'}
        </Button>
      </Box>
    </Box>
  );
};

export default SocialSignupButtons;
