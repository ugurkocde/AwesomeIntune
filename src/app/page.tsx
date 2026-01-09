import { Hero } from "~/components/Hero";
import { ToolsSection } from "~/components/tools/ToolsSection";
import { AuthorSpotlight } from "~/components/AuthorSpotlight";
import { FAQ } from "~/components/FAQ";
import { getAllTools, getAuthorsForSpotlight } from "~/lib/tools.server";
import {
  generateWebsiteStructuredData,
  generateItemListStructuredData,
  generateHomepageFAQStructuredData,
} from "~/lib/structured-data";

export default function HomePage() {
  const tools = getAllTools();
  const authors = getAuthorsForSpotlight();
  const websiteSchema = generateWebsiteStructuredData();
  const itemListSchema = generateItemListStructuredData(tools);
  const faqSchema = generateHomepageFAQStructuredData(tools.length);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <Hero />
      <ToolsSection tools={tools} />
      <AuthorSpotlight authors={authors} />
      <FAQ />
    </>
  );
}
