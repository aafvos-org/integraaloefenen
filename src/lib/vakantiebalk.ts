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
 *
 * Blijft ook verborgen als de leerling via YouTube of Google binnenkomt
 * (INT-709): `YoutubeStrip` en `GoogleStrip` tonen dan hun eigen, persoonlijkere
 * balk, en twee bijna identieke kaarten onder elkaar is verwarrend. Dit
 * scriptje leest `?van=` en `document.referrer` rechtstreeks — dezelfde
 * bronnen als die componenten zelf gebruiken — in plaats van de
 * sessionStorage die `scriptDatBronOnthoudt` (`bron.ts`) vult, omdat de
 * volgorde waarin losse scripts uitvoeren niet gegarandeerd is (zie het
 * `beforeInteractive`-probleem hierboven bij INT-612). De Google-regel staat
 * ook, als losse string, in `scriptDatBronOnthoudt`; `bron.test.ts` bewaakt
 * dat ze gelijk blijven aan `GOOGLE_ZOEKDOMEIN` in `google-herkomst.ts`.
 */
export function scriptDatVakantieBalkToont(): string {
  return `try{var d=new Date();var v=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");if(v>="${PERIODE_START}"&&v<="${PERIODE_EIND}"){var p=new URLSearchParams(location.search).get("van");var r=false;if(typeof p==="string"){var s=p.trim().toLowerCase();r=(s==="youtube"||s==="google")}else if(document.referrer){try{var h=new URL(document.referrer).hostname.toLowerCase().replace(/^www\\./,"");r=/^google\\.[a-z]{2,3}(\\.[a-z]{2,3})?$/.test(h)}catch(e){}}if(!r){var el=document.getElementById("${VAKANTIE_BALK_ID}");if(el)el.hidden=false}}}catch(e){}`
}
