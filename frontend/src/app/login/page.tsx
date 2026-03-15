"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CosmiiConstellation } from "@/components/cosmii-constellation";
import { createClient } from "@/lib/supabase";

const serif = "font-[var(--font-serif)]";

export default function AuthPage() {
  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => { document.body.classList.remove("no-scroll"); };
  }, []);
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const navigateTo = useCallback((path: string) => {
    setLeaving(true);
    setTimeout(() => router.push(path), 600);
  }, [router]);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error("Google login error:", error);
        setLoading(false);
      }
    } catch (e) {
      console.error("Google login error:", e);
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <motion.div
      className="min-h-screen bg-[#060612] text-white overflow-hidden flex"
      initial={{ opacity: 0 }}
      animate={leaving ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-12 relative z-10">
        <div className="absolute inset-0 bg-[#060612]/1 lg:bg-transparent lg:bg-gradient-to-r lg:from-[#060612] lg:via-[#060612]/90 lg:to-[#060612]/25" />

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigateTo("/")}
            className="absolute top-6 left-8 z-20 group flex items-center gap-2"
          >
            <span className={`${serif} font-brand text-[22px] font-bold tracking-tight text-white/70 group-hover:text-white/90 transition-colors duration-500`}>Cosmii</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-[360px]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mb-10">
                  <h1 className={`${serif} text-[28px] text-white tracking-tight`}>
                    {isLogin ? "Welcome back" : "Create your universe"}
                  </h1>
                  <p className="text-[14px] text-white/50 mt-2">
                    {isLogin ? "Sign in to your universe" : "Start building your book memory"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-white text-[#060612] text-[14px] font-medium transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 cursor-pointer"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-[#060612]/20 border-t-[#060612] rounded-full"
                    />
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      {isLogin ? "Continue with Google" : "Sign up with Google"}
                    </>
                  )}
                </button>

                {!isLogin && (
                  <p className="text-center mt-8 text-[12px] text-white/30 leading-relaxed">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="text-white/50 hover:text-white/70 underline underline-offset-2 decoration-white/20 transition-colors duration-300">Terms</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-white/50 hover:text-white/70 underline underline-offset-2 decoration-white/20 transition-colors duration-300">Privacy Policy</Link>.
                  </p>
                )}

                <p className="text-center mt-8 text-[14px] text-white/40">
                  {isLogin ? "Don\u2019t have an account?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => setMode(isLogin ? "signup" : "login")}
                    className="text-white/70 hover:text-white transition-colors duration-300"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
      </div>

      {/* Mobile — subtle background constellation */}
      <div className="absolute inset-0 lg:hidden opacity-20 pointer-events-none">
        <CosmiiConstellation />
      </div>

      {/* Desktop — right half */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <CosmiiConstellation />
      </div>
    </motion.div>
  );
}
