const mongoose = require('mongoose');
require('dotenv').config();

// Local MongoDB connection
const LOCAL_URI = 'mongodb://127.0.0.1:27017/gameverse';

// Atlas MongoDB connection (from .env)
const ATLAS_URI = process.env.MONGODB_URI;

if (!ATLAS_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

async function migrateData() {
  try {
    console.log('🔄 Starting migration from local MongoDB to Atlas...\n');

    // Connect to local MongoDB
    console.log('📥 Connecting to local MongoDB...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to local MongoDB\n');

    // Connect to Atlas MongoDB
    console.log('📤 Connecting to MongoDB Atlas...');
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connected to MongoDB Atlas\n');

    // Get all collections from local database
    const collections = await localConn.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections to migrate:\n`);
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`   - ${collectionName}`);
    }
    console.log('');

    // Migrate each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      
      console.log(`🔄 Migrating collection: ${collectionName}...`);
      
      // Get data from local collection
      const localCollection = localConn.db.collection(collectionName);
      const documents = await localCollection.find({}).toArray();
      
      console.log(`   Found ${documents.length} documents`);
      
      if (documents.length > 0) {
        // Insert into Atlas collection
        const atlasCollection = atlasConn.db.collection(collectionName);
        
        // Clear existing data in Atlas (optional - comment out if you want to keep existing data)
        await atlasCollection.deleteMany({});
        
        // Insert documents
        await atlasCollection.insertMany(documents);
        console.log(`   ✅ Migrated ${documents.length} documents to Atlas\n`);
      } else {
        console.log(`   ⚠️  No documents to migrate\n`);
      }
    }

    console.log('✅ Migration completed successfully!');
    
    // Close connections
    await localConn.close();
    await atlasConn.close();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateData();
