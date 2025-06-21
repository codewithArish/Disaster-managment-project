import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DisasterFormProps {
  onDisasterCreated: (disaster: any) => void;
}

export const DisasterForm = ({ onDisasterCreated }: DisasterFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    location_name: "",
    description: "",
    tags: []
  });
  const [currentTag, setCurrentTag] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const commonTags = ["flood", "fire", "earthquake", "hurricane", "tornado", "evacuation", "urgent", "medical"];

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setCurrentTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('disasters')
        .insert([{
          title: formData.title,
          location_name: formData.location_name,
          description: formData.description,
          tags: formData.tags,
          owner_id: "user", // You can replace this with actual user ID when auth is implemented
          status: "active"
        }])
        .select()
        .single();

      if (error) throw error;

      onDisasterCreated(data);
      
      // Reset form
      setFormData({
        title: "",
        location_name: "",
        description: "",
        tags: []
      });

      toast({
        title: "Success",
        description: "Disaster record created successfully",
      });
    } catch (error) {
      console.error('Error creating disaster:', error);
      toast({
        title: "Error",
        description: "Failed to create disaster record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Disaster Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., NYC Flood"
          required
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="location"
            value={formData.location_name}
            onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
            placeholder="e.g., Manhattan, NYC"
            className="pl-10"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the disaster situation..."
          rows={3}
          required
        />
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-2 mb-2">
          <Input
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag(currentTag))}
            placeholder="Add custom tag..."
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleAddTag(currentTag)}
            disabled={!currentTag}
          >
            Add
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {commonTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddTag(tag)}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              disabled={formData.tags.includes(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Disaster Record"}
      </Button>
    </form>
  );
};
