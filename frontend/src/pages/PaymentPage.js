import React, { useState } from 'react';
import { Paper, Typography, Button, TextField, Box, Grid, Alert } from '@mui/material';
import axios from 'axios';

export default function PaymentPage() {
  const [amount, setAmount] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handlePay = async () => {
    setMsg('');
    setError('');
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }
    try {
      const res = await axios.post('http://localhost:8080/api/payment/create-intent',
        null,
        { params: { amount: Math.floor(amount * 100), currency: 'inr' } }
      );
      setMsg("Payment Intent Created Successfully! Stripe Client Secret:\n" + res.data);
    } catch (e) {
      setError(e.response?.data || "Payment Failed.");
    }
  };

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={7} md={4}>
        <Paper elevation={3} sx={{ p:4, mt:6 }}>
          <Typography variant="h6" mb={2}>Make a Payment</Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {msg && <Alert severity="success" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{msg}</Alert>}

          <TextField
            label="Amount (INR)"
            type="number"
            fullWidth
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handlePay}
          >
            Pay
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
}
