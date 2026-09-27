<template>
  <div class="mp-menu-previewer">
    <draggable
      v-model="menuList"
      ghost-class="draggable-ghost"
      :animation="400"
      @end="onParentDragEnd"
    >
      <div
        v-for="(parent, x) in menuList"
        :key="parent.id || 'parent-' + x"
        class="menu_bottom"
      >
        <div
          class="menu_item"
          :class="{ active: activeIndex === String(x) }"
          @click="menuClicked(parent, x)"
        >
          <i class="el-icon-s-fold" />{{ parent.name }}
        </div>
        <div v-if="parentIndex === x && parent.children" class="submenu">
          <draggable
            v-model="parent.children"
            ghost-class="draggable-ghost"
            :animation="400"
            @end="onChildDragEnd($event, x)"
          >
            <div
              v-for="(child, y) in parent.children"
              :key="child.id || 'child-' + x + '-' + y"
              class="menu_bottom subtitle"
            >
              <div
                class="menu_subItem"
                :class="{ active: activeIndex === x + '-' + y }"
                @click="subMenuClicked(child, x, y)"
              >{{ child.name }}</div>
            </div>
          </draggable>
          <div
            v-if="parent.children.length < 5"
            class="menu_bottom menu_addicon"
            @click="addSubMenu(x, parent)"
          >
            <i class="el-icon-plus plus" />
          </div>
        </div>
      </div>
    </draggable>

    <div v-if="menuList.length < 3" class="menu_bottom menu_addicon" @click="addMenu">
      <i class="el-icon-plus plus" />
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { createMenu, MENU_NOT_SELECTED } from './types'

export default {
  name: 'MpMenuPreviewer',
  components: { draggable },
  model: { prop: 'value', event: 'input' },
  props: {
    value: { type: Array, default: () => [] },
    activeIndex: { type: String, default: MENU_NOT_SELECTED },
    parentIndex: { type: Number, default: -1 },
    accountId: { type: [Number, String], default: -1 }
  },
  computed: {
    menuList: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  methods: {
    addMenu() {
      const index = this.menuList.length
      const menu = createMenu('菜单名称', this.accountId, true)
      const list = this.menuList.slice()
      list.push(menu)
      this.menuList = list
      this.menuClicked(menu, index)
    },
    addSubMenu(parentIndex, parent) {
      if (!Array.isArray(parent.children)) this.$set(parent, 'children', [])
      const childIndex = parent.children.length
      const child = createMenu('子菜单名称', this.accountId, false)
      this.$set(parent.children, childIndex, child)
      this.$emit('input', this.menuList.slice())
      this.subMenuClicked(child, parentIndex, childIndex)
    },
    menuClicked(parent, index) {
      this.$emit('menu-clicked', parent, index)
    },
    subMenuClicked(child, parentIndex, childIndex) {
      this.$emit('submenu-clicked', child, parentIndex, childIndex)
    },
    onParentDragEnd({ oldIndex, newIndex }) {
      if (this.activeIndex === MENU_NOT_SELECTED || oldIndex === newIndex) return
      const positions = new Array(this.menuList.length).fill(false)
      positions[this.parentIndex] = true
      const moved = positions.splice(oldIndex, 1)[0]
      positions.splice(newIndex, 0, moved)
      const newParentIndex = positions.indexOf(true)
      const parent = this.menuList[newParentIndex]
      if (parent) this.menuClicked(parent, newParentIndex)
    },
    onChildDragEnd({ newIndex }, parentIndex) {
      const children = this.menuList[parentIndex] && this.menuList[parentIndex].children
      const child = children && children[newIndex]
      if (child) this.subMenuClicked(child, parentIndex, newIndex)
    }
  }
}
</script>

<style lang="scss" scoped>
.menu_bottom {
  position: relative;
  display: block;
  float: left;
  width: 85.5px;
  text-align: center;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #ebedee;
  box-sizing: border-box;

  &.menu_addicon {
    height: 46px;
    line-height: 46px;

    .plus { color: #2bb673; }
  }

  .menu_item {
    display: flex;
    width: 100%;
    height: 44px;
    line-height: 44px;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;

    &.active { border: 1px solid #2bb673; }
  }

  .menu_subItem {
    height: 44px;
    line-height: 44px;
    text-align: center;
    box-sizing: border-box;

    &.active { border: 1px solid #2bb673; }
  }
}

.submenu {
  position: absolute;
  bottom: 45px;
  width: 85.5px;

  .subtitle {
    background-color: #fff;
    box-sizing: border-box;
  }
}

.draggable-ghost {
  background: #f7fafc;
  border: 1px solid #4299e1;
  opacity: 0.5;
}
</style>
