
import { useGetTeamsQuery } from "@/hooks/useApi";
import { useGlobalStore } from "@/stores/globalStore";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const CustomToolBar = () => (
  <GridToolbarContainer className="toolbar flex gap-2 p-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70, minWidth: 50, flex: 0 },
  { field: "teamName", headerName: "Team Name", minWidth: 120, flex: 1 },
  { field: "productOwnerUsername", headerName: "Product Owner", minWidth: 120, flex: 1 },
  { field: "projectManagerUsername", headerName: "Project Manager", minWidth: 120, flex: 1 },
];

// Mobile card view for a single team
const TeamCard = ({ team }: { team: any }) => (
  <Card className="mb-3">
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">
            {team.teamName?.charAt(0)?.toUpperCase() || 'T'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{team.teamName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Team ID: {team.id}</p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {team.productOwnerUsername && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">Owner</Badge>
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px] bg-gray-100 text-gray-700">
                  {team.productOwnerUsername?.charAt(0)?.toUpperCase() || 'P'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground truncate">{team.productOwnerUsername}</span>
            </div>
          </div>
        )}
        {team.projectManagerUsername && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">Manager</Badge>
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px] bg-gray-100 text-gray-700">
                  {team.projectManagerUsername?.charAt(0)?.toUpperCase() || 'M'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground truncate">{team.projectManagerUsername}</span>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

const Teams = () => {
  const { data: teams, isLoading, isError } = useGetTeamsQuery();
  const isDarkMode = useGlobalStore().isDarkMode;

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 flex-shrink-0" />
              <div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl">Teams</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Loading team members...</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex items-center justify-center h-24 sm:h-32">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground text-sm">Loading teams...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !teams) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 flex-shrink-0" />
              <div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl">Teams</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Error loading teams</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="flex flex-col items-center justify-center h-24 sm:h-32 text-center space-y-3">
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <p className="text-muted-foreground text-sm">Failed to load teams</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 flex-shrink-0" />
            <div>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl">Teams</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage your workspace teams and members
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-full bg-gray-100 dark:bg-gray-900/20 flex-shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Teams</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-600 dark:text-gray-400">
                {teams.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile: Card View */}
      <div className="md:hidden">
        {teams.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No teams found</p>
            </CardContent>
          </Card>
        ) : (
          teams.map((team: any) => <TeamCard key={team.id} team={team} />)
        )}
      </div>

      {/* Desktop: DataGrid View */}
      <Card className="hidden md:block overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[500px] lg:h-[600px] w-full">
            <DataGrid
              rows={teams || []}
              columns={columns}
              pagination
              slots={{ toolbar: CustomToolBar }}
              className={dataGridClassNames}
              sx={{
                ...dataGridSxStyles(isDarkMode),
                border: 'none',
                '& .MuiDataGrid-main': {
                  overflow: 'auto',
                },
              }}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Teams;
