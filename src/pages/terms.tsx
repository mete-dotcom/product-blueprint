import Head from "next/head";
import Link from "next/link";
import { Terminal, ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — DeepStrain</title>
      </Head>

      <div className="min-h-screen bg-deep-950">
        {/* Header */}
        <nav className="border-b border-white/5 bg-deep-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <Terminal className="w-6 h-6 text-strain-400" />
                <span className="font-bold gradient-text">DeepStrain</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By purchasing, downloading, or using DeepStrain ("the Software"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Software.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. License Grant</h2>
              <p>
                DeepStrain grants you a non-exclusive, non-transferable license to use the Software for your personal or business purposes, subject to the tier you have purchased. Each license is tied to a specific email address and may be activated on a limited number of machines as defined by your plan.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Restrictions</h2>
              <p>You may not:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Reverse engineer, decompile, or disassemble the Software</li>
                <li>Redistribute, sublicense, or resell the Software</li>
                <li>Use the Software for any illegal activity</li>
                <li>Circumvent the license activation system</li>
                <li>Share your license key with unauthorized users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Subscription & Billing</h2>
              <p>
                Subscriptions are billed monthly or annually as selected at checkout. You may cancel at any time. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial periods.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Data & Privacy</h2>
              <p>
                DeepStrain operates offline-first. Your code never leaves your machine. We collect only the minimum data required for license activation and support. See our Privacy Policy for details.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Disclaimer of Warranty</h2>
              <p>
                The Software is provided "as is" without warranty of any kind. DeepStrain does not guarantee that the Software will be error-free or uninterrupted.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
              <p>
                DeepStrain shall not be liable for any indirect, incidental, or consequential damages arising from the use of the Software.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Users will be notified of material changes via email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Contact</h2>
              <p>
                For questions about these terms, contact us at support@massiron.com.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 border-t border-white/5 bg-deep-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} DeepStrain. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
