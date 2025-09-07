'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Measurements } from '@/types';
import { ChevronDown, ChevronRight, Lightbulb, Palette, Zap, Settings } from 'lucide-react';
import { COLOR_SCHEMES, ANIMATION_MODES, LIGHT_SPACING_OPTIONS } from '@/lib/constants';

interface LightVisualizationProps {
  measurements: Measurements;
  onMeasurementsUpdate: (measurements: Partial<Measurements>) => void;
}

export default function LightVisualization({ measurements, onMeasurementsUpdate }: LightVisualizationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [lightSpacing, setLightSpacing] = useState(8);
  const [colorScheme, setColorScheme] = useState('rgbw');
  const [animationMode, setAnimationMode] = useState('static');
  const [animationSpeed, setAnimationSpeed] = useState(5);
  const [wasteFactor, setWasteFactor] = useState(10);
  const [customColors, setCustomColors] = useState(['#ff0000', '#00ff00', '#0000ff', '#ffff00']);
  const [sideSource, setSideSource] = useState({
    front: 'street',
    left: 'aerial',
    right: 'aerial',
    back: 'aerial'
  });

  // Calculate total measurements
  const aerialTotal = measurements.aerial?.perimeter || 0;
  const streetTotal = measurements.street?.total || 0;
  const totalFeet = aerialTotal + streetTotal;

  // Calculate lights needed
  const spacingFeet = lightSpacing / 12;
  const totalLights = totalFeet > 0 ? Math.ceil(totalFeet / spacingFeet) : 0;
  const lightsWithWaste = Math.ceil(totalLights * (1 + wasteFactor / 100));

  // Update light calculations when measurements change
  useEffect(() => {
    // This would trigger light visualization updates
  }, [measurements, lightSpacing, wasteFactor]);

  const handleColorSchemeChange = (scheme: string) => {
    setColorScheme(scheme);
  };

  const handleCustomColorChange = (index: number, color: string) => {
    const newColors = [...customColors];
    newColors[index] = color;
    setCustomColors(newColors);
  };

  const handleSideSourceChange = (side: string, source: string) => {
    setSideSource(prev => ({
      ...prev,
      [side]: source
    }));
  };

  const getCurrentColors = () => {
    if (colorScheme === 'custom') {
      return customColors;
    }
    return COLOR_SCHEMES.find(scheme => scheme.name === colorScheme)?.colors || ['#ffffff'];
  };

  const getCurrentColorDescription = () => {
    return COLOR_SCHEMES.find(scheme => scheme.name === colorScheme)?.description || 'Custom Colors';
  };

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
          <Lightbulb className="mr-2" />
          💡 Step 4: Light Visualization & Design
        </span>
        {isOpen ? <ChevronDown /> : <ChevronRight />}
      </div>
      
      <div className={`section-content ${isOpen ? 'block' : 'hidden'}`}>
        {/* Light Spacing Controls */}
        <div className="mb-5">
          <label className="font-bold block mb-2 text-gray-700">
            📏 Light Spacing:
          </label>
          <select
            value={lightSpacing}
            onChange={(e) => setLightSpacing(Number(e.target.value))}
            className="input-field w-auto"
          >
            {LIGHT_SPACING_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Animation Controls */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-5">
          <label className="font-bold block mb-3">
            🎬 Light Animation:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Mode:</label>
              <select
                value={animationMode}
                onChange={(e) => setAnimationMode(e.target.value)}
                className="input-field"
              >
                {ANIMATION_MODES.map(mode => (
                  <option key={mode.name} value={mode.name}>
                    {mode.icon} {mode.name}
                  </option>
                ))}
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
              <span className="text-sm text-gray-600">
                {animationSpeed <= 3 ? 'Slow' : animationSpeed <= 7 ? 'Medium' : 'Fast'}
              </span>
            </div>
            
            <div className="flex items-end">
              <button className="btn text-sm">
                {animationMode === 'static' ? '▶️ Start Animation' : '⏸️ Stop Animation'}
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            💡 Toggle animation and select effects for your lights
          </div>
        </div>

        {/* Multi-Color System */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-5">
          <label className="font-bold block mb-3">
            🎨 Color Scheme:
          </label>
          <select
            value={colorScheme}
            onChange={(e) => handleColorSchemeChange(e.target.value)}
            className="input-field mb-3"
          >
            {COLOR_SCHEMES.map(scheme => (
              <option key={scheme.name} value={scheme.name}>
                {scheme.description}
              </option>
            ))}
          </select>

          {/* Custom Color Palette */}
          {colorScheme === 'custom' && (
            <div className="mt-3">
              <label className="font-bold block mb-2">🎨 Custom Colors:</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {customColors.map((color, index) => (
                  <input
                    key={index}
                    type="color"
                    value={color}
                    onChange={(e) => handleCustomColorChange(index, e.target.value)}
                    className="w-full h-10 border-2 border-white rounded-lg cursor-pointer shadow-lg"
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 text-center">
                💡 Click colors to customize your palette
              </div>
            </div>
          )}

          {/* Color Preview */}
          <div className="mt-3">
            <div 
              className="h-8 rounded-full border-2 border-white shadow-lg mb-2"
              style={{
                background: `linear-gradient(90deg, ${getCurrentColors().join(', ')})`
              }}
            ></div>
            <div className="text-sm text-gray-600 text-center">
              Current: {getCurrentColorDescription()}
            </div>
          </div>
        </div>

        {/* Side-Specific Measurement Sources */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-5">
          <h4 className="text-primary-orange font-bold mb-3">🏠 Side-Specific Measurement Sources</h4>
          <p className="text-sm text-gray-600 mb-3">
            Choose which measurement source to use for each side of the house. Front defaults to Street View, others to Aerial.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(sideSource).map(([side, source]) => (
              <div key={side} className="flex items-center gap-2">
                <label className="font-bold min-w-[60px] capitalize">{side}:</label>
                <select
                  value={source}
                  onChange={(e) => handleSideSourceChange(side, e.target.value)}
                  className="input-field text-sm w-auto"
                >
                  <option value="street">Street View</option>
                  <option value="aerial">Aerial View</option>
                </select>
                <span className="text-xs text-gray-600">({source === 'street' ? 'Street View' : 'Aerial View'})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Waste Factor Control */}
        <div className="mb-5">
          <label className="font-bold block mb-2 text-gray-700">
            📦 Waste Factor (%):
          </label>
          <input
            type="number"
            value={wasteFactor}
            onChange={(e) => setWasteFactor(Number(e.target.value))}
            className="input-field w-auto"
            min="0"
            max="50"
            step="1"
          />
          <span className="ml-3 text-gray-600 text-sm">
            💡 Recommended: 10% for most projects
          </span>
        </div>

        {/* Light Count & Waste Factor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="measurement-card">
            <h3 className="text-lg font-semibold text-primary-orange mb-2">💡 Total Lights Needed</h3>
            <div className="measurement-value">{totalLights}</div>
            <div className="measurement-unit">lights</div>
          </div>
          <div className="measurement-card">
            <h3 className="text-lg font-semibold text-primary-orange mb-2">📦 With Waste Factor</h3>
            <div className="measurement-value">{lightsWithWaste}</div>
            <div className="measurement-unit">lights</div>
          </div>
        </div>

        {/* Light Visualization Preview */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-bold mb-3 text-gray-700">🎨 Light Preview</h4>
          <div className="bg-white p-4 rounded-lg border border-gray-300">
            <div className="text-center text-gray-500">
              💡 Light visualization preview will be implemented here
              <br />
              <small>Shows animated lights along measured paths</small>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
