export interface Point {
  x: number;
  y: number;
  timestamp?: number;
}

export interface Path {
  points: Point[];
  side?: string;
  timestamp?: number;
}

export interface Measurements {
  aerial: {
    front: number;
    leftSide: number;
    rightSide: number;
    back: number;
    perimeter: number;
    eaves: number;
    gables: number;
    total?: number;
  };
  street: {
    front: number;
    leftSide: number;
    rightSide: number;
    back: number;
    total: number;
    eaves: number;
    gables: number;
  };
  total?: number;
  sideBreakdown?: any;
}

export interface Property {
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface LightPosition {
  pathIndex: number;
  positions: Point[];
  spacing: number;
}

export interface ColorScheme {
  name: string;
  colors: string[];
  description: string;
}

export interface AnimationMode {
  name: string;
  description: string;
  icon: string;
}

export interface Pricing {
  retailPrice: number;
  salePrice: number;
  controllerCost: number;
  extraDiscount: number;
  retailTotal: number;
  saleTotal: number;
  totalSavings: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface OrderData {
  customer: Customer;
  property: Property;
  measurements: Measurements;
  pricing: Pricing;
  lights: {
    total: number;
    withWaste: number;
    spacing: number;
    colorScheme: string;
    animation: string;
  };
  timestamp: string;
}

export interface DrawingMode {
  type: 'straight' | 'freehand' | 'mixed';
  description: string;
}

export interface SideSelection {
  front: 'street' | 'aerial';
  left: 'street' | 'aerial';
  right: 'street' | 'aerial';
  back: 'street' | 'aerial';
}
