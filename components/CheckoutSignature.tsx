'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Measurements, Pricing, Property, Customer } from '@/types';
import { ChevronDown, ChevronRight, User, Mail, Phone, FileText, PenTool, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CheckoutSignatureProps {
  measurements: Measurements;
  pricing: Pricing;
  customer: Customer;
  currentProperty: Property | null;
  onCustomerUpdate: (customer: Customer) => void;
}

export default function CheckoutSignature({ 
  measurements, 
  pricing, 
  customer, 
  currentProperty, 
  onCustomerUpdate 
}: CheckoutSignatureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate totals
  const aerialTotal = measurements.aerial?.perimeter || 0;
  const streetTotal = measurements.street?.total || 0;
  const totalFeet = aerialTotal + streetTotal;
  const totalLights = totalFeet > 0 ? Math.ceil(totalFeet / (8/12)) : 0;
  const lightsWithWaste = Math.ceil(totalLights * 1.1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set initial styles
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // Convert canvas to data URL for storage
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData('');
  };

  const handleCustomerChange = (field: keyof Customer, value: string) => {
    onCustomerUpdate({
      ...customer,
      [field]: value
    });
  };

  const finalizeOrder = () => {
    if (!customer.name || !customer.email || !customer.phone) {
      alert('Please fill in all customer information');
      return;
    }

    if (!termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }

    if (!signatureData) {
      alert('Please provide a digital signature');
      return;
    }

    // Create order data
    const orderData = {
      customer,
      property: currentProperty,
      measurements,
      pricing,
      lights: {
        total: totalLights,
        withWaste: lightsWithWaste,
        spacing: 8,
        colorScheme: 'rgbw',
        animation: 'static'
      },
      timestamp: new Date().toISOString()
    };

    console.log('Order Data:', orderData);
    alert('Order completed successfully! Contract generation coming soon.');
  };

  return (
    <motion.div 
      className="section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div 
        className="section-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center">
          <FileText className="mr-2" />
          ✍️ Step 6: Customer Agreement & Checkout
        </span>
        {isOpen ? <ChevronDown /> : <ChevronRight />}
      </div>
      
      <div className={`section-content ${isOpen ? 'block' : 'hidden'}`}>
        {/* Customer Information */}
        <div className="mb-5">
          <h3 className="text-primary-orange font-bold mb-4 flex items-center">
            <User className="mr-2" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-bold block mb-2 text-gray-700">
                <User className="inline mr-2" />
                Customer Name:
              </label>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => handleCustomerChange('name', e.target.value)}
                placeholder="Customer Name"
                className="input-field"
              />
            </div>
            <div>
              <label className="font-bold block mb-2 text-gray-700">
                <Mail className="inline mr-2" />
                Email Address:
              </label>
              <input
                type="email"
                value={customer.email}
                onChange={(e) => handleCustomerChange('email', e.target.value)}
                placeholder="Email Address"
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="font-bold block mb-2 text-gray-700">
              <Phone className="inline mr-2" />
              Phone Number:
            </label>
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) => handleCustomerChange('phone', e.target.value)}
              placeholder="Phone Number"
              className="input-field"
            />
          </div>
        </div>

        {/* Project Summary */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-5">
          <h4 className="font-bold mb-3 text-blue-800">📋 Project Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-semibold">Total Feet:</span>
              <div className="text-lg font-bold text-blue-600">{totalFeet.toFixed(1)} ft</div>
            </div>
            <div>
              <span className="font-semibold">Lights Needed:</span>
              <div className="text-lg font-bold text-blue-600">{totalLights}</div>
            </div>
            <div>
              <span className="font-semibold">With Waste Factor:</span>
              <div className="text-lg font-bold text-blue-600">{lightsWithWaste}</div>
            </div>
            <div>
              <span className="font-semibold">Total Price:</span>
              <div className="text-lg font-bold text-blue-600">{formatCurrency(pricing.saleTotal)}</div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-5">
          <label className="flex items-center gap-3 font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-5 h-5 text-primary-orange focus:ring-primary-orange border-gray-300 rounded"
            />
            <CheckCircle className="text-primary-orange" />
            I agree to the terms and conditions and authorize this estimate
          </label>
        </div>

        {/* Digital Signature */}
        <div className="mb-5">
          <h4 className="font-bold mb-3 flex items-center">
            <PenTool className="mr-2" />
            ✍️ Digital Signature:
          </h4>
          <div className="border-2 border-gray-300 rounded-lg bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-40 cursor-crosshair rounded-lg"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
          <div className="mt-3 flex gap-3">
            <button
              onClick={clearSignature}
              className="btn-secondary text-sm"
            >
              Clear Signature
            </button>
            {signatureData && (
              <span className="text-green-600 text-sm flex items-center">
                <CheckCircle className="mr-1" />
                Signature captured
              </span>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-5">
          <h4 className="font-bold mb-3 text-gray-800">📊 Final Order Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="font-semibold">{customer.name || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span>Property:</span>
              <span className="font-semibold">{currentProperty?.address || 'Not loaded'}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Measurements:</span>
              <span className="font-semibold">{totalFeet.toFixed(1)} ft</span>
            </div>
            <div className="flex justify-between">
              <span>Lights Required:</span>
              <span className="font-semibold">{lightsWithWaste} (with waste factor)</span>
            </div>
            <div className="flex justify-between">
              <span>Total Price:</span>
              <span className="font-semibold text-lg text-primary-orange">
                {formatCurrency(pricing.saleTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Customer Savings:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(pricing.totalSavings)}
              </span>
            </div>
          </div>
        </div>

        {/* Finalize Order */}
        <div className="text-center">
          <button
            onClick={finalizeOrder}
            disabled={!termsAccepted || !signatureData || !customer.name || !customer.email || !customer.phone}
            className="btn text-xl py-4 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚀 Complete Order & Generate Contract
          </button>
          
          {(!termsAccepted || !signatureData || !customer.name || !customer.email || !customer.phone) && (
            <div className="mt-3 text-sm text-gray-600">
              Please complete all required fields above to finalize your order
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
