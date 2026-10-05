// Los van overgang.tsx: een "use client"-module geeft de server alleen
// verwijzingen, geen strings.

/** Voor de eerste verf, NA het voorverf-script van layout.tsx (dat zet
 *  html.stil): één keer per bezoek html.intro, zodat het doek er vanaf de
 *  eerste verf staat. Een vangnet haalt het weg als de JS uitblijft. */
export const INTRO_VOORVERF = `try{var c=document.documentElement.classList;if(!c.contains('stil')&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('gronn-intro')){sessionStorage.setItem('gronn-intro','1');c.add('intro');window.__gronnIntro=setTimeout(function(){c.remove('intro')},8000)}}catch(e){}`
