import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import Footer from '../components/Footer';

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Shop</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 md:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-purple-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Terms & Conditions
            </h1>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600 dark:text-gray-400">
                By accessing and using CadetMart, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Use of Service</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                You agree to use our service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Use the service in any way that violates applicable laws or regulations</li>
                <li>Engage in any fraudulent activity</li>
                <li>Attempt to interfere with the proper functioning of the service</li>
                <li>Use automated systems to access the service without permission</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Product Information</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, pricing, or other content is accurate, complete, or error-free. We reserve the right to correct errors and update information at any time.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Orders and Payment</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                By placing an order, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Pay all charges at the prices in effect when incurred</li>
                <li>Pay applicable taxes and shipping fees</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 mt-3">
                We reserve the right to refuse or cancel any order for any reason, including product availability, errors in pricing, or suspected fraud.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Shipping and Delivery</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We will make reasonable efforts to deliver products within the estimated timeframe. However, delivery times are not guaranteed. Risk of loss and title for products pass to you upon delivery to the carrier.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Intellectual Property</h2>
              <p className="text-gray-600 dark:text-gray-400">
                All content on CadetMart, including text, graphics, logos, and images, is the property of CadetMart and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Limitation of Liability</h2>
              <p className="text-gray-600 dark:text-gray-400">
                CadetMart shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our service or products.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Governing Law</h2>
              <p className="text-gray-600 dark:text-gray-400">
                These Terms shall be governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Changes to Terms</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-400">
                For questions about these Terms, contact us at:
                <br />
                <a href="mailto:legal@cadetmart.com" className="text-purple-500 hover:text-purple-600">
                  legal@cadetmart.com
                </a>
                <br />
                123 Market Street, Lagos, Nigeria
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
