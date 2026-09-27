<template>
  <el-aside class="editor-left" width="261px">
    <el-scrollbar class="library-scrollbar">
      <el-collapse v-model="extendGroups">
        <el-collapse-item
          v-for="group in groups"
          :key="group.name"
          :name="group.name"
          :title="group.name"
        >
          <VueDraggable
            :list="group.components"
            :sort="false"
            :group="{ name: 'component', pull: 'clone', put: false }"
            :clone="handleCloneComponent"
            :animation="200"
            :force-fallback="false"
            class="component-container"
            ghost-class="draggable-ghost"
          >
            <div v-for="element in group.components" :key="element.id">
              <div class="drag-placement">组件放置区域</div>
              <div class="component">
                <svg-icon :icon-class="element.icon" class-name="component-icon" />
                <span class="component-name">{{ element.name }}</span>
              </div>
            </div>
          </VueDraggable>
        </el-collapse-item>
      </el-collapse>
    </el-scrollbar>
  </el-aside>
</template>

<script>
import VueDraggable from 'vuedraggable'
import cloneDeep from 'lodash/cloneDeep'
import { componentConfigs } from './mobile/index'

export default {
  name: 'ComponentLibrary',
  components: { VueDraggable },
  props: {
    list: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      groups: [],
      extendGroups: []
    }
  },
  watch: {
    list: {
      immediate: true,
      deep: true,
      handler(list) {
        this.extendGroups = []
        this.groups = []
        list.forEach((group) => {
          if (group.extended) this.extendGroups.push(group.name)
          const items = group.components
            .map((name) => componentConfigs[name])
            .filter(Boolean)
          if (items.length > 0) {
            this.groups.push({ name: group.name, components: items })
          }
        })
      }
    }
  },
  methods: {
    handleCloneComponent(component) {
      const instance = cloneDeep(component)
      instance.uid = new Date().getTime()
      return instance
    }
  }
}
</script>

<style lang="scss" scoped>
.editor-left {
  z-index: 1;
  flex-shrink: 0;
  user-select: none;
  background: #fff;
  box-shadow: 8px 0 8px -8px rgb(0 0 0 / 12%);
}

.library-scrollbar {
  height: 100%;
}

::v-deep .el-collapse {
  border-top: none;
}

::v-deep .el-collapse-item__wrap {
  border-bottom: none;
}

::v-deep .el-collapse-item__content {
  padding-bottom: 0;
}

::v-deep .el-collapse-item__header {
  height: 32px;
  padding: 0 24px;
  line-height: 32px;
  background-color: #f5f7fa;
  border-bottom: none;
}

.component-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.component {
  display: flex;
  width: 86px;
  height: 86px;
  cursor: move;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.component-icon {
  width: 32px;
  height: 32px;
}

.component-name {
  margin-top: 4px;
  font-size: 12px;
}

.component:hover {
  color: #fff;
  background: #409eff;
}

.component:nth-of-type(3n) {
  border-right: none;
}

.drag-placement {
  display: none;
  color: #fff;
}

::v-deep .drag-area .draggable-ghost {
  display: flex;
  width: 100%;
  height: 40px;
  background: repeating-linear-gradient(45deg, #91a8d5, #91a8d5 10%, #94b4eb 10%, #94b4eb 50%);
  background-size: 1rem 1rem;
  justify-content: center;
  align-items: center;
}

::v-deep .drag-area .draggable-ghost .component {
  display: none;
}

::v-deep .drag-area .draggable-ghost .drag-placement {
  display: block;
}
</style>
