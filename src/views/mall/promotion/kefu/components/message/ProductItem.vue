<template>
  <div
    class="product-warp"
    @click.stop="openDetail(spuId)"
  >
    <div class="product-warp-left">
      <el-image
        :preview-src-list="[picUrl]"
        :src="picUrl"
        class="product-warp-left-img"
        fit="contain"
        @click.stop
      />
    </div>
    <div class="product-warp-right">
      <div class="description">{{ title }}</div>
      <div class="product-statistics">
        <span class="stock">库存: {{ stock || 0 }}</span>
        <span>销量: {{ salesCount || 0 }}</span>
      </div>
      <div class="product-footer">
        <span class="price">￥{{ fenToYuan(price) }}</span>
        <el-button
          size="small"
          type="text"
        >详情</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { fenToYuan } from '@/utils'

export default {
  name: 'ProductItem',
  props: {
    spuId: { type: Number, default: 0 },
    picUrl: {
      type: String,
      default: 'https://img1.baidu.com/it/u=1601695551,235775011&fm=26&fmt=auto'
    },
    title: { type: String, default: '' },
    price: { type: [String, Number], default: '' },
    salesCount: { type: [String, Number], default: '' },
    stock: { type: [String, Number], default: '' }
  },
  methods: {
    openDetail(spuId) {
      return this.$router.push({ name: 'ProductSpuDetail', params: { id: spuId }})
    },
    fenToYuan
  }
}
</script>

<style lang="scss" scoped>
.product-warp {
  display: flex;
  width: 100%;
  padding: 10px;
  cursor: pointer;
  background-color: rgb(128 128 128 / 30%);
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  align-items: center;
  box-sizing: border-box;

  &-left {
    width: 70px;
    margin-right: 24px;

    &-img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }
  }

  &-right {
    flex: 1;
    min-width: 0;

    .description {
      display: -webkit-box;
      width: 100%;
      overflow: hidden;
      font-size: 16px;
      font-weight: bold;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
    }

    .product-statistics {
      margin: 5px 0;

      .stock {
        margin-right: 20px;
      }
    }

    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .price {
      color: #ff3000;
    }
  }
}
</style>
