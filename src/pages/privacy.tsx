import Head from "next/head";
import Link from "next/link";
import { Terminal, ArrowLeft, ChevronRight, Shield } from "lucide-react";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — DeepStrain</title>
      </Head>

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-deep-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Terminal className="w-6 h-6 text-strain-400" />
              <span className="font-semibold gradient-text">DeepStrain</span>
            </Link>
          </div>
        </div>
      </nav>

      <section className="min-h-screen pt-24 pb-16 gradient-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-300">Privacy Policy</span>
          </div>

          <div className="glass p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-6 h-6 text-strain-400" />
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            </div>

            <div className="space-y-6 text-gray-400 leading-relaxed">
              <p>
                <strong className="text-white">DeepStrain is offline-first by design.</strong> Your code never leaves your machine. We do not collect telemetry, usage data, or any information about your projects.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8">What We Collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-gray-300">Email address</strong> — Required for license key delivery and purchase receipts.</li>
                <li><strong className="text-gray-300">Payment information</strong> — Processed by Paddle (our payment provider). We never see or store your credit card details.</li>
                <li><strong className="text-gray-300">License keys</strong> — Stored locally on your machine. We maintain a record of issued keys for verification purposes.</li>
              </ul>

              <h2 className="text-xl font-semibold text-white mt-8">What We Don't Collect</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your source code</li>
                <li>Your AI prompts or responses</li>
                <li>Your file system structure</li>
                <li>Usage analytics or telemetry</li>
                <li>IP addresses (beyond standard server logs)</li>
              </ul>

              <h2 className="text-xl font-semibold text-white mt-8">Data Storage</h2>
              <p>
                License information is stored locally in <code className="text-strain-400 font-mono text-sm">~/.deepstrain/</code>. 
                You can delete this at any time. Your license key can be re-downloaded from your dashboard.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8">Third-Party Services</h2>
              <p>
                We use <strong className="text-gray-300">Paddle</strong> for payment processing. 
                Paddle's privacy policy applies to payment data. We use <strong className="text-gray-300">Vercel</strong> for hosting.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8">Contact</h2>
              <p>
                Questions about this policy? Contact us at <a href="mailto:privacy@deepstrain.dev" className="text-strain-400 hover:text-strain-300 transition-colors">privacy@deepstrain.dev</a>.
              </p>

              <p className="text-sm text-gray-500 pt-4 border-t border-white/5">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-white/5 bg-deep-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} DeepStrain. All rights reserved.
        </div>
      </footer>
    </>
  );
}
