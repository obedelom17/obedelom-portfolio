import { Fragment } from "react"

/**
 * Découpe un texte en mots qui montent un à un depuis un masque quand le bloc `.reveal` parent devient visible.
 * Composant sans état : utilisable côté serveur comme côté client.
 */
export function SplitWords({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <Fragment key={`${i}-${word}`}>
          <span className="split-mask">
            <span className="split-w" style={{ ["--i" as string]: i } as React.CSSProperties}>
              {word}
            </span>
          </span>{" "}
        </Fragment>
      ))}
    </>
  )
}
