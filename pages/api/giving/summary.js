import clientPromise from "../../../lib/mongo";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection("givingRecords");

    const pipeline = [
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalSales" },
          totalGiving: { $sum: "$totalGiving" },
          homelessnessAmount: { $sum: "$homelessnessAmount" },
          mentalHealthAmount: { $sum: "$mentalHealthAmount" },
          suicidePreventionAmount: { $sum: "$suicidePreventionAmount" },
          veteranSupportAmount: { $sum: "$veteranSupportAmount" },
        },
      },
    ];

    const agg = await collection.aggregate(pipeline).toArray();
    const result = agg[0] || {};

    res.status(200).json({
      totalSales: result.totalSales || 0,
      totalGiving: result.totalGiving || 0,
      homelessnessAmount: result.homelessnessAmount || 0,
      mentalHealthAmount: result.mentalHealthAmount || 0,
      suicidePreventionAmount: result.suicidePreventionAmount || 0,
      veteranSupportAmount: result.veteranSupportAmount || 0,
    });
  } catch (error) {
    console.error("Error in /api/giving/summary:", error);
    res.status(500).json({ error: "Failed to load giving summary" });
  }
}
