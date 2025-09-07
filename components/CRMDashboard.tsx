'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Upload,
  Settings,
  BarChart3,
  Zap,
  Star,
  Navigation
} from 'lucide-react';
import LeadCreator from './LeadCreator';
import LeadImportExport from './LeadImportExport';
import AdvancedFilters from './AdvancedFilters';

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

interface CRMDashboardProps {
  onSelectLead: (lead: Lead) => void;
  onCreateLead: () => void;
  onStartMeasurement: (lead: Lead) => void;
}

export default function CRMDashboard({ 
  onSelectLead, 
  onCreateLead, 
  onStartMeasurement 
}: CRMDashboardProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showLeadCreator, setShowLeadCreator] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'kanban'>('table');

  // Mock data - in production, this would come from your backend
  useEffect(() => {
    const mockLeads: Lead[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        address: '123 Main St, Anytown, ST 12345',
        status: 'measured',
        priority: 'high',
        source: 'website',
        assignedTo: 'Mike Johnson',
        createdAt: '2024-01-15',
        lastContact: '2024-01-20',
        estimatedValue: 8500,
        measurements: {
          totalFeet: 245,
          sides: { front: 65, leftSide: 60, rightSide: 55, back: 65 },
          controllerPlaced: true,
          powerSupplyPlaced: true
        },
        notes: ['Customer prefers warm white lights', 'Needs installation before March 15th'],
        nextAction: 'Send proposal',
        nextActionDate: '2024-01-22'
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        phone: '(555) 987-6543',
        address: '456 Oak Ave, Another City, ST 67890',
        status: 'quoted',
        priority: 'medium',
        source: 'referral',
        assignedTo: 'Mike Johnson',
        createdAt: '2024-01-18',
        lastContact: '2024-01-21',
        estimatedValue: 6200,
        measurements: {
          totalFeet: 180,
          sides: { front: 45, leftSide: 45, rightSide: 45, back: 45 },
          controllerPlaced: false,
          powerSupplyPlaced: false
        },
        notes: ['Budget conscious', 'Wants to see samples first'],
        nextAction: 'Follow up on proposal',
        nextActionDate: '2024-01-25'
      },
      {
        id: '3',
        name: 'Robert Davis',
        email: 'robert.davis@email.com',
        phone: '(555) 456-7890',
        address: '789 Pine St, Third City, ST 13579',
        status: 'new',
        priority: 'low',
        source: 'cold_call',
        assignedTo: 'Jane Smith',
        createdAt: '2024-01-22',
        lastContact: '2024-01-22',
        estimatedValue: 0,
        notes: ['Initial contact made', 'Scheduled measurement for next week'],
        nextAction: 'Schedule measurement',
        nextActionDate: '2024-01-25'
      }
    ];
    
    setLeads(mockLeads);
    setFilteredLeads(mockLeads);
  }, []);

  // Filter and search leads
  useEffect(() => {
    let filtered = leads;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(lead => lead.priority === priorityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'estimatedValue':
          aValue = a.estimatedValue;
          bValue = b.estimatedValue;
          break;
        case 'lastContact':
          aValue = new Date(a.lastContact).getTime();
          bValue = new Date(b.lastContact).getTime();
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Plus className="w-4 h-4" />;
      case 'contacted': return <Clock className="w-4 h-4" />;
      case 'measured': return <MapPin className="w-4 h-4" />;
      case 'quoted': return <DollarSign className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'lost': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleLeadSelect = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleBulkAction = (action: string, leadIds: string[]) => {
    switch (action) {
      case 'status':
        // Open status change modal
        console.log('Change status for leads:', leadIds);
        break;
      case 'priority':
        // Open priority change modal
        console.log('Change priority for leads:', leadIds);
        break;
      case 'assign':
        // Open assignment modal
        console.log('Assign leads:', leadIds);
        break;
      case 'email':
        // Open email composer
        console.log('Send email to leads:', leadIds);
        break;
      case 'call':
        // Open call scheduler
        console.log('Schedule calls for leads:', leadIds);
        break;
      case 'proposal':
        // Generate proposals
        console.log('Generate proposals for leads:', leadIds);
        break;
      case 'export':
        // Export selected leads
        console.log('Export leads:', leadIds);
        break;
      case 'delete':
        // Delete selected leads
        if (confirm(`Are you sure you want to delete ${leadIds.length} leads?`)) {
          setLeads(prev => prev.filter(lead => !leadIds.includes(lead.id)));
          setSelectedLeads([]);
        }
        break;
    }
  };

  const handleImportLeads = (importedLeads: Lead[]) => {
    setLeads(prev => [...prev, ...importedLeads]);
    setShowImportExport(false);
  };

  const handleExportLeads = (format: 'csv' | 'excel' | 'json') => {
    console.log(`Exporting leads in ${format} format`);
    // In production, this would generate and download the file
  };

  const handleCreateNewLead = () => {
    setShowLeadCreator(true);
  };

  const handleSaveNewLead = (newLead: Lead) => {
    setLeads(prev => [...prev, newLead]);
    setShowLeadCreator(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
          <p className="text-gray-600">Manage leads, measurements, and proposals</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowImportExport(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import/Export</span>
          </button>
          <button
            onClick={() => setShowAdvancedFilters(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
            {selectedLeads.length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                {selectedLeads.length}
              </span>
            )}
          </button>
          <button
            onClick={handleCreateNewLead}
            className="btn flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Measurements</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads.filter(lead => lead.status === 'measured').length}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled Installations</p>
              <p className="text-2xl font-bold text-gray-900">
                {leads.filter(lead => lead.status === 'scheduled').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(leads.reduce((sum, lead) => sum + lead.estimatedValue, 0))}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="measured">Measured</option>
            <option value="quoted">Quoted</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="input-field"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="estimatedValue-desc">Highest Value</option>
            <option value="estimatedValue-asc">Lowest Value</option>
            <option value="lastContact-desc">Recent Contact</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead, index) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectLead(lead)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                      <div className="text-sm text-gray-500">{lead.address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {getStatusIcon(lead.status)}
                      <span className="ml-1 capitalize">{lead.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                      {lead.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.estimatedValue > 0 ? formatCurrency(lead.estimatedValue) : 'TBD'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lead.lastContact)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.nextAction}</div>
                    <div className="text-sm text-gray-500">{formatDate(lead.nextActionDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLead(lead);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartMeasurement(lead);
                        }}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit lead
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by creating a new lead.'}
          </p>
        </div>
      )}

      {/* Modals */}
      <LeadCreator
        isOpen={showLeadCreator}
        onClose={() => setShowLeadCreator(false)}
        onSave={handleSaveNewLead}
      />

      <LeadImportExport
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        onImport={handleImportLeads}
        onExport={handleExportLeads}
        existingLeads={leads}
      />

      <AdvancedFilters
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        onApplyFilters={(filters) => {
          // Apply advanced filters logic here
          console.log('Applying filters:', filters);
        }}
        onBulkAction={handleBulkAction}
        selectedLeads={selectedLeads}
        onSelectAll={handleSelectAll}
        totalLeads={leads.length}
      />
    </div>
  );
}
