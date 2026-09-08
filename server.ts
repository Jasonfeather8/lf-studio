import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  
  const args = process.argv.slice(2);
  const portArgIndex = args.indexOf('--port');
  
  const PORT = portArgIndex !== -1 
    ? Number(args[portArgIndex + 1]) 
    : (Number(process.env.PORT) || 3000);

  app.use(express.json());

  app.post('/api/generate-ux-report', async (req, res) => {
    try {
      const { testName, testDescription, steps, status, errorMessage } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: 'A chave de API do Gemini (GEMINI_API_KEY) não está configurada neste ambiente.' 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const stepsLog = steps
        .map((s: any, idx: number) => `Passo ${idx + 1}: [${s.status.toUpperCase()}] ${s.description}${s.error ? ` (Erro: ${s.error})` : ''}`)
        .join('\n');

      const systemInstruction = `Analista QA e UX...`;

      const prompt = `Nome: ${testName}\nStatus: ${status}\nLogs:\n${stepsLog}`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
        },
      });

      res.json({ report: response.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();