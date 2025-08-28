export interface SubscribeResponseSuccess {
  status: string | number
  email: string
  subscribe: unknown
}

export interface SubscribeResponseError {
  error: string
}

export type SubscribeResponse = SubscribeResponseSuccess | SubscribeResponseError

export async function subscribeToNewsletter(email: string): Promise<SubscribeResponse> {
  const res = await fetch('/api/newsletter/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email })
  })

  // The proxy always returns JSON
  const data = await res.json()
  return data as SubscribeResponse
}


