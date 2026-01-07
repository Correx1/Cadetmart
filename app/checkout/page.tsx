'use client';

import React, { useState, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useShoppingCart } from 'use-shopping-cart';
import Link from 'next/link';
import { ArrowLeft, CreditCard, User, Mail, Phone, MapPin } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  location: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
}

function CheckoutContent() {
  const { clearCart, cartDetails } = useShoppingCart();
  const searchParams = useSearchParams();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    location: '',
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  function generateOrderNumber(): string {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return "CM." + randomNum;
  }

  const orderNumber = generateOrderNumber();
  const totalPriceString = searchParams.get("totalPrice") ?? "0";
  const totalPrice = parseFloat(totalPriceString);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    const newErrors: FormErrors = {};

    if (!formData.name) newErrors.name = 'Please enter your full name';
    if (!formData.email || !validateEmail(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.phone || !/^\d{11,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number (11 digits)';
    if (!formData.location) newErrors.location = 'Please enter your delivery location';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Get cart items and format them
        const cartItems = Object.values(cartDetails ?? {}).map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }));

        const customerData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          totalPrice,
          orderNumber,
        };

        localStorage.setItem('pendingOrderData', JSON.stringify(customerData));

        const paymentPayload = {
          tx_ref: orderNumber,
          amount: totalPrice,
          currency: "NGN",
          payment_options: "card,mobilemoney,ussd,banktransfer",
          redirect_url: `${window.location.origin}/success`,
          customer: {
            email: formData.email,
            phone_number: formData.phone,
            name: formData.name,
          },
          meta: { 
            ...customerData, 
            orderType: 'digital',
            items: JSON.stringify(cartItems)
          },
          customizations: {
            title: "CadetMart",
            description: "Payment for digital products",
            logo: "",
          },
        };

        // Initialize Flutterwave payment
        const res = await fetch("/api/initialize-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload),
        });

        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Payment initialization failed");

        window.location.href = data.link;
      } catch (error) {
        console.error("❌ Error during payment:", error);
        alert("Payment initialization failed. Please try again.");
        setSubmitting(false);
      }
    } else {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link 
            href="/cart"
            className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-5 gap-6">
          {/* Form Section */}
          <div className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="08012345678"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                </div>

                {/* Location Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Delivery Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.location 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors`}
                    placeholder="Enter your delivery address"
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : `Pay ₦${totalPrice.toLocaleString()}`}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Order Number</span>
                  <span className="font-medium text-gray-900 dark:text-white">{orderNumber}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-purple-600">₦{totalPrice.toLocaleString()}</span>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium mb-1">Secure Payment</p>
                <p className="text-xs">Your payment information is encrypted and secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center">
      <p className="text-gray-600 dark:text-gray-400">Loading checkout...</p>
    </div>}>
      <CheckoutContent />
    </Suspense>
  );
}
