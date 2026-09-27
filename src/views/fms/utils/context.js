import { useFmsStore } from '@/views/fms/store/fms'

export const FMS_ACCOUNT_SET_CACHE_KEY = 'fmsAccountSet'

export function readFmsAccountSetId(route) {
  const queryId = route && route.query && route.query.accountSetId
  const parsedQueryId = Number(queryId)
  if (Number.isFinite(parsedQueryId) && parsedQueryId > 0) return parsedQueryId
  return Number(useFmsStore().getAccountSetId) || 0
}

export function saveFmsAccountSet(accountSet) {
  if (!accountSet || !accountSet.id) return
  useFmsStore().setAccountSet({
    id: accountSet.id,
    companyName: accountSet.companyName,
    level: accountSet.level
  })
}
