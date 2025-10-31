import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { Priority } from "@/hooks/useApi";

const High = () => {
  return <ReusablePriorityPage priority={Priority.High} />;
};

export default High;
