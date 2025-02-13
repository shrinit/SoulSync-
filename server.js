import express from 'express';
import cors from 'cors';
import { createServer } from 'vite';
import axios from 'axios';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(cors());
app.use(express.json());

// Set trust proxy to handle IP addresses correctly
app.set('trust proxy', 1);

// Create a limiter that allows 1 request every 15 seconds
const apiLimiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds
  max: 1, // limit each IP to 1 request per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    error: 'Too many requests, please try again later.',
    details: 'Please wait 15 seconds between messages to avoid overloading the AI model.'
  },
  keyGenerator: () => 'global_limit' // Single global rate limit for all users
});

// Apply the rate limiter to the chat endpoint
app.use('/api/chat', apiLimiter);

const LANGFLOW_API = 'https://api.langflow.astra.datastax.com/lf/f6813254-b4cd-428c-84e8-d10151d2e914/api/v1/run/3931eed0-ed80-497d-b492-5651edb5eb1c';

// Extract only the text field from the response
const extractResponse = (data) => {
  let text = '';
  // Prefer the top-level text field if it exists.
  if (data?.text) {
    text = data.text.trim();
  } else if (data?.outputs?.[0]?.outputs?.[0]?.results?.message?.data?.text) {
    text = data.outputs[0].outputs[0].results.message.data.text.trim();
  } else {
    return null;
  }

  // If the text contains a header that repeats (e.g., "### You're Feeling"),
  // find its second occurrence and trim the text there.
  const headerMatch = text.match(/(### [^\n]+)/);
  if (headerMatch) {
    const header = headerMatch[1];
    // Look for a second occurrence of the header.
    const secondOccurrence = text.indexOf(header, header.length);
    if (secondOccurrence !== -1) {
      text = text.substring(0, secondOccurrence).trim();
    }
  }
  
  return text;
};

app.post('/api/chat', async (req, res) => {
  try {
    const { message, apiKey } = req.body;
    
    if (!message || !apiKey) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Both message and API key are required.'
      });
    }
    
    console.log('Sending request to Langflow API with message:', message);
    
    const response = await axios.post(
      `${LANGFLOW_API}?stream=false`,
      {
        input_value: message,
        output_type: 'chat',
        input_type: 'chat',
        tweaks: {
          'Agent-PxvlE': {},
          'ChatInput-gwUSa': {},
          'ChatOutput-XZpsi': {},
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 20000 // 20 second timeout
      }
    );

    // Extract the response
    const rawResponse = extractResponse(response.data);
    
    if (!rawResponse) {
      throw new Error('Empty response from AI model');
    }

    // Return the raw markdown response
    res.json({ message: rawResponse });
    
  } catch (error) {
    console.error('Server Error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Request timeout',
        details: 'The AI model took too long to respond. Please try a shorter message.'
      });
    }
    
    if (error.response?.status === 429 || (error.response?.data?.detail && error.response.data.detail.includes('rate_limit_exceeded'))) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        details: 'Please wait 15 seconds before sending another message.'
      });
    }
    
    if (error.response?.status === 413 || (error.response?.data?.detail && error.response.data.detail.includes('Request too large'))) {
      return res.status(413).json({
        error: 'Message too long',
        details: 'Please send a shorter message.'
      });
    }
    
    res.status(500).json({ 
      error: 'An error occurred',
      details: error.message || 'The AI model is currently unavailable. Please try again in a moment.'
    });
  }
});

// Create Vite server in middleware mode
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

// Use vite's connect instance as middleware
app.use(vite.middlewares);

const port = 5173;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});