import puppeteer from "puppeteer";

function getBaseDomain(hostname: string): string {
  const parts = hostname.split(".");
  if (parts.length <= 2) return hostname;
  return parts.slice(parts.length - 2).join(".");
}

async function urlExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return (
      (res.ok && res.headers.get("content-type")?.startsWith("image")) ?? false
    );
  } catch {
    return false;
  }
}

async function extractFaviconsFromHTML(
  url: string,
): Promise<{ href: string; sizes?: string | null }[]> {
  const favicons: { href: string; sizes?: string | null }[] = [];
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });

  const rewriter = new HTMLRewriter().on('link[rel~="icon"]', {
    element(el) {
      const href = el.getAttribute("href");
      const sizes = el.getAttribute("sizes");
      if (href) {
        const absoluteHref = new URL(href, url).toString();
        favicons.push({ href: absoluteHref, sizes });
      }
    },
  });

  await rewriter.transform(response).blob();

  const baseDomain = getBaseDomain(new URL(url).hostname);
  const validFavicons = [];
  for (const icon of favicons) {
    try {
      let absoluteHref = new URL(icon.href, url).toString();
      if (/\.svg$/i.test(absoluteHref)) continue;
      if (!(await urlExists(absoluteHref))) {
        absoluteHref = new URL(icon.href, `https://${baseDomain}`).toString();
        if (/\.svg$/i.test(absoluteHref)) continue;
        if (!(await urlExists(absoluteHref))) continue;
      }
      validFavicons.push({ href: absoluteHref, sizes: icon.sizes ?? null });
    } catch {
      continue;
    }
  }

  return validFavicons;
}

async function extractFaviconsWithPuppeteer(
  url: string,
): Promise<{ href: string; sizes?: string | null }[] | null> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll('link[rel~="icon"]')).map(
        (link) => ({
          href: link.getAttribute("href"),
          sizes: link.getAttribute("sizes"),
        }),
      ),
    );

    const baseDomain = getBaseDomain(new URL(url).hostname);
    const favicons = [];

    for (const link of links) {
      if (!link.href) continue;

      let absoluteHref = "";
      try {
        absoluteHref = new URL(link.href, url).toString();
        if (/\.svg$/i.test(absoluteHref)) continue;
        if (!(await urlExists(absoluteHref))) {
          absoluteHref = new URL(link.href, `https://${baseDomain}`).toString();
          if (/\.svg$/i.test(absoluteHref)) continue;
          if (!(await urlExists(absoluteHref))) continue;
        }
        favicons.push({ href: absoluteHref, sizes: link.sizes ?? null });
      } catch {
        continue;
      }
    }

    return favicons.length ? favicons : null;
  } catch (error) {
    console.error("Puppeteer error:", error);
    return null;
  } finally {
    await browser.close();
  }
}

async function extractFaviconFallback(url: string): Promise<string | null> {
  const faviconUrl = `${url.replace(/\/$/, "")}/favicon.ico`;

  try {
    const res = await fetch(faviconUrl, { method: "HEAD" });
    if (res.ok && res.headers.get("content-type")?.startsWith("image")) {
      return faviconUrl;
    }
  } catch {}

  return null;
}

export async function getFavicon(url: string): Promise<string | null> {
  let favicons = await extractFaviconsFromHTML(url);

  if (!favicons.length) {
    favicons = (await extractFaviconsWithPuppeteer(url)) ?? [];
  }

  if (!favicons.length) {
    const fallback = await extractFaviconFallback(url);
    if (fallback) return fallback;
    return null;
  }

  favicons.sort((a, b) => {
    const sizeA = parseInt(a.sizes?.split("x")[0] ?? "0", 10);
    const sizeB = parseInt(b.sizes?.split("x")[0] ?? "0", 10);
    return sizeB - sizeA;
  });

  return favicons[0]?.href ?? null;
}
