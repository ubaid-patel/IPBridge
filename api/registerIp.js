import { MongoClient } from "mongodb";

let client;
let clientPromise;

if (!clientPromise) {
  client = new MongoClient(process.env.MONGO_URI);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  // 🔓 CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("POST only");
  }

  let body = "";
  req.on("data", chunk => (body += chunk));
  req.on("end", async () => {
    try {
      const { device_id, base_url } = JSON.parse(body);

      if (!device_id || !base_url) {
        res.statusCode = 400;
        return res.end("device_id and base_url required");
      }

      const conn = await clientPromise;
      const collection = conn
        .db(process.env.DB_NAME)
        .collection(process.env.COLLECTION);

      // 🔥 FIND BY device_id → UPDATE → OR CREATE
      await collection.updateOne(
        { device_id },                // <-- lookup key
        {
          $set: {
            base_url,
            last_seen: new Date()
          },
          $setOnInsert: {
            device_id               // only set on first insert
          }
        },
        { upsert: true }
      );

      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.end("server error");
    }
  });
}
 