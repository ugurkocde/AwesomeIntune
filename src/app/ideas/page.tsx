"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { RequestCard, RequestModal } from "~/components/requests";
import { useRequestVoting } from "~/hooks/useRequestVoting";
import { CATEGORIES } from "~/lib/constants";
import type { ToolRequestWithVotes, RequestStatus } from "~/types/request";

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

type SortOption = "votes" | "newest";

const STATUS_OPTIONS: { value: RequestStatus | ""; label: string }[] = [
  { value: "", label: "All Status" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "votes", label: "Most Wanted" },
  { value: "newest", label: "Newest" },
];

export default function RequestsPage() {
  const [requests, setRequests] = useState<ToolRequestWithVotes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("votes");

  // Voting hook
  const { voteCounts, hasVoted, isVotePending, vote } = useRequestVoting();

  // Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (categoryFilter) params.set("category", categoryFilter);
        params.set("sort", sortBy);

        const response = await fetch(`/api/ideas?${params.toString()}`);
        if (response.ok) {
          const data = (await response.json()) as {
            requests: ToolRequestWithVotes[];
          };
          setRequests(data.requests);
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchRequests();
  }, [statusFilter, categoryFilter, sortBy]);

  // Refresh requests when modal closes (after submission)
  const handleModalClose = () => {
    setIsModalOpen(false);
    // Refresh the list with cache bypass to ensure fresh data
    setIsLoading(true);
    const fetchRequests = async () => {
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (categoryFilter) params.set("category", categoryFilter);
        params.set("sort", sortBy);

        const response = await fetch(`/api/ideas?${params.toString()}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = (await response.json()) as {
            requests: ToolRequestWithVotes[];
          };
          setRequests(data.requests);
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchRequests();
  };

  // Merge vote counts with requests
  const requestsWithVotes = useMemo(() => {
    return requests.map((req) => ({
      ...req,
      vote_count: voteCounts[req.id] ?? req.vote_count,
    }));
  }, [requests, voteCounts]);

  // Sort requests
  const sortedRequests = useMemo(() => {
    const sorted = [...requestsWithVotes];
    if (sortBy === "votes") {
      sorted.sort((a, b) => b.vote_count - a.vote_count);
    } else {
      sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return sorted;
  }, [requestsWithVotes, sortBy]);

  return (
    <section className="min-h-screen pb-20 pt-32">
      <div className="container-main">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-5xl"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10 text-center">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--accent-primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to Tools
            </Link>
            <h1
              className="font-display text-4xl font-bold md:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              Tool Ideas
            </h1>
            <p
              className="mt-4 text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              Submit ideas for tools that don&apos;t exist yet and vote for the
              ones you need most
            </p>

            {/* Submit Idea Button */}
            <motion.button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary mt-6 inline-flex px-6 py-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Submit an Idea
            </motion.button>
          </motion.div>

          {/* Filters */}
          <motion.div
            variants={itemVariants}
            className="mb-8 flex flex-wrap items-center justify-center gap-3"
          >
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as RequestStatus | "")
              }
              className="input appearance-none py-2 pr-10 text-sm"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238899aa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 10px center",
                backgroundRepeat: "no-repeat",
                minWidth: "140px",
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input appearance-none py-2 pr-10 text-sm"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238899aa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 10px center",
                backgroundRepeat: "no-repeat",
                minWidth: "160px",
              }}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="input appearance-none py-2 pr-10 text-sm"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238899aa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 10px center",
                backgroundRepeat: "no-repeat",
                minWidth: "140px",
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Results Count */}
          <motion.div
            variants={itemVariants}
            className="mb-6 text-center text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            {isLoading ? (
              "Loading ideas..."
            ) : (
              <>
                {sortedRequests.length}{" "}
                {sortedRequests.length === 1 ? "idea" : "ideas"} found
              </>
            )}
          </motion.div>

          {/* Requests Grid */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <div className="grid gap-5 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl p-5"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div className="mb-3 flex justify-between">
                      <div
                        className="h-5 w-16 rounded"
                        style={{ background: "var(--bg-tertiary)" }}
                      />
                      <div
                        className="h-8 w-14 rounded"
                        style={{ background: "var(--bg-tertiary)" }}
                      />
                    </div>
                    <div
                      className="mb-2 h-6 w-3/4 rounded"
                      style={{ background: "var(--bg-tertiary)" }}
                    />
                    <div
                      className="mb-1 h-4 w-full rounded"
                      style={{ background: "var(--bg-tertiary)" }}
                    />
                    <div
                      className="h-4 w-2/3 rounded"
                      style={{ background: "var(--bg-tertiary)" }}
                    />
                  </div>
                ))}
              </div>
            ) : sortedRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl p-12 text-center"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-tertiary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <h3
                  className="mb-2 text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  No ideas found
                </h3>
                <p
                  className="mb-6 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {statusFilter || categoryFilter
                    ? "Try adjusting your filters or be the first to submit an idea!"
                    : "Be the first to submit a tool idea!"}
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-primary inline-flex px-5 py-2.5"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Submit an Idea
                </button>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="grid gap-5 md:grid-cols-2">
                  {sortedRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      voteCount={voteCounts[request.id] ?? request.vote_count}
                      hasVoted={hasVoted(request.id)}
                      isPending={isVotePending(request.id)}
                      onVote={vote}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Request Modal */}
      <RequestModal isOpen={isModalOpen} onClose={handleModalClose} />
    </section>
  );
}
