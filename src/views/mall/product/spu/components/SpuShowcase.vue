<template>
  <div>
    <div class="spu-showcase">
      <div
        v-for="(spu, index) in productSpus"
        :key="spu.id"
        class="select-box spu-pic"
      >
        <el-tooltip :content="spu.name">
          <div class="spu-image-wrap">
            <el-image
              :src="spu.picUrl"
              class="spu-image"
            />
            <i
              v-show="!disabled"
              class="el-icon-circle-close delete-icon"
              @click="handleRemoveSpu(index)"
            />
          </div>
        </el-tooltip>
      </div>
      <el-tooltip
        v-if="canAdd"
        content="选择商品"
      >
        <div
          class="select-box"
          @click="openSpuTableSelect"
        >
          <i class="el-icon-plus" />
        </div>
      </el-tooltip>
    </div>
    <SpuTableSelect
      ref="spuTableSelect"
      :multiple="limit !== 1"
      @change="handleSpuSelected"
    />
  </div>
</template>

<script>
import * as ProductSpuApi from '@/api/mall/product/spu'
import SpuTableSelect from './SpuTableSelect.vue'

export default {
  name: 'SpuShowcase',
  components: { SpuTableSelect },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    value: {
      type: [Number, Array],
      required: true
    },
    limit: {
      type: Number,
      default: Number.MAX_VALUE
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      productSpus: []
    }
  },
  computed: {
    canAdd() {
      if (this.disabled) return false
      if (!this.limit) return true
      return this.productSpus.length < this.limit
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        const ids = Array.isArray(value) ? value : value ? [value] : []
        if (ids.length === 0) {
          this.productSpus = []
          return
        }
        if (
          this.productSpus.length === 0 ||
          this.productSpus.some(spu => !ids.includes(spu.id))
        ) {
          return ProductSpuApi.getSpuDetailList(ids).then(response => {
            this.productSpus = response.data
            return this.productSpus
          })
        }
      }
    }
  },
  methods: {
    openSpuTableSelect() {
      return this.$refs.spuTableSelect.open(this.productSpus)
    },
    handleSpuSelected(spus) {
      this.productSpus = Array.isArray(spus) ? spus : [spus]
      this.emitSpuChange()
    },
    handleRemoveSpu(index) {
      this.productSpus.splice(index, 1)
      this.emitSpuChange()
    },
    emitSpuChange() {
      if (this.limit === 1) {
        const spu = this.productSpus.length > 0 ? this.productSpus[0] : null
        this.$emit('input', spu ? spu.id : 0)
        this.$emit('change', spu)
      } else {
        this.$emit('input', this.productSpus.map(spu => spu.id))
        this.$emit('change', this.productSpus)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.spu-showcase {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.select-box {
  display: flex;
  width: 60px;
  height: 60px;
  border: 1px dashed #c0c4cc;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
}
.spu-pic {
  position: relative;
}
.spu-image-wrap,
.spu-image {
  position: relative;
  width: 100%;
  height: 100%;
}
.delete-icon {
  position: absolute;
  top: -10px;
  right: -10px;
  z-index: 1;
  width: 20px;
  height: 20px;
  color: #f56c6c;
  font-size: 20px;
  background: #fff;
  border-radius: 50%;
}
</style>

