import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { Priority } from "@/hooks/useApi";

const Medium = () => {
  return <ReusablePriorityPage priority={Priority.Medium} />;
};

export default Medium;
