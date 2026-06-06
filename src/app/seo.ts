import type { Metadata, MetadataRoute } from "next";

type Environment = Partial<NodeJS.ProcessEnv>;

const localSiteUrl = "http://localhost:3000";
const protocolPattern = /^[a-z][a-z\d+\-.]*:\/\//i;

export const siteName = "DRD Helper";
export const siteTitle = "드래곤볼 운빨 디펜스 조합 계산기 | DRD Helper";
export const siteDescription =
  "드래곤볼 운빨 디펜스 조합 계산기로 보유 유닛과 가스를 입력해 부족 재료, 조합법, 상위 유닛 제작 가능 여부를 빠르게 확인하는 공략 도우미입니다.";
export const siteKeywords = [
  "드래곤볼 운빨 디펜스 조합 계산기",
  "드래곤볼 운빨 디펜스 공략 도우미",
  "DRD Helper",
  "드래곤볼 운빨 디펜스 조합법",
  "드래곤볼 운빨 디펜스 부족 재료",
  "드래곤볼 운빨 디펜스 가스 계산",
] as const;

export function getSiteUrl(env: Environment = process.env): URL {
  const rawSiteUrl =
    firstPresent(
      env.NEXT_PUBLIC_SITE_URL,
      env.VERCEL_PROJECT_PRODUCTION_URL,
      env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    ) ?? localSiteUrl;

  return new URL(withProtocol(rawSiteUrl));
}

export function isVercelPreviewDeployment(
  env: Environment = process.env,
): boolean {
  return env.VERCEL === "1" && env.VERCEL_ENV !== "production";
}

export function getRobotsPolicy(
  env: Environment = process.env,
): Metadata["robots"] {
  if (isVercelPreviewDeployment(env)) {
    return {
      index: false,
      follow: false,
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

export function getStructuredData(env: Environment = process.env) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteName,
    url: getSiteUrl(env).toString(),
    description: siteDescription,
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    inLanguage: "ko",
  };
}

export function getSitemapEntries(
  env: Environment = process.env,
): MetadataRoute.Sitemap {
  return [
    {
      url: getSiteUrl(env).toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

export function getRobotsConfig(
  env: Environment = process.env,
): MetadataRoute.Robots {
  if (isVercelPreviewDeployment(env)) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", getSiteUrl(env)).toString(),
  };
}

function firstPresent(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => value !== undefined && value.trim().length > 0);
}

function withProtocol(value: string): string {
  const trimmedValue = value.trim();

  if (protocolPattern.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}
