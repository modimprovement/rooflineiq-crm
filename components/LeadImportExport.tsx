'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Download, 
  FileText, 
  Table, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Plus,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';

interface LeadImportExportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (leads: any[]) => void;
  onExport: (format: 'csv' | 'excel' | 'json') => void;
  existingLeads: any[];
}

interface ImportPreview {
  headers: string[];
  data: any[][];
  errors: string[];
  validRows: number;
  totalRows: number;
}

export default function LeadImportExport({ 
  isOpen, 
  onClose, 
  onImport, 
  onExport, 
  existingLeads 
}: LeadImportExportProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          setImportErrors(['File is empty or invalid']);
          setIsProcessing(false);
          return;
        }

        // Parse CSV
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map(line => 
          line.split(',').map(cell => cell.trim().replace(/"/g, ''))
        );

        // Validate data
        const errors: string[] = [];
        const validRows = data.filter((row, index) => {
          if (row.length !== headers.length) {
            errors.push(`Row ${index + 2}: Column count mismatch`);
            return false;
          }
          return true;
        }).length;

        // Auto-map fields
        const mapping: Record<string, string> = {};
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes('name') || lowerHeader.includes('full name')) {
            mapping[header] = 'name';
          } else if (lowerHeader.includes('email')) {
            mapping[header] = 'email';
          } else if (lowerHeader.includes('phone') || lowerHeader.includes('tel')) {
            mapping[header] = 'phone';
          } else if (lowerHeader.includes('address') || lowerHeader.includes('property')) {
            mapping[header] = 'address';
          } else if (lowerHeader.includes('status')) {
            mapping[header] = 'status';
          } else if (lowerHeader.includes('priority')) {
            mapping[header] = 'priority';
          } else if (lowerHeader.includes('source')) {
            mapping[header] = 'source';
          } else if (lowerHeader.includes('assigned') || lowerHeader.includes('rep')) {
            mapping[header] = 'assignedTo';
          } else if (lowerHeader.includes('value') || lowerHeader.includes('price')) {
            mapping[header] = 'estimatedValue';
          }
        });

        setFieldMapping(mapping);
        setImportPreview({
          headers,
          data: data.slice(0, 10), // Show first 10 rows
          errors,
          validRows,
          totalRows: data.length
        });

      } catch (error) {
        setImportErrors(['Error parsing file. Please check the format.']);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importPreview) return;

    setIsProcessing(true);
    
    // Convert preview data to lead format
    const leads = importPreview.data.map((row, index) => {
      const lead: any = {
        id: `imported_${Date.now()}_${index}`,
        createdAt: new Date().toISOString(),
        lastContact: new Date().toISOString(),
        status: 'new',
        priority: 'medium',
        source: 'import',
        assignedTo: 'Unassigned',
        notes: [],
        nextAction: '',
        nextActionDate: '',
        estimatedValue: 0
      };

      // Map fields based on mapping
      importPreview.headers.forEach((header, colIndex) => {
        const mappedField = fieldMapping[header];
        if (mappedField && row[colIndex]) {
          if (mappedField === 'estimatedValue') {
            lead[mappedField] = parseFloat(row[colIndex]) || 0;
          } else {
            lead[mappedField] = row[colIndex];
          }
        }
      });

      return lead;
    });

    onImport(leads);
    setIsProcessing(false);
    onClose();
  };

  const handleExport = () => {
    setIsProcessing(true);
    
    // Simulate export processing
    setTimeout(() => {
      onExport(selectedFormat);
      setIsProcessing(false);
      onClose();
    }, 1000);
  };

  const downloadTemplate = () => {
    const templateHeaders = [
      'Name',
      'Email',
      'Phone',
      'Address',
      'Status',
      'Priority',
      'Source',
      'Assigned To',
      'Estimated Value',
      'Notes'
    ];
    
    const templateData = [
      'John Smith',
      'john@email.com',
      '(555) 123-4567',
      '123 Main St, City, ST 12345',
      'new',
      'medium',
      'website',
      'Sales Rep Name',
      '5000',
      'Interested in lighting installation'
    ];

    const csvContent = [templateHeaders, templateData].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
            <h2 className="text-2xl font-bold text-gray-900">Import / Export Leads</h2>
            <p className="text-gray-600">Manage your lead data with bulk operations</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'import', label: 'Import Leads', icon: Upload },
              { id: 'export', label: 'Export Leads', icon: Download }
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

        <div className="p-6">
          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</h4>
                  <p className="text-gray-600 mb-4">
                    Upload a CSV file with your lead data. Download our template to get started.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Choose File</span>
                    </button>
                    <button
                      onClick={downloadTemplate}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Template</span>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Import Preview */}
              {importPreview && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Preview</h3>
                  
                  {/* Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-900">Valid Rows</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{importPreview.validRows}</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="font-medium text-red-900">Errors</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">{importPreview.errors.length}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-blue-900">Total Rows</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{importPreview.totalRows}</div>
                    </div>
                  </div>

                  {/* Field Mapping */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Field Mapping</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {importPreview.headers.map((header, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600 w-32 truncate">{header}</span>
                          <span className="text-gray-400">→</span>
                          <select
                            value={fieldMapping[header] || ''}
                            onChange={(e) => setFieldMapping(prev => ({ 
                              ...prev, 
                              [header]: e.target.value 
                            }))}
                            className="input-field flex-1"
                          >
                            <option value="">Select field...</option>
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="address">Address</option>
                            <option value="status">Status</option>
                            <option value="priority">Priority</option>
                            <option value="source">Source</option>
                            <option value="assignedTo">Assigned To</option>
                            <option value="estimatedValue">Estimated Value</option>
                            <option value="notes">Notes</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Preview */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {importPreview.headers.map((header, index) => (
                            <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {importPreview.data.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-4 py-3 text-sm text-gray-900">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Errors */}
                  {importPreview.errors.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-2">Import Errors</h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        {importPreview.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Leads</h3>
                <p className="text-gray-600 mb-6">
                  Export your leads data in various formats for backup, analysis, or integration with other tools.
                </p>

                {/* Export Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { id: 'csv', label: 'CSV File', description: 'Comma-separated values', icon: FileText },
                    { id: 'excel', label: 'Excel File', description: 'Microsoft Excel format', icon: Table },
                    { id: 'json', label: 'JSON File', description: 'JavaScript Object Notation', icon: FileText }
                  ].map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id as any)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedFormat === format.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <format.icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <div className="font-medium text-gray-900">{format.label}</div>
                        <div className="text-sm text-gray-600">{format.description}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Export Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Export Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Leads:</span>
                      <span className="ml-2 font-medium">{existingLeads.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Format:</span>
                      <span className="ml-2 font-medium uppercase">{selectedFormat}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">File Size:</span>
                      <span className="ml-2 font-medium">~{Math.round(existingLeads.length * 0.5)}KB</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="ml-2 font-medium">Now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          {activeTab === 'import' && importPreview && (
            <button
              onClick={handleImport}
              disabled={isProcessing || importPreview.errors.length > 0}
              className="btn flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Import {importPreview.validRows} Leads</span>
                </>
              )}
            </button>
          )}
          {activeTab === 'export' && (
            <button
              onClick={handleExport}
              disabled={isProcessing}
              className="btn flex items-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Leads</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
