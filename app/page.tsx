'use client';

import { useState } from 'react';
import AuthWrapper from '@/components/AuthWrapper';
import AddressSetup from '@/components/AddressSetup';
import AerialMeasurements from '@/components/AerialMeasurements';
import StreetViewMeasurements from '@/components/StreetViewMeasurements';
import LightVisualization from '@/components/LightVisualization';
import PricingSales from '@/components/PricingSales';
import CheckoutSignature from '@/components/CheckoutSignature';
import CRMDashboard from '@/components/CRMDashboard';
import LeadDetail from '@/components/LeadDetail';
import HomeownerPortal from '@/components/HomeownerPortal';
import ProposalGenerator from '@/components/ProposalGenerator';
import DigitalSignature from '@/components/DigitalSignature';
import { Measurements, Property, Pricing, Customer } from '@/types';
import LandingPage from '@/components/LandingPage';

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

export default function Home() {
  const [currentView, setCurrentView] = useState<'landing' | 'crm' | 'measurement' | 'homeowner'>('landing');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showProposalGenerator, setShowProposalGenerator] = useState(false);
  const [showDigitalSignature, setShowDigitalSignature] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [measurements, setMeasurements] = useState<Measurements>({
    aerial: {
      front: 0,
      leftSide: 0,
      rightSide: 0,
      back: 0,
      perimeter: 0,
      eaves: 0,
      gables: 0
    },
    street: {
      front: 0,
      leftSide: 0,
      rightSide: 0,
      back: 0,
      total: 0,
      eaves: 0,
      gables: 0
    }
  });
  const [pricing, setPricing] = useState<Pricing>({
    retailPrice: 35,
    salePrice: 22,
    controllerCost: 300,
    extraDiscount: 0,
    retailTotal: 0,
    saleTotal: 0,
    totalSavings: 0
  });
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    phone: ''
  });

  const updateMeasurements = (newMeasurements: Partial<Measurements>) => {
    setMeasurements(prev => ({
      ...prev,
      ...newMeasurements
    }));
  };

  const updatePricing = (newPricing: Partial<Pricing>) => {
    setPricing(prev => ({
      ...prev,
      ...newPricing
    }));
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleCreateLead = () => {
    // In production, this would open a create lead modal
    console.log('Create new lead');
  };

  const handleStartMeasurement = (lead: Lead) => {
    setSelectedLead(null);
    setCurrentView('measurement');
    // Set property data from lead
    setCurrentProperty({
      address: lead.address,
      location: { lat: 40.7128, lng: -74.0060 } // Mock coordinates
    });
  };

  const handleGenerateProposal = (lead: Lead) => {
    setShowProposalGenerator(true);
  };

  const handleSaveLead = (lead: Lead) => {
    // In production, this would save to backend
    console.log('Save lead:', lead);
  };

  const handleOpenHomeownerPortal = (projectId: string) => {
    setCurrentView('homeowner');
  };

  const handleDigitalSignature = (signature: string) => {
    console.log('Digital signature captured:', signature);
    setShowDigitalSignature(false);
  };

  const handleGetStarted = () => {
    setCurrentView('measurement');
  };

  const handleLogin = () => {
    setCurrentView('crm');
  };

  const renderCRMView = () => (
    <div className="space-y-6">
      {!selectedLead ? (
        <CRMDashboard
          onSelectLead={handleSelectLead}
          onCreateLead={handleCreateLead}
          onStartMeasurement={handleStartMeasurement}
        />
      ) : (
        <LeadDetail
          lead={selectedLead}
          onBack={() => setSelectedLead(null)}
          onSave={handleSaveLead}
          onStartMeasurement={handleStartMeasurement}
          onGenerateProposal={handleGenerateProposal}
        />
      )}
    </div>
  );

  const renderMeasurementView = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Measurement Tool</h1>
        <button
          onClick={() => setCurrentView('crm')}
          className="btn-secondary"
        >
          Back to CRM
        </button>
      </div>
      
      <AddressSetup 
        currentProperty={currentProperty}
        onPropertyLoad={setCurrentProperty}
      />
      
      <AerialMeasurements 
        measurements={measurements.aerial}
        onMeasurementsUpdate={(aerial) => updateMeasurements({ aerial })}
        currentProperty={currentProperty}
      />
      
      <StreetViewMeasurements 
        measurements={measurements.street}
        onMeasurementsUpdate={(street) => updateMeasurements({ street })}
        currentProperty={currentProperty}
      />
      
      <LightVisualization 
        measurements={measurements}
        onMeasurementsUpdate={updateMeasurements}
      />
      
      <PricingSales 
        measurements={measurements}
        pricing={pricing}
        onPricingUpdate={updatePricing}
      />
      
      <CheckoutSignature 
        measurements={measurements}
        pricing={pricing}
        customer={customer}
        onCustomerUpdate={setCustomer}
        currentProperty={currentProperty}
      />
    </div>
  );

  return (
    <div>
      {currentView === 'landing' ? (
        <LandingPage 
          onGetStarted={handleGetStarted}
          onLogin={handleLogin}
        />
      ) : (
        <AuthWrapper>
          <div className="space-y-8">
            {currentView === 'crm' && renderCRMView()}
            {currentView === 'measurement' && renderMeasurementView()}
            {currentView === 'homeowner' && (
              <HomeownerPortal
                projectId="proj_123"
                onClose={() => setCurrentView('crm')}
              />
            )}
          </div>

          {/* Modals */}
          {showProposalGenerator && (
            <ProposalGenerator
              leadId={selectedLead?.id || ''}
              onClose={() => setShowProposalGenerator(false)}
              onGenerate={(proposal) => {
                console.log('Proposal generated:', proposal);
                setShowProposalGenerator(false);
              }}
            />
          )}

          <DigitalSignature
            isOpen={showDigitalSignature}
            onSave={handleDigitalSignature}
            onCancel={() => setShowDigitalSignature(false)}
          />
        </AuthWrapper>
      )}
    </div>
  );
}
