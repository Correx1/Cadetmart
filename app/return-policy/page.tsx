import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import Footer from '../components/Footer';

export default function ReturnPolicyPage() {
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
            <RotateCcw className="w-8 h-8 text-purple-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Return Policy
            </h1>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Return Window</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We accept returns within <strong>14 days</strong> of delivery. Items must be unused, in their original packaging, and in the same condition as received.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Eligible Items</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                The following items are eligible for return:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Defective or damaged products</li>
                <li>Wrong items shipped</li>
                <li>Unopened products in original packaging</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Non-Returnable Items</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                The following items cannot be returned:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Opened or used products (unless defective)</li>
                <li>Items without original packaging</li>
                <li>Products marked as final sale</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Return Process</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                To initiate a return:
              </p>
              <ol className="list-decimal pl-6 text-gray-600 dark:text-gray-400 space-y-2">
                <li>Contact our customer service at <a href="mailto:returns@cadetmart.com" className="text-purple-500 hover:text-purple-600">returns@cadetmart.com</a></li>
                <li>Provide your order number and reason for return</li>
                <li>Wait for return authorization and instructions</li>
                <li>Ship the item back using the provided label</li>
              </ol>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Refunds</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Once we receive and inspect your return, we will process your refund within 5-7 business days. Refunds will be issued to the original payment method.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Exchanges</h2>
              <p className="text-gray-600 dark:text-gray-400">
                We currently do not offer direct exchanges. If you need a different item, please return the original and place a new order.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-400">
                For questions about returns, contact us at:
                <br />
                <a href="mailto:returns@cadetmart.com" className="text-purple-500 hover:text-purple-600">
                  returns@cadetmart.com
                </a>
                <br />
                Phone: +234 800 123 4567
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
