import axios from 'axios';
import env from '../config/env.js';

async function listModels() {
  try {
    const res = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`
      }
    });
    console.log('--- ACTIVE GROQ MODELS: ---');
    console.log(res.data.data.map(m => m.id));
    console.log('---------------------------');
  } catch (err) {
    console.error('Error fetching Groq models:', err.message);
    if (err.response) {
      console.error(err.response.data);
    }
  }
}

listModels();
