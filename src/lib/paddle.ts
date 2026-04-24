import { initializePaddle, type Paddle } from '@paddle/paddle-js';

let paddleInstance: Paddle | undefined;

export const getPaddle = async () => {
  if (paddleInstance) {
    return paddleInstance;
  }
  
  if (!import.meta.env.VITE_PADDLE_CLIENT_TOKEN) {
    console.warn('Paddle client token is missing. Please set VITE_PADDLE_CLIENT_TOKEN in your environment variables.');
    return undefined;
  }

  paddleInstance = await initializePaddle({
    environment: 'production',
    token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
  });
  
  return paddleInstance;
};
