import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Loader2, Settings } from "lucide-react";
import { useViewSubscriptions } from "@/hooks/useViewSubscriptions";
import { cn } from "@/lib/utils";

interface ViewSubscriptionButtonProps {
  viewId: number;
  viewName: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export const ViewSubscriptionButton: React.FC<ViewSubscriptionButtonProps> = ({
  viewId,
  viewName,
  className,
  variant = "outline",
  size = "sm",
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  
  const { subscribe, unsubscribe, updateSettings, getStatus } = useViewSubscriptions();

  const [localSettings, setLocalSettings] = useState({
    notifyOnNewTasks: true,
    notifyOnStatusChange: true,
    notifyOnAssignment: false,
    emailNotifications: true,
    pushNotifications: true,
  });

  // Check subscription status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const status = await getStatus(viewId);
      setIsSubscribed(status.isSubscribed);
      setCurrentSubscription(status.subscription);
      if (status.subscription) {
        setLocalSettings({
          notifyOnNewTasks: status.subscription.notifyOnNewTasks ?? true,
          notifyOnStatusChange: status.subscription.notifyOnStatusChange ?? true,
          notifyOnAssignment: status.subscription.notifyOnAssignment ?? false,
          emailNotifications: status.subscription.emailNotifications ?? true,
          pushNotifications: status.subscription.pushNotifications ?? true,
        });
      }
    };
    checkStatus();
  }, [viewId, getStatus]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    const success = await subscribe(viewId, localSettings);
    if (success) {
      setIsSubscribed(true);
      const status = await getStatus(viewId);
      setCurrentSubscription(status.subscription);
    }
    setIsLoading(false);
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    const success = await unsubscribe(viewId);
    if (success) {
      setIsSubscribed(false);
      setCurrentSubscription(null);
    }
    setIsLoading(false);
  };

  const handleUpdateSettings = async () => {
    if (!currentSubscription) return;
    setIsLoading(true);
    const success = await updateSettings(currentSubscription.id, localSettings);
    if (success) {
      setSettingsOpen(false);
    }
    setIsLoading(false);
  };

  if (isSubscribed) {
    return (
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={cn("gap-1.5", className)}
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Subscribed</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>View Notification Settings</DialogTitle>
            <DialogDescription>
              Configure how you want to be notified about changes to &quot;{viewName}&quot;
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-tasks">New Tasks</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when new tasks match this view
                </p>
              </div>
              <Switch
                id="new-tasks"
                checked={localSettings.notifyOnNewTasks}
                onCheckedChange={(checked) =>
                  setLocalSettings((prev) => ({ ...prev, notifyOnNewTasks: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="status-change">Status Changes</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when task status changes
                </p>
              </div>
              <Switch
                id="status-change"
                checked={localSettings.notifyOnStatusChange}
                onCheckedChange={(checked) =>
                  setLocalSettings((prev) => ({ ...prev, notifyOnStatusChange: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="assignment">Assignments</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when tasks are assigned or reassigned
                </p>
              </div>
              <Switch
                id="assignment"
                checked={localSettings.notifyOnAssignment}
                onCheckedChange={(checked) =>
                  setLocalSettings((prev) => ({ ...prev, notifyOnAssignment: checked }))
                }
              />
            </div>
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications
                  </p>
                </div>
                <Switch
                  id="email"
                  checked={localSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setLocalSettings((prev) => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in browser
                  </p>
                </div>
                <Switch
                  id="push"
                  checked={localSettings.pushNotifications}
                  onCheckedChange={(checked) =>
                    setLocalSettings((prev) => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={handleUnsubscribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BellOff className="h-4 w-4 mr-1" />
              )}
              Unsubscribe
            </Button>
            <Button onClick={handleUpdateSettings} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Settings className="h-4 w-4 mr-1" />
              )}
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-1.5", className)}
        >
          <BellOff className="h-4 w-4" />
          <span className="hidden sm:inline">Subscribe</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Subscribe to View</DialogTitle>
          <DialogDescription>
            Get notified when tasks change in &quot;{viewName}&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sub-new-tasks">New Tasks</Label>
              <p className="text-sm text-muted-foreground">
                Notify when new tasks match this view
              </p>
            </div>
            <Switch
              id="sub-new-tasks"
              checked={localSettings.notifyOnNewTasks}
              onCheckedChange={(checked) =>
                setLocalSettings((prev) => ({ ...prev, notifyOnNewTasks: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sub-status-change">Status Changes</Label>
              <p className="text-sm text-muted-foreground">
                Notify when task status changes
              </p>
            </div>
            <Switch
              id="sub-status-change"
              checked={localSettings.notifyOnStatusChange}
              onCheckedChange={(checked) =>
                setLocalSettings((prev) => ({ ...prev, notifyOnStatusChange: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sub-assignment">Assignments</Label>
              <p className="text-sm text-muted-foreground">
                Notify when tasks are assigned or reassigned
              </p>
            </div>
            <Switch
              id="sub-assignment"
              checked={localSettings.notifyOnAssignment}
              onCheckedChange={(checked) =>
                setLocalSettings((prev) => ({ ...prev, notifyOnAssignment: checked }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubscribe} disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Bell className="h-4 w-4 mr-1" />
            )}
            Subscribe to Notifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSubscriptionButton;
