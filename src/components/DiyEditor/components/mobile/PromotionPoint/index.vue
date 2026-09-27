<template>
  <div ref="container" class="promotion-list">
    <div
      v-for="(spu, index) in spuList"
      :key="index"
      class="promotion-card"
      :style="{
        ...calculateSpace(index),
        ...calculateWidth(),
        borderTopLeftRadius: property.borderRadiusTop + 'px',
        borderTopRightRadius: property.borderRadiusTop + 'px',
        borderBottomLeftRadius: property.borderRadiusBottom + 'px',
        borderBottomRightRadius: property.borderRadiusBottom + 'px'
      }"
    >
      <div v-if="property.badge.show" class="badge">
        <el-image fit="cover" :src="property.badge.imgUrl" class="badge-image" />
      </div>
      <div
        class="product-image-wrap"
        :class="{ 'small-image': property.layoutType === 'oneColSmallImg' }"
      >
        <el-image fit="cover" class="product-image" :src="spu.picUrl" />
      </div>
      <div
        class="product-info"
        :class="{ 'small-image-info': property.layoutType === 'oneColSmallImg' }"
      >
        <div
          v-if="property.fields.name.show"
          class="product-name"
          :class="{ 'two-lines': property.layoutType === 'oneColSmallImg' }"
          :style="{ color: property.fields.name.color }"
        >
          {{ spu.name }}
        </div>
        <div
          v-if="property.fields.introduction.show"
          class="product-introduction"
          :style="{ color: property.fields.introduction.color }"
        >
          {{ spu.introduction }}
        </div>
        <div>
          <span
            v-if="property.fields.price.show"
            class="product-price"
            :style="{ color: property.fields.price.color }"
          >
            {{ spu.point }}积分
            {{ !spu.pointPrice || spu.pointPrice === 0 ? '' : '+' + fenToYuan(spu.pointPrice) + '元' }}
          </span>
          <span
            v-if="property.fields.marketPrice.show && spu.marketPrice"
            class="market-price"
            :style="{ color: property.fields.marketPrice.color }"
          >
            ￥{{ fenToYuan(spu.marketPrice) }}
          </span>
        </div>
        <div class="product-count">
          <span
            v-if="property.fields.salesCount.show"
            :style="{ color: property.fields.salesCount.color }"
          >
            已兑{{ (spu.pointTotalStock || 0) - (spu.pointStock || 0) }}件
          </span>
          <span v-if="property.fields.stock.show" :style="{ color: property.fields.stock.color }">
            库存{{ spu.pointTotalStock || 0 }}
          </span>
        </div>
      </div>
      <div class="buy-button">
        <span
          v-if="property.btnBuy.type === 'text'"
          class="buy-button-text"
          :style="{
            background:
              'linear-gradient(to right, ' +
              property.btnBuy.bgBeginColor +
              ', ' +
              property.btnBuy.bgEndColor
          }"
        >
          {{ property.btnBuy.text }}
        </span>
        <el-image
          v-else
          class="buy-button-image"
          fit="cover"
          :src="property.btnBuy.imgUrl"
        />
      </div>
    </div>
  </div>
</template>

<script>
import * as ProductSpuApi from '@/api/mall/product/spu'
import { PointActivityApi as ActivityApi } from '@/api/mall/promotion/point'
import { fenToYuan } from '@/utils'

export default {
  name: 'PromotionPoint',
  props: {
    property: { type: Object, required: true }
  },
  data() {
    return {
      spuList: [],
      spuIdList: [],
      pointActivityList: []
    }
  },
  watch: {
    'property.activityIds': {
      immediate: true,
      deep: true,
      async handler(activityIds) {
        try {
          if (Array.isArray(activityIds) && activityIds.length > 0) {
            const activityResponse = await ActivityApi.getPointActivityListByIds(activityIds)
            this.pointActivityList = activityResponse.data
            this.spuList = []
            this.spuIdList = this.pointActivityList.map(activity => activity.spuId)
            if (this.spuIdList.length > 0) {
              const spuResponse = await ProductSpuApi.getSpuDetailList(this.spuIdList)
              this.spuList = spuResponse.data
            }
            this.pointActivityList.forEach(activity => {
              const spu = this.spuList.find(item => item.id === activity.spuId)
              if (spu) {
                spu.pointStock = activity.stock
                spu.pointTotalStock = activity.totalStock
                spu.point = activity.point
                spu.pointPrice = activity.price
              }
            })
          }
        } catch (error) {
          console.error('获取积分商城活动细节或 SPU 细节时出错:', error)
        }
      }
    }
  },
  methods: {
    fenToYuan,
    calculateSpace(index) {
      const columns = this.property.layoutType === 'twoCol' ? 2 : 1
      const marginLeft = index % columns === 0 ? '0' : this.property.space + 'px'
      const marginTop = index < columns ? '0' : this.property.space + 'px'
      return { marginLeft, marginTop }
    },
    calculateWidth() {
      let width = '100%'
      if (this.property.layoutType === 'twoCol') {
        width = (this.$refs.container.offsetWidth - this.property.space) / 2 + 'px'
      }
      return { width }
    }
  }
}
</script>

<style scoped lang="scss">
.promotion-list {
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  min-height: 30px;
  box-sizing: content-box;
}
.promotion-card {
  position: relative;
  display: flex;
  flex-flow: row wrap;
  overflow: hidden;
  background: #fff;
  box-sizing: content-box;
}
.badge {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.badge-image {
  width: 38px;
  height: 26px;
}
.product-image-wrap {
  width: 100%;
  height: 140px;
}
.product-image-wrap.small-image {
  width: 140px;
}
.product-image {
  width: 100%;
  height: 100%;
}
.product-info {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px;
  gap: 8px;
  box-sizing: border-box;
}
.product-info.small-image-info {
  width: calc(100% - 156px);
}
.product-name,
.product-introduction {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-name {
  font-size: 14px;
}
.product-name.two-lines {
  display: -webkit-box;
  white-space: normal;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.product-introduction,
.product-count {
  font-size: 12px;
}
.product-price {
  font-size: 16px;
}
.market-price {
  margin-left: 4px;
  font-size: 10px;
  text-decoration: line-through;
}
.buy-button {
  position: absolute;
  right: 8px;
  bottom: 8px;
}
.buy-button-text {
  padding: 4px 12px;
  color: #fff;
  font-size: 12px;
  border-radius: 9999px;
}
.buy-button-image {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}
</style>
