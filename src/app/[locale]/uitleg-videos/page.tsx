import { getTranslations } from 'next-intl/server'

import { zetStatischeTaal } from '@/i18n/statisch'
import { eigenPagina } from '@/lib/seo'
import { getUitlegVideos } from '@/lib/videos'

import { UitlegVideosClient } from './uitleg-videos-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations({ locale, namespace: 'UitlegVideos' })
  return eigenPagina({
    locale,
    pad: '/uitleg-videos',
    titel: t('title'),
    omschrijving: t('intro'),
  })
}

/**
 * De videolijst verandert zelden en is voor iedereen hetzelfde. Daarom leest
 * deze pagina geen inlogcookie en geen ?video= in het adres: dat zou hem bij
 * elk bezoek opnieuw laten bouwen. Welke video openstaat en de drie
 * oefenvragen (alleen voor een ingelogde leerling) vult de browser daarna aan.
 */
export default async function UitlegVideosPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  zetStatischeTaal(locale)
  const t = await getTranslations('UitlegVideos')
  const videos = getUitlegVideos()

  return (
    <UitlegVideosClient
      videos={videos.map((v) => ({
        slug: v.slug,
        title: v.title,
        description: v.description,
        duration: v.duration,
        src: v.src,
        href: `/${locale}/uitleg-videos?video=${encodeURIComponent(v.slug)}`,
        soort: v.soort,
        chapter: v.chapter,
        hasPractice: v.clusterIds.length > 0,
      }))}
      loginHref={`/${locale}/inloggen`}
      registerHref={`/${locale}/registreren`}
      oefenHref={`/${locale}/oefenen`}
      labels={{
        h1: t('h1'),
        intro: t('intro'),
        playlistTitle: t('playlistTitle'),
        practiceTitle: t('practiceTitle'),
        questionTile: t.raw('questionTile') as string,
        preview: t('preview'),
        placeholder: t('placeholder'),
        check: t('check'),
        checking: t('checking'),
        correct: t('correct'),
        wrongTitle: t('wrongTitle'),
        yourAnswer: t('yourAnswer'),
        correctAnswer: t('correctAnswer'),
        stepsTitle: t('stepsTitle'),
        nextQuestion: t('nextQuestion'),
        previousQuestion: t('previousQuestion'),
        morePractice: t('morePractice'),
        loginToPractice: t('loginToPractice'),
        practiceLoading: t('practiceLoading'),
        practiceError: t('practiceError'),
        askTitle: t('askTitle'),
        askIntro: t('askIntro'),
        askCta: t('askCta'),
        askPlaceholder: t('askPlaceholder'),
        askSend: t('askSend'),
        askThanks: t('askThanks'),
        askPhoto: t('askPhoto'),
        askPhotoHint: t('askPhotoHint'),
        askPhotoRemove: t('askPhotoRemove'),
        askPhotoBusy: t('askPhotoBusy'),
        askPhotoTooBig: t('askPhotoTooBig'),
        groupGeneral: t('groupGeneral'),
        groupWalkthrough: t('groupWalkthrough'),
        chapterOther: t('chapterOther'),
        emptyTitle: t('emptyTitle'),
        emptyBody: t('emptyBody'),
        emptyPractice: t('emptyPractice'),
        askNoAccount: t('askNoAccount'),
        askLogin: t('askLogin'),
        askRegister: t('askRegister'),
      }}
    />
  )
}
