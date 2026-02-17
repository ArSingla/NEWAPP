// Path: frontend/src/pages/MyRatingsPage.js
import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Rating
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const MyRatingsPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Mock data - would be fetched from API in a real app
  const ratings = [
    { id: 1, service: 'Chef Service', provider: 'Chef John', date: '2025-08-15', rating: 4, review: 'Great service, delicious food!' },
    { id: 2, service: 'Maid Service', provider: 'Clean Pro Services', date: '2025-08-10', rating: 5, review: 'Excellent cleaning, very thorough.' },
    { id: 3, service: 'Gardening', provider: 'Green Thumb', date: '2025-07-28', rating: 3, review: 'Good work but arrived late.' }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
        <ArrowBack
          onClick={() => navigate(-1)}
          style={{ cursor: 'pointer', marginRight: '10px' }}
        />
        <Typography variant="h5" fontWeight="bold">
          My Ratings
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
        {ratings.length > 0 ? (
          ratings.map((item) => (
            <Card
              key={item.id}
              sx={{
                mb: 2,
                background: theme === 'dark' ? '#1a202c' : '#f8f9fa',
                border: theme === 'dark' ? '1px solid #4a5568' : '1px solid #e9ecef'
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  {item.service}
                </Typography>
                <Typography variant="body2" sx={{ color: theme === 'dark' ? '#a0aec0' : '#666', mb: 1 }}>
                  {item.provider} • {item.date}
                </Typography>
                <Rating value={item.rating} readOnly precision={0.5} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {item.review}
                </Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
            You have no ratings yet.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default MyRatingsPage;
