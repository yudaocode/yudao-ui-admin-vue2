<template>
  <div class="draggable-field">
    <div class="draggable-tip">拖动左上角的小圆点可对其排序</div>
    <VueDraggable
      v-model="formData"
      :force-fallback="false"
      :animation="200"
      handle=".drag-icon"
      class="draggable-list"
    >
      <div
        v-for="(element, index) in formData"
        :key="getItemKey(element, index)"
        class="draggable-item"
      >
        <div class="draggable-toolbar">
          <el-tooltip content="拖动排序">
            <svg-icon icon-class="drag" class="drag-icon" />
          </el-tooltip>
          <el-tooltip content="删除">
            <i
              v-if="formData.length > min"
              class="el-icon-delete delete-icon"
              @click="handleDelete(index)"
            />
          </el-tooltip>
        </div>
        <slot :element="element" :index="index" />
      </div>
    </VueDraggable>
    <el-tooltip :disabled="limit < 1" :content="`最多添加${limit}个`">
      <el-button
        type="primary"
        plain
        class="add-button"
        :disabled="limit > 0 && formData.length >= limit"
        @click="handleAdd"
      >
        <i class="el-icon-plus" />
        <span>添加</span>
      </el-button>
    </el-tooltip>
  </div>
</template>

<script>
import VueDraggable from 'vuedraggable'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'DraggableField',
  components: { VueDraggable },
  props: {
    value: {
      type: Array,
      required: true
    },
    emptyItem: {
      type: null,
      default: () => ({})
    },
    limit: {
      type: Number,
      default: 0
    },
    min: {
      type: Number,
      default: 1
    }
  },
  computed: {
    formData: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  methods: {
    getItemKey(element, index) {
      return element && (element.id || element.uid || element.url || element.name) || index
    },
    handleAdd() {
      const value = this.formData.slice()
      value.push(cloneDeep(this.emptyItem || {}))
      this.formData = value
    },
    handleDelete(index) {
      const value = this.formData.slice()
      value.splice(index, 1)
      this.formData = value
    }
  }
}
</script>

<style lang="scss" scoped>
.draggable-tip {
  margin-bottom: 8px;
  font-size: 12px;
  color: #909399;
}

.draggable-item {
  display: flex;
  padding: 8px;
  margin-bottom: 4px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  gap: 4px;
  flex-direction: column;
}

.draggable-toolbar {
  display: flex;
  padding: 8px;
  margin: -8px -8px 4px;
  background-color: #f5f7fa;
  align-items: center;
  justify-content: space-between;
}

.drag-icon {
  color: #8a909c;
  cursor: move;
}

.delete-icon {
  color: #f56c6c;
  cursor: pointer;
}

.add-button {
  width: 100%;
  margin-top: 4px;
}
</style>
