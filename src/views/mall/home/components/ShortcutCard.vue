<template>
  <el-card
    shadow="never"
    class="home-card shortcut-card"
  >
    <div
      slot="header"
      class="home-card__title"
    >快捷入口</div>
    <div class="shortcut-card__grid">
      <button
        v-for="menu in menuList"
        :key="menu.name"
        type="button"
        class="shortcut-card__item"
        @click="handleMenuClick(menu.routerName)"
      >
        <span
          :style="{ backgroundColor: menu.color }"
          class="shortcut-card__icon"
        >
          <svg-icon :icon-class="menu.icon" />
        </span>
        <span>{{ menu.name }}</span>
      </button>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'ShortcutCard',
  data() {
    return {
      menuList: [
        { name: '用户管理', icon: 'user', color: '#f87171', routerName: 'MemberUser' },
        { name: '商品管理', icon: 'shopping', color: '#fb923c', routerName: 'ProductSpu' },
        { name: '订单管理', icon: 'order', color: '#eab308', routerName: 'TradeOrder' },
        { name: '售后管理', icon: 'pay', color: '#16a34a', routerName: 'TradeAfterSale' },
        { name: '分销管理', icon: 'people', color: '#06b6d4', routerName: 'TradeBrokerageUser' },
        { name: '优惠券', icon: 'percentSign', color: '#3b82f6', routerName: 'PromotionCoupon' },
        { name: '拼团活动', icon: 'peoples', color: '#a855f7', routerName: 'PromotionBargainActivity' },
        { name: '佣金提现', icon: 'money', color: '#f43f5e', routerName: 'TradeBrokerageWithdraw' }
      ]
    }
  },
  methods: {
    handleMenuClick(routerName) {
      const result = this.$router.push({ name: routerName })
      if (result && typeof result.catch === 'function') result.catch(() => {})
      return result
    }
  }
}
</script>

<style lang="scss" scoped>
.home-card__title {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.shortcut-card__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px 12px;
  padding: 12px 4px;
}

.shortcut-card__item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: 0;
  color: #606266;
  font: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.shortcut-card__item:hover {
  color: #409eff;
}

.shortcut-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  color: #fff;
  font-size: 24px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .shortcut-card__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
