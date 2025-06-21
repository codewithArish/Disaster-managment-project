
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Disaster {
  id: string;
  title: string;
  location_name: string;
  description: string;
  tags: string[];
  owner_id: string;
  created_at: string;
  status: string;
  latitude?: number;
  longitude?: number;
}

interface Resource {
  id: string;
  name: string;
  type: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  current_occupancy?: number;
  status: string;
  contact?: string;
  amenities?: string[];
  created_at: string;
}

interface MapProps {
  disasters?: Disaster[];
  resources?: Resource[];
  apiKey: string;
  onDisasterClick?: (disaster: Disaster) => void;
  onResourceClick?: (resource: Resource) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  showEarthquakeZones?: boolean;
}

// Optimized earthquake zones - only major zones for faster loading
const earthquakeZones = [
  // Zone V (Very High Risk) - Red - Major zones only
  { name: "Kashmir Valley", center: { lat: 34.0, lng: 74.8 }, radius: 80000, risk: "very-high" },
  { name: "Northeast India", center: { lat: 26.0, lng: 93.0 }, radius: 120000, risk: "very-high" },
  { name: "Kutch Region", center: { lat: 23.5, lng: 69.5 }, radius: 60000, risk: "very-high" },
  
  // Zone IV (High Risk) - Orange - Key areas only
  { name: "Delhi NCR", center: { lat: 28.7, lng: 77.1 }, radius: 50000, risk: "high" },
  { name: "Himachal Pradesh", center: { lat: 31.1, lng: 77.1 }, radius: 80000, risk: "high" },
  { name: "Northern Bihar", center: { lat: 26.5, lng: 85.0 }, radius: 60000, risk: "high" },
  
  // Zone III (Moderate Risk) - Yellow - Main areas only
  { name: "Western Maharashtra", center: { lat: 19.0, lng: 73.5 }, radius: 80000, risk: "moderate" },
  { name: "Northern Kerala", center: { lat: 11.5, lng: 75.8 }, radius: 50000, risk: "moderate" },
];

const MapComponent: React.FC<{ 
  disasters?: Disaster[];
  resources?: Resource[];
  center: google.maps.LatLngLiteral; 
  zoom: number;
  onDisasterClick?: (disaster: Disaster) => void;
  onResourceClick?: (resource: Resource) => void;
  showEarthquakeZones?: boolean;
}> = ({ disasters = [], resources = [], center, zoom, onDisasterClick, onResourceClick, showEarthquakeZones = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);

  // Memoize color functions
  const getDisasterColor = useCallback((status: string): string => {
    switch (status) {
      case 'active': return '#dc2626';
      case 'monitoring': return '#ea580c';
      case 'resolved': return '#16a34a';
      default: return '#6b7280';
    }
  }, []);

  const getResourceColor = useCallback((type: string): string => {
    switch (type) {
      case 'shelter': return '#3b82f6';
      case 'food': return '#10b981';
      case 'medical': return '#ef4444';
      case 'transport': return '#8b5cf6';
      case 'supply': return '#f59e0b';
      default: return '#6b7280';
    }
  }, []);

  const getZoneColor = useCallback((risk: string): string => {
    switch (risk) {
      case 'very-high': return '#dc2626';
      case 'high': return '#ea580c';
      case 'moderate': return '#eab308';
      default: return '#6b7280';
    }
  }, []);

  // Optimized map initialization
  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: false, // Disable for faster loading
        streetViewControl: false, // Disable for faster loading
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
          }
        ]
      });
      
      // Set loading to false once map is ready
      google.maps.event.addListenerOnce(newMap, 'idle', () => {
        setIsLoading(false);
      });
      
      setMap(newMap);
    }
  }, [center, zoom]);

  // Optimized marker and zone rendering
  useEffect(() => {
    if (!map || isLoading) return;

    // Clear existing markers and circles efficiently
    markersRef.current.forEach(marker => marker.setMap(null));
    circlesRef.current.forEach(circle => circle.setMap(null));
    markersRef.current = [];
    circlesRef.current = [];

    const newMarkers: google.maps.Marker[] = [];
    const newCircles: google.maps.Circle[] = [];
    const infoWindow = new google.maps.InfoWindow();

    // Add earthquake zones with optimized rendering
    if (showEarthquakeZones) {
      const addZonesInBatches = () => {
        earthquakeZones.forEach((zone, index) => {
          setTimeout(() => {
            const circle = new google.maps.Circle({
              strokeColor: getZoneColor(zone.risk),
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: getZoneColor(zone.risk),
              fillOpacity: 0.25,
              map,
              center: zone.center,
              radius: zone.radius,
            });

            circle.addListener('click', () => {
              infoWindow.setContent(`
                <div style="padding: 8px; max-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; color: ${getZoneColor(zone.risk)};">${zone.name}</h3>
                  <p style="margin: 4px 0;"><strong>Risk Level:</strong> ${zone.risk.toUpperCase()}</p>
                  <p style="margin: 4px 0;">Earthquake prone zone in India</p>
                </div>
              `);
              infoWindow.setPosition(zone.center);
              infoWindow.open(map);
            });

            newCircles.push(circle);
          }, index * 50); // Stagger rendering for smoother performance
        });
      };
      
      addZonesInBatches();
    }

    // Add disaster markers with batch processing
    const addDisastersInBatches = () => {
      disasters.forEach((disaster, index) => {
        if (disaster.latitude && disaster.longitude) {
          setTimeout(() => {
            const marker = new google.maps.Marker({
              position: { lat: disaster.latitude!, lng: disaster.longitude! },
              map,
              title: disaster.title,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: getDisasterColor(disaster.status),
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
              zIndex: 1000,
            });

            marker.addListener('click', () => {
              infoWindow.setContent(`
                <div style="padding: 12px; max-width: 280px;">
                  <h3 style="margin: 0 0 8px 0; color: ${getDisasterColor(disaster.status)};">${disaster.title}</h3>
                  <div style="display: flex; align-items: center; margin: 6px 0;">
                    <div style="width: 12px; height: 12px; background: ${getDisasterColor(disaster.status)}; border-radius: 50%; margin-right: 8px;"></div>
                    <strong>Status:</strong> <span style="text-transform: capitalize; margin-left: 4px;">${disaster.status}</span>
                  </div>
                  <p style="margin: 4px 0;"><strong>Location:</strong> ${disaster.location_name}</p>
                  <p style="margin: 4px 0;">${disaster.description}</p>
                </div>
              `);
              infoWindow.open(map, marker);
              onDisasterClick?.(disaster);
            });

            newMarkers.push(marker);
          }, index * 25); // Faster staggering for markers
        }
      });
    };

    // Add resource markers with batch processing
    const addResourcesInBatches = () => {
      resources.forEach((resource, index) => {
        if (resource.latitude && resource.longitude) {
          setTimeout(() => {
            const marker = new google.maps.Marker({
              position: { lat: resource.latitude!, lng: resource.longitude! },
              map,
              title: resource.name,
              icon: {
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: getResourceColor(resource.type),
                fillOpacity: 0.9,
                strokeColor: '#fff',
                strokeWeight: 1,
              },
              zIndex: 999,
            });

            marker.addListener('click', () => {
              infoWindow.setContent(`
                <div style="padding: 8px; max-width: 250px;">
                  <h3 style="margin: 0 0 8px 0;">${resource.name}</h3>
                  <p style="margin: 4px 0;"><strong>Type:</strong> ${resource.type}</p>
                  <p style="margin: 4px 0;"><strong>Status:</strong> ${resource.status}</p>
                  <p style="margin: 4px 0;"><strong>Location:</strong> ${resource.location_name}</p>
                </div>
              `);
              infoWindow.open(map, marker);
              onResourceClick?.(resource);
            });

            newMarkers.push(marker);
          }, index * 25);
        }
      });
    };

    // Start batch rendering
    addDisastersInBatches();
    addResourcesInBatches();

    markersRef.current = newMarkers;
    circlesRef.current = newCircles;
  }, [map, disasters, resources, onDisasterClick, onResourceClick, showEarthquakeZones, isLoading, getDisasterColor, getResourceColor, getZoneColor]);

  return (
    <div className="relative">
      <div ref={ref} style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Initializing map...</p>
          </div>
        </div>
      )}
      
      {/* Simplified Legend */}
      {!isLoading && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border text-xs max-w-56">
          <h4 className="font-semibold mb-2 text-gray-800">Map Legend</h4>
          
          {showEarthquakeZones && (
            <div className="mb-2">
              <p className="font-medium text-gray-700 mb-1">Earthquake Zones:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  <span>Very High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                  <span>High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Moderate</span>
                </div>
              </div>
            </div>
          )}

          {disasters.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-1">Disasters:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                  <span>Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                  <span>Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <span>Resolved</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InteractiveMap: React.FC<MapProps> = ({ 
  disasters = [], 
  resources = [], 
  apiKey, 
  onDisasterClick, 
  onResourceClick, 
  center, 
  zoom = 10,
  showEarthquakeZones = false
}) => {
  const mapCenter = useMemo(() => center || { lat: 20.5937, lng: 78.9629 }, [center]);

  if (!apiKey) {
    return (
      <Card className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-dashed border-blue-300">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Google Maps Integration Ready</h3>
            <p className="text-blue-600">Enter your Google Maps API key to enable the interactive map</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Wrapper apiKey={apiKey}>
      <MapComponent 
        disasters={disasters}
        resources={resources}
        center={mapCenter} 
        zoom={zoom} 
        onDisasterClick={onDisasterClick}
        onResourceClick={onResourceClick}
        showEarthquakeZones={showEarthquakeZones}
      />
    </Wrapper>
  );
};

export default InteractiveMap;
