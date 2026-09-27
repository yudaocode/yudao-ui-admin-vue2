<template>
  <div class="combination-showcase">
    <el-tooltip
      v-for="(activity, index) in activities"
      :key="activity.id"
      :content="activity.name"
      placement="top"
    >
      <div class="select-box activity-image">
        <el-image
          :src="activity.picUrl"
          fit="cover"
          class="image"
        />
        <i
          v-show="!disabled"
          class="el-icon-circle-close del-icon"
          @click.stop="handleRemoveActivity(index)"
        />
      </div>
    </el-tooltip>
    <el-tooltip
      v-if="canAdd"
      content="选择活动"
      placement="top"
    >
      <div
        class="select-box add-box"
        @click="openCombinationActivityTableSelect"
      >
        <i class="el-icon-plus" />
      </div>
    </el-tooltip>

    <CombinationTableSelect
      ref="tableSelect"
      :multiple="limit !== 1"
      @change="handleActivitySelected"
    />
  </div>
</template>

<script>
import * as CombinationActivityApi from '@/api/mall/promotion/combination/combinationActivity'
import CombinationTableSelect from './CombinationTableSelect.vue'

export default {
  name: 'CombinationShowcase',
  components: { CombinationTableSelect },
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
        this.loadActivities(value)
      }
    }
  },
  methods: {
    loadActivities(value) {
      const ids = Array.isArray(value) ? value.slice() : value ? [value] : []
      if (ids.length === 0) {
        this.activities = []
        return Promise.resolve([])
      }
      const isSame = this.activities.length === ids.length &&
        this.activities.every((activity) => ids.includes(activity.id))
      if (isSame) return Promise.resolve(this.activities)
      return CombinationActivityApi.getCombinationActivityListByIds(ids).then((response) => {
        const data = response.data
        this.activities = data
        return this.activities
      })
    },
    openCombinationActivityTableSelect() {
      return this.$refs.tableSelect.open(this.activities)
    },
    handleActivitySelected(activityValues) {
      this.activities = Array.isArray(activityValues) ? activityValues.slice() : [activityValues]
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
        return
      }
      const activities = this.activities.slice()
      this.$emit('input', activities.map((activity) => activity.id))
      this.$emit('change', activities)
    }
  }
}
</script>

<style lang="scss" scoped>
.combination-showcase {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.select-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  cursor: pointer;
  border: 1px dashed #c0c4cc;
  border-radius: 8px;
}

.activity-image {
  border-style: solid;
}

.image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.del-icon {
  position: absolute;
  top: -9px;
  right: -9px;
  z-index: 1;
  color: #f56c6c;
  font-size: 20px;
  background: #fff;
  border-radius: 50%;
}

.add-box {
  color: #909399;
  font-size: 22px;
}

@media (max-width: 768px) {
  .select-box {
    width: 52px;
    height: 52px;
  }
}
</style>
