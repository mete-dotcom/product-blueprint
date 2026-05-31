import Head from "next/head";
import Link from "next/link";
import { Terminal, Users, Key, DollarSign, Shield, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

type AdminData = {
  users: Array<{
    id: string;
    email: string;
    name: string;
    tier: string;
    created: string;
    licenseCount: number;
  }>;
  licenses: Array<{
    key: string;
    email: string;
    tier: string;
    issued: string;
    expires: string;
    valid: boolean;
    cancelled: boolean;
  }>;
  stats: {
    totalUsers: number;
    totalLicenses: number;
    activeLicenses: number;
    revenue: {
      starter: number;
      pro: number;
      enterprise: number;
    };
  };
};

export default function Admin() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin", {
        headers: { "X-Admin-Key": adminKey },
      });

      if (res.status === 401) {
        setError("Invalid admin key");
        setAuthenticated(false);
        return;
      }

      const result = await res.json();
      if (!result.success) {
        setError(result.error || "Failed to load data");
        return;
      }

      setData(result.data);
      setAuthenticated(true);
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <>
        <Head>
          <title>Admin — DeepStrain</title>
        </Head>
        <div className="min-h-screen bg-deep-950 flex items-center justify-center px-4">
          <div className="glass p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 text-strain-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
              <p className="text-gray-400 text-sm">Enter your admin key to continue</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin key"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-strain-500 focus:ring-1 focus:ring-strain-500 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && fetchData()}
              />
              <button
                onClick={fetchData}
                className="w-full px-6 py-3 bg-strain-600 hover:bg-strain-500 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Access Admin Panel
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-950 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-strain-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-deep-950 flex items-center justify-center">
        <p className="text-red-400">Failed to load data</p>
      </div>
    );
  }

  const totalRevenue = Object.values(data.stats.revenue).reduce((a, b) => a + b, 0);

  return (
    <>
      <Head>
        <title>Admin Dashboard — DeepStrain</title>
      </Head>

      <div className="min-h-screen bg-deep-950">
        {/* Header */}
        <nav className="border-b border-white/5 bg-deep-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                  <Terminal className="w-6 h-6 text-strain-400" />
                  <span className="font-bold gradient-text">DeepStrain</span>
                </Link>
                <span className="text-sm px-3 py-1 bg-strain-600/20 text-strain-400 rounded-full font-medium">
                  Admin
                </span>
              </div>
              <button
                onClick={() => { setAuthenticated(false); setAdminKey(""); }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Lock
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-strain-400" />
                <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
              </div>
              <p className="text-3xl font-bold text-white">{data.stats.totalUsers}</p>
            </div>

            <div className="glass p-6">
              <div className="flex items-center gap-3 mb-2">
                <Key className="w-5 h-5 text-strain-400" />
                <h3 className="text-gray-400 text-sm font-medium">Total Licenses</h3>
              </div>
              <p className="text-3xl font-bold text-white">{data.stats.totalLicenses}</p>
            </div>

            <div className="glass p-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-green-400" />
                <h3 className="text-gray-400 text-sm font-medium">Active Licenses</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">{data.stats.activeLicenses}</p>
            </div>

            <div className="glass p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                <h3 className="text-gray-400 text-sm font-medium">Monthly Revenue</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-400">${totalRevenue}/mo</p>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="glass p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Revenue Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data.stats.revenue).map(([tier, amount]) => (
                <div key={tier} className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm capitalize mb-1">{tier}</p>
                  <p className="text-2xl font-bold text-white">${amount}/mo</p>
                </div>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="glass p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Tier</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Licenses</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white">{user.email}</td>
                      <td className="py-3 px-4 text-gray-300">{user.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.tier === "enterprise" ? "bg-purple-500/20 text-purple-400" :
                          user.tier === "pro" ? "bg-strain-600/20 text-strain-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {user.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{user.licenseCount}</td>
                      <td className="py-3 px-4 text-gray-500">{new Date(user.created).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Licenses Table */}
          <div className="glass p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Licenses</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Key</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Tier</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {data.licenses.map((lic) => (
                    <tr key={lic.key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white font-mono text-xs">{lic.key}</td>
                      <td className="py-3 px-4 text-gray-300">{lic.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lic.tier === "enterprise" ? "bg-purple-500/20 text-purple-400" :
                          lic.tier === "pro" ? "bg-strain-600/20 text-strain-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {lic.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {lic.cancelled ? (
                          <span className="text-red-400 text-xs font-medium">Cancelled</span>
                        ) : lic.valid ? (
                          <span className="text-green-400 text-xs font-medium">Active</span>
                        ) : (
                          <span className="text-yellow-400 text-xs font-medium">Expired</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{new Date(lic.expires).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
