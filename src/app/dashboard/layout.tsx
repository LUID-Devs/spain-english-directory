"use client";
import React from "react";
import AuthProvider from "../authProvider";
import DashboardWrapper from "../dashboardWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardWrapper>
        {children}
      </DashboardWrapper>
    </AuthProvider>
  );
}