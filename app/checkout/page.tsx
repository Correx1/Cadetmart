'use client';

import React, { useState, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useShoppingCart } from 'use-shopping-cart';
import Link from 'next/link';
import { ArrowLeft, CreditCard, User, Mail, Phone, MapPin, Ruler } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  shoeSize: string;
  clothingSize: string;
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
    shoeSize: '',
    clothingSize: '',
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

  // Shoe sizes from 36 to 48
  const shoeSizes = Array.from({ length: 13 }, (_, i) => (36 + i).toString());
  
  // Clothing sizes
  const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL'];

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
          shoeSize: formData.shoeSize, // Separate shoe size
          clothingSize: formData.clothingSize, // Separate clothing size
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            href="/cart"
            className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="md:col-span-2">
            <Card className="border-gray-100 dark:border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <User className="w-3.5 h-3.5" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="off"
                      placeholder="John Doe"
                      className={`text-sm border-gray-200 dark:border-gray-700 focus-visible:ring-purple-500 ${errors.name ? 'border-red-300' : ''}`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <Mail className="w-3.5 h-3.5" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="off"
                      placeholder="john@example.com"
                      className={`text-sm border-gray-200 dark:border-gray-700 focus-visible:ring-purple-500 ${errors.email ? 'border-red-300' : ''}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <Phone className="w-3.5 h-3.5" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="off"
                      placeholder="08012345678"
                      className={`text-sm border-gray-200 dark:border-gray-700 focus-visible:ring-purple-500 ${errors.phone ? 'border-red-300' : ''}`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  {/* Location Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-3.5 h-3.5" />
                      Delivery Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      autoComplete="off"
                      placeholder="Enter your delivery address"
                      className={`text-sm border-gray-200 dark:border-gray-700 focus-visible:ring-purple-500 ${errors.location ? 'border-red-300' : ''}`}
                    />
                    {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                  </div>

                  {/* Size Fields (Optional) */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                      <Ruler className="w-3.5 h-3.5" />
                      Size <span className="text-xs font-normal text-gray-400">(Optional)</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Shoe Size */}
                      <div>
                        <Select value={formData.shoeSize} onValueChange={(value) => setFormData(prev => ({ ...prev, shoeSize: value }))}>
                          <SelectTrigger className="text-sm border-gray-200 dark:border-gray-700 focus:ring-purple-500">
                            <SelectValue placeholder="Shoe size" />
                          </SelectTrigger>
                          <SelectContent>
                            {shoeSizes.map(size => (
                              <SelectItem key={size} value={size} className="text-sm">
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Clothing Size */}
                      <div>
                        <Select value={formData.clothingSize} onValueChange={(value) => setFormData(prev => ({ ...prev, clothingSize: value }))}>
                          <SelectTrigger className="text-sm border-gray-200 dark:border-gray-700 focus:ring-purple-500">
                            <SelectValue placeholder="Clothing size" />
                          </SelectTrigger>
                          <SelectContent>
                            {clothingSizes.map(size => (
                              <SelectItem key={size} value={size} className="text-sm">
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
                    size="lg"
                  >
                    {submitting ? 'Processing...' : `Pay ₦${totalPrice.toLocaleString()}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <Card className="sticky top-4 border-gray-100 dark:border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Order Number</span>
                    <span className="font-medium text-gray-900 dark:text-white">{orderNumber}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-purple-600">₦{totalPrice.toLocaleString()}</span>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-medium mb-0.5 text-sm">Secure Payment</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Your payment information is encrypted and secure</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <p className="text-gray-600 dark:text-gray-400">Loading checkout...</p>
    </div>}>
      <CheckoutContent />
    </Suspense>
  );
}
