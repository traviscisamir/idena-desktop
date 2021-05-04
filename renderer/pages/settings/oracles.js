import {Box, Stack, Text} from '@chakra-ui/core'
import {useTranslation} from 'react-i18next'
import {SettingsSection} from '../../screens/settings/components'
import {PrimaryButton} from '../../shared/components/button'
import {useSuccessToast} from '../../shared/components/components'
import {useEpochState} from '../../shared/providers/epoch-context'
import {dbProxy} from '../../shared/utils/db'
import SettingsLayout from './layout'

export default function OracleSettings() {
  const {t} = useTranslation()

  const toast = useSuccessToast()

  const epochState = useEpochState()

  return (
    <SettingsLayout>
      <Stack spacing={8} mt={8}>
        {epochState && (
          <SettingsSection title={t('Votings cache')}>
            <Stack spacing={4} align="flex-start" my={4}>
              <Box color="muted">
                <Text>{t('Clear persisted votings.')}</Text>
                <Text color="muted">
                  {t('Recommended in some scenarios, e.g. switching accounts.')}
                </Text>
              </Box>
              <PrimaryButton
                onClick={async () => {
                  await dbProxy.clear('votings')
                  toast(t('Votings removed'))
                }}
              >
                {t('Clear cache')}
              </PrimaryButton>
            </Stack>
          </SettingsSection>
        )}
      </Stack>
    </SettingsLayout>
  )
}
