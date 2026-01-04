"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Turnstile } from "@marsidev/react-turnstile";
import { env } from "~/env";
import { CATEGORIES, TYPES } from "~/lib/constants";
import { CollapsibleSection } from "./CollapsibleSection";
import { trackFormSubmission } from "~/lib/plausible";

type FormState = "idle" | "loading" | "success" | "error";

interface FormData {
  name: string;
  description: string;
  author: string;
  repoUrl: string;
  category: string;
  type: string;
  githubUrl: string;
  linkedinUrl: string;
  xUrl: string;
  downloadUrl: string;
  websiteUrl: string;
  additionalInfo: string;
  acceptTerms: boolean;
}

type FormErrors = Record<string, string | undefined>;

interface SubmitResponse {
  success?: boolean;
  message?: string;
  error?: string;
  issueUrl?: string;
  issueNumber?: number;
  details?: Record<string, string[]>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function ToolSubmitForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [issueUrl, setIssueUrl] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    author: "",
    repoUrl: "",
    category: "",
    type: "",
    githubUrl: "",
    linkedinUrl: "",
    xUrl: "",
    downloadUrl: "",
    websiteUrl: "",
    additionalInfo: "",
    acceptTerms: false,
  });

  const updateField = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Real-time form validity check for submit button state
  const isFormValid =
    formData.name.length >= 2 &&
    formData.description.length >= 20 &&
    formData.author.length >= 2 &&
    formData.repoUrl.length > 0 &&
    formData.category !== "" &&
    formData.type !== "" &&
    formData.acceptTerms &&
    turnstileToken !== "";

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Tool name must be at least 2 characters";
    }
    if (!formData.description || formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }
    if (!formData.author || formData.author.length < 2) {
      newErrors.author = "Author name must be at least 2 characters";
    }
    if (!formData.repoUrl) {
      newErrors.repoUrl = "Tool URL is required";
    }
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }
    if (!formData.type) {
      newErrors.type = "Please select a type";
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the submission guidelines";
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
      const response = await fetch("/api/submit-tool", {
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
        setMessage(data.message ?? "Tool submitted successfully!");
        setIssueUrl(data.issueUrl ?? "");
        trackFormSubmission("tool-submission");
      } else {
        setState("error");
        if (data.details) {
          // Handle validation errors from server
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
        className="rounded-2xl p-8 text-center md:p-12"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(0, 255, 136, 0.15)",
            border: "1px solid rgba(0, 255, 136, 0.3)",
          }}
        >
          <svg
            width="32"
            height="32"
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

        <h2
          className="font-display text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Submission Received!
        </h2>
        <p className="mx-auto mt-3 max-w-md" style={{ color: "var(--text-secondary)" }}>
          Your submission has been received! A GitHub issue has been created for our
          maintainers to review. You can track the status of your submission using
          the link below.
        </p>

        {issueUrl && (
          <motion.a
            href={issueUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-8 inline-flex px-6 py-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
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
      className="rounded-2xl p-6 md:p-8"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Tool Information Section */}
      <motion.div variants={itemVariants} className="space-y-5">
        <h3
          className="font-display text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Tool Information
        </h3>

        {/* Tool Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Tool Name <span style={{ color: "var(--signal-error)" }}>*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g., IntuneBackupAndRestore"
            className="input"
            disabled={state === "loading"}
          />
          {errors.name ? (
            <p className="mt-1 text-xs" style={{ color: "var(--signal-error)" }}>
              {errors.name}
            </p>
          ) : (
            <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
              Minimum 2 characters
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Description <span style={{ color: "var(--signal-error)" }}>*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Describe what your tool does and how it helps Intune administrators..."
            rows={3}
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
                Minimum 20 characters
              </p>
            )}
            <span
              className="text-xs"
              style={{
                color:
                  formData.description.length > 500
                    ? "var(--signal-error)"
                    : formData.description.length < 20
                    ? "var(--text-tertiary)"
                    : "var(--signal-success)",
              }}
            >
              {formData.description.length}/500
            </span>
          </div>
        </div>

        {/* Author Name */}
        <div>
          <label
            htmlFor="author"
            className="mb-2 block text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Author Name <span style={{ color: "var(--signal-error)" }}>*</span>
          </label>
          <input
            id="author"
            type="text"
            value={formData.author}
            onChange={(e) => updateField("author", e.target.value)}
            placeholder="Your name or organization"
            className="input"
            disabled={state === "loading"}
          />
          {errors.author ? (
            <p className="mt-1 text-xs" style={{ color: "var(--signal-error)" }}>
              {errors.author}
            </p>
          ) : (
            <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
              Minimum 2 characters
            </p>
          )}
        </div>

        {/* Tool URL */}
        <div>
          <label
            htmlFor="repoUrl"
            className="mb-2 block text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Tool URL <span style={{ color: "var(--signal-error)" }}>*</span>
            <span className="ml-2 font-normal" style={{ color: "var(--text-tertiary)" }}>
              (GitHub recommended)
            </span>
          </label>
          <div className="relative">
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
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <input
              id="repoUrl"
              type="url"
              value={formData.repoUrl}
              onChange={(e) => updateField("repoUrl", e.target.value)}
              placeholder="https://github.com/username/repo or any valid URL"
              className="input pl-10"
              disabled={state === "loading"}
            />
          </div>
          {errors.repoUrl && (
            <p className="mt-1 text-xs" style={{ color: "var(--signal-error)" }}>
              {errors.repoUrl}
            </p>
          )}
        </div>
      </motion.div>

      {/* Classification Section */}
      <motion.div variants={itemVariants} className="mt-8 space-y-5">
        <h3
          className="font-display text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Classification
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Category <span style={{ color: "var(--signal-error)" }}>*</span>
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
            {errors.category && (
              <p className="mt-1 text-xs" style={{ color: "var(--signal-error)" }}>
                {errors.category}
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Type <span style={{ color: "var(--signal-error)" }}>*</span>
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => updateField("type", e.target.value)}
              className="input appearance-none pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%238899aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 12px center",
                backgroundRepeat: "no-repeat",
              }}
              disabled={state === "loading"}
            >
              <option value="">Select a type</option>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-xs" style={{ color: "var(--signal-error)" }}>
                {errors.type}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Optional Fields */}
      <motion.div variants={itemVariants} className="mt-8">
        <CollapsibleSection title="Optional: Author & Links">
          {/* GitHub URL */}
          <div>
            <label
              htmlFor="githubUrl"
              className="mb-2 block text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              GitHub Profile
            </label>
            <input
              id="githubUrl"
              type="url"
              value={formData.githubUrl}
              onChange={(e) => updateField("githubUrl", e.target.value)}
              placeholder="https://github.com/username"
              className="input"
              disabled={state === "loading"}
            />
            <p className="mt-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
              Your profile picture will be automatically derived from this URL
            </p>
          </div>

          {/* LinkedIn URL */}
          <div>
            <label
              htmlFor="linkedinUrl"
              className="mb-2 block text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              LinkedIn Profile
            </label>
            <input
              id="linkedinUrl"
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => updateField("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="input"
              disabled={state === "loading"}
            />
          </div>

          {/* X/Twitter URL */}
          <div>
            <label
              htmlFor="xUrl"
              className="mb-2 block text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              X / Twitter Profile
            </label>
            <input
              id="xUrl"
              type="url"
              value={formData.xUrl}
              onChange={(e) => updateField("xUrl", e.target.value)}
              placeholder="https://x.com/username"
              className="input"
              disabled={state === "loading"}
            />
          </div>

          {/* Download URL */}
          <div>
            <label
              htmlFor="downloadUrl"
              className="mb-2 block text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Download URL
            </label>
            <input
              id="downloadUrl"
              type="url"
              value={formData.downloadUrl}
              onChange={(e) => updateField("downloadUrl", e.target.value)}
              placeholder="https://powershellgallery.com/packages/..."
              className="input"
              disabled={state === "loading"}
            />
          </div>

          {/* Website URL */}
          <div>
            <label
              htmlFor="websiteUrl"
              className="mb-2 block text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Website / Demo URL
            </label>
            <input
              id="websiteUrl"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => updateField("websiteUrl", e.target.value)}
              placeholder="https://example.com"
              className="input"
              disabled={state === "loading"}
            />
          </div>

          {/* Additional Info */}
          <div>
            <label
              htmlFor="additionalInfo"
              className="mb-2 block text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Additional Information
            </label>
            <textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => updateField("additionalInfo", e.target.value)}
              placeholder="Any additional context or notes about your tool..."
              rows={3}
              className="input resize-none"
              disabled={state === "loading"}
            />
          </div>
        </CollapsibleSection>
      </motion.div>

      {/* Turnstile CAPTCHA */}
      <motion.div variants={itemVariants} className="mt-8">
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

      {/* Terms Checkbox */}
      <motion.div variants={itemVariants} className="mt-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={(e) => updateField("acceptTerms", e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded"
            style={{
              accentColor: "var(--accent-primary)",
            }}
            disabled={state === "loading"}
          />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            I confirm this tool is Intune-related, publicly accessible, and I have permission to submit it.
          </span>
        </label>
        {errors.acceptTerms && (
          <p className="mt-1 ml-8 text-xs" style={{ color: "var(--signal-error)" }}>
            {errors.acceptTerms}
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
            className="mt-6 rounded-lg p-4"
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
      <motion.div variants={itemVariants} className="mt-8">
        <motion.button
          type="submit"
          disabled={state === "loading" || !isFormValid}
          className="btn btn-primary w-full py-4 text-base"
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
                  width="20"
                  height="20"
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
                Submit Tool
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
