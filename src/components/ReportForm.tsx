
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ReportForm = () => {
  const [formData, setFormData] = useState({
    disaster_id: "",
    content: "",
    image_url: "",
    priority: "normal"
  });
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      const { data, error } = await supabase
        .from('disasters')
        .select('id, title')
        .eq('status', 'active');

      if (error) throw error;
      setDisasters(data || []);
    } catch (error) {
      console.error('Error fetching disasters:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('reports')
        .insert([{
          disaster_id: formData.disaster_id || null,
          content: formData.content,
          image_url: formData.image_url || null,
          priority: formData.priority
        }]);

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Your report has been submitted for verification",
      });

      // Reset form
      setFormData({
        disaster_id: "",
        content: "",
        image_url: "",
        priority: "normal"
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="disaster">Related Disaster</Label>
        <Select
          value={formData.disaster_id}
          onValueChange={(value) => setFormData(prev => ({ ...prev, disaster_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a disaster" />
          </SelectTrigger>
          <SelectContent>
            {disasters.map((disaster: any) => (
              <SelectItem key={disaster.id} value={disaster.id}>
                {disaster.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="content">Report Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Describe what you're observing or what help is needed..."
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="image">Image URL (Optional)</Label>
        <div className="relative">
          <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="image"
            value={formData.image_url}
            onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
            placeholder="https://example.com/image.jpg"
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="priority">Priority Level</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        <Send className="h-4 w-4 mr-2" />
        {loading ? "Submitting..." : "Submit Report"}
      </Button>
    </form>
  );
};
