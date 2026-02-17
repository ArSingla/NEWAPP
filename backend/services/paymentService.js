const stripe = require('stripe')(process.env.STRIPE_API_KEY || 'sk_test_your_key_here');

const paymentService = {
  createPaymentIntent: async (amount, currency = 'INR') => {
    try {
      // Amount should be in the smallest currency unit (e.g., paise for INR, cents for USD)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency.toLowerCase()
      });
      
      return paymentIntent.client_secret;
    } catch (error) {
      console.error('Stripe error:', error);
      throw new Error('Failed to create payment intent: ' + error.message);
    }
  }
};

module.exports = paymentService;






