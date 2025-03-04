
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useTask } from "@/contexts/TaskContext";
import { Plus, List, Clock, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const { spaces, createSpace } = useTask();
  const [newSpaceName, setNewSpaceName] = useState("");
  const navigate = useNavigate();

  const handleCreateSpace = () => {
    if (newSpaceName.trim()) {
      createSpace(newSpaceName.trim());
      setNewSpaceName("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Spaces</h1>
            <p className="text-gray-500 mt-1">Manage your projects and tasks</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New Space
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Space</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Space name"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                />
                <Button onClick={handleCreateSpace} className="w-full">
                  Create Space
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {spaces.map((space) => (
            <Card 
              key={space.id} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/space/${space.id}`)}
            >
              <h3 className="text-xl font-semibold mb-4">{space.name}</h3>
              <Progress
                value={(space.tasks.filter(t => t.completed).length / Math.max(space.tasks.length, 1)) * 100}
                className="mb-4"
              />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  <span>{space.tasks.length} tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{space.tasks.filter(t => !t.completed).length} pending</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Navigation />
      </div>
    </div>
  );
}
