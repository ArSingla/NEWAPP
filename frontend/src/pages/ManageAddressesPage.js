// Path: frontend/src/pages/ManageAddressesPage.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  Divider
} from '@mui/material';
import { ArrowBack, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ManageAddressesPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [addresses, setAddresses] = useState([
    '123 Main Street, City, Country',
    '45 Park Avenue, Metropolis, Country'
  ]);
  const [newAddress, setNewAddress] = useState('');

  const handleAddAddress = () => {
    if (newAddress.trim()) {
      setAddresses([...addresses, newAddress.trim()]);
      setNewAddress('');
    }
  };

  const handleDeleteAddress = (index) => {
    const updated = [...addresses];
    updated.splice(index, 1);
    setAddresses(updated);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" sx={{ mb: 3 }}>
        <ArrowBack
          onClick={() => navigate(-1)}
          style={{ cursor: 'pointer', marginRight: '10px' }}
        />
        <Typography variant="h5" fontWeight="bold">
          Manage Addresses
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
        {addresses.length > 0 ? (
          addresses.map((address, index) => (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                mb: 2,
                background: theme === 'dark' ? '#1a202c' : '#f8f9fa',
                borderRadius: 2,
                p: 1
              }}
            >
              <Typography variant="body1">{address}</Typography>
              <IconButton onClick={() => handleDeleteAddress(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No saved addresses.
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Add New Address */}
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Add New Address
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter address"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleAddAddress}>
          Add Address
        </Button>
      </Paper>
    </Container>
  );
};

export default ManageAddressesPage;
