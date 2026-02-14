import { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Resolve Vite's real entry JS/CSS from dist/index.html.
 * This avoids picking the wrong "index-*.js" chunk when many are generated.
 */
function getAssetFilenames(distPath: string): { js: string; css: string } {
  const indexHtmlPath = path.join(distPath, 'index.html');

  if (fs.existsSync(indexHtmlPath)) {
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    const jsMatch = indexHtml.match(/<script[^>]+src="\/assets\/([^"]+\.js)"/);
    const cssMatch = indexHtml.match(/<link[^>]+href="\/assets\/([^"]+\.css)"/);

    if (jsMatch?.[1] && cssMatch?.[1]) {
      console.log(`[static-prerender] Using index.html assets: JS=${jsMatch[1]}, CSS=${cssMatch[1]}`);
      return { js: jsMatch[1], css: cssMatch[1] };
    }

    console.warn('[static-prerender] Could not parse assets from dist/index.html, falling back to assets scan');
  } else {
    console.warn('[static-prerender] dist/index.html not found, falling back to assets scan');
  }

  const assetsPath = path.join(distPath, 'assets');

  if (!fs.existsSync(assetsPath)) {
    console.warn('[static-prerender] Assets folder not found, using fallback names');
    return { js: 'index.js', css: 'index.css' };
  }

  const files = fs.readdirSync(assetsPath);
  const jsFile = files
    .filter((f) => /^index-[A-Za-z0-9_-]+\.js$/.test(f) && !f.endsWith('.map'))
    .sort()
    .pop();
  const cssFile = files
    .filter((f) => /^index-[A-Za-z0-9_-]+\.css$/.test(f) && !f.endsWith('.map'))
    .sort()
    .pop();

  if (!jsFile || !cssFile) {
    console.warn('[static-prerender] Could not find main assets, using fallback names');
    return { js: jsFile || 'index.js', css: cssFile || 'index.css' };
  }

  console.log(`[static-prerender] Fallback assets: JS=${jsFile}, CSS=${cssFile}`);
  return { js: jsFile, css: cssFile };
}

/**
 * Vite plugin to inject static HTML content for public pages
 * This fixes SEO by ensuring search engines see actual content
 */
export function staticPrerenderPlugin(): Plugin {
  // Use current year to match client-side rendering and avoid hydration mismatches
  const currentYear = new Date().getFullYear();
  
  const publicPages: Record<string, { title: string; description: string; content: string }> = {
    '/landing': {
      title: 'TaskLuid - Task Management Platform',
      description: 'A modern task management platform designed to help you organize, track, and complete projects efficiently.',
      content: `
        <div class="min-h-screen bg-black text-white flex flex-col">
          <div class="flex-1 flex items-center justify-center px-4">
            <div class="text-center">
              <p class="text-sm text-neutral-500 mb-2">Part of Luid Suite</p>
              <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-400 to-gray-400 bg-clip-text text-transparent mb-6">
                TaskLuid
              </h1>
              <p class="text-gray-300 mb-8 max-w-md mx-auto">
                A modern task management platform designed to help you organize, track, and complete projects efficiently.
              </p>
              <div class="space-x-4 mb-8">
                <a href="/auth/login" class="inline-block px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-500 text-white rounded-lg hover:from-gray-600 hover:to-gray-600 transition-all duration-300">
                  Sign In
                </a>
                <a href="/auth/register" class="inline-block px-6 py-3 border border-gray-500 text-gray-400 rounded-lg hover:bg-gray-500/10 transition-all duration-300">
                  Sign Up
                </a>
              </div>
              <p class="text-xs text-neutral-500">
                Built by an independent developer
              </p>
            </div>
          </div>
          <footer class="border-t border-neutral-800 py-6 px-4">
            <div class="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <p class="text-sm text-neutral-500">
                &copy; ${currentYear} Luid Suite
              </p>
              <div class="flex gap-6 text-sm">
                <a href="/privacy" class="text-neutral-400 hover:text-gray-400 transition-colors">Privacy Policy</a>
                <a href="/terms" class="text-neutral-400 hover:text-gray-400 transition-colors">Terms of Service</a>
                <a href="/cookies" class="text-neutral-400 hover:text-gray-400 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </footer>
        </div>
      `
    },
    '/auth/login': {
      title: 'Sign In - TaskLuid',
      description: 'Sign in to your TaskLuid account to manage your tasks and projects.',
      content: `
        <div class="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <div class="text-center max-w-md w-full">
            <h1 class="text-3xl font-bold mb-2">Welcome Back</h1>
            <p class="text-gray-400 mb-8">Sign in to your TaskLuid account</p>
            <div class="space-y-4">
              <input type="email" placeholder="Email" class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500" />
              <input type="password" placeholder="Password" class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500" />
              <button class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                Sign In
              </button>
            </div>
            <div class="mt-6 text-sm text-gray-400">
              <a href="/auth/forgot-password" class="hover:text-white transition-colors">Forgot password?</a>
              <span class="mx-2">·</span>
              <a href="/auth/register" class="hover:text-white transition-colors">Create account</a>
            </div>
          </div>
        </div>
      `
    },
    '/auth/register': {
      title: 'Sign Up - TaskLuid',
      description: 'Create your TaskLuid account and start managing your tasks efficiently.',
      content: `
        <div class="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <div class="text-center max-w-md w-full">
            <h1 class="text-3xl font-bold mb-2">Create Account</h1>
            <p class="text-gray-400 mb-8">Start your journey with TaskLuid</p>
            <div class="space-y-4">
              <input type="text" placeholder="Full Name" class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500" />
              <input type="email" placeholder="Email" class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500" />
              <input type="password" placeholder="Password" class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500" />
              <button class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                Create Account
              </button>
            </div>
            <p class="mt-6 text-sm text-gray-400">
              Already have an account? <a href="/auth/login" class="hover:text-white transition-colors">Sign in</a>
            </p>
          </div>
        </div>
      `
    },
    '/auth/forgot-password': {
      title: 'Forgot Password - TaskLuid',
      description: 'Reset your TaskLuid account password.',
      content: `
        <div class="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <div class="text-center max-w-md w-full">
            <h1 class="text-3xl font-bold mb-2">Forgot Password</h1>
            <p class="text-gray-400 mb-8">Enter your email to reset your password</p>
            <div class="space-y-4">
              <input type="email" placeholder="Email" class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500" />
              <button class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                Send Reset Link
              </button>
            </div>
            <p class="mt-6 text-sm text-gray-400">
              Remember your password? <a href="/auth/login" class="hover:text-white transition-colors">Sign in</a>
            </p>
          </div>
        </div>
      `
    },
    '/pricing': {
      title: 'Pricing - TaskLuid',
      description: 'Choose the right plan for your team. Free and paid plans available.',
      content: `
        <div class="min-h-screen bg-black text-white">
          <div class="container mx-auto px-4 py-16">
            <h1 class="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h1>
            <p class="text-gray-400 text-center mb-12 max-w-2xl mx-auto">Choose the plan that fits your needs</p>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div class="border border-gray-800 rounded-lg p-6">
                <h3 class="text-xl font-semibold mb-2">Free</h3>
                <p class="text-3xl font-bold mb-4">$0<span class="text-lg text-gray-400">/month</span></p>
                <ul class="space-y-2 text-gray-400 mb-6">
                  <li>Up to 3 projects</li>
                  <li>Basic task management</li>
                  <li>Email notifications</li>
                </ul>
                <a href="/auth/register" class="block w-full text-center px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors">Get Started</a>
              </div>
              <div class="border border-blue-500 rounded-lg p-6 relative">
                <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-xs px-3 py-1 rounded-full">Popular</span>
                <h3 class="text-xl font-semibold mb-2">Pro</h3>
                <p class="text-3xl font-bold mb-4">$12<span class="text-lg text-gray-400">/month</span></p>
                <ul class="space-y-2 text-gray-400 mb-6">
                  <li>Unlimited projects</li>
                  <li>Advanced analytics</li>
                  <li>Priority support</li>
                  <li>Team collaboration</li>
                </ul>
                <a href="/auth/register" class="block w-full text-center px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Get Started</a>
              </div>
              <div class="border border-gray-800 rounded-lg p-6">
                <h3 class="text-xl font-semibold mb-2">Enterprise</h3>
                <p class="text-3xl font-bold mb-4">Custom</p>
                <ul class="space-y-2 text-gray-400 mb-6">
                  <li>Everything in Pro</li>
                  <li>SSO & SAML</li>
                  <li>Dedicated support</li>
                  <li>Custom integrations</li>
                </ul>
                <a href="/auth/register" class="block w-full text-center px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors">Contact Sales</a>
              </div>
            </div>
          </div>
        </div>
      `
    },
    '/privacy': {
      title: 'Privacy Policy - TaskLuid',
      description: 'Learn how TaskLuid collects, uses, and protects your personal information.',
      content: `
        <div class="min-h-screen bg-black text-white">
          <div class="container mx-auto px-4 py-16 max-w-3xl">
            <h1 class="text-4xl font-bold mb-8">Privacy Policy</h1>
            <div class="prose prose-invert max-w-none">
              <p class="text-gray-400 mb-6">Last updated: February 2026</p>
              <h2 class="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
              <p class="text-gray-300 mb-4">We collect information you provide directly to us, including your name, email address, and any other information you choose to provide.</p>
              <h2 class="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
              <p class="text-gray-300 mb-4">We use the information we collect to provide, maintain, and improve our services, and to communicate with you.</p>
              <h2 class="text-2xl font-semibold mt-8 mb-4">3. Data Security</h2>
              <p class="text-gray-300 mb-4">We implement appropriate technical and organizational measures to protect your personal information.</p>
              <h2 class="text-2xl font-semibold mt-8 mb-4">4. Contact Us</h2>
              <p class="text-gray-300 mb-4">If you have any questions about this Privacy Policy, please contact us.</p>
            </div>
          </div>
        </div>
      `
    },
    '/terms': {
      title: 'Terms of Service - TaskLuid',
      description: 'Read the Terms of Service for using TaskLuid.',
      content: `
        <div class="min-h-screen bg-black text-white">
          <div class="container mx-auto px-4 py-16 max-w-3xl">
            <h1 class="text-4xl font-bold mb-8">Terms of Service</h1>
            <div class="prose prose-invert max-w-none">
              <p class="text-gray-400 mb-6">Last updated: February 2026</p>
              <h2 class="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p class="text-gray-300 mb-4">By accessing or using TaskLuid, you agree to be bound by these Terms of Service.</p>
              <h2 class="text-2xl font-semibold mt-8 mb-4">2. Use of Service</h2>
              <p class="text-gray-300 mb-4">You agree to use the service only for lawful purposes and in accordance with these Terms.</p>
              <h2 class="text-2xl font-semibold mt-8 mb-4">3. Account Security</h2>
              <p class="text-gray-300 mb-4">You are responsible for maintaining the confidentiality of your account credentials.</p>
              <h2 class="text-2xl font-semibold mt-8 mb-4">4. Termination</h2>
              <p class="text-gray-300 mb-4">We may terminate or suspend your account at any time for violations of these terms.</p>
            </div>
          </div>
        </div>
      `
    },
    '/cookies': {
      title: 'Cookie Policy - TaskLuid',
      description: 'Learn about how TaskLuid uses cookies.',
      content: `
        <div class="min-h-screen bg-black text-white">
          <div class="container mx-auto px-4 py-16 max-w-3xl">
            <h1 class="text-4xl font-bold mb-8">Cookie Policy</h1>
            <div class="prose prose-invert max-w-none">
              <p class="text-gray-400 mb-6">Last updated: February 2026</p>
              <h2 class="text-2xl font-semibold mt-8 mb-4">What Are Cookies</h2>
              <p class="text-gray-300 mb-4">Cookies are small text files that are stored on your device when you visit a website.</p>
              <h2 class="text-2xl font-semibold mt-8 mb-4">How We Use Cookies</h2>
              <p class="text-gray-300 mb-4">We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts.</p>
              <h2 class="text-2xl font-semibold mt-8 mb-4">Types of Cookies We Use</h2>
              <p class="text-gray-300 mb-4"><strong>Essential cookies:</strong> Required for the website to function properly.</p>
              <p class="text-gray-300 mb-4"><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website.</p>
              <h2 class="text-2xl font-semibold mt-8 mb-4">Managing Cookies</h2>
              <p class="text-gray-300 mb-4">You can control cookies through your browser settings.</p>
            </div>
          </div>
        </div>
      `
    },
    '/help': {
      title: 'Help Center - TaskLuid',
      description: 'Get help with TaskLuid. Find guides, tutorials, and answers to common questions.',
      content: `
        <div class="min-h-screen bg-black text-white">
          <nav class="border-b border-neutral-800">
            <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <a href="/" class="text-xl font-bold bg-gradient-to-r from-gray-400 to-gray-400 bg-clip-text text-transparent">TaskLuid</a>
              <div class="flex items-center gap-6">
                <a href="/docs" class="text-neutral-400 hover:text-white transition-colors">Docs</a>
                <a href="/auth/login" class="text-neutral-400 hover:text-white transition-colors">Sign In</a>
              </div>
            </div>
          </nav>
          <div class="container mx-auto px-4 py-16 max-w-4xl">
            <h1 class="text-4xl font-bold mb-4 text-center">Help Center</h1>
            <p class="text-gray-400 text-center mb-12 max-w-2xl mx-auto">Find answers to common questions and learn how to get the most out of TaskLuid.</p>
            <div class="grid md:grid-cols-2 gap-8">
              <div class="border border-gray-800 rounded-lg p-6 hover:border-gray-600 transition-colors">
                <h3 class="text-xl font-semibold mb-2">Getting Started</h3>
                <p class="text-gray-400 mb-4">Learn the basics of TaskLuid and set up your first project.</p>
                <a href="/docs/getting-started" class="text-blue-400 hover:text-blue-300 transition-colors">Read more →</a>
              </div>
              <div class="border border-gray-800 rounded-lg p-6 hover:border-gray-600 transition-colors">
                <h3 class="text-xl font-semibold mb-2">Task Management</h3>
                <p class="text-gray-400 mb-4">Discover how to create, organize, and track tasks effectively.</p>
                <a href="/docs/tasks" class="text-blue-400 hover:text-blue-300 transition-colors">Read more →</a>
              </div>
              <div class="border border-gray-800 rounded-lg p-6 hover:border-gray-600 transition-colors">
                <h3 class="text-xl font-semibold mb-2">Team Collaboration</h3>
                <p class="text-gray-400 mb-4">Invite team members and collaborate on projects together.</p>
                <a href="/docs/collaboration" class="text-blue-400 hover:text-blue-300 transition-colors">Read more →</a>
              </div>
              <div class="border border-gray-800 rounded-lg p-6 hover:border-gray-600 transition-colors">
                <h3 class="text-xl font-semibold mb-2">Automation</h3>
                <p class="text-gray-400 mb-4">Set up workflows and automate repetitive tasks.</p>
                <a href="/docs/automation" class="text-blue-400 hover:text-blue-300 transition-colors">Read more →</a>
              </div>
            </div>
          </div>
          <footer class="border-t border-neutral-800 py-8 px-4">
            <div class="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <p class="text-sm text-neutral-500">&copy; ${currentYear} TaskLuid. Part of Luid Suite.</p>
              <div class="flex gap-6 text-sm">
                <a href="/privacy" class="text-neutral-400 hover:text-gray-400 transition-colors">Privacy</a>
                <a href="/terms" class="text-neutral-400 hover:text-gray-400 transition-colors">Terms</a>
              </div>
            </div>
          </footer>
        </div>
      `
    },
    '/docs': {
      title: 'Documentation - TaskLuid',
      description: 'Complete documentation for TaskLuid. API references, guides, and tutorials.',
      content: `
        <div class="min-h-screen bg-black text-white">
          <nav class="border-b border-neutral-800">
            <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <a href="/" class="text-xl font-bold bg-gradient-to-r from-gray-400 to-gray-400 bg-clip-text text-transparent">TaskLuid</a>
              <div class="flex items-center gap-6">
                <a href="/help" class="text-neutral-400 hover:text-white transition-colors">Help</a>
                <a href="/auth/login" class="text-neutral-400 hover:text-white transition-colors">Sign In</a>
              </div>
            </div>
          </nav>
          <div class="container mx-auto px-4 py-16 max-w-4xl">
            <h1 class="text-4xl font-bold mb-4 text-center">Documentation</h1>
            <p class="text-gray-400 text-center mb-12 max-w-2xl mx-auto">Everything you need to know about using TaskLuid, from basic concepts to advanced features.</p>
            <div class="space-y-8">
              <div class="border border-gray-800 rounded-lg p-6">
                <h3 class="text-2xl font-semibold mb-4">Getting Started</h3>
                <ul class="space-y-2 text-gray-400">
                  <li><a href="/docs/quickstart" class="text-blue-400 hover:text-blue-300 transition-colors">Quick Start Guide</a></li>
                  <li><a href="/docs/installation" class="text-blue-400 hover:text-blue-300 transition-colors">Installation & Setup</a></li>
                  <li><a href="/docs/first-project" class="text-blue-400 hover:text-blue-300 transition-colors">Creating Your First Project</a></li>
                </ul>
              </div>
              <div class="border border-gray-800 rounded-lg p-6">
                <h3 class="text-2xl font-semibold mb-4">Core Concepts</h3>
                <ul class="space-y-2 text-gray-400">
                  <li><a href="/docs/projects" class="text-blue-400 hover:text-blue-300 transition-colors">Projects</a></li>
                  <li><a href="/docs/tasks" class="text-blue-400 hover:text-blue-300 transition-colors">Tasks & Subtasks</a></li>
                  <li><a href="/docs/teams" class="text-blue-400 hover:text-blue-300 transition-colors">Teams & Permissions</a></li>
                </ul>
              </div>
              <div class="border border-gray-800 rounded-lg p-6">
                <h3 class="text-2xl font-semibold mb-4">API Reference</h3>
                <ul class="space-y-2 text-gray-400">
                  <li><a href="/docs/api/authentication" class="text-blue-400 hover:text-blue-300 transition-colors">Authentication</a></li>
                  <li><a href="/docs/api/endpoints" class="text-blue-400 hover:text-blue-300 transition-colors">Endpoints</a></li>
                  <li><a href="/docs/api/webhooks" class="text-blue-400 hover:text-blue-300 transition-colors">Webhooks</a></li>
                </ul>
              </div>
            </div>
          </div>
          <footer class="border-t border-neutral-800 py-8 px-4">
            <div class="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <p class="text-sm text-neutral-500">&copy; ${currentYear} TaskLuid. Part of Luid Suite.</p>
              <div class="flex gap-6 text-sm">
                <a href="/privacy" class="text-neutral-400 hover:text-gray-400 transition-colors">Privacy</a>
                <a href="/terms" class="text-neutral-400 hover:text-gray-400 transition-colors">Terms</a>
              </div>
            </div>
          </footer>
        </div>
      `
    },
    '/features': {
      title: 'Features - TaskLuid',
      description: 'Discover TaskLuid features: AI-powered task management, team collaboration, automation, and advanced analytics.',
      content: `
        <div class="min-h-screen bg-black text-white">
          <nav class="border-b border-neutral-800">
            <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <a href="/" class="text-xl font-bold bg-gradient-to-r from-gray-400 to-gray-400 bg-clip-text text-transparent">TaskLuid</a>
              <div class="flex items-center gap-6">
                <a href="/pricing" class="text-neutral-400 hover:text-white transition-colors">Pricing</a>
                <a href="/auth/login" class="text-neutral-400 hover:text-white transition-colors">Sign In</a>
                <a href="/auth/register" class="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-400 transition-all">Get Started</a>
              </div>
            </div>
          </nav>
          <section class="py-20 px-4">
            <div class="max-w-4xl mx-auto text-center">
              <h1 class="text-5xl md:text-6xl font-bold mb-6">Everything you need to <span class="bg-gradient-to-r from-gray-400 to-gray-200 bg-clip-text text-transparent">ship faster</span></h1>
              <p class="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">TaskLuid combines powerful project management with AI assistance to help teams of all sizes deliver their best work.</p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/auth/register" class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-400 transition-all">Start Free Trial</a>
                <a href="/" class="inline-flex items-center justify-center gap-2 px-8 py-4 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-all">Back to Home</a>
              </div>
            </div>
          </section>
          <section class="py-20 px-4 border-t border-neutral-800">
            <div class="max-w-6xl mx-auto">
              <div class="text-center mb-16">
                <h2 class="text-3xl font-bold mb-4">Powerful Features</h2>
                <p class="text-neutral-400 max-w-xl mx-auto">Built for modern teams who need to move fast without breaking things.</p>
              </div>
              <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div class="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
                  <div class="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  </div>
                  <h3 class="text-lg font-semibold mb-2">Intuitive Task Management</h3>
                  <p class="text-sm text-neutral-400">Organize tasks with drag-and-drop simplicity. Create projects and track progress.</p>
                </div>
                <div class="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
                  <div class="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <h3 class="text-lg font-semibold mb-2">Team Collaboration</h3>
                  <p class="text-sm text-neutral-400">Work together seamlessly. Assign tasks and keep everyone aligned.</p>
                </div>
                <div class="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
                  <div class="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 class="text-lg font-semibold mb-2">AI-Powered Automation</h3>
                  <p class="text-sm text-neutral-400">Let AI handle the routine. Auto-assign tasks and get smart recommendations.</p>
                </div>
                <div class="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
                  <div class="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center mb-4">
                    <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <h3 class="text-lg font-semibold mb-2">Enterprise Security</h3>
                  <p class="text-sm text-neutral-400">Bank-level encryption, SSO support, and SOC 2 compliance.</p>
                </div>
              </div>
            </div>
          </section>
          <footer class="border-t border-neutral-800 py-8 px-4">
            <div class="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <p class="text-sm text-neutral-500">&copy; ${currentYear} TaskLuid. Part of Luid Suite.</p>
              <div class="flex gap-6 text-sm">
                <a href="/privacy" class="text-neutral-400 hover:text-gray-400 transition-colors">Privacy</a>
                <a href="/terms" class="text-neutral-400 hover:text-gray-400 transition-colors">Terms</a>
                <a href="/cookies" class="text-neutral-400 hover:text-gray-400 transition-colors">Cookies</a>
              </div>
            </div>
          </footer>
        </div>
      `
    },
    // Legacy redirect pages for SEO/backward compatibility
    '/login': {
      title: 'Sign In - TaskLuid',
      description: 'Sign in to your TaskLuid account to manage your tasks and projects.',
      content: `
        <div class="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <div class="text-center max-w-md w-full">
            <h1 class="text-3xl font-bold mb-2">Redirecting...</h1>
            <p class="text-gray-400 mb-8">Taking you to the login page</p>
            <div class="space-y-4">
              <a href="/auth/login" class="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-center">
                Continue to Sign In
              </a>
            </div>
          </div>
        </div>
      `
    },
    '/register': {
      title: 'Sign Up - TaskLuid',
      description: 'Create your TaskLuid account and start managing your tasks efficiently.',
      content: `
        <div class="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <div class="text-center max-w-md w-full">
            <h1 class="text-3xl font-bold mb-2">Redirecting...</h1>
            <p class="text-gray-400 mb-8">Taking you to the registration page</p>
            <div class="space-y-4">
              <a href="/auth/register" class="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-center">
                Continue to Sign Up
              </a>
            </div>
          </div>
        </div>
      `
    },
    '/forgot-password': {
      title: 'Forgot Password - TaskLuid',
      description: 'Reset your TaskLuid account password.',
      content: `
        <div class="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <div class="text-center max-w-md w-full">
            <h1 class="text-3xl font-bold mb-2">Redirecting...</h1>
            <p class="text-gray-400 mb-8">Taking you to the password reset page</p>
            <div class="space-y-4">
              <a href="/auth/forgot-password" class="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors text-center">
                Continue to Reset Password
              </a>
            </div>
          </div>
        </div>
      `
    }
  };

  return {
    name: 'static-prerender',
    apply: 'build',
    closeBundle() {
      const distPath = path.resolve(process.cwd(), 'dist');
      
      // Get the actual asset filenames from the build output
      const assets = getAssetFilenames(distPath);
      
      // Generate auth/index.html that redirects to /auth/login
      const authDir = path.join(distPath, 'auth');
      if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
      }
      const authRedirectHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url=/auth/login" />
    <title>Redirecting...</title>
  </head>
  <body>
    <p>Redirecting to <a href="/auth/login">login page</a>...</p>
  </body>
</html>`;
      fs.writeFileSync(path.join(authDir, 'index.html'), authRedirectHtml);
      console.log(`[static-prerender] Generated /auth/ redirect to /auth/login`);
      
      Object.entries(publicPages).forEach(([route, data]) => {
        const routePath = route === '/' ? '' : route;
        const fullPath = path.join(distPath, routePath, 'index.html');
        const dir = path.dirname(fullPath);
        
        // Ensure directory exists
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Generate HTML with static content and correct asset paths
        const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
    <title>${data.title}</title>
    <meta name="description" content="${data.description}" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#000000" />
    <script type="module" crossorigin src="/assets/${assets.js}"></script>
    <link rel="stylesheet" crossorigin href="/assets/${assets.css}" />
  </head>
  <body>
    <div id="root">${data.content}</div>
  </body>
</html>`;
        
        fs.writeFileSync(fullPath, html);
        console.log(`[static-prerender] Generated ${route} (${Buffer.byteLength(html, 'utf8')} bytes)`);
      });
      
      // Copy landing page content to root index.html for SEO on homepage
      // The root / route should serve prerendered content, not the SPA shell
      const rootIndexPath = path.join(distPath, 'index.html');
      const landingIndexPath = path.join(distPath, 'landing', 'index.html');
      if (fs.existsSync(landingIndexPath)) {
        fs.copyFileSync(landingIndexPath, rootIndexPath);
        console.log(`[static-prerender] Copied landing page to /index.html for SEO`);
      }
      
      // Also preserve a copy of SPA shell for client-side routes that need it
      // This is used by the server as fallback for authenticated/dashboard routes
      console.log(`[static-prerender] Done generating static pages`);
    }
  };
}
