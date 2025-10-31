
import { useGlobalStore } from "@/stores/globalStore";
import Header from "@/components/Header";
import ModalNewTask from "@/components/ModalNewTask";
import TaskCard from "@/components/TaskCard";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Priority, Task } from "@/hooks/useApi";
import { useGetTasksByUserQuery } from "@/hooks/useApi";
import { useCurrentUser } from "@/stores/userStore";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";
import { useAuth } from "@/app/authProvider";

type Props = {
  priority: Priority;
};

const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 100,
  },
  {
    field: "description",
    headerName: "Description",
    width: 200,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => (
      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
        {params.value}
      </span>
    ),
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 75,
  },
  {
    field: "tags",
    headerName: "Tags",
    width: 130,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 130,
  },
  {
    field: "dueDate",
    headerName: "Due Date",
    width: 130,
  },
  {
    field: "author",
    headerName: "Author",
    width: 150,
    renderCell: (params) => params.value?.author || "Unknown",
  },
  {
    field: "assignee",
    headerName: "Assignee",
    width: 150,
    renderCell: (params) => params.value?.assignee || "Unassigned",
  },
];

const ReusablePriorityPage = ({ priority }: Props) => {
  const [view, setView] = useState("list");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const auth = useAuth();
  const { currentUser, isLoading: userLoading } = useCurrentUser();
  const userId = currentUser?.userId ?? null;
  
  
  const {
    data: tasks,
    isLoading,
    isError: isTasksError,
  } = useGetTasksByUserQuery(userId || 0, { skip: userId === null });

  const isDarkMode = useGlobalStore((state) => state.isDarkMode);
  const filteredTasks = tasks?.filter(
    (task: Task) => task.priority === priority,
  );

  if (userLoading || isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (!auth.user || userId === null) {
    return <div>Please log in to view your tasks</div>;
  }

  if (isTasksError) {
    return <div>Error fetching tasks</div>;
  }

  if (!tasks || tasks.length === 0) {
    return <div>No tasks found</div>;
  }

  return (
    <div className="m-5 p-4">
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
      />
      <Header
        name="Priority Page"
        buttonComponent={
          <button
            className="mr-3 bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            Add Task
          </button>
        }
      />
      <div className="m-b flex justify-start">
        <button
          className={`px-4 py-2 ${view === "list" ? "bg-gray-300" : "bg-white"}`}
          onClick={() => setView("list")}
        >
          List
        </button>
        <button
          className={`px-4 py-2 ${view === "table" ? "bg-gray-300" : "bg-white"}`}
          onClick={() => setView("table")}
        >
          Table
        </button>
      </div>
      {view === "list" ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks?.map((task: Task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        view === "table" &&
        filteredTasks && (
          <div className="w-full">
            <DataGrid
              rows={filteredTasks}
              columns={columns}
              checkboxSelection
              getRowId={(row) => row.id}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
        )
      )}
    </div>
  );
};

export default ReusablePriorityPage;
