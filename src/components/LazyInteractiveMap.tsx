
import { lazy, Suspense } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const InteractiveMap = lazy(() => import('./InteractiveMap'));

interface LazyInteractiveMapProps {
  disasters?: any[];
  resources?: any[];
  apiKey: string;
  onDisasterClick?: (disaster: any) => void;
  onResourceClick?: (resource: any) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  showEarthquakeZones?: boolean;
}

const MapLoadingFallback = () => (
  <div className="h-full w-full flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading interactive map...</p>
    </div>
  </div>
);

const LazyInteractiveMap = (props: LazyInteractiveMapProps) => {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <InteractiveMap {...props} />
    </Suspense>
  );
};

export default LazyInteractiveMap;
