import Head from "next/head";
import Link from "next/link";
import { Terminal, ArrowLeft } from "lucide-react";
import { MassironNav } from "../components/MassironNav";
import { MassironFooter } from "../components/MassironFooter";

export default function Refund() {
  return (
    <>
      <Head>
        <title>Refund Policy — massiron</title>
      </Head>

      <div className="min-h-screen bg-deep-950">
        <MassironNav />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. 14-Day Money-Back Guarantee</h2>
              <p>
                We want you to be confident in your purchase. If you are not satisfied with deepstrain, ATLAS, or adauto, you may request a full refund within <strong>14 days</strong> of your initial purchase. No questions asked.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. How to Request a Refund</h2>
              <p>
                To request a refund, email <a href="mailto:support@massiron.com" className="text-strain-400 hover:underline">support@massiron.com</a> from the email address associated with your purchase. Include your order ID (found in your Paddle receipt). Refunds are processed within 5–10 business days to your original payment method.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Subscription Renewals</h2>
              <p>
                For recurring subscriptions, the 14-day guarantee applies only to your first payment. Renewal charges are non-refundable, but you may cancel at any time to prevent future billing. Cancellation takes effect at the end of the current billing period, and you retain access until then.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. How to Cancel</h2>
              <p>
                You can cancel your subscription at any time from your customer dashboard or by emailing <a href="mailto:support@massiron.com" className="text-strain-400 hover:underline">support@massiron.com</a>. After cancellation, your license remains active until the end of the paid period.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Exceptions</h2>
              <p>
                Refunds may be declined in cases of clear abuse, such as repeated purchase-and-refund cycles, or violation of our Terms of Service. We evaluate each request fairly and in good faith.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Payment Processor</h2>
              <p>
                All payments and refunds are handled by our authorized reseller and Merchant of Record, Paddle.com. Paddle&apos;s buyer terms also apply to your purchase. You may contact Paddle directly regarding any billing inquiry.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Contact</h2>
              <p>
                Questions about this policy? Reach us at <a href="mailto:support@massiron.com" className="text-strain-400 hover:underline">support@massiron.com</a>. We respond within 1 business day.
              </p>
            </section>
          </div>
        </div>

        <MassironFooter />
      </div>
    </>
  );
}
