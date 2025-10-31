import React from "react";
import ReusablePriorityPage from "@/app/dashboard/priority/reusablePriorityPage";
import { Priority } from "@/hooks/useApi";

const MediumPriorityPage = () => {
  return <ReusablePriorityPage priority={Priority.Medium} />;
};

export default MediumPriorityPage;