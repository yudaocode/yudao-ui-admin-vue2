<template>
  <el-container class="diy-editor">
    <el-header class="editor-header">
      <slot name="toolBarLeft" />
      <div class="header-center">{{ title }}</div>
      <el-button-group class="header-right">
        <el-tooltip content="重置" placement="bottom">
          <el-button @click="handleReset"><i class="el-icon-refresh-left" /></el-button>
        </el-tooltip>
        <el-tooltip v-if="previewUrl" content="预览" placement="bottom">
          <el-button @click="handlePreview"><i class="el-icon-view" /></el-button>
        </el-tooltip>
        <el-tooltip content="保存" placement="bottom">
          <el-button @click="handleSave"><i class="el-icon-check" /></el-button>
        </el-tooltip>
      </el-button-group>
    </el-header>

    <el-container class="editor-body">
      <ComponentLibrary v-if="libs && libs.length > 0" :list="libs" />

      <div class="editor-center page-prop-area" @click="handlePageSelected">
        <div class="editor-design-top">
          <img alt="" class="status-bar" src="@/assets/imgs/diy/statusBar.svg" />
          <ComponentContainer
            v-if="showNavigationBar"
            :active="selectedComponent && selectedComponent.id === navigationBarComponent.id"
            :component="navigationBarComponent"
            :show-toolbar="false"
            @click.native.stop="handleNavigationBarSelected"
          />
        </div>

        <div
          v-for="(component, index) in pageComponents"
          :key="component.uid || index"
          @click.stop="handleComponentSelected(component, index)"
        >
          <component
            :is="component.id"
            v-if="component.position === 'fixed' && selectedComponent && selectedComponent.uid === component.uid"
            :property="component.property"
          />
        </div>

        <el-scrollbar
          class="editor-design-center page-prop-area"
          :wrap-style="{ height: '100%' }"
          :view-style="pageViewStyle"
          view-class="phone-container"
        >
          <VueDraggable
            v-model="pageComponents"
            :animation="200"
            :force-fallback="false"
            class="page-prop-area drag-area"
            filter=".component-toolbar"
            ghost-class="draggable-ghost"
            group="component"
            @change="handleComponentChange"
          >
            <template v-for="(element, index) in pageComponents">
              <ComponentContainer
                v-if="!element.position || element.position === 'center'"
                :key="element.uid || index"
                :active="selectedComponentIndex === index"
                :can-move-down="index < pageComponents.length - 1"
                :can-move-up="index > 0"
                :component="element"
                @click.native.stop="handleComponentSelected(element, index)"
                @copy="handleCopyComponent(index)"
                @delete="handleDeleteComponent(index)"
                @move="handleMoveComponent(index, $event)"
              />
            </template>
          </VueDraggable>
        </el-scrollbar>

        <div v-if="showTabBar" class="editor-design-bottom">
          <ComponentContainer
            :active="selectedComponent && selectedComponent.id === tabBarComponent.id"
            :component="tabBarComponent"
            :show-toolbar="false"
            @click.native.stop="handleTabBarSelected"
          />
        </div>

        <div class="fixed-component-action-group">
          <el-tag
            v-if="showPageConfig"
            :effect="selectedComponent && selectedComponent.uid === pageConfigComponent.uid ? 'dark' : 'plain'"
            :type="selectedComponent && selectedComponent.uid === pageConfigComponent.uid ? '' : 'info'"
            @click="handleComponentSelected(pageConfigComponent)"
          >
            <svg-icon :icon-class="pageConfigComponent.icon" />
            <span>{{ pageConfigComponent.name }}</span>
          </el-tag>
          <el-tag
            v-for="(component, index) in fixedComponents"
            :key="component.uid || index"
            :effect="selectedComponent && selectedComponent.uid === component.uid ? 'dark' : 'plain'"
            :type="selectedComponent && selectedComponent.uid === component.uid ? '' : 'info'"
            closable
            @click="handleComponentSelected(component, getPageComponentIndex(component))"
            @close="handleDeleteComponent(getPageComponentIndex(component))"
          >
            <svg-icon :icon-class="component.icon" />
            <span>{{ component.name }}</span>
          </el-tag>
        </div>
      </div>

      <el-aside v-if="selectedComponent && selectedComponent.property" class="editor-right" width="350px">
        <el-card class="property-card" shadow="never">
          <div slot="header" class="property-title">
            <svg-icon :icon-class="selectedComponent.icon" />
            <span>{{ selectedComponent.name }}</span>
          </div>
          <el-scrollbar class="property-scrollbar">
            <component
              :is="selectedComponent.id + 'Property'"
              :key="selectedComponent.uid || selectedComponent.id"
              v-model="selectedComponent.property"
            />
          </el-scrollbar>
        </el-card>
      </el-aside>
    </el-container>

    <el-dialog title="预览" :visible.sync="previewDialogVisible" width="700px" append-to-body>
      <div class="preview-dialog">
        <iframe :src="previewUrl" class="preview-frame" frameborder="0"></iframe>
        <div class="preview-qrcode">
          <span>手机扫码预览</span>
          <QrcodeVue :value="previewUrl" :size="180" />
        </div>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import VueDraggable from 'vuedraggable'
import QrcodeVue from 'qrcode.vue'
import cloneDeep from 'lodash/cloneDeep'
import ComponentLibrary from './components/ComponentLibrary.vue'
import ComponentContainer from './components/ComponentContainer.vue'
import { components, componentConfigs } from './components/mobile/index'
import { component as PAGE_CONFIG_COMPONENT } from './components/mobile/PageConfig/config'
import {
  component as NAVIGATION_BAR_COMPONENT,
  isNavigationBarAlwaysShow,
  isNavigationBarShowType
} from './components/mobile/NavigationBar/config'
import { component as TAB_BAR_COMPONENT } from './components/mobile/TabBar/config'
import { isEmpty, isString } from '@/utils/is'

export default {
  name: 'DiyEditor',
  components: Object.assign(
    { VueDraggable, QrcodeVue, ComponentLibrary, ComponentContainer },
    components
  ),
  props: {
    value: {
      type: [String, Object],
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    libs: {
      type: Array,
      default: () => []
    },
    showNavigationBar: {
      type: Boolean,
      default: true
    },
    showTabBar: {
      type: Boolean,
      default: false
    },
    showPageConfig: {
      type: Boolean,
      default: true
    },
    previewUrl: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      pageConfigComponent: cloneDeep(PAGE_CONFIG_COMPONENT),
      navigationBarComponent: cloneDeep(NAVIGATION_BAR_COMPONENT),
      tabBarComponent: cloneDeep(TAB_BAR_COMPONENT),
      selectedComponent: undefined,
      selectedComponentIndex: -1,
      pageComponents: [],
      previewDialogVisible: false,
      syncingValue: false
    }
  },
  computed: {
    pageViewStyle() {
      const property = this.pageConfigComponent.property
      return {
        minHeight: '100%',
        backgroundColor: property.backgroundColor,
        backgroundImage: `url(${property.backgroundImage})`
      }
    },
    fixedComponents() {
      return this.pageComponents.filter((component) => component.position === 'fixed')
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.syncingValue = true
        const modelValue = isString(value) && !isEmpty(value) ? JSON.parse(value) : value
        this.pageConfigComponent.property = cloneDeep(
          modelValue && typeof modelValue !== 'string' && modelValue.page || PAGE_CONFIG_COMPONENT.property
        )
        this.navigationBarComponent.property = this.normalizeNavigationBarProperty(
          modelValue && typeof modelValue !== 'string' && modelValue.navigationBar || NAVIGATION_BAR_COMPONENT.property
        )
        this.tabBarComponent.property = cloneDeep(
          modelValue && typeof modelValue !== 'string' && modelValue.tabBar || TAB_BAR_COMPONENT.property
        )
        const pageComponents = modelValue && typeof modelValue !== 'string' && modelValue.components || []
        this.pageComponents = pageComponents.map((item) => {
          return Object.assign({}, componentConfigs[item.id], { property: item.property })
        })
        this.$nextTick(() => {
          this.syncingValue = false
        })
      }
    },
    selectedComponent: {
      deep: true,
      handler(value) {
        if (!value || this.selectedComponentIndex === -1) return
        if (this.showTabBar) this.selectedComponentIndex = -1
        if (this.selectedComponentIndex >= 0) {
          this.$set(this.pageComponents, this.selectedComponentIndex, value)
        }
      }
    },
    'pageConfigComponent.property': {
      deep: true,
      handler() {
        this.pageConfigChange()
      }
    },
    'navigationBarComponent.property': {
      deep: true,
      handler() {
        this.pageConfigChange()
      }
    },
    'tabBarComponent.property': {
      deep: true,
      handler() {
        this.pageConfigChange()
      }
    },
    pageComponents: {
      deep: true,
      handler() {
        this.pageConfigChange()
      }
    },
    showPageConfig() {
      this.setDefaultSelectedComponent()
    },
    showNavigationBar() {
      this.setDefaultSelectedComponent()
    },
    showTabBar() {
      this.setDefaultSelectedComponent()
    }
  },
  mounted() {
    this.setDefaultSelectedComponent()
  },
  methods: {
    handleSave() {
      this.$emit('save')
    },
    normalizeNavigationBarProperty(property) {
      const value = cloneDeep(property)
      if (!isNavigationBarShowType(value.showType)) {
        value.showType = isNavigationBarAlwaysShow(value) ? 'always' : 'scroll'
      }
      value.alwaysShow = value.showType === 'always'
      return value
    },
    pageConfigChange() {
      if (this.syncingValue) return
      const pageConfig = {
        page: this.pageConfigComponent.property,
        navigationBar: this.navigationBarComponent.property,
        tabBar: this.tabBarComponent.property,
        components: this.pageComponents.map((component) => ({
          id: component.id,
          property: component.property
        }))
      }
      if (!this.showTabBar) delete pageConfig.tabBar
      this.$emit('input', isString(this.value) ? JSON.stringify(pageConfig) : pageConfig)
    },
    handlePageSelected(event) {
      if (!this.showPageConfig) return
      if (event.target && event.target.classList && event.target.classList.contains('page-prop-area')) {
        this.handleComponentSelected(this.pageConfigComponent)
      }
    },
    handleComponentSelected(component, index = -1) {
      this.selectedComponent = component
      this.selectedComponentIndex = index
    },
    handleNavigationBarSelected() {
      this.handleComponentSelected(this.navigationBarComponent)
    },
    handleTabBarSelected() {
      this.handleComponentSelected(this.tabBarComponent)
    },
    handleComponentChange(event) {
      if (event.added) {
        this.handleComponentSelected(event.added.element, event.added.newIndex)
      } else if (event.moved) {
        this.selectedComponentIndex = event.moved.newIndex
      }
    },
    swapComponent(oldIndex, newIndex) {
      const value = this.pageComponents.slice()
      const oldComponent = value[oldIndex]
      this.$set(value, oldIndex, value[newIndex])
      this.$set(value, newIndex, oldComponent)
      this.pageComponents = value
      this.selectedComponentIndex = newIndex
    },
    handleMoveComponent(index, direction) {
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= this.pageComponents.length) return
      this.swapComponent(index, newIndex)
    },
    handleCopyComponent(index) {
      const component = cloneDeep(this.pageComponents[index])
      component.uid = new Date().getTime()
      this.pageComponents.splice(index + 1, 0, component)
    },
    handleDeleteComponent(index) {
      this.pageComponents.splice(index, 1)
      if (index < this.pageComponents.length) {
        this.handleComponentSelected(this.pageComponents[index], index)
      } else if (this.pageComponents.length > 0) {
        this.handleComponentSelected(this.pageComponents[index - 1], index - 1)
      } else {
        this.handleComponentSelected(this.pageConfigComponent)
      }
    },
    getPageComponentIndex(component) {
      return this.pageComponents.indexOf(component)
    },
    handleReset() {
      const refresh = this.$tab ? this.$tab.refreshPage() : Promise.resolve()
      this.$emit('reset')
      return refresh
    },
    handlePreview() {
      this.previewDialogVisible = true
      this.$emit('preview')
    },
    setDefaultSelectedComponent() {
      if (this.showPageConfig) {
        this.handleComponentSelected(this.pageConfigComponent)
      } else if (this.showNavigationBar) {
        this.handleComponentSelected(this.navigationBarComponent)
      } else if (this.showTabBar) {
        this.handleComponentSelected(this.tabBarComponent)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$phone-width: 375px;
$toolbar-height: 42px;

.diy-editor {
  display: flex;
  height: calc(100vh - 84px);
  flex-direction: column;
  background: #fff;
}

.editor-header {
  display: flex;
  height: $toolbar-height !important;
  padding: 0;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
  align-items: center;
  justify-content: space-between;
}

.header-center {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.header-right {
  height: 100%;
}

.header-right .el-button {
  height: 100%;
  font-size: 24px;
  border-top: none;
  border-bottom: none;
  border-radius: 0;
}

.editor-body {
  height: calc(100vh - 126px);
}

.editor-center {
  position: relative;
  display: flex;
  min-width: 500px;
  padding-top: 16px;
  overflow: hidden;
  background: #f0f2f5;
  flex: 1;
  flex-direction: column;
  justify-content: center;
}

.editor-design-top,
.editor-design-bottom {
  width: $phone-width;
  margin: 0 auto;
}

.editor-design-top {
  display: flex;
  flex-direction: column;
}

.status-bar {
  width: $phone-width;
  height: 20px;
  background: #fff;
}

.editor-design-center {
  width: 100%;
  height: 100%;
}

::v-deep .editor-design-center .phone-container {
  position: relative;
  width: $phone-width;
  min-height: 100%;
  margin: 0 auto;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.drag-area {
  width: 100%;
  min-height: 100%;
}

.fixed-component-action-group {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fixed-component-action-group .el-tag {
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.fixed-component-action-group .svg-icon {
  margin-right: 4px;
}

.editor-right {
  overflow: hidden;
  background: #fff;
  box-shadow: -8px 0 8px -8px rgb(0 0 0 / 12%);
  flex-shrink: 0;
}

.property-card {
  height: 100%;
  border: none;
}

.property-title {
  display: flex;
  gap: 8px;
  align-items: center;
}

.property-scrollbar {
  height: calc(100vh - 190px);
}

.preview-dialog {
  display: flex;
  justify-content: space-around;
}

.preview-frame {
  width: 375px;
  height: 667px;
  padding: 2px;
  border: 4px solid #dcdfe6;
  border-radius: 8px;
}

.preview-qrcode {
  display: flex;
  gap: 16px;
  flex-direction: column;
}
</style>
