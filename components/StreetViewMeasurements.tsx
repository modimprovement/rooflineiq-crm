'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Property } from '@/types';
import { ChevronDown, ChevronRight, Camera, Ruler, Lightbulb, Upload } from 'lucide-react';
import { HOUSE_SIDES, DRAWING_MODES } from '@/lib/constants';

interface StreetViewMeasurementsProps {
  measurements: {
    front: number;
    leftSide: number;
    rightSide: number;
    back: number;
    total: number;
    eaves: number;
    gables: number;
  };
  onMeasurementsUpdate: (measurements: any) => void;
  currentProperty: Property | null;
}

export default function StreetViewMeasurements({ 
  measurements, 
  onMeasurementsUpdate, 
  currentProperty 
}: StreetViewMeasurementsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSide, setCurrentSide] = useState('front');
  const [drawingMode, setDrawingMode] = useState('straight');
  const [lightSpacing, setLightSpacing] = useState(8);
  const [bulbSize, setBulbSize] = useState(1.0);
  const [animationMode, setAnimationMode] = useState('static');
  const [animationSpeed, setAnimationSpeed] = useState(5);
  const [isAnimationActive, setIsAnimationActive] = useState(false);
  const [scaleReference, setScaleReference] = useState(16);
  const [isStreetViewCaptured, setIsStreetViewCaptured] = useState(false);

  const handleSideSelect = (side: string) => {
    setCurrentSide(side);
  };

  const handleDrawingModeChange = (mode: string) => {
    setDrawingMode(mode);
  };

  const toggleAnimation = () => {
    setIsAnimationActive(!isAnimationActive);
  };

  const captureStreetView = () => {
    setIsStreetViewCaptured(true);
  };

  const resetStreetView = () => {
    setIsStreetViewCaptured(false);
  };

  const clearMeasurements = () => {
    onMeasurementsUpdate({
      front: 0,
      leftSide: 0,
      rightSide: 0,
      back: 0,
      total: 0,
      eaves: 0,
      gables: 0
    });
  };

  const applyScale = () => {
    // In real app, this would apply the scale factor to measurements
    console.log('Scale applied:', scaleReference);
  };

  // Calculate total from all sides
  const total = measurements.front + measurements.leftSide + measurements.rightSide + measurements.back;

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
          <Camera className="mr-2" />
          🚗 Step 3: Street View Measurements
        </span>
        {isOpen ? <ChevronDown /> : <ChevronRight />}
      </div>
      
      <div className={`section-content ${isOpen ? 'block' : 'hidden'}`}>
        {/* Scale Calibration Info */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
          <p className="text-gray-700">
            <strong>📏 Scale Calibration:</strong> Draw a reference line on a known feature 
            (16' garage door, 8' single door, 3' front door), then enter the actual measurement.
          </p>
        </div>

        {/* Street View Container */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
          <div className="text-center text-gray-600 mb-4">
            💡 <strong>Enhanced View:</strong> Street View with drawing capabilities
          </div>
          
          {/* Street View Placeholder */}
          <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center text-gray-500">
            🗺️ Street View will be implemented here with Google Maps API
          </div>

          {/* Street View Controls */}
          <div className="absolute top-4 right-4 z-10 bg-black/80 p-3 rounded-lg">
            <div className="text-white text-xs mb-2 text-center opacity-90">
              💡 Uses Google Static Maps API
            </div>
            {!isStreetViewCaptured ? (
              <button
                onClick={captureStreetView}
                className="btn text-sm w-full mb-2"
              >
                📸 Capture Street View
              </button>
            ) : (
              <button
                onClick={resetStreetView}
                className="btn-secondary text-sm w-full mb-2"
              >
                🔄 Back to Live View
              </button>
            )}
          </div>
        </div>

        {/* Street View Light Controls */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
          <label className="font-bold block mb-3">
            🎬 Street View Light Controls:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Animation:</label>
              <select
                value={animationMode}
                onChange={(e) => setAnimationMode(e.target.value)}
                className="input-field text-sm"
              >
                <option value="static">🔄 Static</option>
                <option value="twinkle">✨ Twinkle</option>
                <option value="chase">🏃 Chase</option>
                <option value="fade">🌊 Fade</option>
                <option value="rainbow">🌈 Rainbow</option>
                <option value="christmas">🎄 Christmas</option>
                <option value="patriotic">🇺🇸 Patriotic</option>
                <option value="fireworks">🎆 Fireworks</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Speed:</label>
              <input
                type="range"
                min="1"
                max="10"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{animationSpeed}</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Spacing (in):</label>
              <input
                type="number"
                min="4"
                max="24"
                value={lightSpacing}
                onChange={(e) => setLightSpacing(Number(e.target.value))}
                className="input-field text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Bulb Size (in):</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={bulbSize}
                onChange={(e) => setBulbSize(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{bulbSize.toFixed(1)}"</span>
            </div>
          </div>
          
          <div className="mt-3">
            <button
              onClick={toggleAnimation}
              className={`btn text-sm ${isAnimationActive ? 'bg-green-600' : ''}`}
            >
              {isAnimationActive ? '⏸️ Stop Animation' : '▶️ Start Animation'}
            </button>
            <button
              onClick={clearMeasurements}
              className="btn-secondary text-sm ml-2"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Street View Drawing Controls */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
          <label className="font-bold flex items-center mb-3">
            <Ruler className="mr-2" />
            ✏️ Street View Drawing Mode:
          </label>
          <div className="flex gap-3 mb-3">
            {DRAWING_MODES.map(mode => (
              <button
                key={mode.type}
                onClick={() => handleDrawingModeChange(mode.type)}
                className={`btn text-sm py-2 px-3 ${
                  drawingMode === mode.type ? 'ring-2 ring-white ring-offset-2' : ''
                }`}
              >
                {mode.type === 'straight' ? '📏 Straight Lines' : '✋ Freehand'}
              </button>
            ))}
            <button
              onClick={clearMeasurements}
              className="btn-secondary text-sm py-2 px-3"
            >
              🗑️ Clear All
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {DRAWING_MODES.find(m => m.type === drawingMode)?.description}
          </div>
        </div>

        {/* Scale Calibration */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
          <h4 className="text-yellow-600 font-bold mb-3">📐 Street View Scale Calibration</h4>
          <p className="text-sm text-gray-600 mb-3">
            After capturing Street View, draw a reference line on a known feature, then enter the actual measurement.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-2">📏 Reference Width (feet):</label>
              <input
                type="number"
                value={scaleReference}
                onChange={(e) => setScaleReference(Number(e.target.value))}
                className="input-field"
                placeholder="16"
                step="0.1"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={applyScale}
                className="btn"
              >
                ✅ Apply Scale
              </button>
            </div>
          </div>
        </div>

        {/* Image Upload for Scale Calibration */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
          <h4 className="text-green-600 font-bold mb-3">📁 Upload Image for Scale Calibration</h4>
          <p className="text-sm text-gray-600 mb-3">
            Upload a photo of your house with a known reference object for accurate scale calibration.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-2">📷 Upload Image:</label>
              <input
                type="file"
                accept="image/*"
                className="input-field"
              />
            </div>
            <div>
              <label className="font-bold block mb-2">📏 Reference Width (feet):</label>
              <input
                type="number"
                className="input-field"
                placeholder="16"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="mt-3">
            <button className="btn text-sm">
              ✅ Apply Scale from Image
            </button>
            <button className="btn-secondary text-sm ml-2">
              🗑️ Clear Image
            </button>
          </div>
        </div>

        {/* Side Selection */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
          <label className="font-bold block mb-3">🏠 Select House Side:</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {HOUSE_SIDES.map(side => (
              <button
                key={side.id}
                onClick={() => handleSideSelect(side.id)}
                className={`btn text-sm py-2 px-3 ${
                  currentSide === side.id ? 'ring-2 ring-white ring-offset-2' : ''
                }`}
                style={{ backgroundColor: side.color }}
              >
                {side.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Current Side:</strong> {currentSide.charAt(0).toUpperCase() + currentSide.slice(1)}
          </p>
        </div>

        {/* Measurements Display */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="measurement-card">
            <h3 className="text-lg font-semibold text-primary-orange mb-2">🏠 Front</h3>
            <div className="measurement-value">{measurements.front}</div>
            <div className="measurement-unit">feet</div>
          </div>
          <div className="measurement-card">
            <h3 className="text-lg font-semibold text-primary-orange mb-2">⬅️ Left Side</h3>
            <div className="measurement-value">{measurements.leftSide}</div>
            <div className="measurement-unit">feet</div>
          </div>
          <div className="measurement-card">
            <h3 className="text-lg font-semibold text-primary-orange mb-2">➡️ Right Side</h3>
            <div className="measurement-value">{measurements.rightSide}</div>
            <div className="measurement-unit">feet</div>
          </div>
          <div className="measurement-card">
            <h3 className="text-lg font-semibold text-primary-orange mb-2">🏠 Back</h3>
            <div className="measurement-value">{measurements.back}</div>
            <div className="measurement-unit">feet</div>
          </div>
          <div className="measurement-card">
            <h3 className="text-lg font-semibold text-primary-orange mb-2">📏 Total</h3>
            <div className="measurement-value">{total}</div>
            <div className="measurement-unit">feet</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
