import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import robotsRoute from "./robots";
import {
  getStructuredData,
  getRobotsConfig,
  getRobotsPolicy,
  getSiteUrl,
  getSitemapEntries,
  isVercelPreviewDeployment,
  siteDescription,
  siteKeywords,
  siteTitle,
} from "./seo";
import sitemapRoute from "./sitemap";

const seoEnvKeys = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;

test("uses NEXT_PUBLIC_SITE_URL before Vercel deployment URLs", () => {
  const siteUrl = getSiteUrl({
    NEXT_PUBLIC_SITE_URL: "https://drd.example.com",
    VERCEL_PROJECT_PRODUCTION_URL: "production.example.com",
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: "public-production.example.com",
    VERCEL_URL: "preview.example.com",
  });

  assert.equal(siteUrl.toString(), "https://drd.example.com/");
});

test("adds https protocol to Vercel production domain", () => {
  const siteUrl = getSiteUrl({
    VERCEL_PROJECT_PRODUCTION_URL: "drd-helper.vercel.app",
  });

  assert.equal(siteUrl.toString(), "https://drd-helper.vercel.app/");
});

test("uses public Vercel production domain when server value is unavailable", () => {
  const siteUrl = getSiteUrl({
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: "public-drd.vercel.app",
  });

  assert.equal(siteUrl.toString(), "https://public-drd.vercel.app/");
});

test("does not use VERCEL_URL as the canonical fallback", () => {
  const siteUrl = getSiteUrl({
    VERCEL_URL: "drd-helper-git-feature.vercel.app",
  });

  assert.equal(siteUrl.toString(), "http://localhost:3000/");
});

test("detects Vercel preview deployments", () => {
  assert.equal(
    isVercelPreviewDeployment({ VERCEL: "1", VERCEL_ENV: "preview" }),
    true,
  );
  assert.equal(
    isVercelPreviewDeployment({ VERCEL: "1", VERCEL_ENV: "production" }),
    false,
  );
  assert.equal(isVercelPreviewDeployment({}), false);
});

test("uses noindex robots policy for Vercel preview deployments", () => {
  assert.deepEqual(
    getRobotsPolicy({ VERCEL: "1", VERCEL_ENV: "preview" }),
    {
      index: false,
      follow: false,
    },
  );
});

test("uses index robots policy outside Vercel preview deployments", () => {
  assert.deepEqual(
    getRobotsPolicy({ VERCEL: "1", VERCEL_ENV: "production" }),
    {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  );
});

test("builds a one-page sitemap from the production site URL", () => {
  assert.deepEqual(
    getSitemapEntries({ VERCEL_PROJECT_PRODUCTION_URL: "drd-helper.com" }),
    [
      {
        url: "https://drd-helper.com/",
        changeFrequency: "weekly",
        priority: 1,
      },
    ],
  );
});

test("allows production crawling and points robots to the sitemap", () => {
  assert.deepEqual(
    getRobotsConfig({
      VERCEL: "1",
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "drd-helper.com",
    }),
    {
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: "https://drd-helper.com/sitemap.xml",
    },
  );
});

test("blocks crawling for Vercel preview robots.txt", () => {
  assert.deepEqual(
    getRobotsConfig({
      VERCEL: "1",
      VERCEL_ENV: "preview",
      VERCEL_PROJECT_PRODUCTION_URL: "drd-helper.com",
    }),
    {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    },
  );
});

test("sitemap route uses the production site URL", () => {
  withSeoEnvironment(
    {
      VERCEL_PROJECT_PRODUCTION_URL: "drd-helper.com",
    },
    () => {
      assert.deepEqual(sitemapRoute(), [
        {
          url: "https://drd-helper.com/",
          changeFrequency: "weekly",
          priority: 1,
        },
      ]);
    },
  );
});

test("robots route blocks Vercel preview deployments", () => {
  withSeoEnvironment(
    {
      VERCEL: "1",
      VERCEL_ENV: "preview",
      VERCEL_PROJECT_PRODUCTION_URL: "drd-helper.com",
    },
    () => {
      assert.deepEqual(robotsRoute(), {
        rules: {
          userAgent: "*",
          disallow: "/",
        },
      });
    },
  );
});

test("defines Korean SEO copy in the requested priority order", () => {
  assert.equal(siteTitle, "드래곤볼 운빨 디펜스 조합 계산기 | DRD Helper");
  assert.match(siteDescription, /조합 계산/);
  assert.match(siteDescription, /공략 도우미/);
  assert.equal(siteKeywords[0], "드래곤볼 운빨 디펜스 조합 계산기");
  assert.equal(siteKeywords[1], "드래곤볼 운빨 디펜스 공략 도우미");
  assert.equal(siteKeywords[2], "DRD Helper");
});

test("builds WebApplication structured data from the site URL", () => {
  assert.deepEqual(
    getStructuredData({
      NEXT_PUBLIC_SITE_URL: "https://drd-helper.com",
    }),
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "DRD Helper",
      url: "https://drd-helper.com/",
      description: siteDescription,
      applicationCategory: "GameApplication",
      operatingSystem: "Web",
      inLanguage: "ko",
    },
  );
});

test("root layout wires Next metadata to the shared SEO helpers", () => {
  const layoutSource = readFileSync(
    join(process.cwd(), "src/app/layout.tsx"),
    "utf8",
  );

  assert.match(layoutSource, /metadataBase:\s*getSiteUrl\(\)/);
  assert.match(layoutSource, /title:\s*siteTitle/);
  assert.match(layoutSource, /description:\s*siteDescription/);
  assert.match(layoutSource, /keywords:\s*\[\.\.\.siteKeywords\]/);
  assert.match(layoutSource, /alternates:\s*\{[\s\S]*canonical:\s*"\/"/);
  assert.match(layoutSource, /openGraph:\s*\{/);
  assert.match(layoutSource, /twitter:\s*\{/);
  assert.match(layoutSource, /robots:\s*getRobotsPolicy\(\)/);
});

test("home page renders WebApplication JSON-LD", () => {
  const pageSource = readFileSync(
    join(process.cwd(), "src/app/page.tsx"),
    "utf8",
  );

  assert.match(pageSource, /getStructuredData\(\)/);
  assert.match(pageSource, /type="application\/ld\+json"/);
  assert.match(pageSource, /JSON\.stringify\(structuredData\)/);
});

test("defines generated Open Graph and Twitter image routes", () => {
  const openGraphSource = readFileSync(
    join(process.cwd(), "src/app/opengraph-image.tsx"),
    "utf8",
  );
  const twitterSource = readFileSync(
    join(process.cwd(), "src/app/twitter-image.tsx"),
    "utf8",
  );

  for (const source of [openGraphSource, twitterSource]) {
    assert.match(source, /ImageResponse/);
    assert.match(source, /siteTitle/);
    assert.match(source, /1200/);
    assert.match(source, /630/);
  }
});

function withSeoEnvironment(
  env: Record<string, string>,
  callback: () => void,
): void {
  const previousValues = new Map<string, string | undefined>();

  for (const key of seoEnvKeys) {
    previousValues.set(key, process.env[key]);
    delete process.env[key];
  }

  try {
    Object.assign(process.env, env);
    callback();
  } finally {
    for (const key of seoEnvKeys) {
      const previousValue = previousValues.get(key);

      if (previousValue === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previousValue;
      }
    }
  }
}
