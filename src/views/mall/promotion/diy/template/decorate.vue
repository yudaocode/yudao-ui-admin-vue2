<template>
  <DiyEditor
    v-if="formData && !formLoading"
    v-model="currentFormData.property"
    :libs="libs"
    :preview-url="previewUrl"
    :show-navigation-bar="selectedTemplateItem !== 0"
    :show-page-config="selectedTemplateItem !== 0"
    :show-tab-bar="selectedTemplateItem === 0"
    :title="templateItems[selectedTemplateItem].name"
    @reset="handleEditorReset"
    @save="submitForm"
  >
    <template slot="toolBarLeft">
      <el-radio-group
        :value="selectedTemplateItem"
        class="template-item-tabs"
        @input="handleTemplateItemChange"
      >
        <el-tooltip
          v-for="(item, index) in templateItems"
          :key="index"
          :content="item.name"
          placement="bottom"
        >
          <el-radio-button :label="index">
            <i
              :class="item.icon"
              class="template-item-icon"
            />
          </el-radio-button>
        </el-tooltip>
      </el-radio-group>
    </template>
  </DiyEditor>
</template>

<script>
import * as DiyTemplateApi from '@/api/mall/promotion/diy/template'
import * as DiyPageApi from '@/api/mall/promotion/diy/page'
import DiyEditor from '@/components/DiyEditor/index.vue'
import { PAGE_LIBS } from '@/components/DiyEditor/util'
import { isEmpty } from '@/utils/is'
import { getTenantId } from '@/utils/auth'

const DIY_PAGE_INDEX_KEY = 'diy_page_index'

export default {
  name: 'DiyTemplateDecorate',
  components: { DiyEditor },
  data() {
    return {
      selectedTemplateItem: 0,
      templateItems: [
        { name: '基础设置', icon: 'el-icon-mobile-phone' },
        { name: '首页', icon: 'el-icon-s-home' },
        { name: '我的', icon: 'el-icon-user-solid' }
      ],
      formLoading: false,
      formData: undefined,
      currentFormData: { property: '' },
      currentFormDataMap: new Map(),
      previewUrl: '',
      templateLibs: [],
      libs: []
    }
  },
  created() {
    this.resetForm()
    const id = this.$route && this.$route.params ? this.$route.params.id : undefined
    if (id === undefined || id === null || id === '') {
      this.$modal.msgWarning('参数错误，页面编号不能为空！')
      if (this.$store) this.$store.dispatch('tagsView/delView', this.$route)
      return
    }
    this.getPageDetail(id).then(() => this.recoverPageIndex())
  },
  methods: {
    getPageDetail(id) {
      this.formLoading = true
      return DiyTemplateApi.getDiyTemplateProperty(id)
        .then((response) => {
          this.formData = response.data
          const domain = process.env.VUE_APP_MALL_H5_DOMAIN
          this.previewUrl = `${domain}?templateId=${this.formData.id}&tenantId=${getTenantId()}`
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    handleTemplateItemChange(value) {
      const previousIndex = this.selectedTemplateItem
      this.currentFormDataMap.set(
        this.templateItems[previousIndex].name,
        this.currentFormData
      )
      const data = this.currentFormDataMap.get(this.templateItems[value].name)
      this.selectedTemplateItem = value
      if (value === 0) {
        this.libs = this.templateLibs
        this.currentFormData = isEmpty(data) ? this.formData : data
        return
      }
      this.libs = PAGE_LIBS
      this.currentFormData = isEmpty(data)
        ? this.formData.pages.find((page) => page.name === this.templateItems[value].name)
        : data
    },
    submitForm() {
      this.formLoading = true
      let request = Promise.resolve()
      this.templateItems.forEach((item, index) => {
        request = request.then(() => {
          const data = this.currentFormDataMap.get(item.name)
          if (index === 0) {
            return DiyTemplateApi.updateDiyTemplateProperty(isEmpty(data) ? this.formData : data)
          }
          if (this.currentFormData.name.includes(item.name)) {
            return DiyPageApi.updateDiyPageProperty(this.currentFormData)
          }
          if (!isEmpty(data)) {
            return DiyPageApi.updateDiyPageProperty(data)
          }
          return undefined
        })
      })
      return request
        .then(() => {
          this.$modal.msgSuccess('保存成功')
          return true
        })
        .finally(() => {
          this.formLoading = false
        })
    },
    resetForm() {
      this.formData = {
        id: undefined,
        name: '',
        used: false,
        usedTime: undefined,
        remark: '',
        previewPicUrls: [],
        property: '',
        pages: []
      }
    },
    handleEditorReset() {
      this.storePageIndex()
    },
    storePageIndex() {
      sessionStorage.setItem(DIY_PAGE_INDEX_KEY, `${this.selectedTemplateItem}`)
    },
    recoverPageIndex() {
      const pageIndex = Number(sessionStorage.getItem(DIY_PAGE_INDEX_KEY)) || 0
      sessionStorage.removeItem(DIY_PAGE_INDEX_KEY)
      this.currentFormData = this.formData
      this.currentFormDataMap = new Map()
      if (pageIndex !== this.selectedTemplateItem) {
        this.handleTemplateItemChange(pageIndex)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.template-item-tabs {
  height: 100%;
}

.template-item-icon {
  font-size: 24px;
}

::v-deep .el-radio-button,
::v-deep .el-radio-button__inner {
  height: 100%;
}
</style>
