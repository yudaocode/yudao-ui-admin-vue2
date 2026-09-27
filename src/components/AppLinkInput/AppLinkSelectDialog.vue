<template>
  <div>
    <el-dialog title="选择链接" :visible.sync="dialogVisible" width="65%" append-to-body>
      <div class="link-selector">
        <el-scrollbar ref="groupScrollbar" class="group-scrollbar">
          <div class="group-list">
            <el-button
              v-for="group in APP_LINK_GROUP_LIST"
              ref="groupBtnRefs"
              :key="group.name"
              :type="activeGroup === group.name ? 'primary' : 'default'"
              :plain="activeGroup !== group.name"
              class="group-button"
              @click="handleGroupSelected(group.name)"
            >
              {{ group.name }}
            </el-button>
          </div>
        </el-scrollbar>
        <el-scrollbar ref="linkScrollbar" class="link-scrollbar">
          <div v-for="group in APP_LINK_GROUP_LIST" :key="group.name" class="link-group">
            <div ref="groupTitleRefs" class="group-title">{{ group.name }}</div>
            <el-tooltip
              v-for="appLink in group.links"
              :key="appLink.path"
              :content="appLink.path"
              placement="bottom"
              :open-delay="300"
            >
              <el-button
                class="link-button"
                :type="isSameLink(appLink.path, activeAppLink.path) ? 'primary' : 'default'"
                @click="handleAppLinkSelected(appLink)"
              >
                {{ appLink.name }}
              </el-button>
            </el-tooltip>
          </div>
        </el-scrollbar>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="" :visible.sync="detailSelectDialog.visible" width="50%" append-to-body>
      <el-form class="detail-form">
        <el-form-item
          v-if="detailSelectDialog.type === APP_LINK_TYPE_ENUM.PRODUCT_CATEGORY_LIST"
          label="选择分类"
        >
          <ProductCategorySelect
            v-model="detailSelectDialog.id"
            :parent-id="0"
            @input="handleProductCategorySelected"
          />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import ProductCategorySelect from '@/views/mall/product/category/components/ProductCategorySelect.vue'
import { APP_LINK_GROUP_LIST, APP_LINK_TYPE_ENUM } from './data'

export default {
  name: 'AppLinkSelectDialog',
  components: { ProductCategorySelect },
  data() {
    return {
      APP_LINK_GROUP_LIST,
      APP_LINK_TYPE_ENUM,
      activeGroup: APP_LINK_GROUP_LIST[0].name,
      activeAppLink: {},
      dialogVisible: false,
      detailSelectDialog: {
        visible: false,
        id: undefined,
        type: undefined
      }
    }
  },
  beforeDestroy() {
    this.removeScrollListener()
  },
  methods: {
    open(link) {
      this.activeAppLink = { name: '', path: '' }
      this.dialogVisible = true
      const group = APP_LINK_GROUP_LIST.find((item) => item.links.some((linkItem) => {
        const sameLink = this.isSameLink(linkItem.path, link)
        if (sameLink) this.activeAppLink = Object.assign({}, linkItem, { path: link })
        return sameLink
      }))
      this.$nextTick(() => {
        this.addScrollListener()
        if (group) this.handleGroupSelected(group.name)
      })
    },
    handleAppLinkSelected(appLink) {
      if (!this.isSameLink(appLink.path, this.activeAppLink.path)) {
        const path = appLink.path || this.activeAppLink.path
        this.activeAppLink = Object.assign({}, appLink, { path })
      }
      if (appLink.type === APP_LINK_TYPE_ENUM.PRODUCT_CATEGORY_LIST) {
        this.detailSelectDialog.visible = true
        this.detailSelectDialog.type = appLink.type
        this.detailSelectDialog.id = this.getUrlNumberValue('id', this.activeAppLink.path)
      }
    },
    handleSubmit() {
      this.dialogVisible = false
      this.$emit('change', this.activeAppLink.path)
      this.$emit('appLinkChange', this.activeAppLink)
    },
    handleScroll(event) {
      const scrollTop = event.target.scrollTop
      const title = (this.$refs.groupTitleRefs || []).find((element) => {
        return scrollTop >= element.offsetTop && scrollTop < element.offsetTop + element.offsetHeight
      })
      if (title && this.activeGroup !== title.textContent) {
        this.activeGroup = title.textContent || ''
        this.scrollToGroupBtn(this.activeGroup)
      }
    },
    handleGroupSelected(group) {
      this.activeGroup = group
      const title = (this.$refs.groupTitleRefs || []).find((item) => item.textContent === group)
      const scrollbar = this.$refs.linkScrollbar
      if (title && scrollbar && scrollbar.wrap) scrollbar.wrap.scrollTop = title.offsetTop
    },
    scrollToGroupBtn(group) {
      const button = (this.$refs.groupBtnRefs || []).find((item) => item.$el.textContent.trim() === group)
      const scrollbar = this.$refs.groupScrollbar
      if (button && scrollbar && scrollbar.wrap) scrollbar.wrap.scrollTop = button.$el.offsetTop
    },
    addScrollListener() {
      this.removeScrollListener()
      const scrollbar = this.$refs.linkScrollbar
      if (scrollbar && scrollbar.wrap) scrollbar.wrap.addEventListener('scroll', this.handleScroll)
    },
    removeScrollListener() {
      const scrollbar = this.$refs.linkScrollbar
      if (scrollbar && scrollbar.wrap) scrollbar.wrap.removeEventListener('scroll', this.handleScroll)
    },
    isSameLink(link1, link2) {
      return String(link1 || '').split('?')[0] === String(link2 || '').split('?')[0]
    },
    getUrlNumberValue(key, path) {
      const url = new URL(path || '', 'http://127.0.0.1')
      const value = url.searchParams.get(key)
      return value === null || value === '' ? undefined : Number(value)
    },
    handleProductCategorySelected(id) {
      const url = new URL(this.activeAppLink.path, 'http://127.0.0.1')
      url.searchParams.set('id', `${id}`)
      this.activeAppLink.path = `${url.pathname}${url.search}`
      this.detailSelectDialog.visible = false
      this.detailSelectDialog.id = undefined
    }
  }
}
</script>

<style lang="scss" scoped>
.link-selector {
  display: flex;
  height: 500px;
  gap: 8px;
}

.group-scrollbar {
  width: 120px;
}

.group-list {
  display: flex;
  flex-direction: column;
}

.group-button {
  width: 90px;
  margin-right: 16px;
  margin-left: 0;
  text-align: left;
}

.group-button + .group-button {
  margin-top: 8px;
}

.link-scrollbar {
  flex: 1;
}

.link-group {
  margin-bottom: 16px;
}

.group-title {
  margin-bottom: 12px;
  font-weight: 700;
}

.link-button {
  margin-right: 8px;
  margin-bottom: 8px;
  margin-left: 0;
}

.detail-form {
  min-height: 200px;
}
</style>
