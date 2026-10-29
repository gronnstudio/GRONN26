"use client"

import Link from "next/link"
import type { ComponentProps } from "react"

import { useLanguage } from "@/components/language-provider"
import { localePath } from "@/lib/locale"

// Internal links must stay inside the visitor's language: a Dutch reader
// clicking "Projecten" belongs on /nl/projects, not /projects. Use this
// everywhere instead of next/link for in-site navigation; external URLs,
// mailto: and tel: pass through untouched.
export function LocaleLink({
  href,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const { locale } = useLanguage()
  const isInternal = href.startsWith("/") && !href.startsWith("//")
  return <Link href={isInternal ? localePath(locale, href) : href} {...props} />
}
