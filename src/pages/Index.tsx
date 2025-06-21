
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { DisasterList } from "@/components/DisasterList";
import { SocialMediaFeed } from "@/components/SocialMediaFeed";
import { ResourceMap } from "@/components/ResourceMap";
import { GlobalDisasterMap } from "@/components/GlobalDisasterMap";
import { ReportForm } from "@/components/ReportForm";
import { DisasterForm } from "@/components/DisasterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Users, MessageSquare, Plus, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const Index = () => {
  const [apiKey, setApiKey] = useState('');
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if API key is stored in localStorage
    const storedApiKey = localStorage.getItem('googleMapsApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  useEffect(() => {
    fetchDisasters();
    
    // Set up real-time subscription for disasters
    const channel = supabase
      .channel('disasters-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'disasters'
        },
        (payload) => {
          console.log('Real-time disaster update:', payload);
          fetchDisasters(); // Refetch disasters when changes occur
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Disaster Alert",
              description: `New disaster reported: ${payload.new.title}`,
              variant: "destructive"
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const fetchDisasters = async () => {
    try {
      const { data, error } = await supabase
        .from('disasters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching disasters:', error);
        toast({
          title: "Error",
          description: "Failed to fetch disasters",
          variant: "destructive"
        });
      } else {
        setDisasters(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisasterCreated = (disaster: any) => {
    console.log('New disaster created:', disaster);
    fetchDisasters(); // Refresh the list
  };

  // Calculate stats from real data
  const activeDisasters = disasters.filter(d => d.status === 'active').length;
  const monitoringDisasters = disasters.filter(d => d.status === 'monitoring').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Global Disaster Response Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Real-time monitoring and coordination for emergency response worldwide
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Disasters</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDisasters}</div>
              <p className="text-xs text-muted-foreground">Real-time data</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
              <MapPin className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monitoringDisasters}</div>
              <p className="text-xs text-muted-foreground">Under observation</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Disasters</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{disasters.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports Processed</CardTitle>
              <MessageSquare className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+23 pending review</p>
            </CardContent>
          </Card>
        </div>

        {/* Map Button */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-700">
                <MapPin className="h-6 w-6" />
                <span>India Earthquake Risk Map</span>
              </CardTitle>
              <CardDescription className="text-red-600">
                View detailed earthquake risk zones and disaster locations across India
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
                <a href="/map">
                  <MapPin className="h-5 w-5 mr-2" />
                  Open Interactive Map
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="disasters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="disasters">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Disasters
            </TabsTrigger>
            <TabsTrigger value="resources">
              <MapPin className="h-4 w-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="reports">
              <MessageSquare className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="h-4 w-4 mr-2" />
              Create
            </TabsTrigger>
          </TabsList>

          <TabsContent value="disasters">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {loading ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p>Loading disasters...</p>
                    </CardContent>
                  </Card>
                ) : (
                  <DisasterList disasters={disasters} />
                )}
              </div>
              <div>
                <SocialMediaFeed />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources">
            <ResourceMap />
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submit New Report</CardTitle>
                  <CardDescription>
                    Report a new incident or provide updates on an existing disaster
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReportForm />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>
                    Latest incident reports from the field
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Flooding in downtown area</h4>
                        <Badge variant="destructive">Urgent</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Water levels rising rapidly, need immediate evacuation assistance
                      </p>
                      <p className="text-xs text-gray-400 mt-2">2 minutes ago</p>
                    </div>
                    
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Power outage affecting shelter</h4>
                        <Badge variant="secondary">High</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Backup generators needed for emergency shelter
                      </p>
                      <p className="text-xs text-gray-400 mt-2">15 minutes ago</p>
                    </div>
                    
                    <div className="border-l-4 border-green-500 pl-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Medical supplies delivered</h4>
                        <Badge variant="default">Normal</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Successfully delivered medical supplies to affected area
                      </p>
                      <p className="text-xs text-gray-400 mt-2">1 hour ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Disaster Record</CardTitle>
                  <CardDescription>
                    Add a new disaster to the tracking system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DisasterForm onDisasterCreated={handleDisasterCreated} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Guidelines</CardTitle>
                  <CardDescription>
                    Follow these guidelines when creating disaster records
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Accuracy</h4>
                    <p className="text-sm text-blue-800">
                      Ensure all information is accurate and verified before submitting
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Location</h4>
                    <p className="text-sm text-green-800">
                      Provide specific location details to help responders locate the incident
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Tags</h4>
                    <p className="text-sm text-orange-800">
                      Use relevant tags to help categorize and filter disasters effectively
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Updates</h4>
                    <p className="text-sm text-purple-800">
                      Keep disaster records updated as the situation evolves
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
