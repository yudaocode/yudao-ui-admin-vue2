<template>
  <div class="showcase">
    <div
      v-for="(activity, index) in activities"
      :key="activity.id"
      class="select-box spu-pic"
    >
      <el-tooltip :content="activity.name">
        <div class="activity-image">
          <el-image
            :src="activity.picUrl"
            class="image"
          />
          <i
            v-show="!disabled"
            class="el-icon-error delete-icon"
            @click="handleRemoveActivity(index)"
          />
        </div>
      </el-tooltip>
    </div>
    <el-tooltip
      v-if="canAdd"
      content="选择活动"
    >
      <div
        class="select-box"
        @click="openSeckillActivityTableSelect"
      >
        <i class="el-icon-plus" />
      </div>
    </el-tooltip>

    <SeckillTableSelect
      ref="seckillActivityTableSelect"
      :multiple="limit !== 1"
      @change="handleActivitySelected"
    />
  </div>
</template>

<script>
import * as SeckillActivityApi from '@/api/mall/promotion/seckill/seckillActivity'
import SeckillTableSelect from './SeckillTableSelect.vue'

export default {
  name: 'SeckillShowcase',
  components: { SeckillTableSelect },
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
      activities: []
    }
  },
  computed: {
    canAdd() {
      if (this.disabled) return false
      if (!this.limit) return true
      return this.activities.length < this.limit
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        const ids = Array.isArray(value) ? value : value ? [value] : []
        if (ids.length === 0) {
          this.activities = []
          return
        }
        if (
          this.activities.length === 0 ||
          this.activities.some(activity => !ids.includes(activity.id))
        ) {
          SeckillActivityApi.getSeckillActivityListByIds(ids).then(response => {
            this.activities = response.data
          })
        }
      }
    }
  },
  methods: {
    openSeckillActivityTableSelect() {
      this.$refs.seckillActivityTableSelect.open(this.activities)
    },
    handleActivitySelected(value) {
      this.activities = Array.isArray(value) ? value : [value]
      this.emitActivityChange()
    },
    handleRemoveActivity(index) {
      this.activities.splice(index, 1)
      this.emitActivityChange()
    },
    emitActivityChange() {
      if (this.limit === 1) {
        const activity = this.activities.length > 0 ? this.activities[0] : null
        this.$emit('input', activity ? activity.id : 0)
        this.$emit('change', activity)
      } else {
        this.$emit('input', this.activities.map(activity => activity.id))
        this.$emit('change', this.activities)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.showcase {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.select-box {
  display: flex;
  width: 60px;
  height: 60px;
  cursor: pointer;
  border: 1px dashed #c0c4cc;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
}

.spu-pic {
  position: relative;
}

.activity-image {
  position: relative;
  width: 100%;
  height: 100%;
}

.image {
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
}
</style>
