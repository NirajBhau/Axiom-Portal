import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nirajpatil020_db_user:FJQB2DvumAwOgHcc@cluster0.zufsax4.mongodb.net/?appName=Cluster0';

async function listCandidates() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    const candidates = await mongoose.connection.collection('candidates').find({}).toArray();
    console.log('Candidates in "candidates" collection:', candidates.map(c => ({ email: c.email, isSubmitted: c.isSubmitted })));

    // Try singular just in case
    const candidatesSingular = await mongoose.connection.collection('candidate').find({}).toArray();
    if (candidatesSingular.length > 0) {
        console.log('Candidates in "candidate" collection:', candidatesSingular.map(c => ({ email: c.email, isSubmitted: c.isSubmitted })));
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

listCandidates();
