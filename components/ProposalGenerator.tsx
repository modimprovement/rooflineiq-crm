'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Share, 
  Copy, 
  Mail, 
  Download, 
  QrCode, 
  Link,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';

interface ProposalData {
  id: string;
  leadId: string;
  customerName: string;
  customerEmail: string;
  address: string;
  measurements: {
    totalFeet: number;
    sides: {
      front: number;
      leftSide: number;
      rightSide: number;
      back: number;
    };
  };
  pricing: {
    retail: number;
    contractor: number;
    savings: number;
  };
  products: any[];
  status: 'draft' | 'sent' | 'viewed' | 'signed' | 'expired';
  createdAt: string;
  expiresAt: string;
  shareableLink: string;
  qrCode: string;
}

interface ProposalGeneratorProps {
  leadId: string;
  onClose: () => void;
  onGenerate: (proposal: ProposalData) => void;
}

export default function ProposalGenerator({ leadId, onClose, onGenerate }: ProposalGeneratorProps) {
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMethod, setShareMethod] = useState<'link' | 'email' | 'qr'>('link');
  const [emailAddress, setEmailAddress] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Mock proposal data - in production, this would be fetched from your backend
  useEffect(() => {
    const mockProposal: ProposalData = {
      id: `prop_${Date.now()}`,
      leadId,
      customerName: 'John Smith',
      customerEmail: 'john.smith@email.com',
      address: '123 Main St, Anytown, ST 12345',
      measurements: {
        totalFeet: 245,
        sides: { front: 65, leftSide: 60, rightSide: 55, back: 65 }
      },
      pricing: {
        retail: 12500,
        contractor: 8500,
        savings: 4000
      },
      products: [
        { type: 'FireflyiQ Pro 12V', count: 120, price: 4800 },
        { type: 'FireflyiQ Pro 24V', count: 80, price: 3200 },
        { type: 'Smart Controller Pro', count: 1, price: 800 },
        { type: 'Weatherproof Power Supply', count: 1, price: 600 }
      ],
      status: 'draft',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      shareableLink: `https://rooflineiq.com/proposal/${leadId}`,
      qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
    };
    
    setProposal(mockProposal);
  }, [leadId]);

  const generateProposal = async () => {
    setIsGenerating(true);
    
    // Simulate API call to generate proposal
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (proposal) {
      setProposal({ ...proposal, status: 'sent' });
      onGenerate(proposal);
    }
    
    setIsGenerating(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success message
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const sendEmail = async () => {
    if (!emailAddress || !proposal) return;
    
    setIsSharing(true);
    
    // Simulate API call to send email
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsEmailSent(true);
    setIsSharing(false);
    
    // Reset after 3 seconds
    setTimeout(() => setIsEmailSent(false), 3000);
  };

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

  if (!proposal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate Proposal</h1>
          <p className="text-gray-600">Create a shareable proposal for {proposal.customerName}</p>
        </div>
        <button
          onClick={onClose}
          className="btn-secondary"
        >
          Close
        </button>
      </div>

      {/* Proposal Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Proposal Preview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Project Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="text-gray-900">{proposal.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="text-gray-900">{proposal.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Feet:</span>
                <span className="text-gray-900">{proposal.measurements.totalFeet} ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  proposal.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  proposal.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  proposal.status === 'viewed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Pricing Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Retail Price:</span>
                <span className="text-gray-900">{formatCurrency(proposal.pricing.retail)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Price:</span>
                <span className="text-green-600 font-medium">{formatCurrency(proposal.pricing.contractor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">You Save:</span>
                <span className="text-blue-600 font-medium">{formatCurrency(proposal.pricing.savings)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium text-gray-900">Total:</span>
                <span className="font-bold text-gray-900">{formatCurrency(proposal.pricing.contractor)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sharing Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Share Proposal</h2>
        
        {/* Share Method Selection */}
        <div className="flex space-x-2 mb-6">
          {[
            { id: 'link', label: 'Share Link', icon: Link },
            { id: 'email', label: 'Send Email', icon: Mail },
            { id: 'qr', label: 'QR Code', icon: QrCode }
          ].map((method) => (
            <button
              key={method.id}
              onClick={() => setShareMethod(method.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                shareMethod === method.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <method.icon className="w-4 h-4" />
              <span>{method.label}</span>
            </button>
          ))}
        </div>

        {/* Share Link */}
        {shareMethod === 'link' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shareable Link</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={proposal.shareableLink}
                  readOnly
                  className="flex-1 input-field"
                />
                <button
                  onClick={() => copyToClipboard(proposal.shareableLink)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-900">What the customer will see:</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Interactive 3D visualization of their project</li>
                <li>• Detailed measurements and pricing breakdown</li>
                <li>• Product specifications and warranty information</li>
                <li>• Digital signature capability for agreement</li>
                <li>• Mobile-friendly interface</li>
              </ul>
            </div>
          </div>
        )}

        {/* Email Sharing */}
        {shareMethod === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="customer@email.com"
                  className="flex-1 input-field"
                />
                <button
                  onClick={sendEmail}
                  disabled={!emailAddress || isSharing}
                  className="btn flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSharing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : isEmailSent ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Sent!</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="w-4 h-4 text-green-500" />
                <span className="font-medium text-green-900">Email includes:</span>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Personalized message from your team</li>
                <li>• Direct link to their proposal</li>
                <li>• Your contact information</li>
                <li>• Next steps and timeline</li>
              </ul>
            </div>
          </div>
        )}

        {/* QR Code */}
        {shareMethod === 'qr' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img
                  src={proposal.qrCode}
                  alt="QR Code"
                  className="w-32 h-32"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Customer can scan this QR code to view their proposal
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => copyToClipboard(proposal.shareableLink)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </button>
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download QR</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-end space-x-3"
      >
        <button
          onClick={onClose}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          onClick={generateProposal}
          disabled={isGenerating}
          className="btn flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>Generate Proposal</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
