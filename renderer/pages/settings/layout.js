import React from 'react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {Page, PageTitle} from '../../screens/app/components'
import Layout from '../../shared/components/layout'
import {
  FilterButton,
  FilterButtonList,
} from '../../shared/components/components'

// eslint-disable-next-line react/prop-types
function SettingsLayout({children}) {
  const router = useRouter()
  const {t} = useTranslation()

  return (
    <Layout skipHardForkScreen>
      <Page>
        <PageTitle>{t('Settings')}</PageTitle>
        <FilterButtonList value={router.pathname} onChange={router.push}>
          <FilterButton value="/settings/general">{t('General')}</FilterButton>
          <FilterButton value="/settings/node">{t('Node')}</FilterButton>
          <FilterButton value="/settings/oracles">
            {t('Oracle voting')}
          </FilterButton>
          <FilterButton value="/settings/ads">{t('Ads')}</FilterButton>
        </FilterButtonList>
        {children}
      </Page>
    </Layout>
  )
}

export default SettingsLayout
