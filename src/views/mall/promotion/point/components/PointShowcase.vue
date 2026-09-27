<template>
  <div class="point-showcase">
    <el-tooltip
      v-for="(activity, index) in activities"
      :key="activity.id"
      :content="activity.spuName"
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
        @click="openPointActivityTableSelect"
      >
        <i class="el-icon-plus" />
      </div>
    </el-tooltip>

    <PointTableSelect
      ref="tableSelect"
      :multiple="limit !== 1"
      @change="handleActivitySelected"
    />
  </div>
</template>

<script>
import { PointActivityApi } from '@/api/mall/promotion/point'
import PointTableSelect from './PointTableSelect.vue'

export default {
  name: 'PointShowcase',
  components: { PointTableSelect },
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
      activities: [],
      loadRequestSequence: 0
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
  beforeDestroy() {
    this.loadRequestSequence += 1
  },
  methods: {
    async loadActivities(value) {
      const ids = Array.isArray(value) ? value.slice() : value ? [value] : []
      if (ids.length === 0) {
        this.loadRequestSequence += 1
        this.activities = []
        return []
      }
      const isSame = this.activities.length === ids.length &&
        this.activities.every((activity) => ids.includes(activity.id))
      if (isSame) return this.activities
      const requestId = ++this.loadRequestSequence
      const response = await PointActivityApi.getPointActivityListByIds(ids)
      if (requestId !== this.loadRequestSequence) return this.activities
      const data = response.data
      this.activities = data
      return this.activities
    },
    openPointActivityTableSelect() {
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
.point-showcase {
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
