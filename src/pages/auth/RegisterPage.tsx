import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useAuth } from "@/app/authProvider";
import { PasswordInput } from "@/components/ui/password-input";

// Password requirement type
interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
}

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [hasRedirected, setHasRedirected] = React.useState(false);

  // Countdown timer for resend functionality
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Password requirements configuration
  const passwordRequirements: PasswordRequirement[] = [
    { id: "length", label: "At least 8 characters", validator: (pwd) => pwd.length >= 8 },
    { id: "uppercase", label: "One uppercase letter", validator: (pwd) => /[A-Z]/.test(pwd) },
    { id: "lowercase", label: "One lowercase letter", validator: (pwd) => /[a-z]/.test(pwd) },
    { id: "number", label: "One number", validator: (pwd) => /[0-9]/.test(pwd) },
  ];

  // Check which requirements are met
  const getMetRequirements = () => {
    return passwordRequirements.map(req => ({
      ...req,
      met: req.validator(formData.password)
    }));
  };

  const metRequirements = getMetRequirements();
  const allRequirementsMet = metRequirements.every(req => req.met);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !hasRedirected) {
      setHasRedirected(true);
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, user, navigate, hasRedirected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (!allRequirementsMet) {
      setError("Password does not meet all requirements");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (data.needsConfirmation) {
        setShowConfirmation(true);
      } else {
        setSuccess(true);
        // Redirect to login after successful registration
        setTimeout(() => {
          navigate("/auth/login?message=Registration successful! Please log in.");
        }, 1500);
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/confirm-signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: formData.username,
          confirmationCode: confirmationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Confirmation failed");
      }

      // Redirect to login page after successful confirmation
      navigate("/auth/login?message=Account confirmed successfully. Please log in.");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Confirmation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    // Rate limiting: max 3 attempts, 60 second cooldown
    if (resendAttempts >= 3) {
      setError("Maximum resend attempts reached. Please try again later or contact support.");
      return;
    }

    if (resendCountdown > 0) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/resend-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: formData.username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend confirmation code");
      }

      // Increment resend attempts and start cooldown
      setResendAttempts(prev => prev + 1);
      setResendCountdown(60);
      
      // Clear any previous error and show success message
      setError("");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to resend code. Please try again.");
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

  if (showConfirmation) {
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
            <p className="text-gray-300">Check Your Email</p>
            <p className="text-sm text-gray-400 mt-1">We&apos;ve sent a confirmation code to your email address</p>
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

            <form onSubmit={handleConfirmation} className="space-y-6">
              <div>
                <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmation Code
                </label>
                <motion.input
                  id="confirmationCode"
                  name="confirmationCode"
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:border-gray-500/50 transition-all duration-300"
                  placeholder="Enter confirmation code"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Didn&apos;t receive the email? Check your spam folder or request a new code below.
                </p>
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
                    Confirming...
                  </div>
                ) : (
                  "Confirm Email"
                )}
              </motion.button>
            </form>

            {/* Resend Code Section */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-400">
                  Code expired or didn&apos;t arrive?
                </p>
                <motion.button
                  onClick={handleResendCode}
                  disabled={loading || resendCountdown > 0 || resendAttempts >= 3}
                  className="text-sm text-gray-400 hover:text-gray-300 font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-gray-400"
                  whileHover={resendCountdown === 0 && resendAttempts < 3 ? { scale: 1.02 } : {}}
                  whileTap={resendCountdown === 0 && resendAttempts < 3 ? { scale: 0.98 } : {}}
                >
                  {resendCountdown > 0 ? (
                    <span>Resend code in {resendCountdown}s</span>
                  ) : resendAttempts >= 3 ? (
                    <span>Max resend attempts reached</span>
                  ) : (
                    <span className="underline">Resend confirmation code</span>
                  )}
                </motion.button>
                {resendAttempts > 0 && resendAttempts < 3 && (
                  <p className="text-xs text-gray-500">
                    Attempt {resendAttempts} of 3
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              <Link
                to="/auth/login"
                className="text-gray-400 hover:text-gray-300 font-medium transition-colors duration-300"
              >
                Back to Sign In
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (success) {
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
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center relative z-10"
        >
          {/* Success Icon */}
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-500 rounded-full flex items-center justify-center">
              <motion.svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </motion.svg>
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-400 to-gray-400 bg-clip-text text-transparent mb-4">
              Registration Successful!
            </h2>
            <p className="text-gray-300 mb-8">
              Your account has been created. Redirecting to login page...
            </p>
            
            {/* Loading Animation */}
            <motion.div
              className="flex justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-6 h-6 border-2 border-gray-400/20 border-t-gray-400 rounded-full"></div>
            </motion.div>
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                TaskLuid
              </h1>
            </motion.div>
          </Link>
          <p className="text-gray-300">Create your account</p>
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

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <motion.input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-blue-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                placeholder="Choose a username"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <motion.input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-blue-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                placeholder="you@example.com"
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Create a password"
              />
              
              {/* Password Requirements Checklist */}
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-400 font-medium">Password requirements:</p>
                <div className="space-y-1.5">
                  {metRequirements.map((req) => (
                    <motion.div
                      key={req.id}
                      className="flex items-center gap-2 text-xs"
                      initial={false}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        initial={false}
                        animate={{
                          scale: req.met ? 1 : 1,
                          color: req.met ? "#22c55e" : "#9ca3af"
                        }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        {req.met ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-gray-500" />
                        )}
                      </motion.div>
                      <span className={req.met ? "text-green-400" : "text-gray-400"}>
                        {req.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Confirm your password"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading || !allRequirementsMet}
              aria-label={loading ? "Creating account, please wait" : "Create account"}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 min-h-[48px]"
              whileHover={{ scale: allRequirementsMet ? 1.02 : 1, y: allRequirementsMet ? -2 : 0 }}
              whileTap={{ scale: allRequirementsMet ? 0.98 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                <span>Create account</span>
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

          {/* Google Sign-Up Button */}
          <GoogleSignInButton
            text="Sign up with Google"
            onError={(error) => setError(error)}
          />

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-gray-400 hover:text-gray-300 font-medium transition-colors duration-300"
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;