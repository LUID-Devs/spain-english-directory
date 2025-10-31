import React from "react";
import ReusablePriorityPage from "@/app/dashboard/priority/reusablePriorityPage";
import { Priority } from "@/hooks/useApi";

const UrgentPriorityPage = () => {
  return <ReusablePriorityPage priority={Priority.Urgent} />;
};

export default UrgentPriorityPage;