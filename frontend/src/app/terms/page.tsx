import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F9FCFB]">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-[#848785] hover:text-[#0B7C6B] mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-[#101313] mb-8">
          Terms of Service
        </h1>

        <div className="prose prose-lg max-w-none space-y-6 text-[#101313]">
          <section>
            <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-[#848785] leading-relaxed">
              By accessing and using this online bookstore, you accept and agree
              to be bound by the terms and provision of this agreement. If you
              do not agree to abide by the above, please do not use this
              service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">
              2. Use License
            </h2>
            <p className="text-[#848785] leading-relaxed mb-4">
              Permission is granted to temporarily access the materials on our
              bookstore for personal, non-commercial transitory viewing only.
              This is the grant of a license, not a transfer of title, and under
              this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#848785] ml-4">
              <li>Modify or copy the materials</li>
              <li>
                Use the materials for any commercial purpose or for any public
                display
              </li>
              <li>
                Attempt to reverse engineer any software contained on our
                website
              </li>
              <li>
                Remove any copyright or other proprietary notations from the
                materials
              </li>
              <li>
                Transfer the materials to another person or &quot;mirror&quot;
                the materials on any other server
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">
              3. User Account
            </h2>
            <p className="text-[#848785] leading-relaxed">
              When you create an account with us, you must provide accurate,
              complete, and current information. Failure to do so constitutes a
              breach of the Terms, which may result in immediate termination of
              your account. You are responsible for safeguarding your password
              and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">
              4. Orders and Payment
            </h2>
            <p className="text-[#848785] leading-relaxed">
              All orders are subject to acceptance and availability. We reserve
              the right to refuse or cancel any order for any reason. Prices are
              subject to change without notice. Payment must be received before
              items are shipped. We accept major credit cards and other payment
              methods as displayed on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">
              5. Shipping and Returns
            </h2>
            <p className="text-[#848785] leading-relaxed">
              We ship to addresses provided by customers. Shipping times may
              vary. Items may be returned within 30 days of receipt in their
              original condition. Refunds will be processed within 7-10 business
              days of receiving the returned item.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">
              6. Disclaimer
            </h2>
            <p className="text-[#848785] leading-relaxed">
              The materials on our bookstore are provided on an &apos;as
              is&apos; basis. We make no warranties, expressed or implied, and
              hereby disclaim all other warranties including, without
              limitation, implied warranties or conditions of merchantability,
              fitness for a particular purpose, or non-infringement of
              intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">
              7. Limitations
            </h2>
            <p className="text-[#848785] leading-relaxed">
              In no event shall our bookstore or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">
              8. Modifications
            </h2>
            <p className="text-[#848785] leading-relaxed">
              We may revise these terms of service at any time without notice.
              By using this website, you are agreeing to be bound by the
              then-current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">
              9. Contact Information
            </h2>
            <p className="text-[#848785] leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us through our customer support.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg border border-[#E4E9E8]">
          <p className="text-sm text-[#848785]">
            <strong className="text-[#101313]">Last Updated:</strong> February
            2026
          </p>
        </div>
      </main>
    </div>
  );
}
