import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Loader2 } from "lucide-react";
import { useGetTeamsQuery } from "@/hooks/useApi";

interface Team {
  id: number;
  name: string;
  description?: string;
}

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (invitationData: {
    email: string;
    teamId: number;
    role: string;
  }) => void;
}

const InviteUserModal = ({ isOpen, onClose, onInvite }: InviteUserModalProps) => {
  const [email, setEmail] = useState("");
  const [teamId, setTeamId] = useState("");
  const [role, setRole] = useState("member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  
  // Fetch teams dynamically from API
  const { data: teams, isLoading: isLoadingTeams, isError: isTeamsError } = useGetTeamsQuery(undefined, {
    skip: !isOpen, // Only fetch when modal is open
  });

  // Set default team when teams load
  useEffect(() => {
    if (teams && teams.length > 0 && !teamId) {
      setTeamId(String(teams[0].id));
    }
  }, [teams, teamId]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrors({});

    // Validation
    if (!email.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    // Validate teamId is selected
    if (!teamId || teamId === "") {
      setErrors({ email: "Please select a team" });
      return;
    }

    setIsSubmitting(true);

    try {
      await onInvite({
        email: email.trim(),
        teamId: Number(teamId),
        role,
      });

      // Reset form
      setEmail("");
      setTeamId(teams && teams.length > 0 ? String(teams[0].id) : "");
      setRole("member");
      onClose();
    } catch (error) {
      console.error("Error inviting user:", error);
      setErrors({ email: "Failed to send invitation. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setTeamId(teams && teams.length > 0 ? String(teams[0].id) : "");
    setRole("member");
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} name="Invite Team Member">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              disabled={isSubmitting}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamId">Team</Label>
            <Select 
              value={teamId} 
              onValueChange={setTeamId} 
              disabled={isSubmitting || isLoadingTeams}
            >
              <SelectTrigger>
                {isLoadingTeams ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading teams...
                  </span>
                ) : (
                  <SelectValue placeholder="Select a team" />
                )}
              </SelectTrigger>
              <SelectContent>
                {isTeamsError ? (
                  <SelectItem value="__teams_load_failed__" disabled>
                    Failed to load teams
                  </SelectItem>
                ) : teams && teams.length > 0 ? (
                  teams.map((team: Team) => (
                    <SelectItem key={team.id} value={String(team.id)}>
                      {team.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="__no_teams_available__" disabled>
                    No teams available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {isTeamsError && (
              <p className="text-sm text-destructive">
                Failed to load teams. Please try again.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              An invitation email will be sent to this address. The user will need to
              create an account to join your team.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isTeamsError || !teamId}
              className="flex-1"
            >
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default InviteUserModal;
