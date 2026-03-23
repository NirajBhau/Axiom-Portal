import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nirajpatil020_db_user:FJQB2DvumAwOgHcc@cluster0.zufsax4.mongodb.net/?appName=Cluster0';
const candidateEmail = 'vandanpatel4881@gmail.com';

async function resetCandidate() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Mongoose pluralizes 'Candidate' to 'candidates'
    const result = await mongoose.connection.collection('candidates').updateOne(
      { email: candidateEmail.toLowerCase() },
      { $set: { isSubmitted: false } }
    );

    if (result.matchedCount > 0) {
      console.log(`Successfully reset status for ${candidateEmail}`);
    } else {
      console.error(`Candidate with email ${candidateEmail} not found in database.`);
    }
  } catch (err) {
    console.error('Error during reset:', err);
  } finally {
    await mongoose.connection.close();
  }
}

resetCandidate();
