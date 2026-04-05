import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, Mail, Lock, Shield, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type LoginRole = "user" | "admin";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginRole, setLoginRole] = useState<LoginRole>("user");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signIn(email, password);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isAdmin = roles?.some((r) => r.role === "admin");

      if (loginRole === "admin" && !isAdmin) {
        toast.error("Invalid role for this login. You are not an admin.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      toast.success(loginRole === "admin" ? "Welcome back, Admin!" : "Welcome back!");
      navigate(loginRole === "admin" ? "/admin" : "/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative gradient-hero items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse-glow" />
          <div className="absolute bottom-20 right-20 w-56 h-56 bg-accent/15 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        </div>
        <div className="relative z-10 max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-xl mx-auto mb-8 border border-white/10"
          >
            <BookOpen className="h-10 w-10 text-white" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl font-display font-bold text-white mb-4"
          >
            Libra<span className="text-primary">AI</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-white/60 text-lg leading-relaxed"
          >
            AI-powered library management for the modern campus. Discover, borrow, and learn smarter.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center justify-center gap-3 mt-8"
          >
            {["Smart Search", "AI Chatbot", "Analytics"].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium border border-white/10">
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary glow-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground">
              Libra<span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your LibraAI account</p>
          </div>

          {/* Role Toggle */}
          <div className="flex rounded-2xl bg-surface p-1.5 mb-8 neu-inset">
            <button
              type="button"
              onClick={() => setLoginRole("user")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all duration-200",
                loginRole === "user"
                  ? "bg-card text-foreground shadow-md neu-raised"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="h-4 w-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setLoginRole("admin")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all duration-200",
                loginRole === "admin"
                  ? "gradient-primary text-primary-foreground shadow-md glow-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Shield className="h-4 w-4" />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 rounded-xl bg-surface border-border/50 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 rounded-xl bg-surface border-border/50 focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link to="/reset-password" className="text-sm text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all glow-primary text-base"
              disabled={loading}
            >
              {loading ? "Signing in…" : loginRole === "admin" ? "Sign In as Admin" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
