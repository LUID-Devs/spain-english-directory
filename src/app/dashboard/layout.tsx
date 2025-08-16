"use client";
import React from "react";
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import AuthProvider from "../authProvider";
import DashboardWrapper from "../dashboardWrapper";
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <SubscriptionProvider>
          <DashboardWrapper>
            {children}
          </DashboardWrapper>
        </SubscriptionProvider>
      </Elements>
    </AuthProvider>
  );
}