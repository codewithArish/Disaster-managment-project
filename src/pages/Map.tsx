
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { GlobalDisasterMap } from "@/components/GlobalDisasterMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

const Map = () => {
  const [apiKey, setApiKey] = useState('');
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if API key is stored in localStorage
    const storedApiKey = localStorage.getItem('googleMapsApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const { data, error } = await supabase
        .from('disasters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching disasters:', error);
      } else {
        setDisasters(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 mb-2">
            <MapPin className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              India Earthquake Risk Map
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Interactive map showing earthquake risk zones and disaster locations across India
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <span>Live Disaster & Earthquake Zone Map</span>
            </CardTitle>
            <CardDescription>
              Red zones indicate very high earthquake risk, orange for high risk, and yellow for moderate risk
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[700px] w-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <span className="ml-3">Loading map...</span>
                </div>
              ) : (
                <GlobalDisasterMap apiKey={apiKey} disasters={disasters} />
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Map;
