'use client'

type Props = {
  retry: () => void
}

// Zelfde tekst op elke crash. De foutzin van de server of de database
// komt hier bewust niet in: die is vaak Engels en zegt een leerling niets.
export function Foutpagina({ retry }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        Even mis
      </p>
      <h1 className="mt-2 text-balance font-serif text-3xl text-text sm:text-5xl">
        Er ging iets mis
      </h1>
      <p className="mt-6 text-balance text-lg text-text-muted">
        De pagina kon niet geladen worden. Probeer het opnieuw. Blijft het
        misgaan, ververs dan de pagina of kom later terug.
      </p>
      <div className="mt-10">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-6 text-white shadow-sm hover:bg-accent/90"
        >
          Opnieuw proberen
        </button>
      </div>
    </div>
  )
}
