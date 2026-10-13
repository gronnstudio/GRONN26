"use client"

import { useEffect, useRef } from "react"

// Rimpelend water (11 okt 2026, het ene WebGL-moment): waar je muis of vinger
// over een vijverfoto gaat, rimpelt het beeld als een hand door het water.
// Een canvas over de foto, met dezelfde foto en dezelfde snit (object-cover);
// het staat alleen zichtbaar zolang er rimpels zijn, daarna is het weer de
// gewone foto. Kaal WebGL, geen bibliotheek. Geen WebGL, minder beweging of
// html.stil: niets, de foto blijft zoals hij is.

const MAX = 10

const VS = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}`
const FS = `precision mediump float;
varying vec2 v;uniform sampler2D img;uniform vec2 schaal;uniform vec2 aspect;uniform vec3 drop[${MAX}];uniform float nu;
void main(){
  vec2 uv=v;vec2 d=vec2(0.);float licht=0.;
  for(int i=0;i<${MAX};i++){
    float leeftijd=nu-drop[i].z; if(leeftijd<0.||leeftijd>2.6) continue;
    vec2 r=(uv-drop[i].xy)*aspect; float a=length(r);
    float golf=sin(a*70.-leeftijd*9.)*exp(-a*7.)*exp(-leeftijd*1.6);
    d+=normalize(r+1e-5)*golf*.022; licht+=golf*.16;
  }
  vec2 t=(uv+d-.5)*schaal+.5;
  vec4 k=texture2D(img,clamp(t,0.,1.));
  gl_FragColor=vec4(k.rgb+licht,1.);
}`

export function Rimpel({ src, className = "", vanzelf = false }: { src: string; className?: string; vanzelf?: boolean }) {
  const doek = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = doek.current
    const vak = c?.parentElement
    if (!c || !vak) return
    const stil = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("stil")
    if (stil()) return
    const gl = c.getContext("webgl", { premultipliedAlpha: false, antialias: false })
    if (!gl) return

    const maak = (soort: number, bron: string) => {
      const s = gl.createShader(soort)!
      gl.shaderSource(s, bron)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, maak(gl.VERTEX_SHADER, VS))
    gl.attachShader(prog, maak(gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const p = gl.getAttribLocation(prog, "p")
    gl.enableVertexAttribArray(p)
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0)
    const u = (n: string) => gl.getUniformLocation(prog, n)

    const druppels = new Float32Array(MAX * 3).fill(-99)
    let volgende = 0, klaar = false, loopt = false, laatste = 0, beeldW = 1, beeldH = 1
    const t0 = performance.now()
    const nu = () => (performance.now() - t0) / 1000

    const maat = () => {
      const r = vak.getBoundingClientRect()
      const dpr = Math.min(devicePixelRatio, 2)
      c.width = Math.max(1, Math.round(r.width * dpr))
      c.height = Math.max(1, Math.round(r.height * dpr))
      gl.viewport(0, 0, c.width, c.height)
      // object-cover: het deel van de foto dat in het vak past
      const vakA = r.width / r.height, beeldA = beeldW / beeldH
      gl.uniform2f(u("schaal"), vakA < beeldA ? vakA / beeldA : 1, vakA < beeldA ? 1 : beeldA / vakA)
      gl.uniform2f(u("aspect"), vakA, 1)
    }

    const beeld = new Image()
    beeld.decoding = "async"
    beeld.src = `/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75`
    beeld.onload = () => {
      beeldW = beeld.naturalWidth
      beeldH = beeld.naturalHeight
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, beeld)
      klaar = true
      maat()
      // vanzelf: een paar druppels bij het openen, zodat je ziet dat het water leeft
      if (vanzelf) [[0.32, 0.84], [0.58, 0.9], [0.45, 0.78]].forEach(([x, y], n) => setTimeout(() => druppel(x, y), 500 + n * 450))
    }

    const teken = () => {
      const t = nu()
      gl.uniform1f(u("nu"), t)
      gl.uniform3fv(u("drop[0]"), druppels)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      let jongste = -99
      for (let i = 2; i < druppels.length; i += 3) jongste = Math.max(jongste, druppels[i])
      if (t - jongste < 2.6) requestAnimationFrame(teken)
      else {
        loopt = false
        c.style.transition = "opacity .5s"
        c.style.opacity = "0"
      }
    }

    const druppel = (x: number, y: number) => {
      if (!klaar || stil()) return
      const t = nu()
      druppels.set([x, y, t], volgende * 3)
      volgende = (volgende + 1) % MAX
      c.style.transition = "none"
      c.style.opacity = "1"
      if (!loopt) {
        loopt = true
        requestAnimationFrame(teken)
      }
    }
    const raak = (e: PointerEvent) => {
      if (nu() - laatste < 0.07) return
      laatste = nu()
      const r = vak.getBoundingClientRect()
      druppel((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
    }

    const ro = new ResizeObserver(() => klaar && maat())
    ro.observe(vak)
    vak.addEventListener("pointermove", raak, { passive: true })
    vak.addEventListener("pointerdown", raak, { passive: true })
    return () => {
      ro.disconnect()
      vak.removeEventListener("pointermove", raak)
      vak.removeEventListener("pointerdown", raak)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [src, vanzelf])

  return (
    <canvas
      ref={doek}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 size-full opacity-0 [filter:saturate(.88)_contrast(1.04)_brightness(.98)] ${className}`}
    />
  )
}
