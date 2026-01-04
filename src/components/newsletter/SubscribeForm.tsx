"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SubscribeFormProps {
  variant?: "hero" | "footer";
}

type FormState = "idle" | "loading" | "success" | "error";

export function SubscribeForm({ variant = "footer" }: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const isHero = variant === "hero";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email?.includes("@")) {
      setState("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setState("loading");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string; error?: string };

      if (response.ok && data.success) {
        setState("success");
        setMessage(data.message ?? "Check your email to confirm.");
        setEmail("");
      } else {
        setState("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Failed to sign up. Please try again.");
    }
  };

  const resetForm = () => {
    setState("idle");
    setMessage("");
  };

  return (
    <div className={isHero ? "w-full max-w-md mx-auto" : "space-y-3"}>
      {isHero && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-3"
          style={{ color: "var(--text-secondary)", fontSize: "var(--text-small)" }}
        >
          Get notified when new tools are added
        </motion.p>
      )}

      <AnimatePresence mode="wait">
        {state === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex items-center gap-3 ${isHero ? "justify-center" : ""}`}
          >
            <div
              className="flex items-center gap-2 rounded-lg px-4 py-3"
              style={{
                background: "rgba(0, 255, 136, 0.1)",
                border: "1px solid rgba(0, 255, 136, 0.3)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--signal-success)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ color: "var(--signal-success)", fontSize: "var(--text-small)" }}>
                {message}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className={isHero ? "flex gap-2" : "space-y-3"}
          >
            <div className={`relative ${isHero ? "flex-1" : ""}`}>
              <div
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-tertiary)" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") resetForm();
                }}
                placeholder="Enter your email"
                disabled={state === "loading"}
                className="input w-full"
                style={{
                  height: isHero ? "48px" : "44px",
                  fontSize: "var(--text-small)",
                  opacity: state === "loading" ? 0.7 : 1,
                  paddingLeft: "44px",
                }}
                aria-label="Email address"
              />
            </div>

            <button
              type="submit"
              disabled={state === "loading"}
              className="btn btn-primary"
              style={{
                height: isHero ? "48px" : "44px",
                minWidth: isHero ? "120px" : "100%",
                opacity: state === "loading" ? 0.7 : 1,
              }}
            >
              <AnimatePresence mode="wait">
                {state === "loading" ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <motion.svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </motion.svg>
                    <span>Signing up...</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="notify"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Notify Me
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state === "error" && message && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-center"
            style={{ color: "var(--signal-error)", fontSize: "var(--text-small)" }}
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      {!isHero && state !== "success" && (
        <p style={{ color: "var(--text-tertiary)", fontSize: "var(--text-micro)" }}>
          Get notified when new tools are added
        </p>
      )}
    </div>
  );
}
