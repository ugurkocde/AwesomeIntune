declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
  }
}

type PlausibleEvents = {
  "Form Submission": { form: string };
  "Tool Click": { tool: string; category: string };
  "Outbound Link": { url: string };
  "Newsletter Signup": { source: string };
  "Search": { query: string };
  "Category Filter": { category: string };
  "File Download": { file: string };
  "Sponsor Click": { sponsor: string; location: string };
};

export function trackEvent<T extends keyof PlausibleEvents>(
  event: T,
  props: PlausibleEvents[T]
): void {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(event, { props });
  }
}

export function trackFormSubmission(formName: string): void {
  trackEvent("Form Submission", { form: formName });
}

export function trackToolClick(toolName: string, category: string): void {
  trackEvent("Tool Click", { tool: toolName, category });
}

export function trackOutboundLink(url: string): void {
  trackEvent("Outbound Link", { url });
}

export function trackNewsletterSignup(source: string): void {
  trackEvent("Newsletter Signup", { source });
}

export function trackSearch(query: string): void {
  trackEvent("Search", { query });
}

export function trackCategoryFilter(category: string): void {
  trackEvent("Category Filter", { category });
}

export function trackSponsorClick(sponsor: string, location: string): void {
  trackEvent("Sponsor Click", { sponsor, location });
}
