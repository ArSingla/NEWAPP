// Path: frontend/src/pages/MyPlansPage.js
import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const MyPlansPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // In a real app, this data would come from an API
  const activePlans = [
    { id: 1, service: 'Chef', provider: 'Chef John', date: '2025-08-15', time: '18:00', status: 'Confirmed', price: '$150' },
    { id: 2, service: 'Maid', provider: 'Clean Pro Services', date: '2025-08-20', time: '10:00', status: 'Pending', price: '$80' }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
        <ArrowBack
          onClick={() => navigate(-1)}
          style={{ cursor: 'pointer', marginRight: '10px' }}
        />
        <Typography variant="h5" fontWeight="bold">
          My Plans & Bookings
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
        {activePlans.length > 0 ? (
          activePlans.map((plan) => (
            <Card
              key={plan.id}
              sx={{
                mb: 2,
                background: theme === 'dark' ? '#1a202c' : '#f8f9fa',
                border: theme === 'dark' ? '1px solid #4a5568' : '1px solid #e9ecef'
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" sx={{ color: theme === 'dark' ? '#e2e8f0' : '#333' }}>
                      {plan.service}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme === 'dark' ? '#a0aec0' : '#666' }}>
                      {plan.provider} • {plan.date} at {plan.time}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Chip
                      label={plan.status}
                      color={plan.status === 'Confirmed' ? 'success' : 'warning'}
                      size="small"
                    />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {plan.price}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
            No active bookings. Start by browsing our services!
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default MyPlansPage;
