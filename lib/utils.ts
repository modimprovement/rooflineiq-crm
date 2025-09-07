import { Point, Path, Measurements } from '@/types';

export function calculatePathLength(path: Point[]): number {
  if (path.length < 2) return 0;
  
  let totalLength = 0;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i-1].x;
    const dy = path[i].y - path[i-1].y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
  }
  return totalLength;
}

export function calculateMeasurements(paths: Path[], scaleFactor: number): number {
  return paths.reduce((total, path) => {
    return total + (calculatePathLength(path.points) * scaleFactor);
  }, 0);
}

export function placeLightsAlongPath(path: Point[], spacingInches: number, scaleFactor: number): Point[] {
  const spacingFeet = spacingInches / 12;
  const totalPathLength = calculatePathLength(path) * scaleFactor;
  const numLights = Math.floor(totalPathLength / spacingFeet) + 1;
  
  if (numLights < 2) return [];
  
  const lightPositions: Point[] = [];
  let lastLightPosition: Point | null = null;
  
  for (let i = 0; i < numLights; i++) {
    const distanceAlongPath = i * spacingFeet;
    const lightPosition = getPositionAlongPath(path, distanceAlongPath, scaleFactor);
    
    if (lightPosition) {
      if (lastLightPosition) {
        const dx = lightPosition.x - lastLightPosition.x;
        const dy = lightPosition.y - lastLightPosition.y;
        const pixelDistance = Math.sqrt(dx * dx + dy * dy);
        
        if (pixelDistance < 8) continue;
      }
      
      lightPositions.push(lightPosition);
      lastLightPosition = lightPosition;
    }
  }
  
  return lightPositions;
}

export function getPositionAlongPath(path: Point[], targetDistance: number, scaleFactor: number): Point | null {
  let currentDistance = 0;
  
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].x - path[i-1].x;
    const dy = path[i].y - path[i-1].y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);
    const segmentFeet = segmentLength * scaleFactor;
    
    if (currentDistance + segmentFeet >= targetDistance) {
      const segmentProgress = (targetDistance - currentDistance) / segmentFeet;
      const x = path[i-1].x + (path[i].x - path[i-1].x) * segmentProgress;
      const y = path[i-1].y + (path[i].y - path[i-1].y) * segmentProgress;
      
      return { x, y };
    }
    
    currentDistance += segmentFeet;
  }
  
  if (path.length > 0) {
    return path[path.length - 1];
  }
  
  return null;
}

export function getGoogleMapScale(zoom: number, lat: number): number {
  const metersPerPixel = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);
  return metersPerPixel * 3.28084; // Convert to feet per pixel
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatFeet(feet: number): string {
  return `${feet.toFixed(1)} ft`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
