import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Settings, Check, Loader2, Users } from 'lucide-react';
import { useViewSubscriptions } from '@/hooks/useViewSubscriptions';
import { ViewSubscriptionConfig } from '@/services/apiService';

interface ViewSubscriptionButtonProps {
  viewId: number;
  viewName: string;
  onSubscriptionChange?: (isSubscribed: boolean) => void;
}

export const ViewSubscriptionButton: React.FC<ViewSubscriptionButtonProps> = ({
  viewId,
  viewName,
  onSubscriptionChange,
}) => {
  const { subscribe, unsubscribe, getStatus, updateSettings } = useViewSubscriptions();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localConfig, setLocalConfig] = useState<Partial<ViewSubscriptionConfig>>({
    notifyOnCreate: true,
    notifyOnUpdate: true,
    notifyOnAssign: false,
    notifyOnStatusChange: false,
    emailNotifications: true,
    inAppNotifications: true,
    digestFrequency: 'immediate',
  });

  // Check subscription status on mount
  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      const status = await getStatus(viewId);
      setIsSubscribed(status.isSubscribed);
      setSubscription(status.subscription);
      if (status.subscription) {
        setLocalConfig({
          notifyOnCreate: status.subscription.notifyOnCreate,
          notifyOnUpdate: status.subscription.notifyOnUpdate,
          notifyOnAssign: status.subscription.notifyOnAssign,
          notifyOnStatusChange: status.subscription.notifyOnStatusChange,
          emailNotifications: status.subscription.emailNotifications,
          inAppNotifications: status.subscription.inAppNotifications,
          digestFrequency: status.subscription.digestFrequency as any,
        });
      }
      setIsChecking(false);
    };
    checkStatus();
  }, [viewId, getStatus]);

  const handleSubscribe = useCallback(async () => {
    setIsLoading(true);
    const success = await subscribe(viewId, localConfig);
    if (success) {
      setIsSubscribed(true);
      onSubscriptionChange?.(true);
      const status = await getStatus(viewId);
      setSubscription(status.subscription);
    }
    setIsLoading(false);
  }, [viewId, subscribe, localConfig, onSubscriptionChange, getStatus]);

  const handleUnsubscribe = useCallback(async () => {
    setIsLoading(true);
    const success = await unsubscribe(viewId);
    if (success) {
      setIsSubscribed(false);
      setSubscription(null);
      onSubscriptionChange?.(false);
    }
    setIsLoading(false);
  }, [viewId, unsubscribe, onSubscriptionChange]);

  const handleUpdateSettings = useCallback(async () => {
    if (!subscription) return;
    setIsLoading(true);
    await updateSettings(subscription.id, localConfig);
    setIsLoading(false);
    setSettingsOpen(false);
  }, [subscription, localConfig, updateSettings]);

  if (isChecking) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!isSubscribed) {
    return (
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            Subscribe
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to View</DialogTitle>
            <DialogDescription>
              Get notified when tasks match "{viewName}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <SubscriptionSettingsForm config={localConfig} onChange={setLocalConfig} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubscribe} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
              Subscribe
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="sm" className="gap-2">
          <Check className="h-4 w-4" />
          Subscribed
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Subscription Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Settings className="h-4 w-4 mr-2" />
              Notification Settings
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Notification Settings</DialogTitle>
              <DialogDescription>
                Configure notifications for "{viewName}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <SubscriptionSettingsForm config={localConfig} onChange={setLocalConfig} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSettings} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <DropdownMenuItem onClick={handleUnsubscribe} className="text-destructive">
          <BellOff className="h-4 w-4 mr-2" />
          Unsubscribe
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface SubscriptionSettingsFormProps {
  config: Partial<ViewSubscriptionConfig>;
  onChange: (config: Partial<ViewSubscriptionConfig>) => void;
}

const SubscriptionSettingsForm: React.FC<SubscriptionSettingsFormProps> = ({ config, onChange }) => {
  const updateConfig = (key: keyof ViewSubscriptionConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Notify me when:</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyOnCreate" className="text-sm cursor-pointer">New task matches view</Label>
            <Switch
              id="notifyOnCreate"
              checked={config.notifyOnCreate}
              onCheckedChange={(v) => updateConfig('notifyOnCreate', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyOnUpdate" className="text-sm cursor-pointer">Task update matches view</Label>
            <Switch
              id="notifyOnUpdate"
              checked={config.notifyOnUpdate}
              onCheckedChange={(v) => updateConfig('notifyOnUpdate', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyOnAssign" className="text-sm cursor-pointer">Task assigned to me</Label>
            <Switch
              id="notifyOnAssign"
              checked={config.notifyOnAssign}
              onCheckedChange={(v) => updateConfig('notifyOnAssign', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyOnStatusChange" className="text-sm cursor-pointer">Task status changes</Label>
            <Switch
              id="notifyOnStatusChange"
              checked={config.notifyOnStatusChange}
              onCheckedChange={(v) => updateConfig('notifyOnStatusChange', v)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <Label className="text-sm font-medium">Delivery preferences:</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNotifications" className="text-sm cursor-pointer">Email notifications</Label>
            <Switch
              id="emailNotifications"
              checked={config.emailNotifications}
              onCheckedChange={(v) => updateConfig('emailNotifications', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="inAppNotifications" className="text-sm cursor-pointer">In-app notifications</Label>
            <Switch
              id="inAppNotifications"
              checked={config.inAppNotifications}
              onCheckedChange={(v) => updateConfig('inAppNotifications', v)}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Label htmlFor="digestFrequency" className="text-sm font-medium">Digest frequency:</Label>
        <select
          id="digestFrequency"
          value={config.digestFrequency}
          onChange={(e) => updateConfig('digestFrequency', e.target.value)}
          className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="immediate">Immediate</option>
          <option value="hourly">Hourly digest</option>
          <option value="daily">Daily digest</option>
        </select>
      </div>
    </div>
  );
};

export default ViewSubscriptionButton;
