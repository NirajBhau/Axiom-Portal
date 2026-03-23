import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nirajpatil020_db_user:FJQB2DvumAwOgHcc@cluster0.zufsax4.mongodb.net/?appName=Cluster0';

async function listDbs() {
  try {
    const client = await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = mongoose.connection.useDb('admin').db.admin();
    const dbs = await admin.listDatabases();
    console.log('Databases:', dbs.databases.map(db => db.name));

    for (const dbInfo of dbs.databases) {
        if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
        const db = mongoose.connection.useDb(dbInfo.name);
        const collections = await db.db.listCollections().toArray();
        console.log(`DB: ${dbInfo.name}, Collections:`, collections.map(c => c.name));
        
        for (const col of collections) {
            if (col.name === 'candidates') {
                const results = await db.collection('candidates').find({}).toArray();
                console.log(`  - Found ${results.length} candidates in ${dbInfo.name}.candidates`);
                if (results.length > 0) {
                    console.log(`    Emails: ${results.map(r => r.email).join(', ')}`);
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

listDbs();
