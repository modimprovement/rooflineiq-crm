'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Property } from '@/types';
import { ChevronDown, ChevronRight, ZoomIn, Target, Ruler, Lightbulb } from 'lucide-react';
import { ZOOM_LEVELS, HOUSE_SIDES, DRAWING_MODES } from '@/lib/constants';
import GoogleMaps from './GoogleMaps';

interface AerialMeasurementsProps {
  measurements: {
    front: number;
    leftSide: number;
    rightSide: number;
    back: number;
    perimeter: number;
    eaves: number;
    gables: number;
  };
  onMeasurementsUpdate: (measurements: any) => void;
  currentProperty: Property | null;
}

export default function AerialMeasurements({ 
  measurements, 
  onMeasurementsUpdate, 
  currentProperty 
}: AerialMeasurementsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(21);
  const [currentSide, setCurrentSide] = useState('front');
  const [drawingMode, setDrawingMode] = useState('straight');
  const [lightSpacing, setLightSpacing] = useState(8);
  const [bulbSize, setBulbSize] = useState(1.0);
  const [animationMode, setAnimationMode] = useState('static');
  const [animationSpeed, setAnimationSpeed] = useState(5);
  const [isAnimationActive, setIsAnimationActive] = useState(false);
  const [controllerPlacementMode, setControllerPlacementMode] = useState(false);
  const [powerSupplyMode, setPowerSupplyMode] = useState(false);
  const [controllerPlaced, setControllerPlaced] = useState(false);
  const [powerSupplyPlaced, setPowerSupplyPlaced] = useState(false);

  const handleSideSelect = (side: string) => {
    setCurrentSide(side);
  };

  const handleDrawingModeChange = (mode: string) => {
    setDrawingMode(mode);
  };

  const handleZoomChange = (zoom: number) => {
    setZoomLevel(zoom);
  };

  const toggleAnimation = () => {
    setIsAnimationActive(!isAnimationActive);
  };

  const enterControllerPlacementMode = () => {
    setControllerPlacementMode(true);
    setPowerSupplyMode(false);
  };

  const enterPowerSupplyMode = () => {
    setPowerSupplyMode(true);
    setControllerPlacementMode(false);
  };

  const handleControllerPlacement = () => {
    setControllerPlaced(true);
    setControllerPlacementMode(false);
  };

  const handlePowerSupplyPlacement = () => {
    setPowerSupplyPlaced(true);
    setPowerSupplyMode(false);
  };

  const clearMeasurements = () => {
    onMeasurementsUpdate({
      front: 0,
      leftSide: 0,
      rightSide: 0,
      back: 0,
      perimeter: 0,
      eaves: 0,
      gables: 0
    });
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
          <Target className="mr-2" />
          🛰️ Step 2: Aerial View Measurements
        </span>
        {isOpen ? <ChevronDown /> : <ChevronRight />}
      </div>
      
      <div className={`section-content ${isOpen ? 'block' : 'hidden'}`}>
        {/* Zoom Control Panel */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
          <label className="font-bold flex items-center mb-2">
            <ZoomIn className="mr-2" />
            🔍 Zoom Level:
          </label>
          <div className="flex items-center gap-3">
            <select
              value={zoomLevel}
              onChange={(e) => handleZoomChange(Number(e.target.value))}
              className="input-field w-auto"
            >
              {ZOOM_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">
              Scale: {((21 - zoomLevel) * 0.5 + 0.1).toFixed(3)} ft/pixel
            </span>
          </div>
        </div>

        {/* Side Selection Controls */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
          <label className="font-bold block mb-3 text-gray-700">
            🏠 Select House Side:
          </label>
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
            <strong>Current Side:</strong> {currentSide.charAt(0).toUpperCase() + currentSide.slice(1)} - 
            All measurements will be labeled for this side
          </p>
        </div>

        {/* Drawing Mode Controls */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
          <label className="font-bold flex items-center mb-3">
            <Ruler className="mr-2" />
            ✏️ Drawing Mode:
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

        {/* Google Maps Integration */}
        {currentProperty ? (
          <div className="mb-4">
            <GoogleMaps
              onMeasurementUpdate={onMeasurementsUpdate}
              currentProperty={currentProperty}
              zoomLevel={zoomLevel}
              drawingMode={drawingMode as 'straight' | 'freehand'}
              currentSide={currentSide}
              controllerPlacementMode={controllerPlacementMode}
              powerSupplyMode={powerSupplyMode}
              onControllerPlaced={handleControllerPlacement}
              onPowerSupplyPlaced={handlePowerSupplyPlacement}
            />
          </div>
        ) : (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
            <div className="text-center text-gray-600">
              🗺️ Please load a property first to start measurements
              <br />
              <small>Use the address input above to search for a property</small>
            </div>
          </div>
        )}

        {/* Controller & Power Supply Placement */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
          <label className="font-bold flex items-center mb-3">
            🎛️ Controller & Power Supply:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <button
                onClick={enterControllerPlacementMode}
                className={`btn w-full ${controllerPlacementMode ? 'ring-2 ring-white ring-offset-2' : ''}`}
                style={{ backgroundColor: controllerPlacementMode ? '#1976D2' : '#2196F3' }}
              >
                🎛️ {controllerPlacementMode ? 'Click Map to Place Controller' : 'Place Controller'}
              </button>
              <div className="text-sm text-gray-600 mt-1">
                {controllerPlaced ? '✅ Controller placed' : 'No controller placed'}
              </div>
            </div>
            
            <div>
              <button
                onClick={enterPowerSupplyMode}
                className={`btn w-full ${powerSupplyMode ? 'ring-2 ring-white ring-offset-2' : ''}`}
                style={{ backgroundColor: powerSupplyMode ? '#E65100' : '#FF6B00' }}
              >
                🔌 {powerSupplyMode ? 'Click Map to Place Power Supply' : 'Place Power Supply'}
              </button>
              <div className="text-sm text-gray-600 mt-1">
                {powerSupplyPlaced ? '✅ Power supply placed' : 'No power supply placed'}
              </div>
            </div>
          </div>
          
          {(controllerPlaced || powerSupplyPlaced) && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-700">
                <strong>💡 Power Wire Configuration:</strong>
                <br />
                <strong>Power Wire 1:</strong> 130' with 3 jumps | <strong>Wire 2:</strong> 170' with 1 jump | <strong>Wire 3:</strong> 200' with 1 jump
                <br />
                <strong>🎯 Auto-places T-taps at optimal intervals.</strong> Power wires run parallel to data line with visual separation.
              </div>
            </div>
          )}
        </div>

        {/* Light Controls */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
          <label className="font-bold flex items-center mb-3">
            <Lightbulb className="mr-2" />
            🎬 Aerial Light Controls:
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
          </div>
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
