import { MongoClient } from "mongodb";

let client;
let clientPromise;

if (!clientPromise) {
  client = new MongoClient(process.env.MONGO_URI);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { id, ip } = req.body;

    if (!id || !ip) {
      return res.status(400).json({ error: "id and ip required" });
    }

    const conn = await clientPromise;
    const db = conn.db(process.env.DB_NAME);
    const col = db.collection(process.env.COLLECTION);

    await col.updateOne(
      { _id: id },
      { $set: { ip, updatedAt: new Date() } },
      { upsert: true }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
