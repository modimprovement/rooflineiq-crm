'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  MapPin, 
  Ruler, 
  Lightbulb, 
  DollarSign, 
  FileText, 
  Download, 
  Share, 
  Play, 
  Pause, 
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Heart
} from 'lucide-react';

interface ProjectData {
  id: string;
  address: string;
  measurements: {
    totalFeet: number;
    sides: {
      front: number;
      leftSide: number;
      rightSide: number;
      back: number;
    };
    controllerPlaced: boolean;
    powerSupplyPlaced: boolean;
  };
  pricing: {
    retail: number;
    contractor: number;
    savings: number;
    financing: {
      monthly: number;
      term: number;
    };
  };
  products: {
    lights: {
      type: string;
      count: number;
      price: number;
    }[];
    controller: {
      type: string;
      price: number;
    };
    powerSupply: {
      type: string;
      price: number;
    };
  };
  timeline: {
    measurement: string;
    proposal: string;
    installation: string;
    completion: string;
  };
  status: 'draft' | 'pending' | 'approved' | 'scheduled' | 'completed';
  createdAt: string;
  expiresAt: string;
}

interface HomeownerPortalProps {
  projectId: string;
  onClose: () => void;
}

export default function HomeownerPortal({ projectId, onClose }: HomeownerPortalProps) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'measurements' | 'visualization' | 'pricing' | 'agreement'>('overview');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLights, setShowLights] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [signature, setSignature] = useState<string>('');

  // Mock project data - in production, this would be fetched from your backend
  useEffect(() => {
    const mockProject: ProjectData = {
      id: projectId,
      address: '123 Main St, Anytown, ST 12345',
      measurements: {
        totalFeet: 245,
        sides: { front: 65, leftSide: 60, rightSide: 55, back: 65 },
        controllerPlaced: true,
        powerSupplyPlaced: true
      },
      pricing: {
        retail: 12500,
        contractor: 8500,
        savings: 4000,
        financing: {
          monthly: 283,
          term: 36
        }
      },
      products: {
        lights: [
          { type: 'FireflyiQ Pro 12V', count: 120, price: 4800 },
          { type: 'FireflyiQ Pro 24V', count: 80, price: 3200 }
        ],
        controller: { type: 'Smart Controller Pro', price: 800 },
        powerSupply: { type: 'Weatherproof Power Supply', price: 600 }
      },
      timeline: {
        measurement: '2024-01-20',
        proposal: '2024-01-22',
        installation: '2024-02-15',
        completion: '2024-02-16'
      },
      status: 'pending',
      createdAt: '2024-01-20',
      expiresAt: '2024-02-20'
    };
    
    setProject(mockProject);
  }, [projectId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleProductToggle = (productType: string) => {
    setSelectedProducts(prev => 
      prev.includes(productType) 
        ? prev.filter(p => p !== productType)
        : [...prev, productType]
    );
  };

  const handleSignature = (signatureData: string) => {
    setSignature(signatureData);
  };

  const handleSubmitAgreement = async () => {
    if (!signature) {
      alert('Please provide your signature before submitting.');
      return;
    }

    setIsSigning(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In production, this would:
    // 1. Save the signature to your backend
    // 2. Generate a PDF with the signed agreement
    // 3. Send email to homeowner
    // 4. Update project status
    
    alert('Agreement signed and submitted successfully! You will receive a confirmation email shortly.');
    setIsSigning(false);
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your FireflyiQ Project</h1>
                <p className="text-gray-600">{project.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                project.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
              <button className="btn-secondary flex items-center space-x-2">
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Home },
              { id: 'measurements', label: 'Measurements', icon: Ruler },
              { id: 'visualization', label: '3D Preview', icon: Eye },
              { id: 'pricing', label: 'Pricing', icon: DollarSign },
              { id: 'agreement', label: 'Agreement', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Project Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{project.measurements.totalFeet}</div>
                  <div className="text-sm text-gray-500">Total Linear Feet</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{project.products.lights.length}</div>
                  <div className="text-sm text-gray-500">Light Types</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{formatCurrency(project.pricing.savings)}</div>
                  <div className="text-sm text-gray-500">Your Savings</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Timeline</h2>
              <div className="space-y-4">
                {[
                  { step: 'Measurement', date: project.timeline.measurement, status: 'completed' },
                  { step: 'Proposal', date: project.timeline.proposal, status: 'completed' },
                  { step: 'Installation', date: project.timeline.installation, status: 'pending' },
                  { step: 'Completion', date: project.timeline.completion, status: 'pending' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {item.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.step}</div>
                      <div className="text-sm text-gray-500">{formatDate(item.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('visualization')}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View 3D Preview</span>
                </button>
                <button
                  onClick={() => setActiveTab('pricing')}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Review Pricing</span>
                </button>
                <button
                  onClick={() => setActiveTab('agreement')}
                  className="btn flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Sign Agreement</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'measurements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Measurements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{project.measurements.sides.front}</div>
                  <div className="text-sm text-gray-500">Front (ft)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{project.measurements.sides.leftSide}</div>
                  <div className="text-sm text-gray-500">Left Side (ft)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{project.measurements.sides.rightSide}</div>
                  <div className="text-sm text-gray-500">Right Side (ft)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{project.measurements.sides.back}</div>
                  <div className="text-sm text-gray-500">Back (ft)</div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Linear Feet</span>
                  <span className="text-lg font-bold text-gray-900">{project.measurements.totalFeet} ft</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Installation Details</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900">Controller Placement</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${project.measurements.controllerPlaced ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lightbulb className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-gray-900">Power Supply Placement</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${project.measurements.powerSupplyPlaced ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'visualization' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">3D Visualization</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsAnimating(!isAnimating)}
                    className={`btn-secondary flex items-center space-x-2 ${isAnimating ? 'bg-green-500 text-white' : ''}`}
                  >
                    {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isAnimating ? 'Pause' : 'Play'} Animation</span>
                  </button>
                  <button
                    onClick={() => setShowLights(!showLights)}
                    className={`btn-secondary flex items-center space-x-2 ${showLights ? 'bg-orange-500 text-white' : ''}`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>{showLights ? 'Hide' : 'Show'} Lights</span>
                  </button>
                  <button
                    onClick={() => setShowMeasurements(!showMeasurements)}
                    className={`btn-secondary flex items-center space-x-2 ${showMeasurements ? 'bg-blue-500 text-white' : ''}`}
                  >
                    <Ruler className="w-4 h-4" />
                    <span>{showMeasurements ? 'Hide' : 'Show'} Measurements</span>
                  </button>
                </div>
              </div>
              
              {/* 3D Visualization Container */}
              <div className="relative bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive 3D Preview</h3>
                  <p className="text-gray-600 mb-4">
                    {isAnimating ? 'Animation is playing...' : 'Click play to see your lights in action!'}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${showLights ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                      <span>FireflyiQ Lights</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${showMeasurements ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <span>Measurement Lines</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'pricing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Pricing Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <span className="text-gray-700">Retail Price</span>
                    <span className="text-lg font-bold text-red-600">{formatCurrency(project.pricing.retail)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Your Price</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(project.pricing.contractor)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">You Save</span>
                    <span className="text-lg font-bold text-blue-600">{formatCurrency(project.pricing.savings)}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Financing Options</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Monthly Payment</span>
                        <span className="font-medium">{formatCurrency(project.pricing.financing.monthly)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Term</span>
                        <span className="font-medium">{project.pricing.financing.term} months</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
              <div className="space-y-4">
                {project.products.lights.map((light, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Lightbulb className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium text-gray-900">{light.type}</div>
                        <div className="text-sm text-gray-500">{light.count} units</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatCurrency(light.price)}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(light.price / light.count)} each</div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900">{project.products.controller.type}</div>
                      <div className="text-sm text-gray-500">Smart Controller</div>
                    </div>
                  </div>
                  <div className="font-medium text-gray-900">{formatCurrency(project.products.controller.price)}</div>
                </div>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Lightbulb className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="font-medium text-gray-900">{project.products.powerSupply.type}</div>
                      <div className="text-sm text-gray-500">Power Supply</div>
                    </div>
                  </div>
                  <div className="font-medium text-gray-900">{formatCurrency(project.products.powerSupply.price)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'agreement' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Agreement</h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Project Summary</h3>
                  <p className="text-sm text-blue-800">
                    Installation of {project.measurements.totalFeet} linear feet of FireflyiQ lighting system 
                    at {project.address}. Total project value: {formatCurrency(project.pricing.contractor)}.
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Terms & Conditions</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Installation to be completed within 2 business days</li>
                    <li>• 5-year warranty on all FireflyiQ products</li>
                    <li>• 1-year warranty on installation work</li>
                    <li>• Payment due upon completion of installation</li>
                    <li>• Financing options available through approved lenders</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">Important Notes</h3>
                  <p className="text-sm text-yellow-800">
                    This proposal is valid until {formatDate(project.expiresAt)}. 
                    By signing below, you agree to the terms and authorize the installation of your FireflyiQ lighting system.
                  </p>
                </div>
              </div>
            </div>

            {/* Digital Signature */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Digital Signature</h2>
              <div className="space-y-4">
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center">
                  {signature ? (
                    <div className="text-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Signature captured</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click below to sign</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      // In production, this would open a signature pad
                      setSignature('John Smith - ' + new Date().toLocaleDateString());
                    }}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Sign Document</span>
                  </button>
                  
                  {signature && (
                    <button
                      onClick={() => setSignature('')}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {signature && (
                  <div className="pt-4">
                    <button
                      onClick={handleSubmitAgreement}
                      disabled={isSigning}
                      className="w-full btn flex items-center justify-center space-x-2"
                    >
                      {isSigning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Submit Signed Agreement</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
