'use client';

import React from 'react';
import { Container, Typography, Box, Button, Card, CardContent, Chip, Grid, Link as MuiLink } from '@mui/material';
import { Check, Close, OpenInNew } from '@mui/icons-material';
import Link from 'next/link';

const plans = [
  {
    name: "Free",
    price: "$0",
    interval: "forever",
    description: "Get started with basic task management",
    features: [
      "5 tasks per project",
      "2 projects",
      "Basic features",
      "Community support",
    ],
    limitations: [
      "No AI features",
      "No team collaboration",
      "No priority support",
    ],
    cta: "Current Plan",
    popular: false,
    href: null,
  },
  {
    name: "LuidHub Pro",
    price: "$9",
    interval: "month",
    description: "Unlock all features across all LUID apps",
    features: [
      "Unlimited tasks",
      "Unlimited projects",
      "AI-powered features",
      "Team collaboration",
      "Access to LuidKit Pro",
      "Access to ResumeLuid Pro",
      "Priority support",
    ],
    limitations: [],
    cta: "Subscribe on LuidHub",
    popular: true,
    href: "https://luidhub.com/pricing",
  },
  {
    name: "Pro Annual",
    price: "$79",
    interval: "year",
    description: "Save 27% with annual billing",
    features: [
      "Everything in Pro",
      "3 months free",
      "Annual billing",
      "Priority onboarding",
    ],
    limitations: [],
    cta: "Subscribe Annually",
    popular: false,
    href: "https://luidhub.com/pricing",
  },
];

const includedApps = [
  {
    name: "TaskLuid",
    description: "Task & project management",
    icon: "✓",
    url: "https://taskluid.com",
    current: true,
  },
  {
    name: "LuidKit",
    description: "File conversion & processing",
    icon: "🔄",
    url: "https://luidkit.com",
    current: false,
  },
  {
    name: "ResumeLuid",
    description: "AI-powered resume builder",
    icon: "📄",
    url: "https://resumeluid.com",
    current: false,
  },
];

const faqs = [
  {
    question: "Does one subscription unlock all apps?",
    answer: "Yes! A single LuidHub Pro subscription gives you full access to all apps - TaskLuid, LuidKit, ResumeLuid, and any future apps we build.",
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "Where do I manage my subscription?",
    answer: "All billing and subscription management is handled through LuidHub (luidhub.com). This keeps everything in one place across all LUID apps.",
  },
  {
    question: "What happens if I exceed my task limit?",
    answer: "You'll be prompted to upgrade your plan when you reach your task limit. Your existing tasks will remain accessible.",
  },
];

export default function PricingPage() {
  const handleSubscribe = (href: string | null) => {
    if (href) {
      window.open(href, "_blank");
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Chip label="Simple Pricing" color="primary" sx={{ mb: 3 }} />
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          One Subscription,{" "}
          <Box component="span" sx={{
            background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}>
            All Apps
          </Box>
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Subscribe to LuidHub and unlock unlimited tasks plus access to all LUID apps. No separate subscriptions, no surprise fees.
        </Typography>
      </Box>

      {/* Apps Included */}
      <Box sx={{ py: 6, bgcolor: 'background.paper', borderRadius: 2, mb: 6 }}>
        <Typography variant="h5" textAlign="center" fontWeight="bold" gutterBottom>
          Apps Included in Your Subscription
        </Typography>
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 2, maxWidth: 800, mx: 'auto' }}>
          {includedApps.map((app) => (
            <Grid item xs={12} sm={4} key={app.name}>
              <MuiLink href={app.url} target="_blank" rel="noopener noreferrer" underline="none">
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    border: app.current ? '2px solid' : '1px solid',
                    borderColor: app.current ? 'primary.main' : 'divider',
                    bgcolor: app.current ? 'primary.50' : 'background.paper',
                    '&:hover': { boxShadow: 3 },
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 1 }}>{app.icon}</Typography>
                  {app.current && (
                    <Chip label="You are here" size="small" color="primary" sx={{ mb: 1 }} />
                  )}
                  <Typography variant="subtitle1" fontWeight="bold">{app.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{app.description}</Typography>
                </Card>
              </MuiLink>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Pricing Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.name}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: plan.popular ? '2px solid' : '1px solid',
                borderColor: plan.popular ? 'primary.main' : 'divider',
              }}
            >
              {plan.popular && (
                <Chip
                  label="Most Popular"
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, pt: plan.popular ? 4 : 3 }}>
                <Typography variant="h5" fontWeight="bold" textAlign="center">
                  {plan.name}
                </Typography>
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Typography variant="h3" component="span" fontWeight="bold">
                    {plan.price}
                  </Typography>
                  <Typography variant="body1" component="span" color="text.secondary">
                    /{plan.interval}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                  {plan.description}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  {plan.features.map((feature) => (
                    <Box key={feature} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <Check sx={{ color: 'success.main', mr: 1, fontSize: 20, mt: 0.3 }} />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                  {plan.limitations.map((limitation) => (
                    <Box key={limitation} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <Close sx={{ color: 'text.disabled', mr: 1, fontSize: 20, mt: 0.3 }} />
                      <Typography variant="body2" color="text.disabled">{limitation}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant={plan.popular ? "contained" : "outlined"}
                  disabled={!plan.href}
                  onClick={() => handleSubscribe(plan.href)}
                  startIcon={plan.href ? <OpenInNew /> : undefined}
                  sx={{
                    py: 1.5,
                    ...(plan.popular && {
                      background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                    }),
                  }}
                >
                  {plan.cta}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Billing Note */}
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 6 }}>
        All billing is managed through{" "}
        <MuiLink href="https://luidhub.com/account" target="_blank" rel="noopener noreferrer">
          LuidHub
        </MuiLink>
        . Already subscribed?{" "}
        <MuiLink href="https://luidhub.com/account" target="_blank" rel="noopener noreferrer">
          Manage your subscription
        </MuiLink>
      </Typography>

      {/* FAQ Section */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" textAlign="center" fontWeight="bold" gutterBottom>
          Frequently Asked Questions
        </Typography>

        <Box sx={{ mt: 4, maxWidth: 700, mx: 'auto' }}>
          {faqs.map((faq, index) => (
            <Box key={index} sx={{ mb: 4, pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {faq.question}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {faq.answer}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  );
}