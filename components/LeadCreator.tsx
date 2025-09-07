'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Home, 
  Plus, 
  X, 
  Navigation, 
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Zap
} from 'lucide-react';

interface LeadCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: any) => void;
  templates?: LeadTemplate[];
}

interface LeadTemplate {
  id: string;
  name: string;
  source: string;
  priority: 'low' | 'medium' | 'high';
  defaultNotes: string[];
  icon: string;
  color: string;
}

export default function LeadCreator({ isOpen, onClose, onSave, templates = [] }: LeadCreatorProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'new' as const,
    priority: 'medium' as 'low' | 'medium' | 'high',
    source: 'website' as const,
    assignedTo: '',
    notes: [] as string[],
    nextAction: '',
    nextActionDate: '',
    estimatedValue: 0
  });
  
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<LeadTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Default templates
  const defaultTemplates: LeadTemplate[] = [
    {
      id: 'website',
      name: 'Website Lead',
      source: 'website',
      priority: 'medium',
      defaultNotes: ['Lead came from website contact form'],
      icon: '🌐',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'referral',
      name: 'Referral',
      source: 'referral',
      priority: 'high',
      defaultNotes: ['Referred by existing customer'],
      icon: '🤝',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'cold_call',
      name: 'Cold Call',
      source: 'cold_call',
      priority: 'low',
      defaultNotes: ['Cold outreach via phone'],
      icon: '📞',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'walk_in',
      name: 'Walk-in',
      source: 'walk_in',
      priority: 'high',
      defaultNotes: ['Customer walked into office/showroom'],
      icon: '🚶',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'social_media',
      name: 'Social Media',
      source: 'social_media',
      priority: 'medium',
      defaultNotes: ['Lead from social media campaign'],
      icon: '📱',
      color: 'bg-pink-100 text-pink-800'
    }
  ];

  const allTemplates = [...defaultTemplates, ...templates];

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'new',
        priority: 'medium',
        source: 'website',
        assignedTo: '',
        notes: [],
        nextAction: '',
        nextActionDate: '',
        estimatedValue: 0
      });
      setSelectedTemplate(null);
      setLocationError('');
    }
  }, [isOpen]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoadingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use Google Geocoding API to get address
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyB1KpT96Ce5EzrS_18k6iljxhqfEhSUgAs`
          );
          
          const data = await response.json();
          
          if (data.status === 'OK' && data.results.length > 0) {
            const address = data.results[0].formatted_address;
            setFormData(prev => ({ ...prev, address }));
            setLocationError('');
          } else {
            setLocationError('Could not determine address from location.');
          }
        } catch (error) {
          setLocationError('Error getting address from location.');
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        let errorMessage = 'Error getting location: ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Unknown error occurred.';
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleTemplateSelect = (template: LeadTemplate) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      source: template.source as any,
      priority: template.priority,
      notes: [...template.defaultNotes]
    }));
  };

  const handleAddressChange = async (value: string) => {
    setFormData(prev => ({ ...prev, address: value }));
    
    if (value.length > 2) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(value)}&key=AIzaSyB1KpT96Ce5EzrS_18k6iljxhqfEhSUgAs`
        );
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
          const suggestions = data.results.slice(0, 5).map((result: any) => result.formatted_address);
          setAddressSuggestions(suggestions);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, address: suggestion }));
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newLead = {
      id: `lead_${Date.now()}`,
      ...formData,
      createdAt: new Date().toISOString(),
      lastContact: new Date().toISOString(),
      assignedTo: formData.assignedTo || 'Unassigned'
    };
    
    onSave(newLead);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Lead</h2>
            <p className="text-gray-600">Add a new lead to your CRM system</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Lead Templates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Templates</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {allTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{template.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${template.color}`}>
                      {template.priority}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="input-field"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="input-field"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="w-4 h-4 inline mr-1" />
                Property Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter property address"
                />
                <button
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  title="Use current location"
                >
                  {isLoadingLocation ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  ) : (
                    <Navigation className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
              
              {locationError && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {locationError}
                </div>
              )}

              {/* Address Suggestions */}
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lead Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value as any }))}
                className="input-field"
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="cold_call">Cold Call</option>
                <option value="walk_in">Walk-in</option>
                <option value="social_media">Social Media</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="input-field"
                placeholder="Sales rep name"
              />
            </div>
          </div>

          {/* Next Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Next Action</label>
              <input
                type="text"
                value={formData.nextAction}
                onChange={(e) => setFormData(prev => ({ ...prev, nextAction: e.target.value }))}
                className="input-field"
                placeholder="e.g., Schedule measurement, Send proposal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={formData.nextActionDate}
                onChange={(e) => setFormData(prev => ({ ...prev, nextActionDate: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes.join('\n')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                notes: e.target.value.split('\n').filter(note => note.trim()) 
              }))}
              className="input-field h-24"
              placeholder="Add any additional notes about this lead..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Create Lead</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
