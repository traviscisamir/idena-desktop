/* eslint-disable react/prop-types */
import React from 'react'
import {useRouter} from 'next/router'
import {useTranslation} from 'react-i18next'
import {useService} from '@xstate/react'
import {
  Box,
  Stack,
  Text,
  Icon,
  Flex,
  Divider,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  Drawer as ChakraDrawer,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerContent,
  Heading,
  Collapse,
  IconButton,
  Button,
} from '@chakra-ui/core'
import dayjs from 'dayjs'
import {toLocaleDna, eitherState, callRpc} from '../../shared/utils/utils'
import {
  Avatar,
  Debug,
  Drawer,
  DrawerBody,
  DrawerHeader,
  Input,
} from '../../shared/components/components'
import {VotingStatus} from '../../shared/types'
import {
  VotingResultBar,
  VotingBadge,
  OracleDrawerHeader,
  OracleDrawerBody,
  OracleFormControl,
  OracleFormHelper,
  OracleFormHelperText,
  TaggedInput,
} from './components'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {Link} from '../../shared/components'
import {useIdentityState} from '../../shared/providers/identity-context'
import {
  BLOCK_TIME,
  createContractDataReader,
  createContractReadonlyCaller,
  viewVotingHref,
  votingFinishDate,
} from './utils'

export function VotingCard({votingRef}) {
  const router = useRouter()

  const {t, i18n} = useTranslation()

  const [current, send] = useService(votingRef)

  const {
    id,
    title,
    desc,
    issuer,
    status,
    balance = 0,
    startDate,
    votingDuration,
    publicVotingDuration,
    finishDate = votingFinishDate({
      startDate,
      votingDuration,
      publicVotingDuration,
    }),
    voteProofsCount,
    votesCount,
    actualVotesCount = votesCount || voteProofsCount,
    prevStatus,
    options,
    votes = [],
    votingMinPayment,
    quorum,
  } = current.context

  const toDna = toLocaleDna(i18n.language)

  const viewHref = viewVotingHref(id)

  const isMining = eitherState(current, 'mining')

  const sameString = a => b => a?.toLowerCase() === b?.toLowerCase()

  const eitherIdleState = (...states) =>
    eitherState(current, ...states.map(s => `idle.${s}`.toLowerCase())) ||
    states.some(sameString(status)) ||
    (isMining && states.some(sameString(prevStatus)))

  const maxCount = Math.max(...votes.map(({count}) => count))

  return (
    <>
      <Stack isInline spacing={2} mb={3} align="center">
        <VotingStatusBadge status={status}>{t(status)}</VotingStatusBadge>
        <VotingBadge align="center" bg="gray.50" color="muted" pl="1/2">
          <Avatar
            address={issuer}
            bg="white"
            borderColor="brandGray.016"
            borderWidth="1px"
            borderRadius="full"
            w={5}
            h={5}
            mr={1}
          />
          <Text as="span">{issuer}</Text>
        </VotingBadge>
      </Stack>
      <Link href={viewHref}>
        <Text fontSize="base" fontWeight={500} mb={2}>
          {title}
        </Text>
      </Link>
      <Text color="muted" mb={4}>
        {desc}
      </Text>
      {eitherIdleState(VotingStatus.Archived, VotingStatus.Counting) && (
        <Stack spacing={2} mb={6}>
          <Text color="muted" fontSize="sm">
            {t('Results')}
          </Text>
          {actualVotesCount ? (
            options.map((option, idx) => {
              const value = votes.find(v => v.option === idx)?.count ?? 0
              return (
                <VotingResultBar
                  label={option}
                  value={value}
                  percentage={value / actualVotesCount}
                  isMax={maxCount === value}
                />
              )
            })
          ) : (
            <Text
              bg="gray.50"
              borderRadius="md"
              p={2}
              color="muted"
              fontSize="sm"
            >
              {t('No votes')}
            </Text>
          )}
        </Stack>
      )}
      <Stack
        isInline
        spacing={2}
        align="center"
        bg="orange.010"
        borderColor="orange.050"
        borderWidth="1px"
        borderRadius="md"
        py={2}
        px={3}
        mb={6}
      >
        <Icon name="star" size={5} color="white" />
        <Text fontWeight={500}>
          {t('Total prize')}: {toDna(balance)}
        </Text>
        <Text color="orange.500">
          {Number(votingMinPayment) > 0
            ? t(`Lock {{amount}} for voting`, {
                amount: toLocaleDna(i18n.language)(votingMinPayment),
              })
            : t('Free voting')}
        </Text>
      </Stack>
      <Flex justify="space-between" align="center">
        <Stack isInline spacing={2}>
          {eitherIdleState(VotingStatus.Pending) && (
            <PrimaryButton
              isDisabled={isMining}
              loadingText={t('Launching')}
              onClick={() => send('START_VOTING')}
            >
              {t('Launch')}
            </PrimaryButton>
          )}

          {eitherIdleState(VotingStatus.Open) && (
            <PrimaryButton onClick={() => router.push(viewHref)}>
              {t('Vote')}
            </PrimaryButton>
          )}
          {eitherIdleState(
            VotingStatus.Voted,
            VotingStatus.Archived,
            VotingStatus.Counting
          ) && (
            <PrimaryButton onClick={() => router.push(viewHref)}>
              {t('Open')}
            </PrimaryButton>
          )}
        </Stack>
        <Stack isInline spacing={3}>
          <Text>
            <Text as="span" color="muted">
              {t('Deadline')}:
            </Text>{' '}
            <Text as="span">{new Date(finishDate).toLocaleString()}</Text>
          </Text>
          <Divider
            orientation="vertical"
            borderColor="gray.300"
            borderLeft="1px"
          />
          <Stack isInline spacing={2} align="center">
            <Icon
              name={actualVotesCount >= quorum ? 'user-tick' : 'user'}
              color="muted"
              w={4}
              h={4}
            />
            <Text as="span">
              {t('{{count}} votes', {count: actualVotesCount})}
            </Text>
          </Stack>
        </Stack>
      </Flex>
    </>
  )
}

export function VotingStatusBadge({status, ...props}) {
  const colors = (() => {
    switch (status?.toLowerCase()) {
      case VotingStatus.Pending:
        return {
          bg: 'rgb(218 121 255 /0.2)',
          color: 'rgb(218 121 255)',
        }
      case VotingStatus.Open:
        return {
          bg: 'green.020',
          color: 'green.500',
        }
      case VotingStatus.Voted:
        return {
          bg: 'blue.020',
          color: 'blue.500',
        }
      case VotingStatus.Deploying:
      case VotingStatus.Funding:
      case VotingStatus.Starting:
        return {
          bg: 'orange.020',
          color: 'orange.500',
        }
      case VotingStatus.Counting:
        return {
          bg: 'red.020',
          color: 'red.500',
        }
      default:
      case VotingStatus.Archived:
        return {
          bg: 'gray.300',
          color: 'muted',
        }
    }
  })()

  return <VotingBadge {...colors} {...props} />
}

export function AddFundDrawer({from, to, available, onAddFund, ...props}) {
  const {t, i18n} = useTranslation()

  const toDna = toLocaleDna(i18n.language)

  return (
    <Drawer {...props}>
      <OracleDrawerHeader icon="add-fund">{t('Add fund')}</OracleDrawerHeader>
      <Box
        as="form"
        onSubmit={e => {
          e.preventDefault()
          const {
            amountInput: {value: amount},
            fromInput: {value: fromInputValue},
          } = e.target.elements
          onAddFund({amount: Number(amount), from: fromInputValue})
        }}
      >
        <OracleDrawerBody>
          <OracleFormControl label={t('Transfer from')}>
            <Input name="fromInput" defaultValue={from} />
            <OracleFormHelper label={t('Available')} value={toDna(available)} />
          </OracleFormControl>
          <OracleFormControl label="To address">
            <Input isDisabled value={to} />
          </OracleFormControl>
          <OracleFormControl label={t('Lock, iDNA')}>
            <Input name="amountInput" />
          </OracleFormControl>
          <PrimaryButton type="submit" mt={3} ml="auto">
            {t('Send')}
          </PrimaryButton>
        </OracleDrawerBody>
      </Box>
    </Drawer>
  )
}

export function VoteDrawer({option, from, to, deposit = 0, onVote, ...props}) {
  const {t, i18n} = useTranslation()

  const {balance} = useIdentityState()

  const toDna = toLocaleDna(i18n.language)

  return (
    <Drawer {...props}>
      <OracleDrawerHeader icon="send-out" variantColor="blue">
        {t('Voting: {{option}}', {option, nsSeparator: '!'})}
      </OracleDrawerHeader>
      <OracleDrawerBody>
        <OracleFormControl label={t('Transfer from')}>
          <Input defaultValue={from} />
          <OracleFormHelper label={t('Available')} value={toDna(balance)} />
        </OracleFormControl>
        <OracleFormControl label="To address">
          <Input isDisabled value={to} />
        </OracleFormControl>
        <OracleFormControl label={t('Lock, iDNA')}>
          <Input isDisabled value={deposit} />
        </OracleFormControl>
        <PrimaryButton mt={3} ml="auto" onClick={onVote}>
          {t('Send')}
        </PrimaryButton>
      </OracleDrawerBody>
    </Drawer>
  )
}

export function ReviewVotingDrawer({
  from,
  available,
  minBalance,
  minStake,
  isLoading,
  onConfirm,
  ...props
}) {
  const {t, i18n} = useTranslation()

  return (
    <Drawer {...props}>
      <OracleDrawerHeader icon="oracle">
        {t('Create Oracles Voting')}
      </OracleDrawerHeader>
      <OracleDrawerBody
        as="form"
        onSubmit={e => {
          e.preventDefault()
          const {fromInput, balanceInput, stakeInput} = e.target.elements
          onConfirm({
            from: fromInput.value,
            balance: Number(balanceInput.value),
            stake: Number(stakeInput.value),
          })
        }}
      >
        <OracleFormControl label={t('Transfer from')}>
          <Input name="fromInput" defaultValue={from} />
          <OracleFormHelper
            label={t('Available')}
            value={toLocaleDna(i18n.language)(available)}
          />
        </OracleFormControl>
        <OracleFormControl label={t('Rewards, iDNA')}>
          <Input
            name="balanceInput"
            defaultValue={minBalance}
            type="number"
            min={0}
          />
          <OracleFormHelperText>
            {t(
              `Rewards will be paid to Oracles. You’ll be able to increase Oracles' rewards after the voting is created.`
            )}
          </OracleFormHelperText>
        </OracleFormControl>
        <OracleFormControl label={t('Stake, iDNA')}>
          <Input name="stakeInput" value={minStake} />
          <OracleFormHelperText>
            {t(
              'Voting stake will be refunded to your address once the voting smart contract is terminated'
            )}
          </OracleFormHelperText>
        </OracleFormControl>
        <PrimaryButton
          isLoading={isLoading}
          loadingText={t('Publishing')}
          type="submit"
          mt={3}
          ml="auto"
        >
          {t('Confirm')}
        </PrimaryButton>
      </OracleDrawerBody>
    </Drawer>
  )
}

export function AsideStat({label, value, ...props}) {
  return (
    <Stat {...props}>
      <StatLabel color="muted" fontSize="md">
        {label}
      </StatLabel>
      <StatNumber fontSize="base" fontWeight={500}>
        {value}
      </StatNumber>
    </Stat>
  )
}

export function VotingInspector(contract) {
  const [result, setResult] = React.useState({})

  const {isOpen, onOpen, onClose} = useDisclosure()
  const {isOpen: isOpenContract, onToggle: onToggleContract} = useDisclosure()

  return (
    <>
      <Button
        rightIcon="info"
        variant="outline"
        variantColor="blue"
        onClick={onOpen}
      >
        Open inspector
      </Button>
      <ChakraDrawer isOpen={isOpen} size="lg" onClose={onClose}>
        <DrawerOverlay bg="xblack.080" />
        <DrawerContent px={8} py={12} overflowY="auto">
          <DrawerCloseButton />
          <DrawerHeader>
            <Heading fontSize="lg" fontWeight={500} mb={2}>
              Inspector
            </Heading>
          </DrawerHeader>
          <DrawerBody fontSize="md">
            <Stack spacing={4} w="lg">
              <Stack>
                <Flex align="center">
                  <Heading fontSize="base" fontWeight={500} my={4}>
                    Contract
                  </Heading>
                  <IconButton
                    icon="chevron-down"
                    size="sm"
                    fontSize="lg"
                    ml={1}
                    onClick={onToggleContract}
                  />
                </Flex>
                <Collapse isOpen={isOpenContract}>
                  <Debug>{contract}</Debug>
                </Collapse>
                <Box mt={2}>
                  <Heading fontSize="base" fontWeight={500} my={4}>
                    readonlyCall
                  </Heading>
                  <Stack
                    as="form"
                    spacing={3}
                    onSubmit={async e => {
                      e.preventDefault()
                      const {
                        readonlyCallMethod,
                        readonlyCallMethodFormat,
                        readonlyCallArgs,
                      } = e.target.elements

                      setResult(
                        await createContractReadonlyCaller(contract)(
                          readonlyCallMethod.value,
                          readonlyCallMethodFormat.value,
                          ...JSON.parse(readonlyCallArgs.value || '[]')
                        )
                      )
                    }}
                  >
                    <Stack isInline spacing={2} justify="space-between">
                      <Input
                        id="readonlyCallMethod"
                        placeholder="readonlyCallMethod method"
                      />
                      <Input
                        id="readonlyCallMethodFormat"
                        placeholder="format"
                        w={100}
                      />
                    </Stack>
                    <Input
                      id="readonlyCallArgs"
                      placeholder="readonlyCall args"
                    />
                    <SecondaryButton type="submit" ml="auto">
                      Readonly call
                    </SecondaryButton>
                  </Stack>
                </Box>
                <Box>
                  <Heading fontSize="base" fontWeight={500} my={4}>
                    readKey
                  </Heading>
                  <Stack
                    as="form"
                    spacing={3}
                    onSubmit={async e => {
                      e.preventDefault()

                      const {readKey, readKeyFormat} = e.target.elements

                      setResult(
                        await createContractDataReader(contract)(
                          readKey.value,
                          readKeyFormat.value
                        )
                      )
                    }}
                  >
                    <Stack isInline>
                      <Input id="readKey" placeholder="readKey key" />
                      <Input id="readKeyFormat" placeholder="format" w={100} />
                    </Stack>
                    <SecondaryButton
                      type="submit"
                      ml="auto"
                      onClick={async () => {}}
                    >
                      Read data
                    </SecondaryButton>
                  </Stack>
                </Box>
                <Box>
                  <Heading fontSize="base" fontWeight={500} my={4}>
                    txReceipt
                  </Heading>
                  <Stack
                    as="form"
                    spacing={3}
                    onSubmit={async e => {
                      e.preventDefault()
                      setResult(
                        await callRpc(
                          'bcn_txReceipt',
                          e.target.elements.txHash.value
                        )
                      )
                    }}
                  >
                    <Stack isInline>
                      <Input id="txHash" placeholder="txHash" />
                    </Stack>
                    <SecondaryButton
                      type="submit"
                      ml="auto"
                      onClick={async () => {}}
                    >
                      Show receipt
                    </SecondaryButton>
                  </Stack>
                </Box>
                <Box>
                  <Heading fontSize="base" fontWeight={500} my={4}>
                    contract_getStake
                  </Heading>
                  <Stack
                    as="form"
                    spacing={3}
                    onSubmit={async e => {
                      e.preventDefault()
                      setResult(
                        await callRpc(
                          'contract_getStake',
                          contract.contractHash
                        )
                      )
                    }}
                  >
                    <Stack isInline>
                      <Input
                        value={contract.contractHash}
                        isReadonly
                        isDisabled
                      />
                    </Stack>
                    <SecondaryButton
                      type="submit"
                      ml="auto"
                      onClick={async () => {}}
                    >
                      Get stake
                    </SecondaryButton>
                  </Stack>
                </Box>
                <Box ml="auto" mt={6}>
                  <PrimaryButton
                    variantColor="red"
                    onClick={() => {
                      alert('🤷‍♂️')
                      // send('TERMINATE_CONTRACT')
                    }}
                  >
                    Terminate contact
                  </PrimaryButton>
                </Box>
              </Stack>
              <Debug>{result}</Debug>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </ChakraDrawer>
    </>
  )
}

export function VotingDurationInput({service, ...props}) {
  const {t} = useTranslation()

  const [, send] = useService(service)

  return (
    <TaggedInput
      type="number"
      min={1}
      helperText={`${t('About')} ${dayjs
        // eslint-disable-next-line react/destructuring-assignment
        .duration(props.value * BLOCK_TIME, 's')
        .humanize()}`}
      customText={t('Blocks')}
      onChangePreset={value => {
        send('CHANGE', {id: props.id, value})
      }}
      onChangeCustom={({target}) => {
        send('CHANGE', {
          id: props.id,
          value: Number(target.value),
        })
      }}
      {...props}
    />
  )
}

export const VotingFilter = React.forwardRef(
  ({value, isChecked, children, ...props}, ref) => (
    <VotingStatusBadge
      ref={ref}
      value={value}
      aria-checked={isChecked}
      role="radio"
      pl={isChecked ? 1 : 3}
      {...props}
    >
      <Stack isInline spacing={1}>
        {isChecked && (
          <Icon name="tick" size={4} animation="0.3s both zoomIn" />
        )}
        <Text>{children}</Text>
      </Stack>
      <style jsx global>{`
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale3d(0.7, 0.7, 0.7);
          }

          50% {
            opacity: 1;
          }
        }
      `}</style>
    </VotingStatusBadge>
  )
)
VotingFilter.displayName = 'VotingFilter'
