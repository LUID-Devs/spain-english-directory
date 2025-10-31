"use client";
import React from "react";
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import AuthProvider from "../authProvider";
import DashboardWrapper from "../dashboardWrapper";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SubscriptionProvider } from '@/components/SubscriptionProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Elements stripe={stripePromise}>
          <SubscriptionProvider>
            <DashboardWrapper>
              {children}
            </DashboardWrapper>
          </SubscriptionProvider>
        </Elements>
      </ProtectedRoute>
    </AuthProvider>
  );
}