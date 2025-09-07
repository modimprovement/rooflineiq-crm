import { ColorScheme, AnimationMode } from '@/types';

export const COLOR_SCHEMES: ColorScheme[] = [
  {
    name: 'rgbw',
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffffff'],
    description: 'RGBW Full Spectrum'
  },
  {
    name: 'rwb',
    colors: ['#ff0000', '#ffffff', '#0000ff'],
    description: '🇺🇸 RWB Patriotic'
  },
  {
    name: 'christmas',
    colors: ['#ff0000', '#00ff00', '#ffffff'],
    description: '🎄 Christmas Colors'
  },
  {
    name: 'halloween',
    colors: ['#ff8c00', '#800080', '#000000'],
    description: '🎃 Halloween Colors'
  },
  {
    name: 'easter',
    colors: ['#ffb6c1', '#98fb98', '#87ceeb', '#dda0dd'],
    description: '🐰 Easter Pastels'
  },
  {
    name: 'warm',
    colors: ['#fff8dc', '#ffefd5', '#ffe4b5'],
    description: '🔥 Warm White (2700K)'
  },
  {
    name: 'cool',
    colors: ['#f0f8ff', '#e6f3ff', '#ccf2ff'],
    description: '❄️ Cool White (5000K)'
  },
  {
    name: 'custom',
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'],
    description: '🎨 Custom Colors'
  }
];

export const ANIMATION_MODES: AnimationMode[] = [
  {
    name: 'static',
    description: '🔄 Static (No Animation)',
    icon: '🔄'
  },
  {
    name: 'twinkle',
    description: '✨ Twinkle Effect',
    icon: '✨'
  },
  {
    name: 'chase',
    description: '🏃 Chase Pattern',
    icon: '🏃'
  },
  {
    name: 'fade',
    description: '🌊 Fade In/Out',
    icon: '🌊'
  },
  {
    name: 'rainbow',
    description: '🌈 Rainbow Cycle',
    icon: '🌈'
  },
  {
    name: 'patriotic',
    description: '🇺🇸 Patriotic Wave',
    icon: '🇺🇸'
  },
  {
    name: 'fireworks',
    description: '🎆 Fireworks Burst',
    icon: '🎆'
  },
  {
    name: 'custom',
    description: '🎨 Custom Pattern',
    icon: '🎨'
  }
];

export const LIGHT_SPACING_OPTIONS = [
  { value: 8, label: '8 inches (Recommended)' },
  { value: 9, label: '9 inches' },
  { value: 12, label: '12 inches' },
  { value: 16, label: '16 inches' }
];

export const ZOOM_LEVELS = [
  { value: 18, label: '18 - Wide Area' },
  { value: 19, label: '19 - Neighborhood' },
  { value: 20, label: '20 - Property Focus' },
  { value: 21, label: '21 - Maximum Detail' }
];

export const HOUSE_SIDES = [
  { id: 'front', label: '🏠 Front', color: '#4CAF50' },
  { id: 'left', label: '⬅️ Left Side', color: '#2196F3' },
  { id: 'right', label: '➡️ Right Side', color: '#FF9800' },
  { id: 'back', label: '🏠 Back', color: '#9C27B0' }
];

export const DRAWING_MODES = [
  { type: 'straight', description: '📏 Straight Lines: Click to place points, right-click or double-click to complete path' },
  { type: 'freehand', description: '✋ Freehand: Click and drag to draw continuous lines' }
];

export const DEFAULT_PRICING = {
  retailPrice: 35,
  salePrice: 22,
  controllerCost: 300,
  extraDiscount: 0,
  wasteFactor: 10
};

export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyB1KpT96Ce5EzrS_18k6iljxhqfEhSUgAs';
