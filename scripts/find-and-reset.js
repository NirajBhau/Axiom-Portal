import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nirajpatil020_db_user:FJQB2DvumAwOgHcc@cluster0.zufsax4.mongodb.net/?appName=Cluster0';
const candidateEmail = 'vandanpatel4881@gmail.com';

async function findAndReset() {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log('Connected to Cluster');

    const dbs = ['test', 'axiom-proctor', 'axiom_proctor', 'Axiom-Portal'];
    
    for (const dbName of dbs) {
        const db = mongoose.connection.useDb(dbName);
        console.log(`Checking database: ${dbName}...`);
        
        const candidate = await db.collection('candidates').findOne({ email: candidateEmail.toLowerCase() });
        if (candidate) {
            console.log(`FOUND candidate in ${dbName}.candidates! Current status: isSubmitted=${candidate.isSubmitted}`);
            const result = await db.collection('candidates').updateOne(
                { email: candidateEmail.toLowerCase() },
                { $set: { isSubmitted: false } }
            );
            console.log(`Reset status to false. result: ${JSON.stringify(result)}`);
            return;
        }
    }
    
    console.log('Candidate not found in any common database names.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

findAndReset();
