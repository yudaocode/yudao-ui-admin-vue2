<template>
  <div :class="['component-container-wrap', { active }]">
    <div :style="componentStyle">
      <component :is="component.id" :property="component.property" />
    </div>
    <div class="component-overlay">
      <div v-if="component.name" class="component-name">{{ component.name }}</div>
      <div v-if="showToolbar && component.name && active" class="component-toolbar">
        <VerticalButtonGroup type="primary">
          <el-tooltip content="上移" placement="right">
            <el-button :disabled="!canMoveUp" @click.stop="$emit('move', -1)">
              <i class="el-icon-arrow-up" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="下移" placement="right">
            <el-button :disabled="!canMoveDown" @click.stop="$emit('move', 1)">
              <i class="el-icon-arrow-down" />
            </el-button>
          </el-tooltip>
          <el-tooltip content="复制" placement="right">
            <el-button @click.stop="$emit('copy')"><i class="el-icon-copy-document" /></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="right">
            <el-button @click.stop="$emit('delete')"><i class="el-icon-delete" /></el-button>
          </el-tooltip>
        </VerticalButtonGroup>
      </div>
    </div>
  </div>
</template>

<script>
import VerticalButtonGroup from '@/components/VerticalButtonGroup/index.vue'
import { components } from './mobile/index'

export default {
  name: 'ComponentContainer',
  components: Object.assign({ VerticalButtonGroup }, components),
  props: {
    component: {
      type: Object,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    canMoveUp: {
      type: Boolean,
      default: false
    },
    canMoveDown: {
      type: Boolean,
      default: false
    },
    showToolbar: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    componentStyle() {
      const style = this.component.property && this.component.property.style
      if (!style) return {}
      return {
        marginTop: `${style.marginTop || 0}px`,
        marginRight: `${style.marginRight || 0}px`,
        marginBottom: `${style.marginBottom || 0}px`,
        marginLeft: `${style.marginLeft || 0}px`,
        paddingTop: `${style.paddingTop || 0}px`,
        paddingRight: `${style.paddingRight || 0}px`,
        paddingBottom: `${style.paddingBottom || 0}px`,
        paddingLeft: `${style.paddingLeft || 0}px`,
        borderTopLeftRadius: `${style.borderTopLeftRadius || 0}px`,
        borderTopRightRadius: `${style.borderTopRightRadius || 0}px`,
        borderBottomRightRadius: `${style.borderBottomRightRadius || 0}px`,
        borderBottomLeftRadius: `${style.borderBottomLeftRadius || 0}px`,
        overflow: 'hidden',
        background: style.bgType === 'color' ? style.bgColor : `url(${style.bgImg})`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$active-border-width: 2px;
$name-position: -85px;
$toolbar-position: -55px;

.component-container-wrap {
  position: relative;
  cursor: move;
}

.component-overlay {
  position: absolute;
  top: 0;
  left: -$active-border-width;
  display: block;
  width: 100%;
  height: 100%;
}

.component-overlay:hover {
  border: 1px dashed #409eff;
  box-shadow: 0 0 5px rgb(24 144 255 / 30%);
}

.component-name {
  position: absolute;
  top: $active-border-width;
  left: $name-position;
  display: block;
  width: 80px;
  height: 25px;
  font-size: 12px;
  line-height: 25px;
  color: #6a6a6a;
  text-align: center;
  background: #fff;
  box-shadow: 0 0 4px #00000014, 0 2px 6px #0000000f, 0 4px 8px 2px #0000000a;
}

.component-name::after {
  position: absolute;
  top: 7.5px;
  right: -10px;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-left-color: #fff;
  content: ' ';
}

.component-toolbar {
  position: absolute;
  top: 0;
  right: $toolbar-position;
  display: none;
}

.component-toolbar::before {
  position: absolute;
  top: 10px;
  left: -10px;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-right-color: #409eff;
  content: ' ';
}

.component-container-wrap.active {
  margin-bottom: 4px;
}

.component-container-wrap.active .component-overlay {
  margin-bottom: 4px;
  border: $active-border-width solid #409eff !important;
  box-shadow: 0 0 10px rgb(24 144 255 / 30%);
}

.component-container-wrap.active .component-name {
  top: 0 !important;
  left: $name-position - $active-border-width !important;
  color: #fff;
  background: #409eff;
}

.component-container-wrap.active .component-name::after {
  border-left-color: #409eff;
}

.component-container-wrap.active .component-toolbar {
  display: block;
}
</style>
