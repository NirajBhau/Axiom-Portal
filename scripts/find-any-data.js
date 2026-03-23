import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://nirajpatil020_db_user:FJQB2DvumAwOgHcc@cluster0.zufsax4.mongodb.net/?appName=Cluster0';

async function findAnyData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to Cluster');

    const admin = mongoose.connection.useDb('admin').db.admin();
    const dbs = await admin.listDatabases();
    
    for (const dbInfo of dbs.databases) {
        if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
        const db = mongoose.connection.useDb(dbInfo.name);
        const collections = await db.db.listCollections().toArray();
        console.log(`Database: ${dbInfo.name} (${collections.length} collections)`);
        
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`  - Collection: ${col.name} (${count} documents)`);
            if (count > 0 && col.name === 'candidates') {
                const results = await db.collection(col.name).find({}).toArray();
                console.log(`    Emails found: ${results.map(r => r.email).join(', ')}`);
            }
        }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

findAnyData();
