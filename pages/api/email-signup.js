import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  // Store emails in a simple JSON file (easy + fine for now)
  const filePath = path.join(process.cwd(), "emails.json");

  let emails = [];
  if (fs.existsSync(filePath)) {
    emails = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }

  if (!emails.includes(email)) {
    emails.push(email);
    fs.writeFileSync(filePath, JSON.stringify(emails, null, 2));
  }

  // OPTIONAL: send notification email (see Step 3)
  console.log("New email signup:", email);

  return res.status(200).json({ success: true });
}
