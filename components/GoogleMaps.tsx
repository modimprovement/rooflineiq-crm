'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapsProps {
  onMeasurementUpdate: (measurements: any) => void;
  currentProperty: {
    address: string;
    location: {
      lat: number;
      lng: number;
    };
  } | null;
  zoomLevel: number;
  drawingMode: 'straight' | 'freehand';
  currentSide: string;
  controllerPlacementMode?: boolean;
  powerSupplyMode?: boolean;
  onControllerPlaced?: () => void;
  onPowerSupplyPlaced?: () => void;
}

interface DrawingPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface DrawingPath {
  points: DrawingPoint[];
  side: string;
  timestamp: number;
}

export default function GoogleMaps({
  onMeasurementUpdate,
  currentProperty,
  zoomLevel,
  drawingMode,
  currentSide,
  controllerPlacementMode = false,
  powerSupplyMode = false,
  onControllerPlaced,
  onPowerSupplyPlaced
}: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingPoint[]>([]);
  const [allPaths, setAllPaths] = useState<DrawingPath[]>([]);
  const [measurements, setMeasurements] = useState({
    front: 0,
    leftSide: 0,
    rightSide: 0,
    back: 0,
    total: 0
  });

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: 'AIzaSyB1KpT96Ce5EzrS_18k6iljxhqfEhSUgAs',
        version: 'weekly',
        libraries: ['geometry', 'places']
      });

      try {
        const google = await loader.load();
        
        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: currentProperty?.location || { lat: 40.7128, lng: -74.0060 },
            zoom: zoomLevel,
            mapTypeId: google.maps.MapTypeId.SATELLITE,
            tilt: 0, // Flat aerial view (no tilt)
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            rotateControl: false,
            fullscreenControl: true,
            clickableIcons: false, // Disable POI clicks to allow drawing
            gestureHandling: 'greedy' // Allow pan and zoom while drawing
          });

          setMap(mapInstance);

          // Load property if available
          if (currentProperty) {
            loadProperty(mapInstance, currentProperty);
          }
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, [currentProperty, zoomLevel]);

  // Setup canvas drawing when map is ready
  useEffect(() => {
    if (map && canvasRef.current) {
      setupCanvasDrawing();
    }
  }, [map, drawingMode, currentSide, controllerPlacementMode, powerSupplyMode]);

  // Redraw paths when allPaths changes
  useEffect(() => {
    if (allPaths.length > 0) {
      redrawAllPaths();
    }
  }, [allPaths]);

  const setupCanvasDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match map container
    const mapContainer = mapRef.current;
    if (mapContainer) {
      canvas.width = mapContainer.offsetWidth;
      canvas.height = mapContainer.offsetHeight;
    }

    // Clear existing event listeners
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('mouseleave', handleMouseUp);

    // Add new event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    // Set cursor style
    canvas.style.cursor = 'crosshair';
  };

  const loadProperty = (mapInstance: google.maps.Map, property: any) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: property.address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        mapInstance.setCenter(location);
        mapInstance.setZoom(zoomLevel);
        
        // Add property marker
        new google.maps.Marker({
          position: location,
          map: mapInstance,
          title: property.address,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#ff6a00"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24)
          }
        });
      }
    });
  };

  // Canvas-based drawing functions
  const handleMouseDown = (e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (controllerPlacementMode) {
      handleControllerPlacement(x, y);
    } else if (powerSupplyMode) {
      handlePowerSupplyPlacement(x, y);
    } else if (drawingMode === 'straight') {
      handleStraightLineClick(x, y);
    } else {
      startFreehandDrawing(x, y);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawing || drawingMode !== 'freehand') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    continueFreehandDrawing(x, y);
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isDrawing && drawingMode === 'freehand') {
      endFreehandDrawing();
    }
  };

  const handleStraightLineClick = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newPoint: DrawingPoint = { x, y, timestamp: Date.now() };
    const newPath = [...currentPath, newPoint];

    if (newPath.length === 1) {
      // First point - start drawing
      setCurrentPath(newPath);
      drawPoint(ctx, x, y, '#0066cc', 4);
    } else if (newPath.length === 2) {
      // Second point - complete line
      setCurrentPath([]);
      
      // Save the completed path
      const completedPath: DrawingPath = {
        points: newPath,
        side: currentSide,
        timestamp: Date.now()
      };
      setAllPaths(prev => [...prev, completedPath]);
      
      // Draw the line
      drawLine(ctx, newPath[0], newPath[1]);
      
      // Calculate and update measurements
      const distance = calculateCanvasDistance(newPath[0], newPath[1]);
      updateMeasurements(currentSide, distance);
    }
  };

  const startFreehandDrawing = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const newPoint: DrawingPoint = { x, y, timestamp: Date.now() };
    setCurrentPath([newPoint]);

    // Start drawing path
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#ff6a00';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  };

  const continueFreehandDrawing = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newPoint: DrawingPoint = { x, y, timestamp: Date.now() };
    setCurrentPath(prev => [...prev, newPoint]);

    // Continue drawing path
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endFreehandDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(false);
    
    if (currentPath.length > 1) {
      // Save the completed path
      const completedPath: DrawingPath = {
        points: currentPath,
        side: currentSide,
        timestamp: Date.now()
      };
      setAllPaths(prev => [...prev, completedPath]);
      
      // Calculate and update measurements
      const distance = calculateFreehandDistance(currentPath);
      updateMeasurements(currentSide, distance);
    }
    
    setCurrentPath([]);
  };

  const drawPoint = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawLine = (ctx: CanvasRenderingContext2D, point1: DrawingPoint, point2: DrawingPoint) => {
    ctx.strokeStyle = '#ff6a00';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(point2.x, point2.y);
    ctx.stroke();
  };

  const calculateCanvasDistance = (point1: DrawingPoint, point2: DrawingPoint): number => {
    // Simple pixel distance calculation - in real implementation, you'd need to convert to real-world distance
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Rough conversion: assume 1 pixel = 1 foot (this would need proper scale calibration)
    return pixelDistance;
  };

  const calculateFreehandDistance = (path: DrawingPoint[]): number => {
    let totalDistance = 0;
    for (let i = 1; i < path.length; i++) {
      totalDistance += calculateCanvasDistance(path[i - 1], path[i]);
    }
    return totalDistance;
  };

  const handleControllerPlacement = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw controller icon on canvas
    drawControllerIcon(ctx, x, y);
    
    onControllerPlaced?.();
  };

  const handlePowerSupplyPlacement = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw power supply icon on canvas
    drawPowerSupplyIcon(ctx, x, y);
    
    onPowerSupplyPlaced?.();
  };

  const drawControllerIcon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const size = 24;
    const halfSize = size / 2;
    
    // Controller body
    ctx.fillStyle = '#2196F3';
    ctx.fillRect(x - halfSize, y - halfSize + 2, size, size - 4);
    
    // Controller screen
    ctx.fillStyle = 'white';
    ctx.fillRect(x - halfSize + 2, y - halfSize + 4, size - 4, size - 8);
    
    // Controller buttons (dots)
    ctx.fillStyle = '#2196F3';
    const buttonSize = 2;
    const spacing = 4;
    
    // Top row
    ctx.beginPath();
    ctx.arc(x - 6, y - 2, buttonSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y - 2, buttonSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 6, y - 2, buttonSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Bottom row
    ctx.beginPath();
    ctx.arc(x - 6, y + 2, buttonSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y + 2, buttonSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 6, y + 2, buttonSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPowerSupplyIcon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const size = 24;
    const halfSize = size / 2;
    
    // Power supply body
    ctx.fillStyle = '#FF6B00';
    ctx.fillRect(x - halfSize, y - halfSize + 4, size, size - 8);
    
    // Power supply screen
    ctx.fillStyle = 'white';
    ctx.fillRect(x - halfSize + 2, y - halfSize + 6, size - 4, size - 12);
    
    // Power lines
    ctx.strokeStyle = '#FF6B00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x + 6, y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 2);
    ctx.lineTo(x + 4, y + 2);
    ctx.stroke();
    
    // Power indicator light
    ctx.fillStyle = '#FF6B00';
    ctx.beginPath();
    ctx.arc(x, y - 6, 3, 0, Math.PI * 2);
    ctx.fill();
  };

  const updateMeasurements = (side: string, distance: number) => {
    const newMeasurements = {
      ...measurements,
      [side]: measurements[side as keyof typeof measurements] + distance
    };
    
    newMeasurements.total = newMeasurements.front + newMeasurements.leftSide + 
                           newMeasurements.rightSide + newMeasurements.back;
    
    setMeasurements(newMeasurements);
    onMeasurementUpdate(newMeasurements);
  };

  const clearMeasurements = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    setMeasurements({
      front: 0,
      leftSide: 0,
      rightSide: 0,
      back: 0,
      total: 0
    });
    setAllPaths([]);
    setCurrentPath([]);
    setIsDrawing(false);
    
    onMeasurementUpdate({
      front: 0,
      leftSide: 0,
      rightSide: 0,
      back: 0,
      total: 0
    });
  };

  const redrawAllPaths = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all saved paths
    allPaths.forEach(path => {
      if (path.points.length === 2) {
        // Straight line
        drawLine(ctx, path.points[0], path.points[1]);
      } else if (path.points.length > 2) {
        // Freehand path
        ctx.strokeStyle = '#ff6a00';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
      }
    });
  };

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className={`w-full h-96 rounded-lg border-2 border-gray-300 ${
          controllerPlacementMode || powerSupplyMode 
            ? 'cursor-crosshair' 
            : drawingMode === 'straight' 
              ? 'cursor-crosshair' 
              : 'cursor-crosshair'
        }`}
        style={{
          background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      />
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 pointer-events-auto"
        style={{ 
          width: '100%', 
          height: '100%',
          zIndex: 10,
          cursor: controllerPlacementMode ? 'crosshair' : 
                  powerSupplyMode ? 'crosshair' : 
                  drawingMode === 'straight' ? 'crosshair' : 'crosshair'
        }}
      />
      
      {/* Drawing Mode Overlay */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-orange-200">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="font-medium text-orange-800">
            {controllerPlacementMode ? '🎛️ Click to place controller' :
             powerSupplyMode ? '⚡ Click to place power supply' :
             drawingMode === 'straight' ? '📏 Click 2 points to draw line' :
             '✏️ Click and drag to draw'}
          </span>
        </div>
      </div>
      
      {/* Drawing Instructions */}
      <div className="mt-2 p-4 bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg border-2 border-orange-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-orange-800">🎯 Drawing Mode Active</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isDrawing ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isDrawing ? 'Drawing...' : 'Ready to Draw'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-700 mb-1">
              <strong>Mode:</strong> {drawingMode === 'straight' ? '📏 Straight Line (Click 2 points)' : '✏️ Freehand (Click & drag)'}
            </p>
            <p className="text-gray-600">
              <strong>Side:</strong> {currentSide} | 
              <strong> Total:</strong> {measurements.total.toFixed(1)} feet
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <button 
              onClick={clearMeasurements}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              🗑️ Clear All
            </button>
            
            {controllerPlacementMode && (
              <div className="text-xs text-blue-600 font-medium">
                🎛️ Controller Placement Mode
              </div>
            )}
            
            {powerSupplyMode && (
              <div className="text-xs text-orange-600 font-medium">
                ⚡ Power Supply Placement Mode
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
