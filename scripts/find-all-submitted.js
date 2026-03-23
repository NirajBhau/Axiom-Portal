import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nirajpatil020_db_user:FJQB2DvumAwOgHcc@cluster0.zufsax4.mongodb.net/?appName=Cluster0';

async function findAllSubmitted() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to Cluster');

    const admin = mongoose.connection.useDb('admin').db.admin();
    const dbs = await admin.listDatabases();
    
    for (const dbInfo of dbs.databases) {
        if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
        const db = mongoose.connection.useDb(dbInfo.name);
        const collections = await db.db.listCollections().toArray();
        
        for (const col of collections) {
            if (col.name === 'candidates') {
                const results = await db.collection('candidates').find({ isSubmitted: true }).toArray();
                if (results.length > 0) {
                    console.log(`Found ${results.length} submitted candidates in DB "${dbInfo.name}":`);
                    results.forEach(r => console.log(`  - Email: ${r.email}, Name: ${r.name}, Phone: ${r.phone}`));
                } else {
                    const all = await db.collection('candidates').find({}).toArray();
                    if (all.length > 0) {
                        console.log(`DB "${dbInfo.name}" has ${all.length} candidates, but none marked as submitted.`);
                        all.forEach(r => console.log(`  - Found: ${r.email} (isSubmitted: ${r.isSubmitted})`));
                    }
                }
            }
        }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

findAllSubmitted();
