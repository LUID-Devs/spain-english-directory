import React, { useState } from "react";
import { UserWithStats } from "@/hooks/useApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Eye, 
  User, 
  Target, 
  Crown, 
  Check, 
  AlertTriangle,
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithStats | null;
  onUpdateRole: (userId: number, newRole: string) => Promise<void>;
}

const roles = [
  { 
    value: "viewer", 
    label: "Viewer", 
    description: "Can view projects and tasks",
    icon: Eye,
    variant: "outline" as const
  },
  { 
    value: "member", 
    label: "Member", 
    description: "Can create and edit tasks, comment on projects",
    icon: User,
    variant: "secondary" as const
  },
  { 
    value: "project_manager", 
    label: "Project Manager", 
    description: "Can manage projects and assign tasks",
    icon: Target,
    variant: "default" as const
  },
  { 
    value: "admin", 
    label: "Admin", 
    description: "Full access to all features and settings",
    icon: Crown,
    variant: "destructive" as const
  },
];

const RoleManagementModal = ({ isOpen, onClose, user, onUpdateRole }: RoleManagementModalProps) => {
  const [selectedRole, setSelectedRole] = useState("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (user) {
      // Set the current user's role or default to member
      setSelectedRole(user.role || "member");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      await onUpdateRole(user.userId, selectedRole);
      onClose();
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const currentRole = roles.find(role => role.value === user.role);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage User Role</DialogTitle>
          <DialogDescription>
            Update user permissions and access levels
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-center space-x-4 rounded-lg bg-muted p-4">
            <div className="relative">
              <img
                src={user.profilePictureUrl 
                  ? `https://pm-s3-images.s3.us-east-1.amazonaws.com/${user.profilePictureUrl}`
                  : `https://pm-s3-images.s3.us-east-1.amazonaws.com/p1.jpeg`
                }
                alt={`${user.username}'s profile`}
                className="h-16 w-16 rounded-full border-2 border-border object-cover"
              />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {user.username}
              </h3>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
              {currentRole && (
                <div className="mt-2">
                  <Badge variant={currentRole.variant} className="text-xs">
                    Current: {currentRole.label}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Select New Role</Label>
              <RadioGroup 
                value={selectedRole} 
                onValueChange={setSelectedRole}
                className="mt-4 space-y-3"
              >
                {roles.map((role) => {
                  const IconComponent = role.icon;
                  return (
                    <div
                      key={role.value}
                      className={cn(
                        "relative flex items-center space-x-4 rounded-lg border p-4 transition-all",
                        selectedRole === role.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <RadioGroupItem value={role.value} id={role.value} />
                      
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={role.value} className="text-base font-medium cursor-pointer">
                              {role.label}
                            </Label>
                            {selectedRole === role.value && (
                              <Badge variant="secondary" className="text-xs">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        </div>
                      </div>

                      {selectedRole === role.value && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Warning */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div>
                  <div className="font-medium mb-1">Role Change Notice</div>
                  <div className="text-sm">
                    Changing this user's role will immediately update their permissions and access to features across the platform.
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || selectedRole === user.role}
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  `Update to ${roles.find(r => r.value === selectedRole)?.label || 'Role'}`
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleManagementModal;