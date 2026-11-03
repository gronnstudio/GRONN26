import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build-stempel voor de DEV-laag (alleen de eigenaar ziet hem): de
  // commit en het bouwmoment, bij het bouwen vastgelegd. Alleen deze twee
  // waarden gaan naar de client; zonder Vercel-sha staat er "lokaal".
  env: {
    NEXT_PUBLIC_BUILD_SHA: (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7),
    NEXT_PUBLIC_BUILD_TIJD: new Date().toISOString(),
  },
  images: {
    // Editor-uploaded photographs live in the project's Vercel Blob
    // store; private stores are proxied through /api/img (same origin,
    // no pattern needed). Picsum is gone — imagery is self-hosted.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // Canonical host: www serves a 308 to the apex domain.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.gronn.studio" }],
        destination: "https://gronn.studio/:path*",
        permanent: true,
      },
      // V5 (sep 2026): de nieuwe publieke site heeft geen journaal,
      // werkwijze- of labpagina meer. Tijdelijk (307), niet permanent:
      // een 308 blijft in browsers hangen, en de eigenaar kan er later
      // nog iets anders mee willen. /stack is sinds 24 sep 2026 terug
      // (stack.spec.ts bewaakt dat hij niet meer omleidt).
      ...["", "/nl"].flatMap((pre) => [
        { source: `${pre}/journal/:path*`, destination: pre || "/", permanent: false },
        { source: `${pre}/journal`, destination: pre || "/", permanent: false },
        { source: `${pre}/approach`, destination: `${pre}/studio`, permanent: false },
        { source: `${pre}/lab`, destination: pre || "/", permanent: false },
        // De easter eggs zijn weg (eigenaar, 1 okt 2026: "Verwijder de
        // easter eggs!"); wie de oude verzamelkaart nog open heeft, komt
        // op de voorpagina.
        { source: `${pre}/easter-eggs`, destination: pre || "/", permanent: false },
        // De kennisbank is weg (eigenaar, 4 okt 2026: "haal kennisbank
        // weg"); oude links landen bij de veelgestelde vragen, die
        // dezelfde vragen dragen. geen-kennisbank.spec.ts bewaakt het.
        { source: `${pre}/kennisbank/:path*`, destination: `${pre}/faq`, permanent: false },
        { source: `${pre}/kennisbank`, destination: `${pre}/faq`, permanent: false },
      ]),
    ];
  },
};

export default nextConfig;
