'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Measurements, Pricing } from '@/types';
import { ChevronDown, ChevronRight, DollarSign, Calculator, Percent, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PricingSalesProps {
  measurements: Measurements;
  pricing: Pricing;
  onPricingUpdate: (pricing: Partial<Pricing>) => void;
}

export default function PricingSales({ measurements, pricing, onPricingUpdate }: PricingSalesProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate total measurements
  const aerialTotal = measurements.aerial?.perimeter || 0;
  const streetTotal = measurements.street?.total || 0;
  const totalFeet = aerialTotal + streetTotal;

  // Update pricing calculations when measurements change
  useEffect(() => {
    const retailTotal = (totalFeet * pricing.retailPrice) + pricing.controllerCost;
    const saleTotal = (totalFeet * pricing.salePrice) + pricing.controllerCost - pricing.extraDiscount;
    const totalSavings = retailTotal - saleTotal;

    onPricingUpdate({
      retailTotal,
      saleTotal,
      totalSavings
    });
  }, [totalFeet, pricing.retailPrice, pricing.salePrice, pricing.controllerCost, pricing.extraDiscount]);

  const handleInputChange = (field: keyof Pricing, value: number) => {
    onPricingUpdate({ [field]: value });
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
          <DollarSign className="mr-2" />
          💰 Step 5: Pricing & Sales
        </span>
        {isOpen ? <ChevronDown /> : <ChevronRight />}
      </div>
      
      <div className={`section-content ${isOpen ? 'block' : 'hidden'}`}>
        {/* Pricing Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="font-bold block mb-2 text-gray-700">
              💵 Retail Price per Foot:
            </label>
            <input
              type="number"
              value={pricing.retailPrice}
              onChange={(e) => handleInputChange('retailPrice', Number(e.target.value))}
              className="input-field"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="font-bold block mb-2 text-gray-700">
              🏷️ Sale Price per Foot:
            </label>
            <input
              type="number"
              value={pricing.salePrice}
              onChange={(e) => handleInputChange('salePrice', Number(e.target.value))}
              className="input-field"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="font-bold block mb-2 text-gray-700">
              🎮 Controller Cost:
            </label>
            <input
              type="number"
              value={pricing.controllerCost}
              onChange={(e) => handleInputChange('controllerCost', Number(e.target.value))}
              className="input-field"
              step="1"
              min="0"
            />
          </div>
          <div>
            <label className="font-bold block mb-2 text-gray-700">
              🎁 Extra Discount Amount:
            </label>
            <input
              type="number"
              value={pricing.extraDiscount}
              onChange={(e) => handleInputChange('extraDiscount', Number(e.target.value))}
              className="input-field"
              step="0.01"
              min="0"
              placeholder="Enter additional discount"
            />
          </div>
        </div>

        {/* Project Summary */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-5">
          <h4 className="font-bold mb-3 text-blue-800">📊 Project Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalFeet.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Total Feet</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalFeet > 0 ? Math.ceil(totalFeet / (8/12)) : 0}
              </div>
              <div className="text-sm text-gray-600">Lights Needed (8" spacing)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalFeet > 0 ? Math.ceil((totalFeet / (8/12)) * 1.1) : 0}
              </div>
              <div className="text-sm text-gray-600">With 10% Waste Factor</div>
            </div>
          </div>
        </div>

        {/* Pricing Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="measurement-card">
            <h3 className="text-lg font-semibold text-primary-orange mb-2">💰 Retail Total</h3>
            <div className="measurement-value text-green-600">
              {formatCurrency(pricing.retailTotal)}
            </div>
            <div className="measurement-unit">before taxes</div>
          </div>
          <div className="measurement-card">
            <h3 className="text-lg font-semibold text-primary-orange mb-2">🎯 Sale Total</h3>
            <div className="measurement-value text-blue-600">
              {formatCurrency(pricing.saleTotal)}
            </div>
            <div className="measurement-unit">special price</div>
          </div>
          <div className="measurement-card">
            <h3 className="text-lg font-semibold text-primary-orange mb-2">🎁 Extra Discount</h3>
            <div className="measurement-value text-purple-600">
              {formatCurrency(pricing.extraDiscount)}
            </div>
            <div className="measurement-unit">additional savings</div>
          </div>
          <div className="measurement-card">
            <h3 className="text-lg font-semibold text-primary-orange mb-2">💰 Total Savings</h3>
            <div className="measurement-value text-red-600">
              {formatCurrency(pricing.totalSavings)}
            </div>
            <div className="measurement-unit">customer saves</div>
          </div>
        </div>

        {/* Savings Breakdown */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-5">
          <h4 className="font-bold mb-3 text-green-800">💡 Savings Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Price per foot savings:</span>
              <span className="font-semibold">
                {formatCurrency(pricing.retailPrice - pricing.salePrice)} per foot
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total price savings:</span>
              <span className="font-semibold">
                {formatCurrency((pricing.retailPrice - pricing.salePrice) * totalFeet)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Extra discount:</span>
              <span className="font-semibold">
                {formatCurrency(pricing.extraDiscount)}
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Customer Savings:</span>
                <span className="text-green-600">
                  {formatCurrency(pricing.totalSavings)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 flex-wrap">
          <button className="btn">
            📊 Generate Quote
          </button>
          <button className="btn-secondary">
            📧 Email Estimate
          </button>
          <button className="btn-secondary">
            🖨️ Print Summary
          </button>
        </div>
      </div>
    </motion.div>
  );
}
