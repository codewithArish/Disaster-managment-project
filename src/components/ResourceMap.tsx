import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Users, Car, Home, Key, Search, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LazyInteractiveMap from "./LazyInteractiveMap";

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

export const ResourceMap = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchResources();
    const storedApiKey = localStorage.getItem('googleMapsApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setShowApiKeyInput(false);
    }
  }, []);

  // Filter resources whenever search criteria change
  useEffect(() => {
    let filtered = [...resources];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.name.toLowerCase().includes(term) ||
        resource.location_name.toLowerCase().includes(term) ||
        resource.type.toLowerCase().includes(term)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(resource => resource.status === selectedStatus);
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, selectedType, selectedStatus]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Sample data for demonstration
      const resourceData = data && data.length > 0 ? data : [
        {
          id: '1',
          name: 'Red Cross Emergency Shelter',
          type: 'shelter',
          location_name: 'Lower East Side, NYC',
          latitude: 40.7180,
          longitude: -73.9857,
          capacity: 150,
          current_occupancy: 89,
          status: 'available',
          contact: '+1-555-0123',
          amenities: ['Food', 'Medical', 'Clothing', 'WiFi'],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Community Food Bank',
          type: 'food',
          location_name: 'East Village, NYC',
          latitude: 40.7282,
          longitude: -73.9942,
          capacity: 300,
          current_occupancy: 145,
          status: 'available',
          contact: '+1-555-0456',
          amenities: ['Hot Meals', 'Supplies', 'Water'],
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'NYC Health Emergency Center',
          type: 'medical',
          location_name: 'SoHo, NYC',
          latitude: 40.7230,
          longitude: -74.0020,
          capacity: 75,
          current_occupancy: 68,
          status: 'limited',
          contact: '+1-555-0789',
          amenities: ['Emergency Care', 'Pharmacy', 'Mental Health'],
          created_at: new Date().toISOString()
        }
      ];
      
      setResources(resourceData);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Failed to fetch resources. Showing sample data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('googleMapsApiKey', apiKey.trim());
      setShowApiKeyInput(false);
      toast({
        title: "Success",
        description: "Google Maps API key saved successfully!",
      });
    }
  };

  const handleResourceClick = (resource: Resource) => {
    setSelectedResource(resource);
    const element = document.getElementById(`resource-${resource.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shelter': return Home;
      case 'food': return Users;
      case 'medical': return Phone;
      case 'transport': return Car;
      default: return MapPin;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'limited': return 'secondary';
      case 'full': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading resources...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Resource Map</h2>
        <Badge variant="outline">
          {filteredResources.length} Resources Found
        </Badge>
      </div>

      {/* API Key Input */}
      {showApiKeyInput && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Key className="h-5 w-5 mr-2 text-blue-600" />
              Google Maps API Key Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google Maps API key"
              />
              <Button onClick={handleApiKeySubmit} disabled={!apiKey.trim()}>
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="all">All Types</option>
                <option value="shelter">Shelter</option>
                <option value="food">Food</option>
                <option value="medical">Medical</option>
                <option value="transport">Transport</option>
                <option value="supply">Supplies</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="limited">Limited</option>
                <option value="full">Full</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimized Interactive Map */}
      <LazyInteractiveMap 
        resources={filteredResources} 
        apiKey={apiKey} 
        onResourceClick={handleResourceClick}
        zoom={12}
      />

      {/* Resource List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((resource) => {
          const TypeIcon = getTypeIcon(resource.type);
          const isSelected = selectedResource?.id === resource.id;
          
          return (
            <Card 
              key={resource.id} 
              id={`resource-${resource.id}`}
              className={`hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                      <CardDescription className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {resource.location_name}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(resource.status)}>
                    {resource.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {resource.capacity && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Capacity
                      </span>
                      <span>{resource.current_occupancy}/{resource.capacity}</span>
                    </div>
                  )}
                  
                  {resource.contact && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Contact
                      </span>
                      <a href={`tel:${resource.contact}`} className="text-blue-600 hover:underline">
                        {resource.contact}
                      </a>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(`https://maps.google.com/maps?daddr=${resource.latitude},${resource.longitude}`, '_blank')}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Directions
                    </Button>
                    {resource.contact && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`tel:${resource.contact}`)}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No resources match your search criteria</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedStatus('all');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
