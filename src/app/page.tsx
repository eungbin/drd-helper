import Dashboard from "@/features/drd-helper/Dashboard";

import { getStructuredData } from "./seo";

export default function Home() {
  const structuredData = getStructuredData();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <Dashboard />
    </>
  );
}
