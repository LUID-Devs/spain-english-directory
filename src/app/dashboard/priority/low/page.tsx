import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { Priority } from "@/hooks/useApi";

const Low = () => {
  return <ReusablePriorityPage priority={Priority.Low} />;
};

export default Low;
