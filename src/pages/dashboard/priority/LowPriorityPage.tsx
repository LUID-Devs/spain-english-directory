import React from "react";
import ReusablePriorityPage from "@/app/dashboard/priority/reusablePriorityPage";
import { Priority } from "@/hooks/useApi";

const LowPriorityPage = () => {
  return <ReusablePriorityPage priority={Priority.Low} />;
};

export default LowPriorityPage;