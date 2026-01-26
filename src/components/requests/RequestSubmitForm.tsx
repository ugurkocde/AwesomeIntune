"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Turnstile } from "@marsidev/react-turnstile";
import { env } from "~/env";
import { CATEGORIES } from "~/lib/constants";
import { trackFormSubmission } from "~/lib/plausible";

type FormState = "idle" | "loading" | "success" | "error";

interface FormData {
  title: string;
  description: string;
  use_case: string;
  category: string;
}

type FormErrors = Record<string, string | undefined>;

interface SubmitResponse {
  success?: boolean;
  message?: string;
  error?: string;
  issueUrl?: string;
  issueNumber?: number;
  requestId?: string;
  details?: Record<string, string[]>;
}

interface RequestSubmitFormProps {
  onSuccess?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function RequestSubmitForm({ onSuccess }: RequestSubmitFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [issueUrl, setIssueUrl] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    use_case: "",
    category: "",
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Real-time form validity check
  const isFormValid =
    formData.title.length >= 10 &&
    formData.description.length >= 50 &&
    turnstileToken !== "";

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title || formData.title.length < 10) {
      newErrors.title = "Title must be at least 10 characters";
    }
    if (formData.title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }
    if (!formData.description || formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }
    if (formData.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }
    if (formData.use_case && formData.use_case.length > 1000) {
      newErrors.use_case = "Use case must be less than 1000 characters";
    }
    if (!turnstileToken) {
      newErrors.turnstile = "Please complete the CAPTCHA verification";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setState("loading");

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          turnstileToken,
        }),
      });

      const data = (await response.json()) as SubmitResponse;

      if (response.ok && data.success) {
        setState("success");
        setMessage(data.message ?? "Request submitted successfully!");
        setIssueUrl(data.issueUrl ?? "");
        trackFormSubmission("tool-request");
        onSuccess?.();
      } else {
        setState("error");
        if (data.details) {
          const serverErrors: FormErrors = {};
          Object.entries(data.details).forEach(([key, messages]) => {
            serverErrors[key] = messages[0];
          });
          setErrors(serverErrors);
        }
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Failed to submit. Please try again.");
    }
  };

  if (state === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl p-6 text-center md:p-8"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: "rgba(0, 255, 136, 0.15)",
            border: "1px solid rgba(0, 255, 136, 0.3)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--signal-success)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>

        <h3
          className="font-display text-xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Request Submitted!
        </h3>
        <p
          className="mx-auto mt-2 max-w-sm text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          Your tool request has been submitted. A GitHub issue has been created
          for community discussion.
        </p>

        {issueUrl && (
          <motion.a
            href={issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-6 inline-flex px-5 py-2.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View GitHub Issue
          </motion.a>
        )}
      </motion.div>
    );
  }

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Title */}
      <motion.div variants={itemVariants}>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          What tool do you need?{" "}
          <span style={{ color: "var(--signal-error)" }}>*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g., A tool to bulk update device categories"
          className="input"
          disabled={state === "loading"}
        />
        {errors.title ? (
          <p className="mt-1 text-xs" style={{ color: "var(--signal-error)" }}>
            {errors.title}
          </p>
        ) : (
          <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
            Minimum 10 characters
          </p>
        )}
      </motion.div>

      {/* Description */}
      <motion.div variants={itemVariants}>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Describe the tool{" "}
          <span style={{ color: "var(--signal-error)" }}>*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe what the tool should do, what problem it solves, and any specific features you'd like..."
          rows={4}
          className="input resize-none"
          disabled={state === "loading"}
        />
        <div className="mt-1 flex justify-between">
          {errors.description ? (
            <p className="text-xs" style={{ color: "var(--signal-error)" }}>
              {errors.description}
            </p>
          ) : (
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Minimum 50 characters
            </p>
          )}
          <span
            className="text-xs"
            style={{
              color:
                formData.description.length > 2000
                  ? "var(--signal-error)"
                  : formData.description.length < 50
                  ? "var(--text-tertiary)"
                  : "var(--signal-success)",
            }}
          >
            {formData.description.length}/2000
          </span>
        </div>
      </motion.div>

      {/* Use Case (Optional) */}
      <motion.div variants={itemVariants}>
        <label
          htmlFor="use_case"
          className="mb-2 block text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Use Case{" "}
          <span
            className="font-normal"
            style={{ color: "var(--text-tertiary)" }}
          >
            (optional)
          </span>
        </label>
        <textarea
          id="use_case"
          value={formData.use_case}
          onChange={(e) => updateField("use_case", e.target.value)}
          placeholder="Describe a specific scenario where this tool would be helpful..."
          rows={2}
          className="input resize-none"
          disabled={state === "loading"}
        />
        {errors.use_case && (
          <p className="mt-1 text-xs" style={{ color: "var(--signal-error)" }}>
            {errors.use_case}
          </p>
        )}
      </motion.div>

      {/* Category (Optional) */}
      <motion.div variants={itemVariants}>
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Category{" "}
          <span
            className="font-normal"
            style={{ color: "var(--text-tertiary)" }}
          >
            (optional)
          </span>
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => updateField("category", e.target.value)}
          className="input appearance-none pr-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%238899aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundPosition: "right 12px center",
            backgroundRepeat: "no-repeat",
          }}
          disabled={state === "loading"}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Turnstile CAPTCHA */}
      <motion.div variants={itemVariants}>
        <Turnstile
          siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={setTurnstileToken}
          onError={() => setTurnstileToken("")}
          onExpire={() => setTurnstileToken("")}
          options={{
            theme: "dark",
          }}
        />
        {errors.turnstile && (
          <p className="mt-2 text-xs" style={{ color: "var(--signal-error)" }}>
            {errors.turnstile}
          </p>
        )}
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {state === "error" && message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg p-3"
            style={{
              background: "rgba(255, 68, 68, 0.1)",
              border: "1px solid rgba(255, 68, 68, 0.3)",
            }}
          >
            <p className="text-sm" style={{ color: "var(--signal-error)" }}>
              {message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.div variants={itemVariants}>
        <motion.button
          type="submit"
          disabled={state === "loading" || !isFormValid}
          className="btn btn-primary w-full py-3"
          whileHover={{ scale: state === "loading" || !isFormValid ? 1 : 1.02 }}
          whileTap={{ scale: state === "loading" || !isFormValid ? 1 : 0.98 }}
          style={{
            opacity: state === "loading" || !isFormValid ? 0.5 : 1,
            cursor: !isFormValid ? "not-allowed" : undefined,
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
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </motion.svg>
                <span>Submitting...</span>
              </motion.div>
            ) : (
              <motion.span
                key="submit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Submit Request
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
