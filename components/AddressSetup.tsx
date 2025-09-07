'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Property } from '@/types';
import { ChevronDown, ChevronRight, MapPin, Loader2 } from 'lucide-react';

interface AddressSetupProps {
  currentProperty: Property | null;
  onPropertyLoad: (property: Property) => void;
}

export default function AddressSetup({ currentProperty, onPropertyLoad }: AddressSetupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    const initAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places && inputRef.current) {
        try {
          const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'us' },
            fields: ['formatted_address', 'geometry']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address) {
              setAddress(place.formatted_address);
            }
          });
          
          console.log('✅ Google Places Autocomplete initialized');
        } catch (error) {
          console.error('❌ Error initializing autocomplete:', error);
        }
      }
    };

    // Wait for Google Maps to load
    const checkGoogle = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        clearInterval(checkGoogle);
        console.log('✅ Google Maps and Places loaded, initializing autocomplete...');
        initAutocomplete();
      }
    }, 100);
    
    return () => clearInterval(checkGoogle);
  }, []);

  // Fallback autocomplete using Geocoding API
  const fetchAddressSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=AIzaSyB1KpT96Ce5EzrS_18k6iljxhqfEhSUgAs`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const addressSuggestions = data.results.slice(0, 5).map((result: any) => result.formatted_address);
        setSuggestions(addressSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    setSelectedIndex(-1);
    
    // Debounce the API call
    const timeoutId = setTimeout(() => {
      fetchAddressSuggestions(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setAddress(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleLoadProperty();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleLoadProperty = async () => {
    if (!address.trim()) {
      setStatus({ message: 'Please enter a property address', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatus({ message: 'Loading property...', type: 'info' });

    try {
      // Use Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyB1KpT96Ce5EzrS_18k6iljxhqfEhSUgAs`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;
        
        const property: Property = {
          address: result.formatted_address,
          location: {
            lat: location.lat,
            lng: location.lng
          }
        };

        onPropertyLoad(property);
        setStatus({ message: `Property loaded: ${result.formatted_address}`, type: 'success' });
      } else {
        setStatus({ message: 'Could not find property address', type: 'error' });
      }
    } catch (error) {
      setStatus({ message: 'Could not find property address', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const clearStatus = () => {
    setTimeout(() => setStatus(null), 3000);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (status) {
    clearStatus();
  }

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
          <MapPin className="mr-2" />
          🏠 Step 1: Address & Property Setup
        </span>
        {isOpen ? <ChevronDown /> : <ChevronRight />}
      </div>
      
      <div className={`section-content ${isOpen ? 'block' : 'hidden'}`}>
        <div className="mb-5">
          <label className="font-bold block mb-2 text-gray-700">
            🏡 Property Address:
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={address}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Start typing an address..."
              className="input-field mb-3"
              autoComplete="off"
            />
            
            {/* Address Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border-2 border-primary-orange rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-orange-50 transition-colors ${
                      index === selectedIndex ? 'bg-orange-100' : ''
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="flex items-center">
                      <MapPin className="mr-2 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-800">{suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={handleLoadProperty}
              disabled={isLoading}
              className="btn flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <MapPin className="mr-2" />
              )}
              {isLoading ? 'Loading...' : '🚀 Load Property'}
            </button>
          </div>
        </div>

        {currentProperty && (
          <div className="bg-green-100 border border-green-500 text-green-700 p-3 rounded-lg">
            ✅ <strong>Property Loaded:</strong> {currentProperty.address}
            <br />
            📍 Coordinates: {currentProperty.location.lat.toFixed(6)}, {currentProperty.location.lng.toFixed(6)}
          </div>
        )}

        {status && (
          <div className={`status-message status-${status.type}`}>
            {status.message}
          </div>
        )}
      </div>
    </motion.div>
  );
}
