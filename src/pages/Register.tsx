import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Eye, EyeOff, Mail, Lock, User, Phone, IdCard, ArrowLeft, Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ADMIN_SECRET_KEY = "LibraAI@Admin2026";

const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
const strengthColors = ["bg-destructive", "bg-warning", "bg-primary", "bg-success"];

type SignupRole = "user" | "admin";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpValue, setOtpValue] = useState("");
  const [signupRole, setSignupRole] = useState<SignupRole>("user");
  const [adminSecretKey, setAdminSecretKey] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    collegeId: "",
    phone: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const strength = getPasswordStrength(formData.password);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (signupRole === "admin" && adminSecretKey !== ADMIN_SECRET_KEY) {
      toast.error("Invalid admin secret key");
      return;
    }
    setLoading(true);
    try {
      await signUp(formData.email, formData.password, {
        full_name: formData.name,
        college_id: formData.collegeId,
        phone: formData.phone,
        ...(signupRole === "admin" ? { admin_role: "true" } : {}),
      });
      toast.success("Verification code sent to your email!");
      setStep("otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: otpValue,
        type: "signup",
      });
      if (error) throw error;

      // If admin signup, add admin role
      if (signupRole === "admin" && data.user) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: data.user.id, role: "admin" });
        if (roleError) {
          console.error("Failed to assign admin role:", roleError);
          toast.error("Account created but admin role assignment failed. Contact support.");
        }
      }

      toast.success("Account verified! Welcome to LibraAI.");
      navigate(signupRole === "admin" ? "/admin" : "/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: formData.email,
      });
      if (error) throw error;
      toast.success("Verification code resent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4 py-12">
      <div className="absolute top-20 left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl hidden md:block" />

      <div className="w-full max-w-md relative">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">
            Libra<span className="text-primary">AI</span>
          </span>
        </Link>

        <Card className="border-border/50 shadow-xl">
          {step === "form" ? (
            <>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Create Account</CardTitle>
                <CardDescription>Join LibraAI and start exploring</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Role Toggle */}
                <div className="flex rounded-lg border border-border bg-muted/50 p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => setSignupRole("user")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all",
                      signupRole === "user"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <User className="h-4 w-4" />
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole("admin")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all",
                      signupRole === "admin"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="name" placeholder="John Doe" value={formData.name} onChange={update("name")} className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={update("email")} className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={update("password")}
                        className="pl-10 pr-10"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="space-y-1.5">
                        <div className="flex gap-1">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i < strength ? strengthColors[strength - 1] : "bg-muted")} />
                          ))}
                        </div>
                        <p className={cn("text-xs", strength <= 1 ? "text-destructive" : strength === 2 ? "text-warning" : "text-success")}>
                          {strengthLabels[strength - 1] || "Too short"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="collegeId">College ID</Label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="collegeId" placeholder="ID123" value={formData.collegeId} onChange={update("collegeId")} className="pl-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" type="tel" placeholder="+91..." value={formData.phone} onChange={update("phone")} className="pl-10" required />
                      </div>
                    </div>
                  </div>

                  {/* Admin Secret Key Field */}
                  {signupRole === "admin" && (
                    <div className="space-y-2">
                      <Label htmlFor="adminKey" className="flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5 text-primary" />
                        Admin Secret Key
                      </Label>
                      <Input
                        id="adminKey"
                        type="password"
                        placeholder="Enter admin secret key"
                        value={adminSecretKey}
                        onChange={(e) => setAdminSecretKey(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Contact your institution to get the admin secret key.
                      </p>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(c as boolean)} className="mt-0.5" />
                    <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground cursor-pointer leading-relaxed">
                      I agree to the{" "}
                      <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and{" "}
                      <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={!termsAccepted || loading}>
                    {loading ? "Creating account…" : signupRole === "admin" ? "Create Admin Account" : "Create Account"}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Verify Your Email</CardTitle>
                <CardDescription>
                  We sent a 6-digit code to <span className="font-medium text-foreground">{formData.email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button onClick={handleVerifyOtp} className="w-full" size="lg" disabled={otpValue.length !== 6 || loading}>
                  {loading ? "Verifying…" : "Verify & Continue"}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?{" "}
                    <button onClick={handleResendOtp} disabled={loading} className="text-primary font-medium hover:underline disabled:opacity-50">
                      Resend
                    </button>
                  </p>
                  <button onClick={() => setStep("form")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Back to registration
                  </button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Register;
