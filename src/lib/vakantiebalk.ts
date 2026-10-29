/**
 * Periode voor de tijdelijke "terug van vakantie"-balk op de startpagina
 * (INT-456): Midden en Zuid zijn dan terug van de herfstvakantie en starten
 * toetsweken. Na 9 november verdwijnt de balk vanzelf, geen cleanup-taak.
 */
const PERIODE_START = '2026-10-26'
const PERIODE_EIND = '2026-11-09'

/** Id van de balk in de ruwe HTML; `scriptDatVakantieBalkToont` zoekt hierop. */
export const VAKANTIE_BALK_ID = 'vakantie-balk'

/**
 * Staat als kaal `<script>` direct na de balk in `vakantie-balk.tsx`, dus de
 * browser voert het synchroon uit terwijl hij de ruwe HTML nog inleest — ruim
 * vóór de eerste tekening van de pagina. De balk zelf staat altijd in die
 * ruwe HTML maar begint verborgen (`hidden`); dit scriptje toont hem alleen
 * binnen de periode. Zo springt er niets meer bij na hydratatie (INT-612) —
 * vergelijk met de oude aanpak, een client-component die pas ná hydratatie
 * wist of de balk moest tonen.
 */
export function scriptDatVakantieBalkToont(): string {
  return `try{var d=new Date();var v=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");if(v>="${PERIODE_START}"&&v<="${PERIODE_EIND}"){var e=document.getElementById("${VAKANTIE_BALK_ID}");if(e)e.hidden=false}}catch(e){}`
}
