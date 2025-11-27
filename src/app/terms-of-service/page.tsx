import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service - ZST Marketplace',
  description: 'Terms of Service for ZST marketplace platform. Read our terms and conditions for using our services.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-brand-light">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-playfair text-4xl font-bold text-text-primary md:text-5xl">
            Terms of Service
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
                1. Agreement to Terms
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Welcome to ZST. These Terms of Service (&quot;Terms&quot;) govern your access to and use of
                the ZST website, mobile application, and services (collectively, the &quot;Platform&quot;).
                By accessing or using our Platform, you agree to be bound by these Terms.
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                If you do not agree to these Terms, you may not access or use the Platform. We reserve
                the right to modify these Terms at any time. Your continued use of the Platform after
                any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            {/* About ZST */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                2. About ZST
              </h2>
              <p className="text-text-secondary leading-relaxed">
                ZST is a multi-vendor marketplace platform based in Bouzareah, Algeria. We provide a
                platform that connects:
              </p>
              <ul className="list-disc pl-6 mt-3 text-text-secondary space-y-2">
                <li>Customers looking to purchase products and services</li>
                <li>Sellers offering perfumes, fashion items, and other products</li>
                <li>Freelancers providing various services</li>
                <li>B2B buyers and wholesale suppliers</li>
              </ul>
              <p className="text-text-secondary leading-relaxed mt-4">
                ZST acts as an intermediary platform and is not a party to transactions between buyers
                and sellers unless otherwise specified.
              </p>
            </section>

            {/* Account Registration */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                3. Account Registration
              </h2>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">
                3.1 Eligibility
              </h3>
              <p className="text-text-secondary leading-relaxed">
                To use our Platform, you must be at least 18 years old and capable of forming a binding
                contract. By creating an account, you represent that you meet these requirements.
              </p>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">
                3.2 Account Security
              </h3>
              <p className="text-text-secondary leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and
                for all activities that occur under your account. You must immediately notify us of any
                unauthorized use of your account.
              </p>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">
                3.3 Account Types
              </h3>
              <p className="text-text-secondary leading-relaxed">
                We offer different account types including Customer, Seller, and Freelancer accounts.
                Each account type has specific features and responsibilities.
              </p>
            </section>

            {/* User Conduct */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                4. User Conduct
              </h2>
              <p className="text-text-secondary leading-relaxed">
                When using our Platform, you agree not to:
              </p>
              <ul className="list-disc pl-6 mt-3 text-text-secondary space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the intellectual property rights of others</li>
                <li>Post false, misleading, or fraudulent content</li>
                <li>Harass, threaten, or harm other users</li>
                <li>Interfere with the proper functioning of the Platform</li>
                <li>Attempt to gain unauthorized access to other accounts or systems</li>
                <li>Use the Platform for any illegal or unauthorized purpose</li>
                <li>Sell counterfeit, prohibited, or restricted items</li>
              </ul>
            </section>

            {/* Seller Terms */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                5. Seller Terms
              </h2>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">
                5.1 Seller Responsibilities
              </h3>
              <p className="text-text-secondary leading-relaxed">
                As a seller on ZST, you agree to:
              </p>
              <ul className="list-disc pl-6 mt-3 text-text-secondary space-y-2">
                <li>Provide accurate and complete product information</li>
                <li>Fulfill orders in a timely manner</li>
                <li>Maintain adequate stock of listed products</li>
                <li>Respond to customer inquiries promptly</li>
                <li>Comply with all applicable laws regarding product sales</li>
                <li>Honor prices and terms listed on the Platform</li>
              </ul>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">
                5.2 Product Listings
              </h3>
              <p className="text-text-secondary leading-relaxed">
                All product listings must be accurate, include clear images, and not infringe on any
                third-party rights. We reserve the right to remove any listings that violate our
                policies.
              </p>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">
                5.3 Seller Categories
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Sellers are categorized as Fournisseur (retailer), Importateur, or Grossiste (wholesaler).
                Each category has specific visibility rules on the Platform. B2B sellers (Importateur
                and Grossiste) are only visible in the B2B section.
              </p>
            </section>

            {/* Customer Terms */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                6. Customer Terms
              </h2>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">
                6.1 Purchasing
              </h3>
              <p className="text-text-secondary leading-relaxed">
                When you place an order on ZST, you are entering into a contract with the seller. You
                agree to provide accurate shipping and payment information and to pay for all items
                ordered.
              </p>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">
                6.2 Reviews and Feedback
              </h3>
              <p className="text-text-secondary leading-relaxed">
                You may leave reviews for products and services you have purchased. Reviews must be
                honest, relevant, and comply with our community guidelines.
              </p>
            </section>

            {/* Freelancer Terms */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                7. Freelancer Terms
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Freelancers offering services on ZST agree to:
              </p>
              <ul className="list-disc pl-6 mt-3 text-text-secondary space-y-2">
                <li>Provide accurate descriptions of their skills and services</li>
                <li>Deliver services as described and within agreed timeframes</li>
                <li>Maintain professional communication with clients</li>
                <li>Comply with all applicable laws regarding service provision</li>
                <li>Not engage in fraudulent or deceptive practices</li>
              </ul>
            </section>

            {/* Payments */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                8. Payments and Fees
              </h2>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">
                8.1 Pricing
              </h3>
              <p className="text-text-secondary leading-relaxed">
                All prices displayed on the Platform are in Algerian Dinar (DZD) unless otherwise
                specified. Prices may change without notice, but changes will not affect orders already
                placed.
              </p>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">
                8.2 Payment Methods
              </h3>
              <p className="text-text-secondary leading-relaxed">
                We accept various payment methods as displayed at checkout. You agree to pay all
                applicable fees and charges associated with your transactions.
              </p>

              <h3 className="text-lg font-semibold text-text-primary mt-6 mb-3">
                8.3 Refunds
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Refund policies vary by seller. Please review the seller&apos;s refund policy before
                making a purchase. ZST may facilitate refund requests in accordance with our dispute
                resolution process.
              </p>
            </section>

            {/* Shipping */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                9. Shipping and Delivery
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Shipping times and costs vary by seller and location. Sellers are responsible for
                accurately representing shipping information. ZST is not responsible for delays caused
                by shipping carriers or customs.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                10. Intellectual Property
              </h2>
              <p className="text-text-secondary leading-relaxed">
                The ZST Platform, including its design, logos, and content, is protected by intellectual
                property laws. You may not copy, modify, distribute, or create derivative works without
                our written permission.
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                Sellers and freelancers retain ownership of their content but grant ZST a license to
                display and promote their listings on the Platform.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                11. Limitation of Liability
              </h2>
              <p className="text-text-secondary leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, ZST SHALL NOT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF
                THE PLATFORM.
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                ZST does not guarantee the quality, safety, or legality of items listed by sellers.
                We are not responsible for the conduct of sellers, freelancers, or other users.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                12. Disclaimers
              </h2>
              <p className="text-text-secondary leading-relaxed">
                THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
                EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED,
                SECURE, OR ERROR-FREE.
              </p>
            </section>

            {/* Dispute Resolution */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                13. Dispute Resolution
              </h2>
              <p className="text-text-secondary leading-relaxed">
                In case of disputes between buyers and sellers, we encourage parties to first attempt
                to resolve the issue directly. ZST may provide mediation services at its discretion.
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                Any disputes arising from these Terms shall be governed by the laws of Algeria and
                shall be resolved in the courts of Algiers.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                14. Termination
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violations
                of these Terms or for any other reason at our discretion. You may close your account
                at any time by contacting us.
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                Upon termination, your right to use the Platform will immediately cease. Provisions
                that by their nature should survive termination shall remain in effect.
              </p>
            </section>

            {/* Modifications */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                15. Modifications to Terms
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We may revise these Terms at any time by posting an updated version on the Platform.
                We will provide notice of material changes. Your continued use of the Platform after
                changes are posted constitutes acceptance of the modified Terms.
              </p>
            </section>

            {/* Severability */}
            <section className="mb-10">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                16. Severability
              </h2>
              <p className="text-text-secondary leading-relaxed">
                If any provision of these Terms is found to be unenforceable, the remaining provisions
                will continue in full force and effect.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-6">
              <h2 className="font-playfair text-2xl font-semibold text-text-primary mb-4">
                17. Contact Information
              </h2>
              <p className="text-text-secondary leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
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

        {/* Navigation Links */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/privacy-policy"
            className="text-brand-primary hover:text-brand-primary/80 transition-colors font-medium"
          >
            View Privacy Policy
          </Link>
          <span className="hidden sm:inline text-text-secondary">|</span>
          <Link
            href="/"
            className="text-brand-primary hover:text-brand-primary/80 transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
