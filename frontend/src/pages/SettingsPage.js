// Path: frontend/src/pages/SettingsPage.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const languages = ['Hindi', 'Punjabi', 'English', 'Japanese', 'French', 'Urdu'];

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
        <ArrowBack
          onClick={() => navigate(-1)}
          style={{ cursor: 'pointer', marginRight: '10px' }}
        />
        <Typography variant="h5" fontWeight="bold">
          Settings
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: theme === 'dark' ? '#2d3748' : '#fff',
          border: theme === 'dark' ? '1px solid #4a5568' : 'none'
        }}
      >
        {/* Language Selection */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Language
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Language</InputLabel>
          <Select
            value={selectedLanguage}
            label="Select Language"
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {/* Notifications Toggle */}
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography>Enable Notifications</Typography>
          <Switch
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Theme Toggle */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography>Dark Mode</Typography>
          <Switch
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default SettingsPage;
