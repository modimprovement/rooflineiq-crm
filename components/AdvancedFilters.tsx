'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  Search, 
  Calendar, 
  DollarSign, 
  User, 
  MapPin, 
  Tag, 
  X, 
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Trash2,
  Mail,
  Phone,
  FileText,
  Download
} from 'lucide-react';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  onBulkAction: (action: string, leadIds: string[]) => void;
  selectedLeads: string[];
  onSelectAll: (selectAll: boolean) => void;
  totalLeads: number;
}

interface FilterState {
  search: string;
  status: string[];
  priority: string[];
  source: string[];
  assignedTo: string[];
  dateRange: {
    start: string;
    end: string;
  };
  valueRange: {
    min: number;
    max: number;
  };
  hasMeasurements: boolean | null;
  hasProposal: boolean | null;
  tags: string[];
}

const defaultFilters: FilterState = {
  search: '',
  status: [],
  priority: [],
  source: [],
  assignedTo: [],
  dateRange: { start: '', end: '' },
  valueRange: { min: 0, max: 100000 },
  hasMeasurements: null,
  hasProposal: null,
  tags: []
};

export default function AdvancedFilters({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  onBulkAction,
  selectedLeads,
  onSelectAll,
  totalLeads
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [savedFilters, setSavedFilters] = useState<Array<{name: string, filters: FilterState}>>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const statusOptions = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'measured', label: 'Measured', color: 'bg-purple-100 text-purple-800' },
    { value: 'quoted', label: 'Quoted', color: 'bg-orange-100 text-orange-800' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  const sourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'social_media', label: 'Social Media' }
  ];

  const bulkActions = [
    { id: 'status', label: 'Change Status', icon: Tag },
    { id: 'priority', label: 'Change Priority', icon: Star },
    { id: 'assign', label: 'Assign to Rep', icon: User },
    { id: 'email', label: 'Send Email', icon: Mail },
    { id: 'call', label: 'Schedule Call', icon: Phone },
    { id: 'proposal', label: 'Generate Proposal', icon: FileText },
    { id: 'export', label: 'Export Selected', icon: Download },
    { id: 'delete', label: 'Delete Selected', icon: Trash2, destructive: true }
  ];

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayFilterChange = (key: keyof FilterState, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...(prev[key] as string[]), value]
        : (prev[key] as string[]).filter(item => item !== value)
    }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const saveFilter = () => {
    const name = prompt('Enter a name for this filter:');
    if (name) {
      setSavedFilters(prev => [...prev, { name, filters: { ...filters } }]);
    }
  };

  const loadFilter = (savedFilter: {name: string, filters: FilterState}) => {
    setFilters(savedFilter.filters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.source.length > 0) count++;
    if (filters.assignedTo.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.valueRange.min > 0 || filters.valueRange.max < 100000) count++;
    if (filters.hasMeasurements !== null) count++;
    if (filters.hasProposal !== null) count++;
    if (filters.tags.length > 0) count++;
    return count;
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
            <h2 className="text-2xl font-bold text-gray-900">Advanced Filters & Bulk Actions</h2>
            <p className="text-gray-600">
              {selectedLeads.length > 0 
                ? `${selectedLeads.length} leads selected` 
                : `${totalLeads} total leads`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search Leads
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field"
              placeholder="Search by name, email, phone, or address..."
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {statusOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(option.value)}
                    onChange={(e) => handleArrayFilterChange('status', option.value, e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className={`text-xs px-2 py-1 rounded-full ${option.color}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="flex space-x-4">
              {priorityOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.priority.includes(option.value)}
                    onChange={(e) => handleArrayFilterChange('priority', option.value, e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className={`text-xs px-2 py-1 rounded-full ${option.color}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {sourceOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.source.includes(option.value)}
                    onChange={(e) => handleArrayFilterChange('source', option.value, e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Created After
              </label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { 
                  ...filters.dateRange, 
                  start: e.target.value 
                })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Created Before
              </label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { 
                  ...filters.dateRange, 
                  end: e.target.value 
                })}
                className="input-field"
              />
            </div>
          </div>

          {/* Value Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Estimated Value Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                <input
                  type="number"
                  value={filters.valueRange.min}
                  onChange={(e) => handleFilterChange('valueRange', { 
                    ...filters.valueRange, 
                    min: Number(e.target.value) 
                  })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                <input
                  type="number"
                  value={filters.valueRange.max}
                  onChange={(e) => handleFilterChange('valueRange', { 
                    ...filters.valueRange, 
                    max: Number(e.target.value) 
                  })}
                  className="input-field"
                  placeholder="100000"
                />
              </div>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Has Measurements</label>
              <select
                value={filters.hasMeasurements === null ? '' : filters.hasMeasurements.toString()}
                onChange={(e) => handleFilterChange('hasMeasurements', 
                  e.target.value === '' ? null : e.target.value === 'true'
                )}
                className="input-field"
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Has Proposal</label>
              <select
                value={filters.hasProposal === null ? '' : filters.hasProposal.toString()}
                onChange={(e) => handleFilterChange('hasProposal', 
                  e.target.value === '' ? null : e.target.value === 'true'
                )}
                className="input-field"
              >
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedLeads.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {bulkActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => onBulkAction(action.id, selectedLeads)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      action.destructive
                        ? 'border-red-200 hover:border-red-300 hover:bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <action.icon className={`w-6 h-6 mx-auto mb-2 ${
                        action.destructive ? 'text-red-500' : 'text-gray-600'
                      }`} />
                      <div className={`text-sm font-medium ${
                        action.destructive ? 'text-red-700' : 'text-gray-900'
                      }`}>
                        {action.label}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Filters</h3>
              <div className="space-y-2">
                {savedFilters.map((savedFilter, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">{savedFilter.name}</span>
                    <button
                      onClick={() => loadFilter(savedFilter)}
                      className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear All Filters
            </button>
            <button
              onClick={saveFilter}
              className="text-sm text-orange-600 hover:text-orange-800"
            >
              Save Filter
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={applyFilters}
              className="btn flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Apply Filters ({getActiveFiltersCount()})</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
