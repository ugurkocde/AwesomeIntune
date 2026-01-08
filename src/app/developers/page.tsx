"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";
import { env } from "~/env";

type FormState = "idle" | "loading" | "success" | "error";
type DocTab = "quickstart" | "examples" | "reference";

interface FormData {
  name: string;
  email: string;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

const codeBlockStyle = {
  background: "rgba(0, 0, 0, 0.4)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "8px",
  padding: "12px",
  overflow: "auto" as const,
  fontSize: "12px",
  lineHeight: "1.5",
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
};

const CATEGORIES = ["reporting", "automation", "packaging", "troubleshooting", "security", "configuration", "monitoring", "migration", "other"];
const TYPES = ["powershell-module", "powershell-script", "web-app", "desktop-app", "browser-extension", "cli-tool", "api-wrapper", "documentation", "other"];

export default function DevelopersPage() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [activeTab, setActiveTab] = useState<DocTab>("quickstart");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
  });

  const isFormValid =
    formData.name.length >= 2 &&
    formData.email.includes("@") &&
    turnstileToken !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setState("loading");

    try {
      const response = await fetch("/api/v1/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          turnstileToken,
        }),
      });

      const data = (await response.json()) as ApiResponse;

      if (response.ok && data.success) {
        setState("success");
        setMessage(data.message ?? "API key created successfully!");
      } else {
        setState("error");
        setMessage(data.error?.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Failed to request API key. Please try again.");
    }
  };

  const tabs: { id: DocTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "quickstart",
      label: "Quick Start",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
    {
      id: "examples",
      label: "Examples",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      id: "reference",
      label: "Reference",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="min-h-screen pt-32 pb-20">
      <div className="container-main">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-6xl"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10 text-center">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--accent-primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to Tools
            </Link>
            <h1
              className="font-display text-4xl font-bold md:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              Developer API
            </h1>
            <p
              className="mt-3 text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              Access the Awesome Intune tools collection programmatically
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-12 overflow-hidden">
            {/* Left Column - Registration & Info */}
            <motion.div variants={itemVariants} className="lg:col-span-4 space-y-4 min-w-0">
              {/* Registration Form */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <h2
                  className="font-display text-lg font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Get Your API Key
                </h2>

                <AnimatePresence mode="wait">
                  {state === "success" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                        style={{
                          background: "rgba(0, 255, 136, 0.15)",
                          border: "1px solid rgba(0, 255, 136, 0.3)",
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--signal-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </motion.div>
                      <p style={{ color: "var(--text-primary)" }} className="font-medium">
                        Check Your Email
                      </p>
                      <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                        {message}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-3"
                    >
                      <div>
                        <label htmlFor="name" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          Your Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                          className="input"
                          disabled={state === "loading"}
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="you@example.com"
                          className="input"
                          disabled={state === "loading"}
                        />
                      </div>

                      <div className="pt-1">
                        <Turnstile
                          siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                          onSuccess={setTurnstileToken}
                          onError={() => setTurnstileToken("")}
                          onExpire={() => setTurnstileToken("")}
                          options={{ theme: "dark" }}
                        />
                      </div>

                      {state === "error" && message && (
                        <div
                          className="rounded-lg p-2.5"
                          style={{
                            background: "rgba(255, 68, 68, 0.1)",
                            border: "1px solid rgba(255, 68, 68, 0.3)",
                          }}
                        >
                          <p className="text-sm" style={{ color: "var(--signal-error)" }}>
                            {message}
                          </p>
                        </div>
                      )}

                      <motion.button
                        type="submit"
                        disabled={state === "loading" || !isFormValid}
                        className="btn btn-primary w-full py-2.5"
                        whileHover={{ scale: state === "loading" || !isFormValid ? 1 : 1.02 }}
                        whileTap={{ scale: state === "loading" || !isFormValid ? 1 : 0.98 }}
                        style={{
                          opacity: state === "loading" || !isFormValid ? 0.5 : 1,
                          cursor: !isFormValid ? "not-allowed" : undefined,
                        }}
                      >
                        {state === "loading" ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </motion.svg>
                            Requesting...
                          </span>
                        ) : (
                          "Get API Key"
                        )}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Rate Limit</div>
                  <div className="font-bold" style={{ color: "var(--accent-primary)" }}>1,000/day</div>
                </div>
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Reset</div>
                  <div className="font-bold" style={{ color: "var(--text-primary)" }}>Midnight UTC</div>
                </div>
              </div>

              {/* Base URL */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Base URL
                </div>
                <code
                  className="block text-sm break-all"
                  style={{ color: "var(--accent-primary)" }}
                >
                  https://awesomeintune.com/api/v1
                </code>
              </div>

              {/* Endpoints Quick View */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="text-xs font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                  Endpoints
                </div>
                <div className="space-y-2">
                  {[
                    { path: "/tools", desc: "List tools" },
                    { path: "/tools/:id", desc: "Get tool" },
                    { path: "/categories", desc: "List categories" },
                    { path: "/stats", desc: "Get stats" },
                  ].map((ep) => (
                    <div key={ep.path} className="flex items-center gap-2 min-w-0">
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0"
                        style={{
                          background: "rgba(0, 212, 255, 0.15)",
                          color: "var(--accent-primary)",
                        }}
                      >
                        GET
                      </span>
                      <code className="text-xs shrink-0" style={{ color: "var(--text-primary)" }}>{ep.path}</code>
                      <span className="text-xs ml-auto hidden sm:inline" style={{ color: "var(--text-tertiary)" }}>{ep.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Tabbed Documentation */}
            <motion.div variants={itemVariants} className="lg:col-span-8 min-w-0">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {/* Tab Navigation */}
                <div
                  className="flex border-b"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap flex-1"
                      style={{
                        color: activeTab === tab.id ? "var(--accent-primary)" : "var(--text-secondary)",
                        background: activeTab === tab.id ? "rgba(0, 212, 255, 0.05)" : "transparent",
                      }}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ background: "var(--accent-primary)" }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-4 sm:p-5 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {activeTab === "quickstart" && (
                      <motion.div
                        key="quickstart"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5 min-w-0"
                      >
                        {/* Authentication */}
                        <div>
                          <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                            Authentication
                          </h3>
                          <p className="text-sm mb-3" style={{ color: "var(--text-tertiary)" }}>
                            Include your API key in the <code style={{ color: "var(--accent-primary)" }}>X-API-Key</code> header with every request.
                          </p>
                          <pre style={codeBlockStyle}>
                            <code style={{ color: "var(--text-primary)" }}>
{`curl -H "X-API-Key: ai_your-key-here" \\
  https://awesomeintune.com/api/v1/tools`}
                            </code>
                          </pre>
                        </div>

                        {/* Response Format */}
                        <div>
                          <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                            Response Format
                          </h3>
                          <p className="text-sm mb-3" style={{ color: "var(--text-tertiary)" }}>
                            All responses follow a consistent JSON structure with <code style={{ color: "var(--accent-primary)" }}>data</code> and <code style={{ color: "var(--accent-primary)" }}>meta</code> fields.
                          </p>
                          <pre style={codeBlockStyle}>
                            <code style={{ color: "var(--text-primary)" }}>
{`{
  "data": [...],
  "meta": { "total": 84, "limit": 20, "offset": 0, "hasMore": true }
}`}
                            </code>
                          </pre>
                        </div>

                        {/* Query Parameters */}
                        <div>
                          <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                            Query Parameters for /tools
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr style={{ color: "var(--text-secondary)" }}>
                                  <th className="text-left py-2 pr-4 font-medium">Param</th>
                                  <th className="text-left py-2 pr-4 font-medium">Default</th>
                                  <th className="text-left py-2 font-medium">Description</th>
                                </tr>
                              </thead>
                              <tbody style={{ color: "var(--text-tertiary)" }}>
                                {[
                                  { param: "category", default: "-", desc: "Filter by category" },
                                  { param: "type", default: "-", desc: "Filter by tool type" },
                                  { param: "sort", default: "newest", desc: "newest | popular | votes | name" },
                                  { param: "limit", default: "20", desc: "Results per page (max 100)" },
                                  { param: "offset", default: "0", desc: "Pagination offset" },
                                ].map((row) => (
                                  <tr key={row.param} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                                    <td className="py-2 pr-4"><code style={{ color: "var(--accent-primary)" }}>{row.param}</code></td>
                                    <td className="py-2 pr-4">{row.default}</td>
                                    <td className="py-2">{row.desc}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "examples" && (
                      <motion.div
                        key="examples"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5 min-w-0"
                      >
                        {/* Code Examples in 2 columns on desktop */}
                        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: "#f97316" }} />
                              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>cURL</span>
                            </div>
                            <pre style={codeBlockStyle}>
                              <code style={{ color: "var(--text-primary)" }}>
{`curl -H "X-API-Key: YOUR_KEY" \\
  "https://awesomeintune.com/api/v1/tools?category=automation&limit=10"`}
                              </code>
                            </pre>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full" style={{ background: "#eab308" }} />
                              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>JavaScript</span>
                            </div>
                            <pre style={codeBlockStyle}>
                              <code style={{ color: "var(--text-primary)" }}>
{`const res = await fetch(url, {
  headers: { "X-API-Key": "YOUR_KEY" }
});
const { data } = await res.json();`}
                              </code>
                            </pre>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: "#3b82f6" }} />
                            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Python</span>
                          </div>
                          <pre style={codeBlockStyle}>
                            <code style={{ color: "var(--text-primary)" }}>
{`import requests
response = requests.get("https://awesomeintune.com/api/v1/tools",
    headers={"X-API-Key": "YOUR_KEY"}, params={"category": "automation"})
data = response.json()`}
                            </code>
                          </pre>
                        </div>

                        {/* Response Examples */}
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
                            Response Examples
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="min-w-0">
                              <div className="text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>GET /tools</div>
                              <pre style={{ ...codeBlockStyle, fontSize: "11px" }}>
                                <code style={{ color: "var(--text-primary)" }}>
{`{
  "data": [{
    "id": "tool-id",
    "name": "Tool Name",
    "category": "automation",
    "type": "powershell-module",
    "votes": 42, "views": 1250
  }],
  "meta": { "total": 84, ... }
}`}
                                </code>
                              </pre>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs mb-2" style={{ color: "var(--text-tertiary)" }}>GET /stats</div>
                              <pre style={{ ...codeBlockStyle, fontSize: "11px" }}>
                                <code style={{ color: "var(--text-primary)" }}>
{`{
  "data": {
    "totalTools": 84,
    "totalAuthors": 56,
    "totalViews": 193890,
    "totalVotes": 56,
    "categoryBreakdown": {...},
    "typeBreakdown": {...}
  }
}`}
                                </code>
                              </pre>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "reference" && (
                      <motion.div
                        key="reference"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5 min-w-0"
                      >
                        {/* Valid Values */}
                        <div>
                          <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
                            Valid Parameter Values
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>category</div>
                              <div className="flex flex-wrap gap-1">
                                {CATEGORIES.map((cat) => (
                                  <code key={cat} className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: "rgba(0, 0, 0, 0.3)", color: "var(--accent-primary)" }}>
                                    {cat}
                                  </code>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>type</div>
                              <div className="flex flex-wrap gap-1">
                                {TYPES.map((type) => (
                                  <code key={type} className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: "rgba(0, 0, 0, 0.3)", color: "var(--accent-primary)" }}>
                                    {type}
                                  </code>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Response Headers */}
                        <div>
                          <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                            Response Headers
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <tbody style={{ color: "var(--text-tertiary)" }}>
                                <tr className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                                  <td className="py-2 pr-4"><code style={{ color: "var(--accent-primary)" }}>X-RateLimit-Remaining</code></td>
                                  <td className="py-2">Requests remaining in current period</td>
                                </tr>
                                <tr className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                                  <td className="py-2 pr-4"><code style={{ color: "var(--accent-primary)" }}>Cache-Control</code></td>
                                  <td className="py-2">Caching directives (varies by endpoint)</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Error Codes */}
                        <div>
                          <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                            Error Codes
                          </h3>
                          <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
                            Errors return: <code style={{ color: "var(--text-secondary)" }}>{`{ "error": { "code": "...", "message": "..." } }`}</code>
                          </p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr style={{ color: "var(--text-secondary)" }}>
                                  <th className="text-left py-2 pr-4 font-medium">HTTP</th>
                                  <th className="text-left py-2 pr-4 font-medium">Code</th>
                                  <th className="text-left py-2 font-medium">Description</th>
                                </tr>
                              </thead>
                              <tbody style={{ color: "var(--text-tertiary)" }}>
                                {[
                                  { http: "401", code: "INVALID_KEY", desc: "Missing or invalid API key" },
                                  { http: "400", code: "INVALID_PARAMS", desc: "Invalid query parameters" },
                                  { http: "404", code: "NOT_FOUND", desc: "Resource not found" },
                                  { http: "429", code: "RATE_LIMITED", desc: "Rate limit exceeded" },
                                  { http: "500", code: "INTERNAL_ERROR", desc: "Server error" },
                                ].map((row) => (
                                  <tr key={row.code} className="border-t" style={{ borderColor: "var(--border-subtle)" }}>
                                    <td className="py-2 pr-4">{row.http}</td>
                                    <td className="py-2 pr-4"><code style={{ color: "var(--signal-error)" }}>{row.code}</code></td>
                                    <td className="py-2">{row.desc}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
