/**
 * Het ©-teken dat even het Ø van het woordmerk wordt, en terug
 * (eigenaar, 23 sep 2026). Klein en rustig: het rolt zoals de letterrol
 * in de menubalk, eens per 8 s (`.copy-wissel` in globals.css). Bij
 * minder beweging staat er gewoon ©.
 *
 * Een schermlezer hoort één keer "©": de twee rollende tekens zijn
 * `aria-hidden`, het echte teken staat ernaast als `sr-only`.
 */
export function Auteursrecht() {
  return (
    <>
      <span className="sr-only">©</span>
      <span aria-hidden data-auteursrecht="" className="copy-wissel">
        <span className="copy-wissel-rol">
          <span>©</span>
          <span>Ø</span>
        </span>
      </span>
    </>
  )
}
