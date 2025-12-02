import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Zap, Eye, EyeOff, Check, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "../lib/utils";

const validatePassword = (password: string) => {
  const errors = [];
  if (password.length < 8) {
    errors.push({ id: "length", message: "Minimum 8 characters long." });
  }
  if (!/[A-Z]/.test(password)) {
    errors.push({ id: "uppercase", message: "At least one uppercase letter (A-Z)." });
  }
  if (!/[a-z]/.test(password)) {
    errors.push({ id: "lowercase", message: "At least one lowercase letter (a-z)." });
  }
  if (!/[0-9]/.test(password)) {
    errors.push({ id: "number", message: "At least one number (0-9)." });
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push({ id: "symbol", message: "At least one symbol (e.g., !, $, #)." });
  }
  return errors;
};

const ValidationCheck = ({ rule, isValid }: { rule: string; isValid: boolean }) => (
  <motion.li
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className={cn(
      "flex items-center gap-2 text-xs transition-colors",
      isValid ? "text-white font-medium" : "text-muted-foreground"
    )}
  >
    {isValid ? (
      <Check className="w-3 h-3 text-white" />
    ) : (
      <X className="w-3 h-3 text-muted-foreground" />
    )}
    {rule}
  </motion.li>
);

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordErrors = validatePassword(password);
  const isPasswordValid = passwordErrors.length === 0;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (isSignUp && !isPasswordValid) {
      setError("Please meet all password requirements before signing up.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage("Success! Check your email to confirm your account.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        setMessage("Signed in successfully!");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = [
    { id: "length", rule: "8 characters minimum", check: password.length >= 8 },
    { id: "uppercase", rule: "One uppercase letter", check: /[A-Z]/.test(password) },
    { id: "lowercase", rule: "One lowercase letter", check: /[a-z]/.test(password) },
    { id: "number", rule: "One number", check: /[0-9]/.test(password) },
    { id: "symbol", rule: "One symbol (e.g., $, #)", check: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="spotlight" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-20 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute bottom-20 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="p-3 bg-white rounded-xl">
            <Zap className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">TaskFlow</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-white/10 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-center">
                {isSignUp
                  ? "Sign up to start organizing your tasks"
                  : "Sign in to continue to TaskFlow"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg bg-white/10 border border-white/20 text-sm text-white"
                >
                  {message}
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive-foreground"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                      placeholder="you@example.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isSignUp && password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-white/5 border border-white/10 rounded-lg"
                  >
                    <ul className="grid grid-cols-2 gap-2">
                      {passwordRules.map((rule) => (
                        <ValidationCheck
                          key={rule.id}
                          rule={rule.rule}
                          isValid={rule.check}
                        />
                      ))}
                    </ul>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !email || !password || (isSignUp && !isPasswordValid)}
                  loading={loading}
                  className="w-full"
                  size="lg"
                >
                  {isSignUp ? "Sign Up" : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError("");
                      setMessage("");
                    }}
                    className="text-foreground font-semibold hover:underline transition-colors"
                    disabled={loading}
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}