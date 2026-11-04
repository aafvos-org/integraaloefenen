export function Kop({ h1, subtitle }: { h1: string; subtitle: string }) {
  return (
    <>
      <h1 className="font-serif text-3xl text-text">{h1}</h1>
      <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
    </>
  )
}
