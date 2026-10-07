'use client'

import { useTranslation } from '@payloadcms/ui'

import type { RankerTranslationKeys, RankerTranslations } from '@/admin/translations'

import { Wordmark } from './Mark'

/** Logo trên trang đăng nhập (admin.components.graphics.Logo). */
export function Logo() {
  const { t } = useTranslation<RankerTranslations, RankerTranslationKeys>()
  return (
    <div className="rk-login-brand">
      <Wordmark size={34} />
      <p className="rk-login-brand__subtitle">{t('ranker:loginSubtitle')}</p>
    </div>
  )
}
