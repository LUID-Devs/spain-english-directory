import React from "react";
import ReusablePriorityPage from "@/app/dashboard/priority/reusablePriorityPage";
import { Priority } from "@/hooks/useApi";

const BacklogPriorityPage = () => {
  return <ReusablePriorityPage priority={Priority.Backlog} />;
};

export default BacklogPriorityPage;