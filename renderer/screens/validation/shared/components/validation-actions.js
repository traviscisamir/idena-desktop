import React from 'react'
import PropTypes from 'prop-types'
import {margin, rem} from 'polished'
import {Button, Box} from '../../../../shared/components'
import Flex from '../../../../shared/components/flex'
import theme from '../../../../shared/theme'

function ValidationActions({
  onReportAbuse,
  onSubmitAnswers,
  canSubmit,
  countdown,
}) {
  return (
    <Flex
      justify="space-between"
      css={{
        ...margin(rem(theme.spacings.medium32), 0),
      }}
    >
      <Flex justify="flex-start" css={{flex: 1}}>
        <Button onClick={onReportAbuse}>Report abuse</Button>
      </Flex>
      <Flex justify="center" css={{width: '33%'}}>
        {countdown}
      </Flex>
      <Flex justify="flex-end" css={{flex: 1}}>
        {canSubmit && <Button onClick={onSubmitAnswers}>Submit answers</Button>}
      </Flex>
    </Flex>
  )
}

ValidationActions.propTypes = {
  onReportAbuse: PropTypes.func,
  onSubmitAnswers: PropTypes.func,
  canSubmit: PropTypes.bool,
  countdown: PropTypes.node,
}

export default ValidationActions
