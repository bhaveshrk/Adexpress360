import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Shield, Lock, Eye, Database, Bell, Mail, UserCheck, AlertTriangle, Scale } from 'lucide-react';

export function PrivacyPolicy() {
    const lastUpdated = "January 23, 2026";

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Header />

            <main className="flex-1 container-app py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-2xl mb-6">
                            <Shield className="text-primary-600" size={32} />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Last Updated: {lastUpdated}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 space-y-8">

                        {/* Introduction */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Lock size={24} className="text-primary-500" />
                                1. Introduction
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>
                                    Welcome to FindAds ("we," "our," or "us"). We are committed to protecting your privacy
                                    and personal data in accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong>,
                                    the <strong>Information Technology Act, 2000</strong>, and the <strong>Information Technology
                                        (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>.
                                </p>
                                <p>
                                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                                    when you use our classified advertisement platform. Please read this policy carefully to
                                    understand our practices regarding your personal data.
                                </p>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                    <p className="text-blue-800 dark:text-blue-300 text-sm">
                                        <strong>Data Fiduciary:</strong> FindAds operates as a Data Fiduciary under the DPDP Act, 2023.
                                        We process your personal data based on your consent and legitimate purposes as outlined in this policy.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Information We Collect */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Database size={24} className="text-primary-500" />
                                2. Information We Collect
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">2.1 Personal Data You Provide</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Account Information:</strong> Mobile number, email address (optional), display name</li>
                                    <li><strong>Advertisement Data:</strong> Title, description, category, location, contact details</li>
                                    <li><strong>Communication Data:</strong> Messages, inquiries, support tickets</li>
                                    <li><strong>Payment Information:</strong> Transaction records for premium services (processed via secure payment gateways)</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">2.2 Automatically Collected Data</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                                    <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns, search queries</li>
                                    <li><strong>Location Data:</strong> Approximate location based on IP address (for localized ads)</li>
                                    <li><strong>Cookies & Tracking:</strong> Session cookies, analytics cookies, preference cookies</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">2.3 Sensitive Personal Data</h3>
                                <p>
                                    We do not intentionally collect Sensitive Personal Data or Information (SPDI) as defined under
                                    IT Rules, 2011 (financial information, health data, biometric data, etc.) unless explicitly
                                    required for a specific service and with your express consent.
                                </p>
                            </div>
                        </section>

                        {/* Purpose of Data Collection */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Eye size={24} className="text-primary-500" />
                                3. Purpose of Data Collection
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>We process your personal data for the following lawful purposes:</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Service Delivery</h4>
                                        <ul className="text-sm space-y-1">
                                            <li>• User registration and authentication</li>
                                            <li>• Publishing and managing advertisements</li>
                                            <li>• Facilitating buyer-seller communication</li>
                                            <li>• Processing payments for premium features</li>
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Platform Improvement</h4>
                                        <ul className="text-sm space-y-1">
                                            <li>• Analyzing usage patterns</li>
                                            <li>• Preventing fraud and abuse</li>
                                            <li>• Enhancing user experience</li>
                                            <li>• Developing new features</li>
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Legal Compliance</h4>
                                        <ul className="text-sm space-y-1">
                                            <li>• Responding to legal requests</li>
                                            <li>• Compliance with government orders</li>
                                            <li>• Dispute resolution</li>
                                            <li>• Record keeping requirements</li>
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Communication</h4>
                                        <ul className="text-sm space-y-1">
                                            <li>• Service notifications</li>
                                            <li>• Promotional offers (with consent)</li>
                                            <li>• Customer support</li>
                                            <li>• Policy updates</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Data Sharing */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <UserCheck size={24} className="text-primary-500" />
                                4. Data Sharing & Disclosure
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>We may share your personal data with:</p>
                                <ul className="space-y-3">
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-gray-900 dark:text-white min-w-[180px]">Other Users:</span>
                                        <span>Contact details in published ads are visible to potential buyers</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-gray-900 dark:text-white min-w-[180px]">Service Providers:</span>
                                        <span>Cloud hosting, analytics, payment processors (under confidentiality agreements)</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-gray-900 dark:text-white min-w-[180px]">Legal Authorities:</span>
                                        <span>When required by law, court order, or government authority under IT Act, 2000</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="font-semibold text-gray-900 dark:text-white min-w-[180px]">Business Transfers:</span>
                                        <span>In case of merger, acquisition, or sale of assets (with prior notice)</span>
                                    </li>
                                </ul>
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-4">
                                    <p className="text-amber-800 dark:text-amber-300 text-sm">
                                        <strong>Cross-Border Transfer:</strong> Your data may be processed on servers located outside India.
                                        We ensure adequate safeguards are in place as per DPDP Act requirements.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Your Rights */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Scale size={24} className="text-primary-500" />
                                5. Your Rights Under DPDP Act, 2023
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>As a Data Principal, you have the following rights:</p>
                                <div className="space-y-4">
                                    <div className="border-l-4 border-primary-500 pl-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Right to Access</h4>
                                        <p className="text-sm">Obtain confirmation and summary of your personal data being processed</p>
                                    </div>
                                    <div className="border-l-4 border-primary-500 pl-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Right to Correction & Erasure</h4>
                                        <p className="text-sm">Request correction of inaccurate data or erasure of data no longer required</p>
                                    </div>
                                    <div className="border-l-4 border-primary-500 pl-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Right to Grievance Redressal</h4>
                                        <p className="text-sm">File complaints with our Grievance Officer or the Data Protection Board of India</p>
                                    </div>
                                    <div className="border-l-4 border-primary-500 pl-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Right to Withdraw Consent</h4>
                                        <p className="text-sm">Withdraw consent at any time (may affect service availability)</p>
                                    </div>
                                    <div className="border-l-4 border-primary-500 pl-4">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">Right to Nominate</h4>
                                        <p className="text-sm">Nominate another person to exercise your rights in case of death or incapacity</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Data Retention */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Database size={24} className="text-primary-500" />
                                6. Data Retention
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>We retain your personal data for:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Active Account:</strong> As long as your account is active</li>
                                    <li><strong>Advertisement Data:</strong> Duration of ad plus 90 days after expiry</li>
                                    <li><strong>Transaction Records:</strong> 7 years (as per Income Tax Act requirements)</li>
                                    <li><strong>Legal Compliance:</strong> As required by applicable laws</li>
                                    <li><strong>After Account Deletion:</strong> Anonymized data may be retained for analytics</li>
                                </ul>
                            </div>
                        </section>

                        {/* Security Measures */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Lock size={24} className="text-primary-500" />
                                7. Security Measures
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>We implement reasonable security practices as mandated by IT Rules, 2011:</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <ul className="list-disc list-inside space-y-2">
                                        <li>SSL/TLS encryption for data in transit</li>
                                        <li>Encrypted storage for sensitive data</li>
                                        <li>Regular security audits</li>
                                        <li>Access controls and authentication</li>
                                    </ul>
                                    <ul className="list-disc list-inside space-y-2">
                                        <li>Firewall protection</li>
                                        <li>Intrusion detection systems</li>
                                        <li>Employee training on data protection</li>
                                        <li>Incident response procedures</li>
                                    </ul>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mt-4">
                                    <p className="text-red-800 dark:text-red-300 text-sm">
                                        <strong>Security Breach Notification:</strong> In case of a personal data breach likely to cause harm,
                                        we will notify affected users and the Data Protection Board as required under DPDP Act.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Cookies */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Bell size={24} className="text-primary-500" />
                                8. Cookies & Tracking Technologies
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>We use cookies and similar technologies for:</p>
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-700">
                                            <th className="text-left p-3 font-semibold">Type</th>
                                            <th className="text-left p-3 font-semibold">Purpose</th>
                                            <th className="text-left p-3 font-semibold">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b dark:border-gray-700">
                                            <td className="p-3">Essential</td>
                                            <td className="p-3">Authentication, security</td>
                                            <td className="p-3">Session</td>
                                        </tr>
                                        <tr className="border-b dark:border-gray-700">
                                            <td className="p-3">Functional</td>
                                            <td className="p-3">Preferences, settings</td>
                                            <td className="p-3">1 year</td>
                                        </tr>
                                        <tr className="border-b dark:border-gray-700">
                                            <td className="p-3">Analytics</td>
                                            <td className="p-3">Usage statistics</td>
                                            <td className="p-3">2 years</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p className="text-sm">
                                    You can manage cookie preferences through your browser settings. Disabling essential cookies
                                    may affect platform functionality.
                                </p>
                            </div>
                        </section>

                        {/* Children's Privacy */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <AlertTriangle size={24} className="text-primary-500" />
                                9. Children's Privacy
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>
                                    Our services are not intended for individuals under 18 years of age. We do not knowingly
                                    collect personal data from minors. If we become aware of such collection, we will promptly
                                    delete the data as per Section 9 of the DPDP Act, 2023.
                                </p>
                                <p>
                                    Parents or guardians who believe their child has provided personal data should contact us immediately.
                                </p>
                            </div>
                        </section>

                        {/* Grievance Officer */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Mail size={24} className="text-primary-500" />
                                10. Grievance Officer
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>
                                    In accordance with IT Act, 2000 and DPDP Act, 2023, we have appointed a Grievance Officer:
                                </p>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                    <p><strong>Name:</strong> Grievance Officer, FindAds</p>
                                    <p><strong>Email:</strong> grievance@findads.com</p>
                                    <p><strong>Response Time:</strong> Within 30 days of receiving complaint</p>
                                    <p className="mt-4 text-sm">
                                        If not satisfied with our response, you may approach the Data Protection Board of India
                                        as per Section 13 of the DPDP Act, 2023.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Changes to Policy */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                11. Changes to This Policy
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>
                                    We may update this Privacy Policy from time to time. Material changes will be notified
                                    through email or prominent notice on our platform. Continued use after changes constitutes
                                    acceptance of the updated policy.
                                </p>
                            </div>
                        </section>

                        {/* Governing Law */}
                        <section className="border-t pt-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Governing Law & Jurisdiction
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                This Privacy Policy is governed by the laws of India. Any disputes shall be subject to the
                                exclusive jurisdiction of courts in [Your City], India.
                            </p>
                        </section>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
