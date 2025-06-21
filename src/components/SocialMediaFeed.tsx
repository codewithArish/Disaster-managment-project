
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Share, Heart, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const SocialMediaFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialMediaPosts();
  }, []);

  const fetchSocialMediaPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching social media posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'normal': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    return priority === 'urgent' ? AlertTriangle : MessageCircle;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (loading) {
    return <div>Loading social media feed...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Social Media Feed</h2>
        <Badge variant="outline">
          Live Updates
        </Badge>
      </div>

      <div className="space-y-4">
        {posts.map((post: any) => {
          const PriorityIcon = getPriorityIcon(post.priority);
          
          return (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <PriorityIcon className="h-5 w-5 text-blue-500" />
                    <div>
                      <CardTitle className="text-lg">{post.user_handle}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <span>{post.platform}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(post.created_at)}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(post.priority)}>
                    {post.priority}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 mb-4">{post.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Share className="h-4 w-4" />
                      <span>{post.shares}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Verify
                    </Button>
                    <Button variant="outline" size="sm">
                      Track
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {posts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No social media posts yet</p>
            <p className="text-gray-400">Posts will appear here as they are added to the system</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
