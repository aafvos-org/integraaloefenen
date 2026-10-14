import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'

// Openbare pagina's worden bij de build klaargezet. Deze cache leest die
// versie uit de statische bestanden, zodat de Worker ze niet opnieuw bouwt.
// Pagina's achter de inlog blijven per bezoek; die staan hier niet in.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
})
