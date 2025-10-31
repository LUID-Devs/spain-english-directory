import React from "react";
import ReusablePriorityPage from "@/app/dashboard/priority/reusablePriorityPage";
import { Priority } from "@/hooks/useApi";

const HighPriorityPage = () => {
  return <ReusablePriorityPage priority={Priority.High} />;
};

export default HighPriorityPage;