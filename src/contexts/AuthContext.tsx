import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "user";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: { full_name: string | null; college_id: string | null; phone: string | null; avatar_url: string | null } | null;
  roles: AppRole[];
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, meta: { full_name: string; college_id: string; phone: string; admin_role?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async (userId: string) => {
    const [profileRes, rolesRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, college_id, phone, avatar_url")
        .eq("id", userId)
        .single(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId),
    ]);
    setProfile(profileRes.data);
    setRoles((rolesRes.data || []).map((r) => r.role));
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up listener first (no await inside callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to avoid blocking the callback
          setTimeout(() => {
            if (mounted) {
              loadUserData(session.user.id).then(() => {
                if (mounted) setIsLoading(false);
              });
            }
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
          setIsLoading(false);
        }
      }
    );

    // Then restore session from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id).then(() => {
          if (mounted) setIsLoading(false);
        });
      } else {
        if (mounted) setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  };

  const signUp = async (
    email: string,
    password: string,
    meta: { full_name: string; college_id: string; phone: string; admin_role?: string }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: meta.full_name, ...(meta.admin_role ? { admin_role: meta.admin_role } : {}) },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        roles,
        isAdmin: roles.includes("admin"),
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
