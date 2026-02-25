import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Hub } from "aws-amplify/utils";
import { confirmSignIn, signIn } from "aws-amplify/auth";
import { useAuth } from "@/app/authProvider";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { PasswordInput } from "@/components/ui/password-input";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
  });
  const [challenge, setChallenge] = useState<{
    signInStep: string;
  } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshAuth, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [hasRedirected, setHasRedirected] = React.useState(false);
  const redirectTarget = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    // Prevent open redirect behavior: only allow in-app absolute paths
    if (!redirect || !redirect.startsWith('/')) return '/dashboard';
    return redirect;
  }, [location.search]);

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? "" : "Invalid email format";
  };

  const validatePassword = (value: string) => {
    if (!value.trim()) return "Password required";
    return "";
  };

  const emailValidation = validateEmail(formData.username);
  const passwordValidation = validatePassword(formData.password);
  const isFormValid = !emailValidation && !passwordValidation;
  const emailError = touchedFields.email ? fieldErrors.email : "";
  const passwordError = touchedFields.password ? fieldErrors.password : "";

  // Redirect if already authenticated (only once)
  useEffect(() => {
    // Only auto-redirect when backend auth is fully established (userId present)
    if (!authLoading && isAuthenticated && user?.userId && !hasRedirected) {
      setHasRedirected(true);
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, authLoading, user?.userId, navigate, hasRedirected, redirectTarget]);

  // Listen for OAuth callback
  useEffect(() => {
    const hubListenerCancelToken = Hub.listen('auth', async ({ payload }) => {
      switch (payload.event) {
        case 'signInWithRedirect':
          setLoading(true);
          await refreshAuth();
          setLoading(false);
          break;
        case 'signInWithRedirect_failure':
          console.error('[LOGIN PAGE] OAuth sign-in failed:', payload.data);
          setError(`OAuth sign-in failed: ${payload.data?.message || 'Unknown error'}`);
          setLoading(false);
          break;
      }
    });

    return () => hubListenerCancelToken();
  }, [navigate, refreshAuth]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "username" && touchedFields.email) {
      setFieldErrors(prev => ({
        ...prev,
        email: validateEmail(value),
      }));
    }

    if (name === "password" && touchedFields.password) {
      setFieldErrors(prev => ({
        ...prev,
        password: validatePassword(value),
      }));
    }

    setError("");
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "username") {
      setTouchedFields(prev => ({ ...prev, email: true }));
      setFieldErrors(prev => ({
        ...prev,
        email: validateEmail(value),
      }));
    }

    if (name === "password") {
      setTouchedFields(prev => ({ ...prev, password: true }));
      setFieldErrors(prev => ({
        ...prev,
        password: validatePassword(value),
      }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(formData.username);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setTouchedFields({ email: true, password: true });
      setFieldErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn({
        username: formData.username,
        password: formData.password,
      });

      const signInStep = result?.nextStep?.signInStep;

      if (signInStep && signInStep !== "DONE") {
        if (
          signInStep === "CONFIRM_SIGN_IN_WITH_SMS_CODE" ||
          signInStep === "CONFIRM_SIGN_IN_WITH_TOTP_CODE"
        ) {
          setChallenge({ signInStep });
          return;
        }

        if (signInStep === "CONFIRM_SIGN_UP") {
          throw new Error("Please confirm your account before signing in.");
        }

        if (signInStep === "RESET_PASSWORD") {
          throw new Error("Password reset required. Please reset your password.");
        }

        throw new Error(`Additional sign-in step required: ${signInStep}`);
      }

      setChallenge(null);
      // Successful login - refresh auth state.
      // Navigation is handled by the auth redirect effect once backend auth is ready.
      await refreshAuth();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await confirmSignIn({ challengeResponse: mfaCode });
      const signInStep = result?.nextStep?.signInStep;

      if (signInStep && signInStep !== "DONE") {
        throw new Error(`Additional sign-in step required: ${signInStep}`);
      }

      setChallenge(null);
      // Successful MFA - refresh auth state.
      // Navigation is handled by the auth redirect effect once backend auth is ready.
      await refreshAuth();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "MFA verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-500/30 border-t-gray-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (challenge) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gray-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/landing" className="inline-block">
              <motion.div
                className="flex items-center justify-center gap-3 mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <img
                  src="/logo.png"
                  alt="LUID"
                  className="w-10 h-10 rounded-lg"
                />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-400 to-gray-400 bg-clip-text text-transparent">
                  TaskLuid
                </h1>
              </motion.div>
            </Link>
            <p className="text-gray-300">Multi-Factor Authentication</p>
            <p className="text-sm text-gray-400 mt-1">Please enter your verification code</p>
          </div>

          {/* Auth Card */}
          <motion.div 
            className="p-8 bg-black/60 backdrop-blur-xl border border-gray-500/20 rounded-2xl shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {error && (
              <motion.div 
                className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleMfaSubmit} className="space-y-6">
              <div>
                <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-300 mb-2">
                  Verification Code
                </label>
                <motion.input
                  id="mfaCode"
                  name="mfaCode"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/50 transition-all duration-300"
                  placeholder="Enter verification code"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-500 hover:from-gray-600 hover:to-gray-600 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-500/25"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify Code"
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-8 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-semibold text-blue-200">
              Free forever · Upgrade when ready
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-semibold text-white">Welcome back to your dashboard</h2>
              <p className="text-gray-300 text-lg">
                Sign in to pick up where you left off. TaskLuid keeps your projects, tasks, and team
                updates in one calm, focused workspace.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Why TaskLuid?</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-blue-400"></span>
                  <span>AI-powered task summaries and smart filters so you see what matters first.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-purple-400"></span>
                  <span>Simple project spaces for teams, clients, and personal goals.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>Automations and integrations that keep your stack in sync.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Trusted by builders</h3>
              <p className="text-sm text-gray-400">Join 2,000+ teams keeping work on track with TaskLuid.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300">
                  “We onboarded in a day and finally have clarity on what ships this week.”
                  <div className="mt-3 text-xs text-gray-500">— Alex, Product Lead</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300">
                  “The dashboard keeps our team aligned without weekly status meetings.”
                  <div className="mt-3 text-xs text-gray-500">— Priya, Ops Manager</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/landing" className="inline-block">
                <motion.div
                  className="flex items-center justify-center gap-3 mb-4"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <img
                    src="/logo.png"
                    alt="LUID"
                    className="w-10 h-10 rounded-lg"
                  />
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    TaskLuid
                  </h1>
                </motion.div>
              </Link>
              <p className="text-gray-300">Sign in to your account</p>
            </div>

            {/* Auth Card */}
            <motion.div
              className="p-8 bg-black/60 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <motion.input
                    id="username"
                    name="username"
                    type="email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={formData.username}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    required
                    className={`w-full px-4 py-3 bg-gray-900/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                      emailError
                        ? "border-red-500/60 focus:ring-red-500/50 focus:border-red-500/70"
                        : "border-blue-500/20 focus:ring-blue-500/50 focus:border-blue-500/50"
                    }`}
                    placeholder="you@example.com"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                  {emailError && (
                    <p className="mt-2 text-sm text-red-400">{emailError}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <Link
                      to="/auth/forgot-password"
                      className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-300 cursor-pointer"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <PasswordInput
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={
                      passwordError
                        ? "border-red-500/60 focus:ring-red-500/50 focus:border-red-500/70"
                        : "border-blue-500/20 focus:ring-blue-500/50 focus:border-blue-500/50"
                    }
                    containerClassName="rounded-lg"
                  />
                  {passwordError && (
                    <p className="mt-2 text-sm text-red-400">{passwordError}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign in"
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-black/60 px-4 text-gray-400">Or continue with</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <GoogleSignInButton
                text="Sign in with Google"
                onError={(error) => setError(error)}
              />

              <div className="mt-6 text-center text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  to="/auth/register"
                  className="text-gray-400 hover:text-gray-300 font-medium transition-colors duration-300"
                >
                  Sign up
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
