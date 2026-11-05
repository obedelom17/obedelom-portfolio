/** Texte dont chaque lettre « roule » vers le haut au survol du parent `.roll-host` (ou d'un <a>/<button>). */
export function Roll({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`roll ${className}`} aria-label={text}>
      {Array.from(text).map((c, i) => {
        const ch = c === " " ? "\u00a0" : c
        return (
          <span key={i} className="roll__c" data-c={ch} style={{ ["--i" as string]: i } as React.CSSProperties} aria-hidden>
            {ch}
          </span>
        )
      })}
    </span>
  )
}
