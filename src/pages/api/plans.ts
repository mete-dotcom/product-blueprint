import type { NextApiRequest, NextApiResponse } from "next";

const BASE = 9; // $/month

type PlansResponse = {
  success: boolean;
  error?: string;
  plans?: Plan[];
};

interface Plan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    quarterly: number;   // per month
    biannual: number;    // per month
    yearly: number;      // per month
  };
  billed: {
    monthly: number;
    quarterly: number;
    biannual: number;
    yearly: number;
  };
  features: string[];
  paddleId: {
    monthly: string;
    quarterly: string;
    biannual: string;
    yearly: string;
  };
}

const PLANS: Plan[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Full access. One plan. Commit longer, pay less.",
    price: {
      monthly:   BASE,
      quarterly: Math.floor(BASE * 0.89),
      biannual:  Math.floor(BASE * 0.78),
      yearly:    Math.floor(BASE * 0.67),
    },
    billed: {
      monthly:   BASE * 1,
      quarterly: Math.floor(BASE * 3 * 0.89),
      biannual:  Math.floor(BASE * 6 * 0.78),
      yearly:    Math.floor(BASE * 12 * 0.67),
    },
    features: [
      "compiled binary via pip — no source exposed",
      "unlimited local agent execution runs",
      "byok deepseek api (bring your own key)",
      "keyring-backed secret storage",
      "cloud license activation + revocation",
      "hmac-signed offline execution token",
      "gui settings panel",
      "3 cli aliases: deepstrain · ds · strain",
      "desktop shortcut + powershell integration",
      "priority support",
    ],
    paddleId: {
      monthly:   "pro_monthly",
      quarterly: "pro_quarterly",
      biannual:  "pro_biannual",
      yearly:    "pro_yearly",
    },
  },
];

/**
 * GET /api/plans
 * Returns the professional plan with all billing period prices.
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PlansResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  return res.status(200).json({ success: true, plans: PLANS });
}
