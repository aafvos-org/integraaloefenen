/**
 * De drie sommen op de startpagina, nagekeken met dezelfde regel als oefenen.
 *
 * Een leerling ziet meteen goed of fout, zonder account. De constante mag
 * weg, en een minteken dat uit een pdf of van een telefoon komt telt mee.
 */
import { answersMatch } from './engine'

export type DemoNiveau = 'easy' | 'medium' | 'hard'

export type DemoVraag = {
  difficulty: 1 | 2 | 3
  /** Goede primitieve, met integratieconstante. */
  goed: string
  correctLatex: string
}

export const STARTPAGINA_VRAGEN: Record<DemoNiveau, DemoVraag> = {
  easy: {
    difficulty: 1,
    goed: '3x^2 + 5x + c',
    correctLatex: '3x^2 + 5x + c',
  },
  medium: {
    difficulty: 2,
    goed: '1/3 sin(3x) + c',
    correctLatex: '\\tfrac{1}{3}\\sin(3x) + c',
  },
  hard: {
    difficulty: 3,
    goed: '(x - 1)e^x + c',
    correctLatex: '(x - 1)e^x + c',
  },
}

export function startpaginaKlopt(niveau: DemoNiveau, leerling: string): boolean {
  return answersMatch(leerling, STARTPAGINA_VRAGEN[niveau].goed)
}
