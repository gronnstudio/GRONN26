import nextVitals from "eslint-config-next/core-web-vitals"

export default [
  ...nextVitals,
  { ignores: [".next/**", "public/wireframes/**", "public/sw.js", "next-env.d.ts"] },
]
