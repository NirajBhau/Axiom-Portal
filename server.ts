import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/axiom-proctor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  token: string;
  expiresAt: number;
  isSubmitted?: boolean;
}

// Whitelist of authorized candidates
const WHITELIST = [
  { email: "ganeshjumade3@gmail.com", phone: "7276265631" },
  { email: "badgujarp121@gmail.com", phone: "7028277396" },
  { email: "nishadshivam787@gmail.com", phone: "8830811337" },
  { email: "srushtigawali735@gmail.com", phone: "9373126940" },
  { email: "kritikathawari2@gmail.com", phone: "9529311457" },
  { email: "navyasri4225@gmail.com", phone: "9014184657" },
  { email: "pallavijain237@gmail.com", phone: "8484965201" },
  { email: "nangrutejas5@gmail.com", phone: "8307341716" },
  { email: "24p31a1224@acet.ac.in", phone: "7337419275" },
  { email: "vivekpoddar.work@gmail.com", phone: "8597449308" },
  { email: "deepanjandey400@gmail.com", phone: "9113398593" },
  { email: "abhishekshingade16@gmail.com", phone: "7757897377" },
  { email: "chintuxyz01@gmail.com", phone: "8340152411" },
  { email: "diaaadhya@gmail.com", phone: "7651889251" },
  { email: "mehulmaru356@gmail.com", phone: "9537261684" },
  { email: "jyothiakshaya12@gmail.com", phone: "6304585836" },
  { email: "limmymariat.kc@icloud.com", phone: "9446441541" },
  { email: "mahadiksmit26@gmail.com", phone: "9004754963" },
  { email: "tanyamaggo26@gmail.com", phone: "8447343167" },
  { email: "aashishkhandelwal1570@gmail.com", phone: "9870687299" },
  { email: "rushitsavani733@gmail.com", phone: "9574245562" },
  { email: "yadavnehayn2111@gmail.com", phone: "8770581385" },
  { email: "thanagalanagendra@gmail.com", phone: "8008668019" },
  { email: "bhasinkrishna4@gmail.com", phone: "9622606047" },
  { email: "shrutigaur757@gmail.com", phone: "9897903242" },
  { email: "ritikakadam186@gmail.com", phone: "9359228737" }
];

// MongoDB Schema
const candidateSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Number, required: true },
  isSubmitted: { type: Boolean, default: false }
});

const CandidateModel = mongoose.model('Candidate', candidateSchema);

// Connection logic moved to startServer

async function startServer() {
  // Connect to MongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully.');
  } catch (err) {
    console.error('MongoDB connection error. Continuing in degraded mode:', err);
  }

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // --- API Routes ---

  // Register a candidate and generate a unique, time-limited token
  app.post('/api/candidates/register', async (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required.' });
    }

    // 1. Whitelist Verification
    const whitelistEntry = WHITELIST.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (!whitelistEntry) {
      return res.status(404).json({ error: 'Invalid Email: Your email address is not registered in our database.' });
    }

    if (whitelistEntry.phone !== phone) {
      return res.status(401).json({ error: 'Invalid Phone: The mobile number provided does not match our records for this email.' });
    }

    // 2. Check for existing registration in MongoDB
    try {
      const existing = await CandidateModel.findOne({ phone });
      if (existing) {
        if (existing.isSubmitted) {
          return res.status(400).json({ error: 'This mobile number has already completed the assessment. Only one attempt is allowed.' });
        }
        return res.json({
          message: 'Identity verified. Returning your active token.',
          token: existing.token,
          expiresAt: new Date(existing.expiresAt).toISOString()
        });
      }

      // Generate a unique ID and token
      const id = crypto.randomUUID();
      const year = new Date().getFullYear();
      const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
      const token = `AXIOM-${year}-${randomPart}`;
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

      const candidate = await CandidateModel.create({ 
        id, name, email, phone, token, expiresAt, isSubmitted: false 
      });

      console.log(`Registered candidate: ${name} (${email}) with token: ${token}`);
      res.json({
        message: 'Candidate registered successfully.',
        token,
        expiresAt: new Date(expiresAt).toISOString()
      });
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Internal server error during registration.' });
    }
  });

  // Verify candidate credentials and token
  app.post('/api/auth/verify-token', async (req, res) => {
    const { email, phone, token } = req.body;

    if (!email || !phone || !token) {
      return res.status(400).json({ error: 'Email, phone, and token are required.' });
    }

    try {
      const candidate = await CandidateModel.findOne({ token: token.toUpperCase() });

      if (!candidate) return res.status(401).json({ error: 'Invalid access token.' });
      if (candidate.email.toLowerCase() !== email.toLowerCase()) return res.status(401).json({ error: 'Email mismatch.' });
      if (candidate.phone !== phone) return res.status(401).json({ error: 'Phone number mismatch.' });
      if (Date.now() > candidate.expiresAt) return res.status(401).json({ error: 'Access token has expired.' });
      if (candidate.isSubmitted) return res.status(403).json({ error: 'Assessment already submitted.' });

      res.json({
        message: 'Authentication successful.',
        candidate: { id: candidate.id, name: candidate.name }
      });
    } catch (err) {
      res.status(500).json({ error: 'Authentication service error.' });
    }
  });

  // Finalize an exam submission
  app.post('/api/exam/submit', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required.' });

    try {
      const candidate = await CandidateModel.findOneAndUpdate(
        { token: token.toUpperCase() },
        { isSubmitted: true },
        { new: true }
      );
      if (!candidate) return res.status(404).json({ error: 'Token not found.' });
      res.json({ message: 'Exam submitted and finalized successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Submission service error.' });
    }
  });
  
  // Proctoring: Upload a webcam frame
  app.post('/api/proctor/upload-frame', async (req, res) => {
    const { token, image } = req.body;

    if (!token || !image) {
      return res.status(400).json({ error: 'Token and image data are required.' });
    }

    const candidate = await CandidateModel.findOne({ token: token.toUpperCase() });
    if (!candidate) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }

    try {
      // Create recordings directory if it doesn't exist
      const recordingsDir = path.join(process.cwd(), 'recordings', token.toUpperCase());
      if (!fs.existsSync(recordingsDir)) {
        fs.mkdirSync(recordingsDir, { recursive: true });
      }

      // Extract base64 and save as JPEG
      const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
      const fileName = `frame_${Date.now()}.jpg`;
      const filePath = path.join(recordingsDir, fileName);

      fs.writeFileSync(filePath, base64Data, 'base64');
      
      console.log(`Saved proctoring frame for ${candidate.name} (${token}): ${fileName}`);
      res.json({ message: 'Frame uploaded successfully.' });
    } catch (err) {
      console.error('Error saving proctoring frame:', err);
      res.status(500).json({ error: 'Failed to save frame.' });
    }
  });

  // --- Vite Middleware ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Axiom Proctor Server running on http://localhost:${PORT}`);
  });
}

startServer();
