"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

import { useT } from "@/components/language-provider"
import { cn } from "@/lib/utils"

// Recording mode: blurs the street address, phone, email and
// registration numbers (everything marked data-sensitive) so the site
// can be screen-recorded without exposing credentials. Owner tool —
// unlocking requires the studio password; only its SHA-256 digest
// lives in the bundle, and the unlock is remembered per browser.
// Turning the blur OFF never needs the password (that is the public
// state of the page anyway).
const PASSWORD_SHA256 =
  "5e39d654bb38f47c8aeb97e03c2b52120993dca3b441a91dfb509443e7563f0b"
const ENABLED_KEY = "gronn-privacy-blur"
const UNLOCK_KEY = "gronn-privacy-unlocked"

// The blur flag lives in localStorage, so it is external state, not React
// state — read it through a store (same pattern as the language and
// hydration providers) instead of copying it in with setState during an
// effect. Cross-tab sync comes free with the storage event.
const CHANGE_EVENT = "gronn-privacy-blur-change"

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

function getSnapshot() {
  try {
    return localStorage.getItem(ENABLED_KEY) === "1"
  } catch {
    return false // private mode
  }
}

function getServerSnapshot() {
  return false
}

function setBlurEnabled(enabled: boolean) {
  try {
    localStorage.setItem(ENABLED_KEY, enabled ? "1" : "0")
  } catch {
    /* private mode — the class below still applies for this session */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  )
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export function PrivacyToggle() {
  const t = useT()
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [asking, setAsking] = useState(false)
  const [password, setPassword] = useState("")
  const [rejected, setRejected] = useState(false)

  // Legitimate effect: pushing React state out to an external system
  // (the document class the blur CSS hangs off).
  useEffect(() => {
    document.documentElement.classList.toggle("privacy-blur", enabled)
  }, [enabled])

  const toggle = () => {
    if (enabled) {
      setBlurEnabled(false)
      return
    }
    let unlocked = false
    try {
      unlocked = localStorage.getItem(UNLOCK_KEY) === "1"
    } catch {
      /* fine */
    }
    if (unlocked) setBlurEnabled(true)
    else {
      setAsking((v) => !v)
      setRejected(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((await sha256Hex(password.trim())) === PASSWORD_SHA256) {
      try {
        localStorage.setItem(UNLOCK_KEY, "1")
      } catch {
        /* fine */
      }
      setAsking(false)
      setPassword("")
      setRejected(false)
      setBlurEnabled(true)
    } else {
      setRejected(true)
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        className={cn(
          "tap-target flex items-center gap-2 rounded-full border py-1.5 pl-2 pr-3 text-xs transition-colors",
          enabled
            ? "border-gronn-ember/50 text-gronn-ember"
            : "border-line/20 text-muted hover:border-gronn-green hover:text-foreground"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "size-4 rounded-full border",
            enabled
              ? "border-gronn-ember/60 [filter:blur(2px)] bg-gronn-ember/60"
              : "border-line/25"
          )}
        />
        <span className="font-mono uppercase tracking-wider">
          {t({ en: "Record blur", nl: "Opnamevervaging" })}:{" "}
          {enabled ? t({ en: "on", nl: "aan" }) : t({ en: "off", nl: "uit" })}
        </span>
      </button>
      {asking && (
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setRejected(false)
            }}
            autoFocus
            placeholder={t({ en: "Password", nl: "Wachtwoord" })}
            aria-label={t({
              en: "Password to unlock recording blur",
              nl: "Wachtwoord om opnamevervaging te ontgrendelen",
            })}
            className={cn(
              "min-h-11 w-36 rounded-full border bg-transparent px-3 py-1.5 font-mono text-xs text-foreground",
              rejected ? "border-gronn-ember" : "border-line/20"
            )}
          />
          <button
            type="submit"
            className="tap-target rounded-full border border-line/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted transition-colors hover:border-gronn-green hover:text-foreground"
          >
            {t({ en: "Unlock", nl: "Ontgrendel" })}
          </button>
          {rejected && (
            <span role="alert" className="font-mono text-[11px] text-gronn-ember">
              {t({ en: "Wrong password", nl: "Onjuist wachtwoord" })}
            </span>
          )}
        </form>
      )}
    </div>
  )
}
