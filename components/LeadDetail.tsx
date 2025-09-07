'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  FileText, 
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Share
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'new' | 'contacted' | 'measured' | 'quoted' | 'scheduled' | 'completed' | 'lost';
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'referral' | 'cold_call' | 'walk_in' | 'social_media';
  assignedTo: string;
  createdAt: string;
  lastContact: string;
  estimatedValue: number;
  measurements?: {
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
  notes: string[];
  nextAction: string;
  nextActionDate: string;
}

interface LeadDetailProps {
  lead: Lead;
  onBack: () => void;
  onSave: (lead: Lead) => void;
  onStartMeasurement: (lead: Lead) => void;
  onGenerateProposal: (lead: Lead) => void;
}

export default function LeadDetail({ 
  lead, 
  onBack, 
  onSave, 
  onStartMeasurement, 
  onGenerateProposal 
}: LeadDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead>(lead);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    setEditedLead(lead);
  }, [lead]);

  const handleSave = () => {
    onSave(editedLead);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedLead(lead);
    setIsEditing(false);
  };

  const addNote = () => {
    if (newNote.trim()) {
      setEditedLead({
        ...editedLead,
        notes: [...editedLead.notes, newNote.trim()],
        lastContact: new Date().toISOString().split('T')[0]
      });
      setNewNote('');
    }
  };

  const removeNote = (index: number) => {
    setEditedLead({
      ...editedLead,
      notes: editedLead.notes.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'measured': return 'bg-purple-100 text-purple-800';
      case 'quoted': return 'bg-orange-100 text-orange-800';
      case 'scheduled': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Lead' : 'Lead Details'}
            </h1>
            <p className="text-gray-600">Manage lead information and track progress</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="btn-secondary flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="btn flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onStartMeasurement(lead)}
                className="btn-secondary flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Start Measurement</span>
              </button>
              <button
                onClick={() => onGenerateProposal(lead)}
                className="btn-secondary flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Proposal</span>
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="btn flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedLead.name}
                    onChange={(e) => setEditedLead({ ...editedLead, name: e.target.value })}
                    className="input-field"
                  />
                ) : (
                  <p className="text-gray-900">{lead.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedLead.email}
                    onChange={(e) => setEditedLead({ ...editedLead, email: e.target.value })}
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800">
                      {lead.email}
                    </a>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedLead.phone}
                    onChange={(e) => setEditedLead({ ...editedLead, phone: e.target.value })}
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${lead.phone}`} className="text-blue-600 hover:text-blue-800">
                      {lead.phone}
                    </a>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedLead.address}
                    onChange={(e) => setEditedLead({ ...editedLead, address: e.target.value })}
                    className="input-field"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{lead.address}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Lead Status and Priority */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                {isEditing ? (
                  <select
                    value={editedLead.status}
                    onChange={(e) => setEditedLead({ ...editedLead, status: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="measured">Measured</option>
                    <option value="quoted">Quoted</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="lost">Lost</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </span>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                {isEditing ? (
                  <select
                    value={editedLead.priority}
                    onChange={(e) => setEditedLead({ ...editedLead, priority: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(lead.priority)}`}>
                    {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                  </span>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                {isEditing ? (
                  <select
                    value={editedLead.source}
                    onChange={(e) => setEditedLead({ ...editedLead, source: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="cold_call">Cold Call</option>
                    <option value="walk_in">Walk In</option>
                    <option value="social_media">Social Media</option>
                  </select>
                ) : (
                  <span className="text-gray-900 capitalize">{lead.source.replace('_', ' ')}</span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Measurements */}
          {lead.measurements && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Measurements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{lead.measurements.totalFeet}</div>
                  <div className="text-sm text-gray-500">Total Feet</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{lead.measurements.sides.front}</div>
                  <div className="text-sm text-gray-500">Front</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{lead.measurements.sides.leftSide}</div>
                  <div className="text-sm text-gray-500">Left Side</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{lead.measurements.sides.rightSide}</div>
                  <div className="text-sm text-gray-500">Right Side</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${lead.measurements.controllerPlaced ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-600">Controller Placed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${lead.measurements.powerSupplyPlaced ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="text-sm text-gray-600">Power Supply Placed</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <div className="space-y-3">
              {lead.notes.map((note, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{note}</p>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeNote(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1 input-field"
                    onKeyPress={(e) => e.key === 'Enter' && addNote()}
                  />
                  <button
                    onClick={addNote}
                    className="btn flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => onStartMeasurement(lead)}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <MapPin className="w-4 h-4" />
                <span>Start Measurement</span>
              </button>
              <button
                onClick={() => onGenerateProposal(lead)}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Proposal</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Share className="w-4 h-4" />
                <span>Share Lead</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
            </div>
          </motion.div>

          {/* Lead Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Created</span>
                <p className="text-sm text-gray-900">{formatDate(lead.createdAt)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Last Contact</span>
                <p className="text-sm text-gray-900">{formatDate(lead.lastContact)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Assigned To</span>
                <p className="text-sm text-gray-900">{lead.assignedTo}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Estimated Value</span>
                <p className="text-sm text-gray-900">
                  {lead.estimatedValue > 0 ? formatCurrency(lead.estimatedValue) : 'TBD'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Next Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Action</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Action</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedLead.nextAction}
                    onChange={(e) => setEditedLead({ ...editedLead, nextAction: e.target.value })}
                    className="input-field mt-1"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{lead.nextAction}</p>
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Due Date</span>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedLead.nextActionDate}
                    onChange={(e) => setEditedLead({ ...editedLead, nextActionDate: e.target.value })}
                    className="input-field mt-1"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{formatDate(lead.nextActionDate)}</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
