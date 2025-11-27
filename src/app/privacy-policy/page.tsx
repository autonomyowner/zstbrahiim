import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - ZST Marketplace',
  description: 'Privacy Policy for ZST marketplace platform. Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-brand-light">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-playfair text-4xl font-bold text-text-primary md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-text-secondary">
            Last updated: November 27, 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="rounded-2xl bg-white p-8 shadow-card-md md:p-12">

            {/* Introduction */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                1. Introduction
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Welcome to ZST (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are a multi-vendor marketplace platform
                based in Bouzareah, Algeria, offering perfumes, fashion, and freelance services. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your information when you visit
                our website and mobile application.
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy
                policy, please do not access the platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">
                2.1 Personal Information
              </h3>
              <p className="text-text-secondary leading-relaxed">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc pl-6 mt-3 text-text-secondary space-y-2">
                <li>Register for an account (name, email address, phone number)</li>
                <li>Place an order (shipping address, billing information)</li>
                <li>Register as a seller or freelancer (business information, identification)</li>
                <li>Contact our customer support</li>
                <li>Subscribe to our newsletter</li>
                <li>Participate in promotions or surveys</li>
              </ul>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">
                2.2 Automatically Collected Information
              </h3>
              <p className="text-text-secondary leading-relaxed">
                When you access our platform, we automatically collect certain information including:
              </p>
              <ul className="list-disc pl-6 mt-3 text-text-secondary space-y-2">
                <li>Device information (device type, operating system, unique device identifiers)</li>
                <li>Log information (access times, pages viewed, IP address)</li>
                <li>Location information (with your consent)</li>
                <li>Information collected through cookies and similar technologies</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc pl-6 mt-3 text-text-secondary space-y-2">
                <li>To create and manage your account</li>
                <li>To process and fulfill your orders</li>
                <li>To facilitate transactions between buyers and sellers</li>
                <li>To communicate with you about orders, products, and services</li>
                <li>To send promotional communications (with your consent)</li>
                <li>To improve our platform and user experience</li>
                <li>To detect and prevent fraud or unauthorized activities</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                4. Information Sharing
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mt-3 text-text-secondary space-y-2">
                <li><strong>With Sellers:</strong> When you place an order, we share necessary information with the seller to fulfill your order</li>
                <li><strong>With Service Providers:</strong> We may share information with third-party vendors who perform services on our behalf (payment processing, shipping, analytics)</li>
                <li><strong>For Legal Purposes:</strong> We may disclose information when required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition of our business</li>
              </ul>
              <p className="text-text-secondary leading-relaxed mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            {/* Data Security */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                5. Data Security
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your
                personal information against unauthorized access, alteration, disclosure, or destruction.
                These measures include:
              </p>
              <ul className="list-disc pl-6 mt-3 text-text-secondary space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication mechanisms</li>
                <li>Regular security assessments</li>
                <li>Access controls and monitoring</li>
              </ul>
              <p className="text-text-secondary leading-relaxed mt-4">
                However, no method of transmission over the Internet is 100% secure, and we cannot
                guarantee absolute security.
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                6. Data Retention
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes
                outlined in this privacy policy, unless a longer retention period is required or
                permitted by law. When your information is no longer needed, we will securely delete
                or anonymize it.
              </p>
            </section>

            {/* Your Rights */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                7. Your Rights
              </h2>
              <p className="text-text-secondary leading-relaxed">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mt-3 text-text-secondary space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing communications at any time</li>
                <li><strong>Account Closure:</strong> Request closure of your account</li>
              </ul>
              <p className="text-text-secondary leading-relaxed mt-4">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            {/* Cookies */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                8. Cookies and Tracking Technologies
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We use cookies and similar tracking technologies to collect information about your
                browsing activities. Cookies are small data files stored on your device that help us
                improve our services and your experience.
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                You can control cookies through your browser settings. However, disabling cookies may
                limit your ability to use certain features of our platform.
              </p>
            </section>

            {/* Third-Party Links */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                9. Third-Party Links
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Our platform may contain links to third-party websites. We are not responsible for the
                privacy practices of these websites. We encourage you to review the privacy policies of
                any third-party sites you visit.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                10. Children&apos;s Privacy
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Our platform is not intended for children under the age of 18. We do not knowingly
                collect personal information from children. If you believe we have collected information
                from a child, please contact us immediately.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes
                by posting the new privacy policy on this page and updating the &quot;Last updated&quot; date.
                We encourage you to review this privacy policy periodically.
              </p>
            </section>

            {/* Contact Us */}
            <section className="mb-6">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                12. Contact Us
              </h2>
              <p className="text-text-secondary leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-6 bg-brand-light rounded-xl">
                <p className="text-text-primary font-medium">ZST Marketplace</p>
                <p className="text-text-secondary mt-2">Bouzareah, Algiers, Algeria</p>
                <p className="text-text-secondary">Email: contact@zst.xyz</p>
                <p className="text-text-secondary">Website: www.zst.xyz</p>
              </div>
            </section>

          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-brand-primary hover:text-brand-primary/80 transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
