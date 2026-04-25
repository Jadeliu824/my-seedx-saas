import { initializePaddle, type Paddle } from '@paddle/paddle-js';

let paddleInstance: Paddle | undefined;

export const getPaddle = async () => {
  if (paddleInstance) {
    return paddleInstance;
  }
  
  if (!import.meta.env.VITE_PADDLE_CLIENT_TOKEN) {
    console.error('[Paddle] ❌ Client token is missing. Set VITE_PADDLE_CLIENT_TOKEN in Vercel environment variables.');
    return undefined;
  }

  console.log('[Paddle] Initializing with token:', import.meta.env.VITE_PADDLE_CLIENT_TOKEN?.slice(0, 20) + '...');
  console.log('[Paddle] Sprout Price ID:', import.meta.env.VITE_PADDLE_SPROUT_PRICE_ID);
  console.log('[Paddle] Forest Price ID:', import.meta.env.VITE_PADDLE_FOREST_PRICE_ID);

  if (!import.meta.env.VITE_PADDLE_SPROUT_PRICE_ID) {
    console.error('[Paddle] ❌ Sprout Price ID is missing. Set VITE_PADDLE_SPROUT_PRICE_ID.');
  }
  if (!import.meta.env.VITE_PADDLE_FOREST_PRICE_ID) {
    console.error('[Paddle] ❌ Forest Price ID is missing. Set VITE_PADDLE_FOREST_PRICE_ID.');
  }

  paddleInstance = await initializePaddle({
    environment: 'production',
    token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
    eventCallback(event) {
      console.log('[Paddle Event]', event.name, event);
      if (event.name === 'checkout.completed') {
        console.log('[Paddle] ✅ Checkout completed:', event.data);
      }
      if (event.name === 'checkout.error') {
        console.error('[Paddle] ❌ Checkout error details:', JSON.stringify(event, null, 2));
      }
    },
  });
  
  console.log('[Paddle] ✅ Initialized successfully:', !!paddleInstance);
  return paddleInstance;
};
