import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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

                <h1 className="text-4xl font-bold text-[#101313] mb-8">Privacy Policy</h1>

                <div className="prose prose-lg max-w-none space-y-6 text-[#101313]">
                    <section>
                        <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">1. Information We Collect</h2>
                        <p className="text-[#848785] leading-relaxed mb-4">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-[#848785] ml-4">
                            <li>Name and contact information (email address, phone number, shipping address)</li>
                            <li>Account credentials (email and password)</li>
                            <li>Payment information (processed securely through Stripe)</li>
                            <li>Order history and preferences</li>
                            <li>Communications with us</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">2. How We Use Your Information</h2>
                        <p className="text-[#848785] leading-relaxed mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-[#848785] ml-4">
                            <li>Process and fulfill your orders</li>
                            <li>Send you order confirmations and shipping notifications</li>
                            <li>Communicate with you about products, services, and promotional offers</li>
                            <li>Improve our website and customer service</li>
                            <li>Prevent fraud and enhance security</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">3. Information Sharing</h2>
                        <p className="text-[#848785] leading-relaxed">
                            We do not sell, trade, or rent your personal information to third parties. We may share your information with:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-[#848785] ml-4 mt-4">
                            <li>Service providers who assist in our operations (payment processing, shipping)</li>
                            <li>Law enforcement when required by law</li>
                            <li>Business partners with your consent</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">4. Payment Security</h2>
                        <p className="text-[#848785] leading-relaxed">
                            All payment transactions are processed through Stripe, a PCI-DSS compliant payment processor. We do not store your complete credit card information on our servers. Payment data is encrypted and transmitted securely using industry-standard SSL/TLS protocols.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">5. Cookies and Tracking</h2>
                        <p className="text-[#848785] leading-relaxed">
                            We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand user preferences. You can control cookies through your browser settings, but disabling them may affect website functionality.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">6. Data Security</h2>
                        <p className="text-[#848785] leading-relaxed">
                            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">7. Your Rights</h2>
                        <p className="text-[#848785] leading-relaxed mb-4">
                            You have the right to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-[#848785] ml-4">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your account and data</li>
                            <li>Opt-out of marketing communications</li>
                            <li>Export your data</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">8. Data Retention</h2>
                        <p className="text-[#848785] leading-relaxed">
                            We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law. Order history is retained for accounting and legal compliance purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">9. Children's Privacy</h2>
                        <p className="text-[#848785] leading-relaxed">
                            Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">10. Changes to This Policy</h2>
                        <p className="text-[#848785] leading-relaxed">
                            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date below.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#0B7C6B] mb-4">11. Contact Us</h2>
                        <p className="text-[#848785] leading-relaxed">
                            If you have questions about this privacy policy or how we handle your personal information, please contact our privacy team through our customer support.
                        </p>
                    </section>
                </div>

                <div className="mt-12 p-6 bg-white rounded-lg border border-[#E4E9E8]">
                    <p className="text-sm text-[#848785]">
                        <strong className="text-[#101313]">Last Updated:</strong> February 2026
                    </p>
                </div>
            </main>
        </div>
    );
}
