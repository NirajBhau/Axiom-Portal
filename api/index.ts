import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/axiom-proctor';

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
  { email: "ritikakadam186@gmail.com", phone: "9359228737" },
  { email: "vandanpatel4882@gmail.com", phone: "9173384392" },
];

interface ICandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  token: string;
  expiresAt: number;
  isSubmitted: boolean;
}

const candidateSchema = new mongoose.Schema<ICandidate>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Number, required: true },
  isSubmitted: { type: Boolean, default: false }
});

const CandidateModel = mongoose.models.Candidate || mongoose.model<ICandidate>('Candidate', candidateSchema);

// Proctoring Frame Schema
interface IFrame {
  token: string;
  image: string; // Base64
  createdAt: Date;
}

const frameSchema = new mongoose.Schema<IFrame>({
  token: { type: String, required: true, index: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const FrameModel = mongoose.models.Frame || mongoose.model<IFrame>('Frame', frameSchema);

const app = express();
app.use(express.json());

// Global MongoDB connection state
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

// --- API Routes ---

app.post('/api/candidates/register', async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) return res.status(400).json({ error: 'Name, email, and phone are required.' });

  const whitelistEntry = WHITELIST.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (!whitelistEntry) return res.status(404).json({ error: 'Invalid Email: Your email address is not registered.' });
  if (whitelistEntry.phone !== phone) return res.status(401).json({ error: 'Invalid Phone: Mismatch with our records.' });

  try {
    const existing = await CandidateModel.findOne({ phone });
    if (existing) {
      if (existing.isSubmitted) return res.status(400).json({ error: 'Assessment already completed.' });
      return res.json({ message: 'Identity verified.', token: existing.token, expiresAt: new Date(existing.expiresAt).toISOString() });
    }

    const id = crypto.randomUUID();
    const year = new Date().getFullYear();
    const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
    const token = `AXIOM-${year}-${randomPart}`;
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    await CandidateModel.create({ id, name, email, phone, token, expiresAt, isSubmitted: false });
    res.json({ message: 'Registered successfully.', token, expiresAt: new Date(expiresAt).toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/auth/verify-token', async (req, res) => {
  const { email, phone, token } = req.body;
  if (!email || !phone || !token) return res.status(400).json({ error: 'Credentials required.' });

  try {
    const candidate = await CandidateModel.findOne({ token: token.toUpperCase() });
    if (!candidate || candidate.email.toLowerCase() !== email.toLowerCase() || candidate.phone !== phone) {
      return res.status(401).json({ error: 'Invalid credentials or token.' });
    }
    if (Date.now() > candidate.expiresAt) return res.status(401).json({ error: 'Token expired.' });
    if (candidate.isSubmitted) return res.status(403).json({ error: 'Already submitted.' });

    res.json({ message: 'Authentication successful.', candidate: { id: candidate.id, name: candidate.name } });
  } catch (err) {
    res.status(500).json({ error: 'Auth service error.' });
  }
});

app.post('/api/exam/submit', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token is required.' });

  try {
    const candidate = await CandidateModel.findOneAndUpdate({ token: token.toUpperCase() }, { isSubmitted: true }, { new: true });
    if (!candidate) return res.status(404).json({ error: 'Token not found.' });
    res.json({ message: 'Exam submitted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Submission service error.' });
  }
});

app.post('/api/proctor/upload-frame', async (req, res) => {
  const { token, image } = req.body;
  if (!token || !image) return res.status(400).json({ error: 'Token and image required.' });

  const candidate = await CandidateModel.findOne({ token: token.toUpperCase() });
  if (!candidate) return res.status(401).json({ error: 'Invalid session.' });

  try {
    await FrameModel.create({
      token: token.toUpperCase(),
      image, // Store the full base64 string
      createdAt: new Date()
    });

    console.log(`Frame saved to DB for candidate ${candidate.name} (${token})`);
    res.json({ message: 'Frame uploaded and persisted successfully.' });
  } catch (err) {
    console.error('Error saving proctoring frame to DB:', err);
    res.status(500).json({ error: 'Failed to save frame to database.' });
  }
});

export default app;
