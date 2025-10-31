import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { Priority } from "@/hooks/useApi";

const Backlog = () => {
  return <ReusablePriorityPage priority={Priority.Backlog} />;
};

export default Backlog;
