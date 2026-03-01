import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const navigate = useNavigate();

  // Countdown timer for rate limiting
  useEffect(() => {
    if (rateLimited && retryAfter > 0) {
      const timer = setInterval(() => {
        setRetryAfter((prev) => {
          if (prev <= 1) {
            setRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [rateLimited, retryAfter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Please enter your username");
      return;
    }

    // Check if we're currently rate limited
    if (rateLimited) {
      toast.error(`Please wait ${retryAfter} seconds before trying again`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting (429) specifically
        if (response.status === 429) {
          const retrySeconds = data.retryAfter || 60;
          setRateLimited(true);
          setRetryAfter(retrySeconds);
          throw new Error(`Too many attempts. Please try again in ${retrySeconds} seconds.`);
        }
        throw new Error(data.message || "Failed to send reset code");
      }

      setEmailSent(true);
      setRateLimited(false);
      setRetryAfter(0);
      toast.success("Reset code sent! Check your email.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate("/auth/reset-password", { state: { username } });
  };

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
          <p className="text-gray-300">Reset your password</p>
        </div>

        {/* Auth Card */}
        <motion.div 
          className="p-8 bg-black/60 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {!emailSent ? (
            <>
              <div className="mb-6 text-center">
                <p className="text-gray-400 text-sm">
                  Enter your username and we'll send you a code to reset your password.
                </p>
              </div>

              {/* Rate Limit Warning */}
              {rateLimited && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-amber-200 text-sm font-medium">
                        Too many attempts
                      </p>
                      <p className="text-amber-200/70 text-xs mt-1">
                        Please wait <span className="text-amber-400 font-semibold">{retryAfter}</span> seconds before trying again.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <motion.input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={rateLimited || loading}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-blue-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-800/50"
                    placeholder="Enter your username"
                    whileFocus={{ scale: (rateLimited || loading) ? 1 : 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                  {loading && (
                    <div className="absolute right-3 top-[34px]">
                      <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || rateLimited}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                  whileHover={{ scale: rateLimited ? 1 : 1.02, y: rateLimited ? 0 : -2 }}
                  whileTap={{ scale: rateLimited ? 1 : 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : rateLimited ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Wait {retryAfter}s
                    </div>
                  ) : (
                    "Send Reset Code"
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
              >
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Check your email!</h3>
                <p className="text-gray-400 text-sm">
                  We've sent a password reset code to the email associated with <strong className="text-white">{username}</strong>.
                </p>
              </div>

              <motion.button
                onClick={handleContinue}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                Enter Reset Code
              </motion.button>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-400">
            Remember your password?{" "}
            <Link
              to="/auth/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
