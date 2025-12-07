import clientPromise from "../../../lib/mongo";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      date,
      source,
      totalSales,
      totalGiving,
      homelessnessAmount,
      mentalHealthAmount,
      suicidePreventionAmount,
      veteranSupportAmount,
    } = req.body;

    if (!date || totalSales == null || totalGiving == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("givingRecords");

    const doc = {
      date: new Date(date),
      source: source || "Manual",
      totalSales: Number(totalSales),
      totalGiving: Number(totalGiving),
      homelessnessAmount: Number(homelessnessAmount),
      mentalHealthAmount: Number(mentalHealthAmount),
      suicidePreventionAmount: Number(suicidePreventionAmount),
      veteranSupportAmount: Number(veteranSupportAmount),
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    res.status(200).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Error in /api/giving/add:", error);
    res.status(500).json({ error: "Failed to add giving record" });
  }
}
