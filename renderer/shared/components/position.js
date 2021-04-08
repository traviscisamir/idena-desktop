import React from 'react'
import {Box} from '@chakra-ui/core'

export const Absolute = React.forwardRef(function Absolute(props, ref) {
  return <Box ref={ref} position="absolute" {...props} />
})

export function Fill(props) {
  return (
    <Absolute top={0} left={0} bottom={0} right={0} zIndex={1} {...props} />
  )
}
