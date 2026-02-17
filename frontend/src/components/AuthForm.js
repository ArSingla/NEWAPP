import React, { useState } from 'react';
import { Avatar, Button, TextField, Typography, Paper, Grid, MenuItem, Box, Alert, InputAdornment, IconButton } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SocialSignupButtons from './SocialSignupButtons';

const providerTypes = [
  { value: "CHEF", label: "Chef" },
  { value: "BARTENDER", label: "Bartender" },
  { value: "MAID", label: "Maid" },
  { value: "WAITER", label: "Waiter" }
];

export default function AuthForm({ mode, onSubmit }) {
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'CUSTOMER', providerType: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');   // Clear error on input change
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const validateForm = () => {
    if (mode === 'signup') {
      if (!form.name.trim()) return "Name is required.";
      if (!form.role) return "Role is required.";
      if (form.role === 'SERVICE_PROVIDER' && !form.providerType) return "Provider type is required.";
    }
    if (!form.email.trim()) return "Email is required.";
    // Basic RFC2822 Email regex for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Enter a valid email address.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return null; // No errors
  };

  const handleSubmit = e => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    onSubmit(form);
  };

  const handleSocialSignup = (provider) => {
    // Handle social media signup
    console.log(`${provider} signup initiated`);
    // You can implement OAuth flow here
    alert(`${provider} signup will be implemented with OAuth integration`);
  };

  const handleSocialSuccess = (userData) => {
    // Handle successful social authentication
    console.log('Social authentication successful:', userData);
    // Redirect to profile or show success message
    if (onSubmit) {
      // Pass the user data to the parent component
      onSubmit({ ...form, isSocialAuth: true, socialUserData: userData });
    }
  };

  const handleSocialError = (error) => {
    // Handle social authentication errors
    console.error('Social authentication error:', error);
    setError(error);
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '70vh' }}>
      <Grid item xs={12} sm={6} md={4}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: 'secondary.main', mb: 1 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              {mode === 'signup' ? "Sign Up" : "Login"}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  autoFocus
                />
                <TextField
                  select
                  margin="normal"
                  required
                  fullWidth
                  label="Role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <MenuItem value="CUSTOMER">Customer</MenuItem>
                  <MenuItem value="SERVICE_PROVIDER">Service Provider</MenuItem>
                </TextField>
                {form.role === "SERVICE_PROVIDER" && (
                  <TextField
                    select
                    margin="normal"
                    required
                    fullWidth
                    label="Provider Type"
                    name="providerType"
                    value={form.providerType}
                    onChange={handleChange}
                  >
                    {providerTypes.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              autoComplete={mode === 'signup' ? "new-password" : "current-password"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              color="primary"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
            >
              {mode === 'signup' ? "Sign Up" : "Login"}
            </Button>
          </Box>

          {/* Social Signup Buttons - Only show on signup page */}
          {mode === 'signup' && (
            <SocialSignupButtons
              onSuccess={handleSocialSuccess}
              onError={handleSocialError}
            />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
