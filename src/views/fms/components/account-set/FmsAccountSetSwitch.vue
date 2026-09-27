<!-- FMS 账套切换器：恢复账套缓存、切换当前账套，并加载当前会计期间 -->
<template>
  <div class="fms-account-set-switch-host">
    <div v-if="isFmsRoute" class="fms-account-set-switch">
      <i class="el-icon-office-building account-set-icon" />
      <el-select
        v-model="selectedAccountSetId"
        :disabled="switching"
        :loading="loading"
        filterable
        placeholder="请选择账套"
        @change="handleChange"
        @visible-change="handleVisibleChange"
      >
        <el-option
          v-for="item in accountSetList"
          :key="item.id"
          :disabled="!item.initialized"
          :label="item.companyName"
          :value="item.id"
        >
          <div class="account-set-option">
            <span>{{ item.companyName }}</span>
            <span class="account-set-tags">
              <el-tag v-if="item.defaultStatus" effect="plain" size="mini">默认</el-tag>
              <el-tag v-if="!item.initialized" effect="plain" size="mini" type="info">未初始化</el-tag>
            </span>
          </div>
        </el-option>
      </el-select>
      <span v-if="currentMonthText" class="current-month-text">{{ currentMonthText }}</span>
    </div>
    <fms-account-set-guide ref="accountSetGuide" />
  </div>
</template>

<script>
import { updateAccountSetDefaultStatus } from '@/api/fms/config/account-user'
import { useFmsStore } from '@/views/fms/store/fms'
import FmsAccountSetGuide from './FmsAccountSetGuide.vue'

const FMS_ROUTE_PREFIX = '/fms'
const FMS_HOME_PATH = '/fms/home'
const FMS_ACCOUNT_SET_PATH = '/fms/config/account-set'

export default {
  name: 'FmsAccountSetSwitch',
  components: { FmsAccountSetGuide },
  data() {
    return {
      fmsStore: useFmsStore(),
      loading: false,
      switching: false,
      accountSetListLoaded: false,
      accountSetGuideShown: false,
      selectedAccountSetId: undefined
    }
  },
  computed: {
    isFmsRoute() {
      return this.isFmsRoutePath(this.$route.path)
    },
    accountSetId() {
      return this.fmsStore.getAccountSetId
    },
    accountSetList() {
      return this.fmsStore.getAccountSetList
    },
    currentMonthText() {
      return this.formatCurrentMonth(this.fmsStore.getCurrentMonth)
    }
  },
  watch: {
    accountSetId: {
      immediate: true,
      handler(id) {
        this.selectedAccountSetId = id
        this.loadCurrentMonthIfNeeded()
      }
    },
    isFmsRoute: {
      immediate: true,
      handler(visible) {
        if (visible) {
          this.loadAccountSetList()
          this.loadCurrentMonthIfNeeded()
        }
      }
    },
    '$route.path'() {
      this.showAccountSetGuide()
    }
  },
  methods: {
    loadAccountSetList(force) {
      if (this.loading) return Promise.resolve()
      this.loading = true
      return this.fmsStore.loadAccountSetList(Boolean(force)).then(() => {
        this.accountSetListLoaded = true
        const accountSet = this.accountSetList.find(item => item.id === this.accountSetId)
        if (!accountSet) {
          this.selectedAccountSetId = undefined
          return this.showAccountSetGuide()
        }
        this.accountSetGuideShown = false
        if (this.$refs.accountSetGuide) this.$refs.accountSetGuide.close()
        this.selectedAccountSetId = accountSet.id
        this.fmsStore.setAccountSet({
          id: accountSet.id,
          companyName: accountSet.companyName,
          level: accountSet.level
        })
        return undefined
      }).finally(() => {
        this.loading = false
      })
    },
    showAccountSetGuide() {
      if (!this.accountSetListLoaded || this.accountSetGuideShown || !this.isFmsRoute ||
        this.$route.path === FMS_ACCOUNT_SET_PATH || this.accountSetId) return Promise.resolve()
      return this.$nextTick().then(() => {
        if (!this.$refs.accountSetGuide) return
        this.accountSetGuideShown = true
        this.$refs.accountSetGuide.open(this.accountSetList.length === 0 ? 'empty' : 'uninitialized')
      })
    },
    handleVisibleChange(visible) {
      if (visible) return this.loadAccountSetList(true)
      return Promise.resolve()
    },
    loadCurrentMonthIfNeeded() {
      if (this.isFmsRoute && this.accountSetId && !this.fmsStore.getCurrentMonth) {
        return this.fmsStore.loadCurrentMonth()
      }
      return Promise.resolve()
    },
    async handleChange(id) {
      const previousAccountSetId = this.accountSetId
      if (id === previousAccountSetId) return
      const accountSet = this.accountSetList.find(item => item.id === id)
      if (!accountSet || !accountSet.initialized) {
        this.selectedAccountSetId = previousAccountSetId
        return
      }
      const content = '切换账套后将关闭所有财务管理标签页，未保存的内容不会保留。确认切换至“' +
        accountSet.companyName + '”吗？'
      try {
        await this.$confirm(content, '切换账套', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch {
        this.selectedAccountSetId = previousAccountSetId
        return
      }
      this.switching = true
      try {
        await updateAccountSetDefaultStatus(accountSet.id)
        this.fmsStore.setAccountSet({
          id: accountSet.id,
          companyName: accountSet.companyName,
          level: accountSet.level
        })
        this.closeFmsTags()
        await this.$router.replace(FMS_HOME_PATH).catch(error => {
          if (!error || error.name !== 'NavigationDuplicated') throw error
        })
        this.$message.success('已切换至账套“' + accountSet.companyName + '”')
      } finally {
        this.switching = false
      }
    },
    closeFmsTags() {
      const tagsView = this.$store.state.tagsView
      const views = (tagsView.visitedViews || []).filter(view => this.isFmsRoutePath(view.path))
      views.forEach(view => {
        this.$store.dispatch('tagsView/delVisitedView', view)
        this.$store.dispatch('tagsView/delCachedView', view)
      })
    },
    isFmsRoutePath(path) {
      return path === FMS_ROUTE_PREFIX || String(path || '').indexOf(FMS_ROUTE_PREFIX + '/') === 0
    },
    formatCurrentMonth(currentMonth) {
      const match = String(currentMonth || '').match(/^(\d{4})-(\d{2})$/)
      return match ? match[1] + ' 年第 ' + match[2] + ' 期' : currentMonth || ''
    }
  }
}
</script>

<style scoped>
.fms-account-set-switch-host { display: inline-flex; align-items: center; height: 100%; vertical-align: top; }
.fms-account-set-switch { position: relative; width: 285px; margin-right: 8px; flex-shrink: 0; line-height: normal; }
.fms-account-set-switch .el-select { width: 100%; }
.account-set-icon { position: absolute; z-index: 2; top: 50%; left: 10px; transform: translateY(-50%); color: #606266; }
.fms-account-set-switch ::v-deep .el-input__inner { padding-left: 32px; padding-right: 116px; }
.current-month-text { position: absolute; z-index: 2; top: 50%; right: 32px; max-width: 78px; padding-left: 8px; overflow: hidden; border-left: 1px solid #dcdfe6; color: #909399; font-size: 12px; line-height: 16px; text-overflow: ellipsis; white-space: nowrap; transform: translateY(-50%); pointer-events: none; }
.account-set-option { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.account-set-tags { display: flex; flex-shrink: 0; gap: 4px; }
@media (max-width: 1280px) {
  .fms-account-set-switch { width: 190px; }
  .current-month-text { display: none; }
  .fms-account-set-switch ::v-deep .el-input__inner { padding-right: 30px; }
}
</style>
