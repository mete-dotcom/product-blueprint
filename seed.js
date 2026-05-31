const { kv } = require('@vercel/kv');
const crypto = require('crypto');
require('dotenv').config();

async function seed() {
  console.log("Seeding Vercel KV...");
  
  const email = "kalptenduaya@gmail.com"; // Assuming this is the email based on the GitHub username. We'll use a placeholder if unsure, but let's use the one the user might log in with. Or just 'admin@deepstrain.org'
  const userEmail = "admin@deepstrain.org";
  
  // Create a license key
  const licenseKey = "DSTR-P0002-SEED-KEY-12345";
  
  const user = {
    id: crypto.randomUUID(),
    email: userEmail,
    name: "Mete Admin",
    passwordHash: "not-needed-for-seed-login", // You can use magic link or bypass password for testing
    createdAt: new Date().toISOString(),
    licenses: [licenseKey],
  };

  const license = {
    key: licenseKey,
    plan: "pro",
    userId: user.id,
    email: userEmail,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    paddleSubscriptionId: "sub_seed",
    paddleOrderId: "order_seed"
  };

  try {
    await kv.set(`user:${userEmail}`, user);
    console.log(`User seeded: ${userEmail}`);
    
    await kv.set(`license:${licenseKey}`, license);
    console.log(`License seeded: ${licenseKey}`);
    
    console.log("Seeding complete!");
  } catch (err) {
    console.error("Error seeding:", err);
  }
}

seed();
