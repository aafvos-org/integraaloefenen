import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Alle pagina's zijn dynamisch, dus geen incremental cache (R2) nodig.
export default defineCloudflareConfig({})
