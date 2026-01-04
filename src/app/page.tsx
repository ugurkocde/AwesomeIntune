import { Hero } from "~/components/Hero";
import { ToolsSection } from "~/components/tools/ToolsSection";
import { getAllTools } from "~/lib/tools.server";
import { generateWebsiteStructuredData } from "~/lib/structured-data";

export default function HomePage() {
  const tools = getAllTools();
  const websiteSchema = generateWebsiteStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <Hero />
      <ToolsSection tools={tools} />
    </>
  );
}
