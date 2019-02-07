const baseUrl = '//localhost:9009'

export const getAddress = () =>
  fetch(baseUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({method: 'dna_getCoinbaseAddr', params: [], id: 1}),
  })
    .then(response => response.json())
    .then(data => data.result)

export const getBalance = address =>
  fetch(baseUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      method: 'dna_getBalance',
      params: [address],
      id: 1,
    }),
  })
    .then(response => response.json())
    .then(data => data.result)

export const getPeers = () =>
  fetch(baseUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({method: 'net_peers', params: [], id: 1}),
  })
    .then(response => response.json())
    .then(data => data.result)

export const getLastBlock = () =>
  fetch(baseUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({method: 'dna_lastBlock', params: [], id: 1}),
  })
    .then(response => response.json())
    .then(data => data.result)

export const submitFlip = formData =>
  fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: formData,
  }).then(r => r.json())
