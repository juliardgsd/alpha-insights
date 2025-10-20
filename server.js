import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import multer from 'multer';
import XLSX from 'xlsx';
import Papa from 'papaparse';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Endpoint para chat com IA
app.post('/api/chat', async (req, res) => {
  try {
    const { message, salesData } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Você é um assistente de análise de vendas para a Alpha Insights, empresa de varejo tecnológico. Analise dados e forneça insights acionáveis. Dados disponíveis: ${JSON.stringify(salesData)}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Erro na API OpenAI:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

// Endpoint para upload de arquivos
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    let data;

    if (file.originalname.endsWith('.csv')) {
      const csvData = file.buffer.toString('utf-8');
      const parsed = Papa.parse(csvData, { header: true });
      data = parsed.data;
    } else if (file.originalname.endsWith('.xlsx')) {
      const workbook = XLSX.read(file.buffer);
      const sheetName = workbook.SheetNames[0];
      data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }

    res.json({ data, success: true });
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    res.status(500).json({ error: 'Erro ao processar arquivo' });
  }
});

// Endpoint para buscar dados do Google Sheets
app.get('/api/google-sheets', async (req, res) => {
  try {
    // Aqui você implementaria a integração com Google Sheets API
    // Por enquanto, retorna dados mock
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
```

**.env (backend):**
```
OPENAI_API_KEY=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
PORT=3001
