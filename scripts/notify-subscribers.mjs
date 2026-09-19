import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { createHash } from "crypto";
import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOOLS_DIR = join(__dirname, "..", "data", "tools");

// Environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = process.env.SITE_URL || "https://awesomeintune.com";

if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(RESEND_API_KEY);

async function getAllTools() {
  const files = await readdir(TOOLS_DIR);
  const tools = [];

  for (const file of files) {
    // Match the site loader: never treat the empty template as a real tool.
    if (file.endsWith(".json") && file !== "template.json") {
      const content = await readFile(join(TOOLS_DIR, file), "utf-8");
      const tool = JSON.parse(content);
      tools.push(tool);
    }
  }

  return tools;
}

async function getSentNotifications() {
  const { data, error } = await supabase
    .from("sent_notifications")
    .select("tool_id");

  if (error) {
    // Never fall back to an empty list: that makes every tool look new and
    // would re-announce the entire catalog on the next run.
    throw new Error(`Failed to fetch sent notifications: ${error.message}`);
  }

  return data.map((n) => n.tool_id);
}

async function getConfirmedSubscribers() {
  const { data, error } = await supabase
    .from("subscribers")
    .select("id, email, unsubscribe_token")
    .eq("confirmed", true);

  if (error) {
    // An empty fallback here would record new tools as notified with zero
    // recipients, silently dropping the notification.
    throw new Error(`Failed to fetch subscribers: ${error.message}`);
  }

  return data;
}

// Map of subscriber_id -> Set of tool_ids already delivered to them. Filtered
// by tool only, and paginated past the Supabase 1000-row API limit, so no
// delivery is missed (which would cause a duplicate send).
async function getDeliveries(toolIds) {
  const pageSize = 1000;
  const delivered = new Map();

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("notification_deliveries")
      .select("tool_id, subscriber_id")
      .in("tool_id", toolIds)
      .order("tool_id", { ascending: true })
      .order("subscriber_id", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(`Failed to fetch deliveries: ${error.message}`);
    }

    for (const row of data ?? []) {
      const set = delivered.get(row.subscriber_id) ?? new Set();
      set.add(row.tool_id);
      delivered.set(row.subscriber_id, set);
    }

    if (!data || data.length < pageSize) break;
  }

  return delivered;
}

async function recordDeliveries(rows) {
  if (!rows.length) return;
  const { error } = await supabase
    .from("notification_deliveries")
    .insert(rows);
  if (error) {
    throw new Error(`Failed to record deliveries: ${error.message}`);
  }
}

/**
 * For each subscriber, the pending tools they have not received yet. Exported
 * for tests; returns one entry per subscriber that still needs an email.
 */
export function planDeliveries(pendingTools, subscribers, deliveredBySubscriber) {
  const plan = [];
  for (const subscriber of subscribers) {
    const delivered = deliveredBySubscriber.get(subscriber.id) ?? new Set();
    const tools = pendingTools.filter((tool) => !delivered.has(tool.id));
    if (tools.length) plan.push({ subscriber, tools });
  }
  return plan;
}

async function recordSentNotification(toolId, recipientCount) {
  const { error } = await supabase.from("sent_notifications").insert({
    tool_id: toolId,
    recipient_count: recipientCount,
  });

  if (error) {
    // Fail loudly so a missing record does not lead to a silent re-announce.
    throw new Error(`Failed to record notification for ${toolId}: ${error.message}`);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCategory(category) {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatType(type) {
  const typeLabels = {
    "powershell-module": "PowerShell Module",
    "powershell-script": "PowerShell Script",
    "web-app": "Web App",
    "desktop-app": "Desktop App",
    "browser-extension": "Browser Extension",
    "cli-tool": "CLI Tool",
    "api-wrapper": "API Wrapper",
    documentation: "Documentation",
    other: "Tool",
  };
  return typeLabels[type] || type;
}

function generateEmailHtml(tools, unsubscribeUrl) {
  const toolCards = tools
    .map(
      (tool) => `
    <div style="background-color: #171717; border-radius: 12px; border: 1px solid #2a2a2a; padding: 24px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td>
            <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 0 0 12px; line-height: 1.3;">${escapeHtml(tool.name)}</h2>
            <div style="margin-bottom: 16px;">
              <span style="display: inline-block; background-color: #00d4ff20; color: #00d4ff; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHtml(formatCategory(tool.category))}</span>
              <span style="display: inline-block; background-color: #262626; color: #a3a3a3; font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 12px; margin-left: 6px;">${escapeHtml(formatType(tool.type))}</span>
            </div>
            <p style="color: #d4d4d4; font-size: 14px; line-height: 24px; margin: 0 0 16px;">${escapeHtml(tool.description)}</p>
            <p style="color: #737373; font-size: 13px; margin: 0;">
              <span style="color: #a3a3a3;">By</span> <span style="color: #ffffff; font-weight: 500;">${escapeHtml(tool.author)}</span>
            </p>
          </td>
        </tr>
      </table>
      <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #2a2a2a;">
        <a href="${SITE_URL}/tools/${encodeURIComponent(tool.id)}" style="color: #00d4ff; font-size: 14px; font-weight: 500; text-decoration: none;">View Details &rarr;</a>
      </div>
    </div>
  `
    )
    .join("");

  const toolCount = tools.length;
  const greeting = "Hey there!";
  const introText =
    toolCount === 1
      ? `A new community tool has just been added to Awesome Intune that you might find useful.`
      : `${toolCount} new community tools have just been added to Awesome Intune that you might find useful.`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Tools on Awesome Intune</title>
</head>
<body style="background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
  <div style="margin: 0 auto; padding: 48px 24px; max-width: 580px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #00d4ff; font-size: 32px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Awesome Intune</h1>
      <p style="color: #525252; font-size: 14px; margin: 8px 0 0;">Your curated collection of Intune community tools</p>
    </div>

    <!-- Greeting -->
    <p style="color: #ffffff; font-size: 18px; font-weight: 500; margin: 0 0 8px;">${greeting}</p>
    <p style="color: #a3a3a3; font-size: 16px; line-height: 26px; margin: 0 0 32px;">${introText}</p>

    <!-- Tool Cards -->
    ${toolCards}

    <!-- CTA Button -->
    <div style="text-align: center; margin: 40px 0;">
      <a href="${SITE_URL}" style="background: linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%); border-radius: 10px; color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 16px 32px; box-shadow: 0 4px 14px rgba(0, 212, 255, 0.25);">Browse All Tools</a>
    </div>

    <!-- Divider -->
    <hr style="border: none; border-top: 1px solid #262626; margin: 40px 0;">

    <!-- Footer -->
    <div style="text-align: center;">
      <p style="color: #525252; font-size: 13px; line-height: 22px; margin: 0 0 16px;">
        You're receiving this because you subscribed to Awesome Intune updates.<br>
        Know someone who'd find this useful? <a href="${SITE_URL}" style="color: #00d4ff; text-decoration: none;">Share Awesome Intune</a>
      </p>
      <p style="color: #525252; font-size: 12px; margin: 0 0 16px;">
        A project by <a href="https://ugurlabs.com" style="color: #00d4ff; text-decoration: none;">UgurLabs.com</a>
      </p>
      <a href="${unsubscribeUrl}" style="color: #525252; font-size: 12px; text-decoration: underline;">Unsubscribe from these emails</a>
    </div>

  </div>
</body>
</html>
`;
}

// Resend dedupes requests that share an Idempotency-Key, so a retry after a
// partial failure does not email a subscriber who already received this exact
// batch. The key hashes the rendered payload because Resend rejects a reused
// key whose payload changed, for example after a tool edit. Recipient delivery
// is tracked durably in notification_deliveries, so the 24-hour key window is
// only a secondary guard against a lost response.
function notificationKey(subscriber, payload) {
  return createHash("sha256")
    .update(
      `awesomeintune:${subscriber.unsubscribe_token}:${JSON.stringify(payload)}`
    )
    .digest("hex");
}

// Resend error names that are worth another attempt. Everything else, such as
// validation or authentication errors, fails permanently for this batch.
const RETRYABLE_ERROR_NAMES = new Set([
  "rate_limit_exceeded",
  "concurrent_idempotent_requests",
  "resource_locked",
  "internal_server_error",
  "application_error",
]);

function isRetryable(error) {
  if (!error) return false;
  // Thrown network errors carry no statusCode; retry those.
  if (typeof error.statusCode !== "number") return true;
  // 429 rate limits and 5xx server errors are transient. 409 is not retried
  // broadly because some 409s are permanent; the named set lists the
  // transient 409s explicitly.
  if (error.statusCode === 429 || error.statusCode >= 500) return true;
  return RETRYABLE_ERROR_NAMES.has(error.name);
}

// Retry transient failures within the run. Resend reports API failures in the
// resolved { error } result rather than by throwing, so both paths are retried.
async function sendWithRetry(payload, options, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const { error } = await resend.emails.send(payload, options);
      if (!error) return null;
      if (!isRetryable(error)) return error;
      lastError = error;
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }

  return lastError;
}

async function sendNotifications(plan) {
  const total = plan.reduce((sum, item) => sum + item.tools.length, 0);
  console.log(
    `Sending ${total} tool notification(s) across ${plan.length} subscriber(s)`
  );

  const succeeded = [];
  const failed = [];

  for (const { subscriber, tools } of plan) {
    const token = encodeURIComponent(subscriber.unsubscribe_token);
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${token}`;
    const oneClickUnsubscribeUrl = `${SITE_URL}/api/unsubscribe?token=${token}`;
    const html = generateEmailHtml(tools, unsubscribeUrl);

    const subject =
      tools.length === 1
        ? `New tool added: ${tools[0].name}`
        : `${tools.length} new tools added to Awesome Intune`;

    const payload = {
      from: "Awesome Intune <notifications@awesomeintune.com>",
      to: subscriber.email,
      subject,
      html,
      headers: {
        "List-Unsubscribe": `<${oneClickUnsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };

    const failure = await sendWithRetry(payload, {
      idempotencyKey: notificationKey(subscriber, payload),
    });

    if (failure) {
      console.error(
        `Failed to send email to ${subscriber.email}:`,
        failure.message ?? failure
      );
      failed.push(subscriber);
    } else {
      // Persist immediately so a crash after this send cannot lose the
      // delivery record and cause a duplicate on the next run.
      await recordDeliveries(
        tools.map((tool) => ({
          tool_id: tool.id,
          subscriber_id: subscriber.id,
        }))
      );
      succeeded.push({ subscriber, tools });
    }

    // Rate limiting: wait 100ms between emails
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(
    `Sent ${succeeded.length} email(s) successfully, ${failed.length} failed`
  );
  return { succeeded, failed };
}

async function main() {
  console.log("Starting notification check...");

  // Get all tools from JSON files
  const tools = await getAllTools();
  console.log(`Found ${tools.length} tool(s) in data/tools/`);

  // Get already notified tool IDs
  const sentToolIds = await getSentNotifications();
  console.log(`Already notified about ${sentToolIds.length} tool(s)`);

  // Tools that have not been announced to the whole list yet.
  const pendingTools = tools.filter((tool) => !sentToolIds.includes(tool.id));

  if (pendingTools.length === 0) {
    console.log("No new tools to notify about. Exiting.");
    return;
  }

  console.log(
    `Found ${pendingTools.length} pending tool(s):`,
    pendingTools.map((t) => t.name)
  );

  // Get confirmed subscribers
  const subscribers = await getConfirmedSubscribers();

  if (subscribers.length === 0) {
    console.log("No confirmed subscribers. Recording tools as notified.");
    for (const tool of pendingTools) {
      await recordSentNotification(tool.id, 0);
    }
    return;
  }

  console.log(`Found ${subscribers.length} confirmed subscriber(s)`);

  // Which recipients still need which tools.
  const delivered = await getDeliveries(pendingTools.map((tool) => tool.id));
  const plan = planDeliveries(pendingTools, subscribers, delivered);

  console.log(
    `Delivery plan: ${plan.reduce((sum, item) => sum + item.tools.length, 0)} tool notification(s) for ${plan.length} subscriber(s)`
  );

  const { succeeded, failed } = await sendNotifications(plan);

  // Each delivery was persisted as it succeeded; update the in-memory map so
  // fully delivered tools can be marked.
  for (const { subscriber, tools: sentTools } of succeeded) {
    const set = delivered.get(subscriber.id) ?? new Set();
    for (const tool of sentTools) set.add(tool.id);
    delivered.set(subscriber.id, set);
  }

  // A tool is announced to the whole list only once every confirmed subscriber
  // has a delivery record for it.
  const fullyDelivered = pendingTools.filter((tool) =>
    subscribers.every((subscriber) => delivered.get(subscriber.id)?.has(tool.id))
  );
  for (const tool of fullyDelivered) {
    await recordSentNotification(tool.id, subscribers.length);
  }

  console.log(
    `Recorded ${fullyDelivered.length} fully delivered tool(s); ${succeeded.length} email(s) sent, ${failed.length} failed.`
  );

  if (failed.length > 0) {
    // Successful deliveries are recorded, so the next run retries only the
    // failed recipients.
    throw new Error(
      `${failed.length} of ${plan.length} notification email(s) failed; successful deliveries were recorded and the rest will retry`
    );
  }

  console.log("Notification process completed successfully.");
}

// Run only as a CLI so planDeliveries can be imported for tests.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("Notification process failed:", error);
    process.exit(1);
  });
}
