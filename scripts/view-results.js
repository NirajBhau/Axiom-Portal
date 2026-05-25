import mongoose from 'mongoose';

// MongoDB Connection URI
const MONGODB_URI = 'mongodb+srv://nirajpatil020_db_user:FJQB2DvumAwOgHcc@cluster0.zufsax4.mongodb.net/axiom-proctor?appName=Cluster0';

// Correct answer option index for each question ID (1 to 20)
const CORRECT_ANSWERS = {
  1: 0, 2: 1, 3: 1, 4: 0, 5: 1,      // Quant (1-5)
  6: 1, 7: 1, 8: 0, 9: 3, 10: 3,     // Logical (6-10)
  11: 2, 12: 2, 13: 1, 14: 2, 15: 1, // DI (11-15)
  16: 1, 17: 1, 18: 3, 19: 0, 20: 1  // Analytics (16-20)
};

function calculateScore(answers) {
  let total = 0;
  const sections = { quant: 0, logical: 0, di: 0, analytics: 0 };
  
  if (!answers) return { total, sections };

  for (const sectionId of Object.keys(answers)) {
    const sectionAnswers = answers[sectionId] || {};
    for (const qIdStr of Object.keys(sectionAnswers)) {
      const qId = Number(qIdStr);
      const chosenOption = sectionAnswers[qIdStr];
      const correctOption = CORRECT_ANSWERS[qId];
      if (chosenOption !== undefined && chosenOption === correctOption) {
        total++;
        if (sections[sectionId] !== undefined) {
          sections[sectionId]++;
        }
      }
    }
  }

  return { total, sections };
}

async function viewResults() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully.\n');

    // Retrieve database list to search through possible namespaces
    const admin = mongoose.connection.useDb('admin').db.admin();
    const dbs = await admin.listDatabases();
    
    let foundAny = false;

    for (const dbInfo of dbs.databases) {
        if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
        
        const db = mongoose.connection.useDb(dbInfo.name);
        const collections = await db.db.listCollections().toArray();
        const hasCandidates = collections.some(c => c.name === 'candidates');
        
        if (hasCandidates) {
            const candidates = await db.collection('candidates').find({ isSubmitted: true }).toArray();
            if (candidates.length > 0) {
                foundAny = true;
                console.log(`================================================================================`);
                console.log(`DATABASE: ${dbInfo.name} (${candidates.length} submitted candidates)`);
                console.log(`================================================================================`);
                
                candidates.forEach((cand, idx) => {
                    const answers = cand.answers || {};
                    const score = cand.score || calculateScore(answers);
                    
                    console.log(`${idx + 1}. Candidate Name: ${cand.name}`);
                    console.log(`   Email:          ${cand.email}`);
                    console.log(`   Phone:          ${cand.phone}`);
                    console.log(`   Token:          ${cand.token}`);
                    console.log(`   Score:          ${score.total} / 20`);
                    console.log(`   Breakdown:      Quant:     ${score.sections?.quant || 0}/5`);
                    console.log(`                   Logical:   ${score.sections?.logical || 0}/5`);
                    console.log(`                   DI:        ${score.sections?.di || 0}/5`);
                    console.log(`                   Analytics: ${score.sections?.analytics || 0}/5`);
                    console.log(`--------------------------------------------------------------------------------`);
                });
            }
        }
    }

    if (!foundAny) {
        console.log('No submitted candidates found in the database clusters.');
    }

  } catch (err) {
    console.error('Error fetching results:', err);
  } finally {
    await mongoose.connection.close();
  }
}

viewResults();
