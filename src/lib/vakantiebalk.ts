import { BRON_TABBLAD } from './bron'
import { CHATGPT_DOMEINEN_LIJST } from './chatgpt-herkomst'

/**
 * Periode voor de tijdelijke "terug van vakantie"-balk op de startpagina
 * (INT-456): Midden en Zuid zijn dan terug van de herfstvakantie en starten
 * toetsweken. Na 9 november verdwijnt de balk vanzelf, geen cleanup-taak.
 */
const PERIODE_START = '2026-10-26'
const PERIODE_EIND = '2026-11-09'

/** Zelfde domeinen als `isChatgptHerkomst`; hier als losse `h===".."`-vergelijkingen. */
const CHATGPT_DOMEIN_CHECK = CHATGPT_DOMEINEN_LIJST.map((d) => `h==="${d}"`).join('||')

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
 * Blijft ook verborgen als de leerling via YouTube, Google of ChatGPT
 * binnenkomt (INT-709, INT-710): `YoutubeStrip`, `GoogleStrip` en
 * `ChatgptStrip` tonen dan hun eigen, persoonlijkere balk, en twee bijna
 * identieke kaarten onder elkaar is verwarrend. Dit scriptje leest `?van=`,
 * `?utm_source=` en `document.referrer` rechtstreeks — dezelfde bronnen als
 * die componenten zelf gebruiken — in plaats van de sessionStorage die
 * `scriptDatBronOnthoudt` (`bron.ts`) vult, omdat de volgorde waarin losse
 * scripts uitvoeren niet gegarandeerd is bij de eerste landing (zie het
 * `beforeInteractive`-probleem hierboven bij INT-612).
 *
 * Voor Google komt daar een tweede, late check bovenop: `GoogleStrip` blijft
 * ook zichtbaar als de leerling in hetzelfde tabblad doorklikt naar een
 * andere pagina en weer terugkomt op `/nl` zonder `?van=` en zonder
 * Google-verwijzer — `bronUitTabblad` (`bron.ts`) leest dan de
 * sessionStorage die bij de eerste landing al is gezet. Zonder die check
 * stonden de toetsweekbalk én de Google-strip na zo'n tweede bezoek weer
 * allebei (INT-709, Controle-FAIL). Dit probleem speelt niet bij YouTube of
 * ChatGPT: `YoutubeStrip` en `ChatgptStrip` kijken alleen naar de actuele
 * `?van=`/`?utm_source=`/verwijzer, niet naar de sessionStorage, dus die
 * verdwijnen vanzelf weer — de toetsweekbalk moet dan ook weer verschijnen,
 * niet blijven verbergen. Die late check is dus bewust alleen voor `google`.
 * De Google-regel staat ook, als losse string, in `scriptDatBronOnthoudt`;
 * `bron.test.ts` bewaakt dat ze gelijk blijven aan `GOOGLE_ZOEKDOMEIN` in
 * `google-herkomst.ts`. De ChatGPT-regels komen uit `CHATGPT_DOMEINEN_LIJST`
 * in `chatgpt-herkomst.ts`, dezelfde bron als `isChatgptHerkomst` gebruikt.
 */
export function scriptDatVakantieBalkToont(): string {
  return `try{var d=new Date();var v=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");if(v>="${PERIODE_START}"&&v<="${PERIODE_EIND}"){var sp=new URLSearchParams(location.search);var p=sp.get("van");var r=false;if(typeof p==="string"){var s=p.trim().toLowerCase();r=(s==="youtube"||s==="google")}var u=sp.get("utm_source");if(!r&&typeof u==="string"&&u.trim().toLowerCase().indexOf("chatgpt")===0){r=true}if(!r&&document.referrer){try{var h=new URL(document.referrer).hostname.toLowerCase().replace(/^www\\./,"");r=/^google\\.[a-z]{2,3}(\\.[a-z]{2,3})?$/.test(h)||${CHATGPT_DOMEIN_CHECK}}catch(e){}}if(!r){try{r=sessionStorage.getItem("${BRON_TABBLAD}")==="google"}catch(e){}}if(!r){var el=document.getElementById("${VAKANTIE_BALK_ID}");if(el)el.hidden=false}}}catch(e){}`
}
