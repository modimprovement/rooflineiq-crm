'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { DrawingPoint, DrawingPath } from '@/types';

// Google Maps type definitions
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement, options: any) => any;
        };
        Geocoder: new () => any;
        GeocoderStatus: any;
        Map: new (element: HTMLElement, options: any) => any;
        MapTypeId: any;
        Marker: new (options: any) => any;
        LatLng: new (lat: number, lng: number) => any;
        event: any;
        places: any;
        geometry: any;
      };
    };
  }
}

interface GoogleMapsProps {
  onMeasurementUpdate: (measurements: any) => void;
  currentProperty: any;
  zoomLevel: number;
  drawingMode: 'straight' | 'freehand' | null;
  currentSide: string;
  controllerPlacementMode: boolean;
  powerSupplyMode: boolean;
  onControllerPlaced: (position: { lat: number; lng: number }) => void;
  onPowerSupplyPlaced: (position: { lat: number; lng: number }) => void;
}

export default function GoogleMaps({
  onMeasurementUpdate,
  currentProperty,
  zoomLevel,
  drawingMode,
  currentSide,
  controllerPlacementMode,
  powerSupplyMode,
  onControllerPlaced,
  onPowerSupplyPlaced,
}: GoogleMapsProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingPoint[]>([]);
  const [allPaths, setAllPaths] = useState<DrawingPath[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current) return;

    const loader = new Loader({
      apiKey: 'AIzaSyB1KpT96Ce5EzrS_18k6iljxhqfEhSUgAs',
      version: 'weekly',
      libraries: ['geometry', 'places'],
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: currentProperty?.coordinates || { lat: 40.7128, lng: -74.0060 },
          zoom: zoomLevel,
          mapTypeId: window.google.maps.MapTypeId.SATELLITE,
          tilt: 0,
          clickableIcons: false,
          gestureHandling: 'greedy',
        });

        setMap(mapInstance);
        setIsMapReady(true);
      }
    });
  }, [currentProperty?.coordinates, zoomLevel]);

  // Setup canvas drawing when map is ready
  useEffect(() => {
    if (isMapReady && map && canvasRef.current) {
      setupCanvasDrawing();
    }
  }, [isMapReady, map]);

  // Redraw all paths when allPaths changes
  useEffect(() => {
    if (isMapReady && map && canvasRef.current) {
      redrawAllPaths();
    }
  }, [allPaths, isMapReady, map]);

  const setupCanvasDrawing = () => {
    if (!canvasRef.current || !map) return;

    const canvas = canvasRef.current;
    const mapContainer = mapRef.current;
    
    if (!mapContainer) return;

    // Set canvas size to match map container
    const rect = mapContainer.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    // Set cursor based on mode
    if (drawingMode || controllerPlacementMode || powerSupplyMode) {
      canvas.style.cursor = 'crosshair';
    } else {
      canvas.style.cursor = 'default';
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (!canvasRef.current || !map) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawingMode === 'straight') {
      handleStraightLineClick(x, y);
    } else if (drawingMode === 'freehand') {
      startFreehandDrawing(x, y);
    } else if (controllerPlacementMode) {
      handleControllerPlacement(x, y);
    } else if (powerSupplyMode) {
      handlePowerSupplyPlacement(x, y);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!canvasRef.current || !isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (drawingMode === 'freehand') {
      continueFreehandDrawing(x, y);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && drawingMode === 'freehand') {
      endFreehandDrawing();
    }
    setIsDrawing(false);
  };

  const handleStraightLineClick = (x: number, y: number) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const point: DrawingPoint = { x, y };
    const newPath: DrawingPath = {
      id: Date.now().toString(),
      type: 'straight',
      points: [point],
      side: currentSide,
      distance: 0,
    };

    setAllPaths(prev => [...prev, newPath]);
    drawPoint(ctx, x, y);
  };

  const startFreehandDrawing = (x: number, y: number) => {
    setIsDrawing(true);
    const point: DrawingPoint = { x, y };
    setCurrentPath([point]);
  };

  const continueFreehandDrawing = (x: number, y: number) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const point: DrawingPoint = { x, y };
    setCurrentPath(prev => {
      const newPath = [...prev, point];
      
      // Draw line from previous point to current point
      if (prev.length > 0) {
        const prevPoint = prev[prev.length - 1];
        drawLine(ctx, prevPoint.x, prevPoint.y, x, y);
      }
      
      return newPath;
    });
  };

  const endFreehandDrawing = () => {
    if (currentPath.length < 2) return;

    const distance = calculateFreehandDistance(currentPath);
    const newPath: DrawingPath = {
      id: Date.now().toString(),
      type: 'freehand',
      points: currentPath,
      side: currentSide,
      distance,
    };

    setAllPaths(prev => [...prev, newPath]);
    setCurrentPath([]);
  };

  const handleControllerPlacement = (x: number, y: number) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Convert canvas coordinates to lat/lng
    const latLng = map.getProjection().fromPointToLatLng(
      new window.google.maps.Point(x, y)
    );

    if (latLng) {
      onControllerPlaced({ lat: latLng.lat(), lng: latLng.lng() });
      drawControllerIcon(ctx, x, y);
    }
  };

  const handlePowerSupplyPlacement = (x: number, y: number) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Convert canvas coordinates to lat/lng
    const latLng = map.getProjection().fromPointToLatLng(
      new window.google.maps.Point(x, y)
    );

    if (latLng) {
      onPowerSupplyPlaced({ lat: latLng.lat(), lng: latLng.lng() });
      drawPowerSupplyIcon(ctx, x, y);
    }
  };

  const drawPoint = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff6b35';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawControllerIcon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(x - 10, y - 10, 20, 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 10, y - 10, 20, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('C', x, y + 4);
  };

  const drawPowerSupplyIcon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#FF9800';
    ctx.fillRect(x - 10, y - 10, 20, 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 10, y - 10, 20, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('P', x, y + 4);
  };

  const calculateCanvasDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    // Convert pixels to feet (placeholder conversion)
    return distance * 0.1; // 1 pixel = 0.1 feet
  };

  const calculateFreehandDistance = (points: DrawingPoint[]): number => {
    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      totalDistance += calculateCanvasDistance(
        points[i - 1].x, points[i - 1].y,
        points[i].x, points[i].y
      );
    }
    return totalDistance;
  };

  const redrawAllPaths = () => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Redraw all paths
    allPaths.forEach(path => {
      if (path.type === 'straight' && path.points.length > 0) {
        const point = path.points[0];
        drawPoint(ctx, point.x, point.y);
      } else if (path.type === 'freehand' && path.points.length > 1) {
        for (let i = 1; i < path.points.length; i++) {
          const prevPoint = path.points[i - 1];
          const currentPoint = path.points[i];
          drawLine(ctx, prevPoint.x, prevPoint.y, currentPoint.x, currentPoint.y);
        }
      }
    });
  };

  const clearMeasurements = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    setAllPaths([]);
    setCurrentPath([]);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-auto"
        style={{ zIndex: 10 }}
      />
      
      {/* Drawing mode overlay */}
      {(drawingMode || controllerPlacementMode || powerSupplyMode) && (
        <div className="absolute top-4 left-4 bg-black/80 text-white p-3 rounded-lg z-20">
          <div className="text-sm font-medium">
            {drawingMode === 'straight' && 'Click to place measurement points'}
            {drawingMode === 'freehand' && 'Click and drag to draw freehand'}
            {controllerPlacementMode && 'Click to place controller'}
            {powerSupplyMode && 'Click to place power supply'}
          </div>
        </div>
      )}
    </div>
  );
}