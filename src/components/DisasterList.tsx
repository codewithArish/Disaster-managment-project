
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, User, AlertTriangle, Eye, Edit, Trash2 } from "lucide-react";

interface Disaster {
  id: string;
  title: string;
  location_name: string;
  description: string;
  tags: string[];
  owner_id: string;
  created_at: string;
  status: string;
}

interface DisasterListProps {
  disasters: Disaster[];
}

export const DisasterList = ({ disasters }: DisasterListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500';
      case 'monitoring': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'urgent': return 'destructive';
      case 'flood': return 'default';
      case 'fire': case 'wildfire': return 'secondary';
      case 'evacuation': return 'outline';
      default: return 'secondary';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Disaster Records</h2>
        <Badge variant="outline">
          {disasters.length} Total
        </Badge>
      </div>

      {disasters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No disasters recorded yet</p>
            <p className="text-gray-400">Create your first disaster record to get started</p>
          </CardContent>
        </Card>
      ) : (
        disasters.map((disaster) => (
          <Card key={disaster.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(disaster.status)}`}></div>
                    <CardTitle className="text-xl">{disaster.title}</CardTitle>
                  </div>
                  
                  <CardDescription className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{disaster.location_name}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTimeAgo(disaster.created_at)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{disaster.owner_id}</span>
                    </span>
                  </CardDescription>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-700 mb-4">{disaster.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {disaster.tags.map((tag) => (
                  <Badge key={tag} variant={getTagColor(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
