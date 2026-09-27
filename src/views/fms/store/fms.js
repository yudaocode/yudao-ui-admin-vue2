import Vue from 'vue'
import { FmsClosingPeriodApi } from '@/api/fms/closing/period'
import { getAccountSetList } from '@/api/fms/config/account-set'
import { FmsAccountUserLevelEnum } from '@/api/fms/config/account-user'

export const FMS_ACCOUNT_SET_CACHE_KEY = 'fmsAccountSet'

function readCachedAccountSet() {
  if (typeof localStorage === 'undefined') return undefined
  try {
    const accountSet = JSON.parse(localStorage.getItem(FMS_ACCOUNT_SET_CACHE_KEY) || 'null')
    const id = Number(accountSet && accountSet.id)
    if (!Number.isFinite(id) || id <= 0) return undefined
    return {
      id,
      companyName: accountSet.companyName || '',
      level: Number(accountSet.level)
    }
  } catch (error) {
    return undefined
  }
}

function writeCachedAccountSet(accountSet) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(FMS_ACCOUNT_SET_CACHE_KEY, JSON.stringify(accountSet))
  } catch (error) {
    return undefined
  }
}

function removeCachedAccountSet() {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.removeItem(FMS_ACCOUNT_SET_CACHE_KEY)
  } catch (error) {
    return undefined
  }
}

const state = Vue.observable({
  accountSet: readCachedAccountSet(),
  currentMonth: undefined,
  accountSetList: [],
  accountSetListLoaded: false
})

const fmsStore = {
  get getAccountSet() {
    return state.accountSet
  },
  get getAccountSetId() {
    return state.accountSet && state.accountSet.id
  },
  get getCurrentMonth() {
    return state.currentMonth
  },
  get isAccountSetWritable() {
    const level = state.accountSet && state.accountSet.level
    return state.accountSetListLoaded &&
      (level === FmsAccountUserLevelEnum.OWNER || level === FmsAccountUserLevelEnum.WRITE)
  },
  get getAccountSetList() {
    return state.accountSetList
  },
  loadAccountSetList(force) {
    if (state.accountSetListLoaded && !force) return Promise.resolve(state.accountSetList)
    return getAccountSetList().then(response => {
      const rows = response.data
      state.accountSetList = rows
      state.accountSetListLoaded = true
      const accountSet = state.accountSet
      const selected = state.accountSetList.find(item => accountSet && item.id === accountSet.id && item.initialized) ||
        state.accountSetList.find(item => item.defaultStatus && item.initialized) ||
        state.accountSetList.find(item => item.initialized)
      if (selected) {
        this.setAccountSet({
          id: selected.id,
          companyName: selected.companyName,
          level: selected.level
        })
      } else {
        this.clearAccountSet()
      }
      return state.accountSetList
    })
  },
  setAccountSet(accountSet) {
    if (!accountSet || !accountSet.id) return
    if (!state.accountSet || state.accountSet.id !== accountSet.id) state.currentMonth = undefined
    const value = {
      id: Number(accountSet.id),
      companyName: accountSet.companyName || '',
      level: Number(accountSet.level)
    }
    state.accountSet = value
    writeCachedAccountSet(value)
  },
  loadCurrentMonth() {
    const accountSetId = state.accountSet && state.accountSet.id
    if (!accountSetId) return Promise.resolve(undefined)
    return FmsClosingPeriodApi.getCurrentMonth(accountSetId).then(response => {
      const currentMonth = response.data
      if (!state.accountSet || state.accountSet.id !== accountSetId) return undefined
      state.currentMonth = currentMonth
      return currentMonth
    })
  },
  clearAccountSet() {
    state.accountSet = undefined
    state.currentMonth = undefined
    removeCachedAccountSet()
  }
}

export function useFmsStore() {
  return fmsStore
}

export const useFmsStoreWithOut = () => fmsStore
