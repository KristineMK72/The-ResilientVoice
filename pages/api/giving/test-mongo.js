// pages/api/test-mongo.js

import clientPromise from "../../lib/mongo"; // Adjust the path as necessary

export default async function handler(req, res) {
  try {
    // Attempt to connect to the MongoDB client
    const client = await clientPromise;
    
    // Attempt to access a database (this confirms both connection and authentication)
    const dbName = process.env.MONGODB_DB || "test";
    const db = client.db(dbName);

    // Optional: Check if a test collection exists (more thorough check)
    // const collections = await db.listCollections({ name: 'givingRecords' }).toArray();

    // If we reach here, the connection was successful
    res.status(200).json({ 
      success: true, 
      message: "Successfully connected to MongoDB!",
      database: dbName,
      // collectionCheck: collections.length > 0 ? "Giving records collection found." : "Giving records collection NOT found."
    });

  } catch (e) {
    console.error("MongoDB Connection Error:", e);
    // If the connection fails, return a 500 error with the specific failure details
    res.status(500).json({ 
      success: false, 
      message: "Failed to connect to MongoDB.", 
      error: e.message 
    });
  }
}
