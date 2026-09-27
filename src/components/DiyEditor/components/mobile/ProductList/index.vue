<template>
  <el-scrollbar
    ref="container"
    class="product-list-scrollbar"
    wrap-class="product-list-scroll-wrap"
  >
    <div
      class="product-grid"
      :style="{
        gridGap: property.space + 'px',
        gridTemplateColumns: gridTemplateColumns,
        width: scrollbarWidth
      }"
    >
      <div
        v-for="(spu, index) in spuList"
        :key="index"
        class="product-item"
        :style="{
          borderTopLeftRadius: property.borderRadiusTop + 'px',
          borderTopRightRadius: property.borderRadiusTop + 'px',
          borderBottomLeftRadius: property.borderRadiusBottom + 'px',
          borderBottomRightRadius: property.borderRadiusBottom + 'px'
        }"
      >
        <div v-if="property.badge.show" class="badge">
          <el-image fit="cover" :src="property.badge.imgUrl" class="badge-image" />
        </div>
        <el-image
          fit="cover"
          :src="spu.picUrl"
          :style="{ width: imageSize, height: imageSize }"
        />
        <div class="product-info" :class="{ 'two-column-info': columns === 2 }">
          <div
            v-if="property.fields.name.show"
            class="product-name"
            :style="{ color: property.fields.name.color }"
          >
            {{ spu.name }}
          </div>
          <div>
            <span
              v-if="property.fields.price.show"
              class="product-price"
              :style="{ color: property.fields.price.color }"
            >
              ￥{{ fenToYuan(spu.price || 0) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<script>
import * as ProductSpuApi from '@/api/mall/product/spu'
import { fenToYuan } from '@/utils'

export default {
  name: 'ProductList',
  props: {
    property: { type: Object, required: true }
  },
  data() {
    return {
      spuList: [],
      phoneWidth: 375,
      columns: 2,
      scrollbarWidth: '100%',
      imageSize: '0',
      gridTemplateColumns: ''
    }
  },
  watch: {
    'property.spuIds': {
      immediate: true,
      deep: true,
      handler(spuIds) {
        if (!spuIds) {
          this.spuList = []
          return
        }
        return ProductSpuApi.getSpuDetailList(spuIds).then(response => {
          this.spuList = response.data
          return this.spuList
        })
      }
    },
    property: {
      immediate: true,
      deep: true,
      handler() {
        this.calculateLayout()
      }
    },
    'spuList.length': {
      immediate: true,
      handler() {
        this.calculateLayout()
      }
    }
  },
  mounted() {
    this.phoneWidth =
      (this.$refs.container && this.$refs.container.wrap
        ? this.$refs.container.wrap.offsetWidth
        : 0) || 375
    this.calculateLayout()
  },
  methods: {
    fenToYuan,
    calculateLayout() {
      this.columns = this.property.layoutType === 'twoCol' ? 2 : 3
      const productWidth =
        (this.phoneWidth - this.property.space * (this.columns - 1)) / this.columns
      this.imageSize = this.columns === 2 ? '64px' : productWidth + 'px'
      if (this.property.layoutType === 'horizSwiper') {
        this.gridTemplateColumns = 'repeat(auto-fill, ' + productWidth + 'px)'
        this.scrollbarWidth =
          productWidth * this.spuList.length +
          this.property.space * (this.spuList.length - 1) +
          'px'
      } else {
        this.gridTemplateColumns = 'repeat(' + this.columns + ', auto)'
        this.scrollbarWidth = '100%'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.product-list-scrollbar {
  z-index: 1;
  min-height: 30px;
}
::v-deep .product-list-scroll-wrap {
  width: 100%;
}
.product-grid {
  display: grid;
  overflow-x: auto;
}
.product-item {
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
.product-info {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px;
  gap: 8px;
  box-sizing: border-box;
}
.product-info.two-column-info {
  width: calc(100% - 64px);
}
.product-name {
  overflow: hidden;
  color: inherit;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-price {
  font-size: 12px;
}
</style>
