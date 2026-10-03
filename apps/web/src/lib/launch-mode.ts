/** Default-safe launch mode. Do not enable regulated or paid flows without review. */
export function transferExecutionEnabled(): boolean {
  return process.env.ENABLE_TRANSFER_EXECUTION === 'true'
}
export function paidPlansEnabled(): boolean {
  return process.env.ENABLE_PAID_PLANS === 'true'
}
export function featureUnavailableResponse(): Response {
  return Response.json(
    { error: 'This release is a comparison service. This feature is not available.' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } }
  )
}
