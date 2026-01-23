import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FileText, AlertTriangle, Ban, Scale, Shield, CreditCard, Clock, Gavel, Mail, CheckCircle } from 'lucide-react';

export function TermsConditions() {
    const lastUpdated = "January 23, 2026";
    const effectiveDate = "January 23, 2026";

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Header />

            <main className="flex-1 container-app py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-2xl mb-6">
                            <FileText className="text-primary-600" size={32} />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms & Conditions</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Last Updated: {lastUpdated} | Effective: {effectiveDate}
                        </p>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8">
                        <div className="flex gap-4">
                            <AlertTriangle className="text-amber-600 flex-shrink-0" size={24} />
                            <div>
                                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Important Legal Notice</h3>
                                <p className="text-amber-700 dark:text-amber-400 text-sm">
                                    By accessing or using AdExpress360, you agree to be bound by these Terms & Conditions.
                                    If you do not agree, please do not use our services. These terms constitute a legally
                                    binding agreement under the Indian Contract Act, 1872.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 space-y-8">

                        {/* Definitions */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <FileText size={24} className="text-primary-500" />
                                1. Definitions & Interpretation
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>In these Terms & Conditions:</p>
                                <ul className="space-y-2">
                                    <li><strong>"Platform"</strong> refers to AdExpress360 website and mobile applications</li>
                                    <li><strong>"User"</strong> refers to any person accessing or using the Platform</li>
                                    <li><strong>"Advertiser"</strong> refers to Users who post advertisements</li>
                                    <li><strong>"Advertisement/Ad"</strong> refers to any listing posted on the Platform</li>
                                    <li><strong>"Services"</strong> refers to all features and functionalities provided by the Platform</li>
                                    <li><strong>"Content"</strong> refers to text, images, and any material posted by Users</li>
                                    <li><strong>"We/Us/Our"</strong> refers to AdExpress360 and its operators</li>
                                </ul>
                            </div>
                        </section>

                        {/* Eligibility */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <CheckCircle size={24} className="text-primary-500" />
                                2. Eligibility & Account Registration
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">2.1 Eligibility Criteria</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>You must be at least 18 years of age</li>
                                    <li>You must be competent to enter into a contract under the Indian Contract Act, 1872</li>
                                    <li>You must provide accurate and complete registration information</li>
                                    <li>You must have a valid Indian mobile number</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">2.2 Account Responsibilities</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>You are responsible for maintaining confidentiality of your account credentials</li>
                                    <li>You are liable for all activities under your account</li>
                                    <li>You must immediately notify us of any unauthorized access</li>
                                    <li>One person may maintain only one active account</li>
                                </ul>
                            </div>
                        </section>

                        {/* Acceptable Use */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Shield size={24} className="text-primary-500" />
                                3. Acceptable Use Policy
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>You agree to use the Platform only for lawful purposes. You shall NOT:</p>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                                        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Illegal Content</h4>
                                        <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                                            <li>• Weapons, drugs, contraband</li>
                                            <li>• Human trafficking, prostitution</li>
                                            <li>• Counterfeit goods, pirated content</li>
                                            <li>• Wildlife products (per Wildlife Protection Act)</li>
                                        </ul>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                                        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Harmful Content</h4>
                                        <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                                            <li>• Obscene or pornographic material</li>
                                            <li>• Content promoting hatred or violence</li>
                                            <li>• Defamatory or libelous content</li>
                                            <li>• Content violating religious sentiments</li>
                                        </ul>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                                        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Fraudulent Activities</h4>
                                        <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                                            <li>• Misleading or false advertisements</li>
                                            <li>• Phishing or scam attempts</li>
                                            <li>• Ponzi or pyramid schemes</li>
                                            <li>• Impersonation of others</li>
                                        </ul>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                                        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Technical Abuse</h4>
                                        <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                                            <li>• Hacking or unauthorized access</li>
                                            <li>• Malware or virus distribution</li>
                                            <li>• Automated scraping or bots</li>
                                            <li>• Denial of service attacks</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mt-4">
                                    <p className="text-blue-800 dark:text-blue-300 text-sm">
                                        <strong>Legal Compliance:</strong> All advertisements must comply with the Consumer Protection Act, 2019,
                                        Advertising Standards Council of India (ASCI) guidelines, and all applicable Indian laws.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Prohibited Items */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Ban size={24} className="text-primary-500" />
                                4. Prohibited Items & Services
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>The following items/services cannot be advertised:</p>
                                <div className="grid md:grid-cols-3 gap-4 text-sm">
                                    <ul className="space-y-1">
                                        <li>• Alcohol & tobacco products</li>
                                        <li>• Prescription medications</li>
                                        <li>• Firearms & ammunition</li>
                                        <li>• Explosives & fireworks</li>
                                        <li>• Hazardous chemicals</li>
                                    </ul>
                                    <ul className="space-y-1">
                                        <li>• Stolen property</li>
                                        <li>• Government IDs & documents</li>
                                        <li>• Financial instruments</li>
                                        <li>• Cryptocurrency/MLM schemes</li>
                                        <li>• Gambling services</li>
                                    </ul>
                                    <ul className="space-y-1">
                                        <li>• Endangered species products</li>
                                        <li>• Antiquities (per Antiquities Act)</li>
                                        <li>• Organ trafficking</li>
                                        <li>• Surveillance equipment</li>
                                        <li>• Jamming devices</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Advertisement Guidelines */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <FileText size={24} className="text-primary-500" />
                                5. Advertisement Guidelines
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">5.1 Content Requirements</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Advertisements must be accurate, truthful, and not misleading</li>
                                    <li>Prices quoted must be genuine and inclusive of all charges (per Legal Metrology Act)</li>
                                    <li>Images must be original or you must have rights to use them</li>
                                    <li>Contact information must be valid and belong to the advertiser</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">5.2 Moderation Rights</h3>
                                <p>We reserve the right to:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Review, approve, edit, or reject any advertisement</li>
                                    <li>Remove content that violates these terms without notice</li>
                                    <li>Suspend or terminate accounts for repeated violations</li>
                                    <li>Report illegal content to law enforcement authorities</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">5.3 Duration & Renewal</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Advertisements are published for the selected duration</li>
                                    <li>Expired ads are automatically removed from listings</li>
                                    <li>We may delete ads that remain inactive for extended periods</li>
                                </ul>
                            </div>
                        </section>

                        {/* Payments */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <CreditCard size={24} className="text-primary-500" />
                                6. Payments, Fees & Refunds
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">6.1 Pricing</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Basic ad posting is free of charge</li>
                                    <li>Premium features (featured ads, extended duration) are paid services</li>
                                    <li>All prices are in Indian Rupees (INR) and inclusive of applicable GST</li>
                                    <li>We reserve the right to modify pricing with prior notice</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">6.2 Refund Policy</h3>
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                    <ul className="space-y-2">
                                        <li><strong>Full Refund:</strong> If ad is rejected during moderation before going live</li>
                                        <li><strong>Pro-rata Refund:</strong> If ad is removed due to our technical error</li>
                                        <li><strong>No Refund:</strong> If ad is removed due to policy violations by user</li>
                                        <li><strong>Processing Time:</strong> Refunds processed within 7-10 business days</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Intellectual Property */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Shield size={24} className="text-primary-500" />
                                7. Intellectual Property Rights
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">7.1 Our Rights</h3>
                                <p>
                                    AdExpress360, its logo, design, features, and functionality are owned by us and protected
                                    under the Copyright Act, 1957 and Trademarks Act, 1999. You may not copy, reproduce, or
                                    create derivative works without written permission.
                                </p>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">7.2 User Content License</h3>
                                <p>
                                    By posting content on our Platform, you grant us a non-exclusive, royalty-free, worldwide
                                    license to use, display, and distribute your content for the purpose of operating the Platform.
                                    You retain ownership of your content.
                                </p>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">7.3 Copyright Infringement</h3>
                                <p>
                                    If you believe your copyright is infringed, send a notice under the Copyright Act, 1957
                                    to our designated agent with: (a) identification of the work, (b) URL of infringing content,
                                    (c) your contact details, (d) statement of good faith belief, (e) signature.
                                </p>
                            </div>
                        </section>

                        {/* Disclaimer */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <AlertTriangle size={24} className="text-primary-500" />
                                8. Disclaimers & Limitation of Liability
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">8.1 Platform Role</h3>
                                    <p>
                                        AdExpress360 is an <strong>intermediary platform</strong> as defined under Section 2(1)(w) of the
                                        Information Technology Act, 2000. We merely provide the technological platform for Users to
                                        post and view advertisements. We do NOT:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>Initiate, select, or modify the content of advertisements</li>
                                        <li>Guarantee the authenticity of any listing or user</li>
                                        <li>Participate in any transaction between users</li>
                                        <li>Verify the quality, safety, or legality of items listed</li>
                                    </ul>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">8.2 No Warranties</h3>
                                <p>
                                    The Platform is provided "AS IS" and "AS AVAILABLE" without warranties of any kind.
                                    We do not guarantee uninterrupted, secure, or error-free service.
                                </p>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">8.3 Limitation of Liability</h3>
                                <p>
                                    To the maximum extent permitted by law, we shall not be liable for any direct, indirect,
                                    incidental, consequential, or punitive damages arising from:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Use or inability to use the Platform</li>
                                    <li>Any transaction between users</li>
                                    <li>Unauthorized access to your data</li>
                                    <li>Content posted by other users</li>
                                    <li>Any errors or omissions in content</li>
                                </ul>
                                <p className="mt-4">
                                    <strong>Maximum Liability:</strong> Our total liability shall not exceed the amount paid
                                    by you to us in the preceding 12 months or ₹10,000, whichever is lower.
                                </p>
                            </div>
                        </section>

                        {/* Indemnification */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Scale size={24} className="text-primary-500" />
                                9. Indemnification
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>
                                    You agree to indemnify, defend, and hold harmless AdExpress360, its officers, directors,
                                    employees, and agents from any claims, damages, losses, liabilities, costs, or expenses
                                    (including legal fees) arising from:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Your use of the Platform</li>
                                    <li>Your violation of these Terms</li>
                                    <li>Your violation of any third-party rights</li>
                                    <li>Content you post on the Platform</li>
                                    <li>Any transaction you enter with another user</li>
                                </ul>
                            </div>
                        </section>

                        {/* Termination */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Clock size={24} className="text-primary-500" />
                                10. Termination
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">10.1 By User</h3>
                                <p>
                                    You may terminate your account at any time by contacting us. Active advertisements
                                    will be removed, and any unused prepaid services will be forfeited.
                                </p>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">10.2 By Us</h3>
                                <p>We may suspend or terminate your account immediately if you:</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Violate these Terms & Conditions</li>
                                    <li>Engage in fraudulent or illegal activities</li>
                                    <li>Fail to pay for premium services</li>
                                    <li>Remain inactive for more than 12 months</li>
                                    <li>Upon request by law enforcement</li>
                                </ul>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">10.3 Effect of Termination</h3>
                                <p>
                                    Upon termination, your right to use the Platform ceases. Provisions regarding intellectual
                                    property, limitation of liability, indemnification, and dispute resolution survive termination.
                                </p>
                            </div>
                        </section>

                        {/* Dispute Resolution */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Gavel size={24} className="text-primary-500" />
                                11. Dispute Resolution
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">11.1 Consumer Grievance</h3>
                                <p>
                                    In accordance with the Consumer Protection Act, 2019 and Consumer Protection (E-Commerce)
                                    Rules, 2020, complaints can be addressed to our Grievance Officer.
                                </p>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">11.2 Arbitration</h3>
                                <p>
                                    Any dispute arising from these Terms shall be resolved through binding arbitration under
                                    the Arbitration and Conciliation Act, 1996. The arbitration shall be conducted in English,
                                    at [Your City], India, before a sole arbitrator mutually appointed.
                                </p>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">11.3 Jurisdiction</h3>
                                <p>
                                    Subject to arbitration, courts in [Your City], India shall have exclusive jurisdiction over
                                    any disputes. This does not affect your right to approach consumer forums under the Consumer
                                    Protection Act, 2019.
                                </p>
                            </div>
                        </section>

                        {/* Third Party Links */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                12. Third-Party Links & Services
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>
                                    The Platform may contain links to third-party websites or services. We are not responsible
                                    for the content, privacy practices, or terms of such third parties. Your use of third-party
                                    services is at your own risk.
                                </p>
                            </div>
                        </section>

                        {/* Severability */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                13. Severability & Waiver
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>
                                    If any provision of these Terms is found to be unenforceable, the remaining provisions
                                    shall remain in full force. Our failure to enforce any right shall not constitute a waiver.
                                </p>
                            </div>
                        </section>

                        {/* Amendments */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                14. Amendments
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <p>
                                    We reserve the right to modify these Terms at any time. Material changes will be notified
                                    via email or prominent notice on the Platform at least 15 days before taking effect.
                                    Continued use after changes constitutes acceptance.
                                </p>
                            </div>
                        </section>

                        {/* Contact */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Mail size={24} className="text-primary-500" />
                                15. Contact Information
                            </h2>
                            <div className="text-gray-700 dark:text-gray-300 space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                                    <p><strong>Business Name:</strong> AdExpress360</p>
                                    <p><strong>Grievance Officer:</strong> [Officer Name]</p>
                                    <p><strong>Email:</strong> legal@adexpress360.com</p>
                                    <p><strong>Grievance Email:</strong> grievance@adexpress360.com</p>
                                    <p><strong>Address:</strong> [Your Registered Address], India</p>
                                    <p className="mt-4 text-sm">
                                        Complaints will be acknowledged within 24 hours and resolved within 30 days as per
                                        IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Governing Law */}
                        <section className="border-t pt-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Governing Law
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                These Terms & Conditions are governed by and construed in accordance with the laws of India,
                                including but not limited to: Information Technology Act, 2000; Indian Contract Act, 1872;
                                Consumer Protection Act, 2019; and Digital Personal Data Protection Act, 2023.
                            </p>
                        </section>

                        {/* Acknowledgment */}
                        <section className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 mt-8">
                            <h3 className="font-semibold text-primary-800 dark:text-primary-300 mb-2">
                                Acknowledgment
                            </h3>
                            <p className="text-primary-700 dark:text-primary-400 text-sm">
                                By using AdExpress360, you acknowledge that you have read, understood, and agree to be bound
                                by these Terms & Conditions. If you are accepting on behalf of an organization, you represent
                                that you have authority to bind that organization to these Terms.
                            </p>
                        </section>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
