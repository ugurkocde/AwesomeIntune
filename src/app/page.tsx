import { Hero } from "~/components/Hero";
import { ToolsSection } from "~/components/tools/ToolsSection";
import { getAllTools } from "~/lib/tools.server";
import {
  generateWebsiteStructuredData,
  generateItemListStructuredData,
} from "~/lib/structured-data";

export default function HomePage() {
  const tools = getAllTools();
  const websiteSchema = generateWebsiteStructuredData();
  const itemListSchema = generateItemListStructuredData(tools);

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
      <Hero />
      <ToolsSection tools={tools} />
    </>
  );
}
