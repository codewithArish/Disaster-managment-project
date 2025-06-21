
import LazyInteractiveMap from "./LazyInteractiveMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Key } from "lucide-react";
import { useState } from "react";

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

interface GlobalDisasterMapProps {
  apiKey: string;
  disasters?: Disaster[];
}

export const GlobalDisasterMap = ({ apiKey, disasters = [] }: GlobalDisasterMapProps) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  const handleSaveApiKey = () => {
    localStorage.setItem('googleMapsApiKey', tempApiKey);
    window.location.reload();
  };

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Google Maps Configuration</span>
          </CardTitle>
          <CardDescription>
            Enter your Google Maps API key to enable the interactive disaster map
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="password"
              placeholder="Enter Google Maps API Key"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
            />
            <Button onClick={handleSaveApiKey} disabled={!tempApiKey.trim()}>
              Save Key
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Get your API key from the{" "}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Cloud Console
            </a>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden">
      <LazyInteractiveMap 
        apiKey={apiKey}
        disasters={disasters}
        center={{ lat: 20.5937, lng: 78.9629 }}
        zoom={5}
        showEarthquakeZones={true}
      />
    </div>
  );
};
