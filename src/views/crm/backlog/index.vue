<template>
  <div class="app-container crm-backlog-page">
    <doc-alert
      title="【通用】跟进记录、待办事项"
      url="https://doc.iocoder.cn/crm/follow-up/"
    />

    <el-row
      :gutter="20"
      class="backlog-layout"
    >
      <el-col
        :xs="24"
        :sm="7"
        :md="5"
        :lg="4"
        class="backlog-side-column"
      >
        <nav
          class="side-item-list"
          aria-label="CRM 待办分类"
        >
          <div
            v-for="item in visibleLeftSides"
            :key="item.menu"
            :class="['side-item', leftMenu === item.menu ? 'side-item-select' : 'side-item-default']"
            role="button"
            tabindex="0"
            @click="sideClick(item)"
            @keyup.enter="sideClick(item)"
            @keyup.space.prevent="sideClick(item)"
          >
            <span>{{ item.name }}</span>
            <el-badge
              v-if="item.count > 0"
              :max="99"
              :value="item.count"
            />
          </div>
          <el-empty
            v-if="visibleLeftSides.length === 0"
            :image-size="70"
            description="暂无可访问的待办数据"
          />
        </nav>
      </el-col>
      <el-col
        :xs="24"
        :sm="17"
        :md="19"
        :lg="20"
        class="backlog-content-column"
      >
        <customer-today-contact-list
          v-if="leftMenu === 'customerTodayContact'"
          ref="activeList"
        />
        <clue-follow-list
          v-if="leftMenu === 'clueFollow'"
          ref="activeList"
        />
        <customer-follow-list
          v-if="leftMenu === 'customerFollow'"
          ref="activeList"
        />
        <customer-put-pool-remind-list
          v-if="leftMenu === 'customerPutPoolRemind'"
          ref="activeList"
        />
        <contract-audit-list
          v-if="leftMenu === 'contractAudit'"
          ref="activeList"
        />
        <receivable-audit-list
          v-if="leftMenu === 'receivableAudit'"
          ref="activeList"
        />
        <receivable-plan-remind-list
          v-if="leftMenu === 'receivablePlanRemind'"
          ref="activeList"
          @count-change="getCount"
        />
        <contract-remind-list
          v-if="leftMenu === 'contractRemind'"
          ref="activeList"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as CustomerApi from '@/api/crm/customer'
import * as ClueApi from '@/api/crm/clue'
import * as ContractApi from '@/api/crm/contract'
import * as ReceivableApi from '@/api/crm/receivable'
import * as ReceivablePlanApi from '@/api/crm/receivable/plan'
import { checkPermi } from '@/utils/permission'
import CustomerFollowList from './components/CustomerFollowList.vue'
import CustomerTodayContactList from './components/CustomerTodayContactList.vue'
import CustomerPutPoolRemindList from './components/CustomerPutPoolRemindList.vue'
import ClueFollowList from './components/ClueFollowList.vue'
import ContractAuditList from './components/ContractAuditList.vue'
import ContractRemindList from './components/ContractRemindList.vue'
import ReceivablePlanRemindList from './components/ReceivablePlanRemindList.vue'
import ReceivableAuditList from './components/ReceivableAuditList.vue'

const LEFT_SIDES = Object.freeze([
  { name: '今日需联系客户', menu: 'customerTodayContact', countKey: 'customerTodayContact', permission: 'crm:customer:query' },
  { name: '分配给我的线索', menu: 'clueFollow', countKey: 'clueFollow', permission: 'crm:clue:query' },
  { name: '分配给我的客户', menu: 'customerFollow', countKey: 'customerFollow', permission: 'crm:customer:query' },
  { name: '待进入公海的客户', menu: 'customerPutPoolRemind', countKey: 'customerPutPoolRemind', permission: 'crm:customer:query' },
  { name: '待审核合同', menu: 'contractAudit', countKey: 'contractAudit', permission: 'crm:contract:query' },
  { name: '待审核回款', menu: 'receivableAudit', countKey: 'receivableAudit', permission: 'crm:receivable:query' },
  { name: '待回款提醒', menu: 'receivablePlanRemind', countKey: 'receivablePlanRemind', permission: 'crm:receivable-plan:query' },
  { name: '即将到期的合同', menu: 'contractRemind', countKey: 'contractRemind', permission: 'crm:contract:query' }
])

const COUNT_LOADERS = Object.freeze({
  customerTodayContact: CustomerApi.getTodayContactCustomerCount,
  clueFollow: ClueApi.getFollowClueCount,
  customerFollow: CustomerApi.getFollowCustomerCount,
  customerPutPoolRemind: CustomerApi.getPutPoolRemindCustomerCount,
  contractAudit: ContractApi.getAuditContractCount,
  receivableAudit: ReceivableApi.getAuditReceivableCount,
  receivablePlanRemind: ReceivablePlanApi.getReceivablePlanRemindCount,
  contractRemind: ContractApi.getRemindContractCount
})

export default {
  name: 'CrmBacklog',
  components: {
    CustomerFollowList,
    CustomerTodayContactList,
    CustomerPutPoolRemindList,
    ClueFollowList,
    ContractAuditList,
    ContractRemindList,
    ReceivablePlanRemindList,
    ReceivableAuditList
  },
  data() {
    return {
      leftMenu: 'customerTodayContact',
      counts: {
        clueFollow: 0,
        customerFollow: 0,
        customerPutPoolRemind: 0,
        customerTodayContact: 0,
        contractAudit: 0,
        contractRemind: 0,
        receivableAudit: 0,
        receivablePlanRemind: 0
      },
      countRequestSequence: 0,
      skipInitialActivation: true
    }
  },
  computed: {
    visibleLeftSides() {
      return LEFT_SIDES
        .filter(item => checkPermi([item.permission]))
        .map(item => Object.assign({}, item, { count: this.counts[item.countKey] || 0 }))
    }
  },
  created() {
    this.ensureActiveMenu()
  },
  mounted() {
    this.getCount()
    this.$nextTick(() => {
      this.skipInitialActivation = false
    })
  },
  activated() {
    if (this.skipInitialActivation) return
    this.ensureActiveMenu()
    this.getCount()
    this.$nextTick(() => {
      const activeList = this.$refs.activeList
      if (activeList && typeof activeList.getList === 'function') activeList.getList()
    })
  },
  beforeDestroy() {
    this.countRequestSequence += 1
  },
  methods: {
    ensureActiveMenu() {
      if (this.visibleLeftSides.some(item => item.menu === this.leftMenu)) return
      this.leftMenu = this.visibleLeftSides.length > 0 ? this.visibleLeftSides[0].menu : ''
    },
    sideClick(item) {
      if (!item || item.menu === this.leftMenu) return
      this.leftMenu = item.menu
    },
    async getCount() {
      const requestId = ++this.countRequestSequence
      const accessibleItems = LEFT_SIDES.filter(item => checkPermi([item.permission]))
      const uniqueItems = accessibleItems.filter((item, index, items) =>
        items.findIndex(candidate => candidate.countKey === item.countKey) === index
      )
      await Promise.all(uniqueItems.map(async item => {
        const value = (await COUNT_LOADERS[item.countKey]()).data
        if (requestId === this.countRequestSequence) {
          const count = Number(value)
          this.$set(this.counts, item.countKey, Number.isFinite(count) ? count : 0)
        }
      }))
    }
  }
}
</script>

<style lang="scss" scoped>
.backlog-side-column,
.backlog-content-column {
  min-width: 0;
}

.side-item-list {
  overflow: hidden;
  font-size: 14px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
}

.side-item {
  position: relative;
  min-height: 50px;
  padding: 0 52px 0 20px;
  line-height: 50px;
  cursor: pointer;
  outline: none;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;

  &:focus-visible {
    box-shadow: inset 0 0 0 2px rgba(64, 158, 255, 0.35);
  }
}

.side-item-default {
  color: #303133;
  border-right: 2px solid transparent;
}

.side-item-select {
  color: #409eff;
  background-color: #ecf5ff;
  border-right: 2px solid #409eff;
}

.side-item ::v-deep .el-badge {
  position: absolute;
  top: 0;
  right: 15px;
}

.side-item ::v-deep .el-badge__content {
  top: 7px;
  border: none;
}

@media (max-width: 767px) {
  .backlog-side-column {
    margin-bottom: 16px;
  }

  .side-item-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .side-item {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-right: 1px solid #ebeef5;
    border-bottom: 1px solid #ebeef5;
  }

  .side-item-select {
    border-right-color: #409eff;
  }
}

@media (max-width: 480px) {
  .side-item-list {
    grid-template-columns: 1fr;
  }
}
</style>
