<template>
  <div class="app-container mp-menu-page">
    <doc-alert title="公众号菜单" url="https://doc.iocoder.cn/mp/menu/" />

    <el-card shadow="never" class="query-card">
      <el-form ref="queryForm" :inline="true" label-width="68px" size="small">
        <el-form-item label="公众号" prop="accountId">
          <wx-account-select @change="onAccountChanged" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div v-loading="loading" class="clearfix public-account-management">
        <div class="left">
          <div class="weixin-hd">
            <div class="weixin-title">{{ accountName }}</div>
          </div>
          <div class="clearfix weixin-menu">
            <menu-previewer
              ref="menuPreviewer"
              v-model="menuList"
              :account-id="accountId"
              :active-index="activeIndex"
              :parent-index="parentIndex"
              @menu-clicked="menuClicked"
              @submenu-clicked="subMenuClicked"
            />
          </div>
          <div class="save_div">
            <el-button
              v-hasPermi="['mp:menu:save']"
              class="save_btn"
              type="success"
              size="small"
              @click="onSave"
            >保存并发布菜单</el-button>
            <el-button
              v-hasPermi="['mp:menu:delete']"
              class="save_btn"
              type="danger"
              size="small"
              @click="onClear"
            >清空菜单</el-button>
          </div>
        </div>

        <div v-if="showRightPanel" class="right">
          <menu-editor
            ref="menuEditor"
            v-model="activeMenu"
            :account-id="accountId"
            :is-parent="isParent"
            @delete="onDeleteMenu"
          />
        </div>
        <div v-else class="right"><p>请选择菜单配置</p></div>
      </div>
    </el-card>
  </div>
</template>

<script>
import WxAccountSelect from '@/views/mp/components/wx-account-select'
import MenuEditor from './components/MenuEditor.vue'
import MenuPreviewer from './components/MenuPreviewer.vue'
import * as MpMenuApi from '@/api/mp/menu'
import { handleTree } from '@/utils/ruoyi'
import { MENU_NOT_SELECTED, MenuLevel } from './components/types'

export default {
  name: 'MpMenu',
  components: { WxAccountSelect, MenuEditor, MenuPreviewer },
  data() {
    return {
      loading: false,
      accountId: -1,
      accountName: '',
      menuList: [],
      activeIndex: MENU_NOT_SELECTED,
      parentIndex: -1,
      showRightPanel: false,
      isParent: true,
      activeMenu: {},
      tempSelfObj: {
        grand: MenuLevel.Undefined,
        x: 0,
        y: 0
      },
      requestSequence: 0
    }
  },
  beforeDestroy() {
    this.requestSequence += 1
  },
  methods: {
    onAccountChanged(id, name) {
      this.accountId = id
      this.accountName = name
      this.resetForm()
      this.getList()
    },
    async getList() {
      if (this.accountId === -1 || this.accountId === undefined || this.accountId === null) return
      const requestId = ++this.requestSequence
      this.loading = true
      try {
        const response = await MpMenuApi.getMenuList(this.accountId)
        const data = response.data
        if (requestId !== this.requestSequence) return
        this.menuList = handleTree(this.menuListToFrontend(data), 'id')
      } finally {
        if (requestId === this.requestSequence) this.loading = false
      }
    },
    handleQuery() {
      this.resetForm()
      this.getList()
    },
    menuListToFrontend(list) {
      return list.map(item => ({
        ...item,
        reply: {
          type: item.replyMessageType,
          accountId: item.accountId,
          content: item.replyContent,
          mediaId: item.replyMediaId,
          url: item.replyMediaUrl,
          title: item.replyTitle,
          description: item.replyDescription,
          thumbMediaId: item.replyThumbMediaId,
          thumbMediaUrl: item.replyThumbMediaUrl,
          articles: item.replyArticles,
          musicUrl: item.replyMusicUrl,
          hqMusicUrl: item.replyHqMusicUrl
        }
      }))
    },
    resetForm() {
      this.activeIndex = MENU_NOT_SELECTED
      this.parentIndex = -1
      this.showRightPanel = false
      this.isParent = true
      this.activeMenu = {}
      this.tempSelfObj = { grand: MenuLevel.Undefined, x: 0, y: 0 }
    },
    menuClicked(parent, index) {
      this.showRightPanel = true
      this.activeMenu = parent
      this.tempSelfObj = { grand: MenuLevel.Parent, x: index, y: 0 }
      this.isParent = true
      this.activeIndex = String(index)
      this.parentIndex = index
    },
    subMenuClicked(child, parentIndex, childIndex) {
      this.showRightPanel = true
      this.activeMenu = child
      this.tempSelfObj = { grand: MenuLevel.Child, x: parentIndex, y: childIndex }
      this.isParent = false
      this.activeIndex = parentIndex + '-' + childIndex
      this.parentIndex = parentIndex
    },
    onDeleteMenu() {
      this.$modal.confirm('确定要删除吗?').then(() => {
        if (this.tempSelfObj.grand === MenuLevel.Parent) {
          this.menuList.splice(this.tempSelfObj.x, 1)
        } else if (this.tempSelfObj.grand === MenuLevel.Child) {
          const parent = this.menuList[this.tempSelfObj.x]
          if (parent && parent.children) parent.children.splice(this.tempSelfObj.y, 1)
        }
        this.$modal.msgSuccess('删除成功')
        this.resetForm()
      }).catch(() => {})
    },
    async onSave() {
      try {
        await this.$modal.confirm('确定要保存并发布该菜单吗？')
        this.loading = true
        await MpMenuApi.saveMenu(this.accountId, this.menuListToBackend())
        await this.getList()
        this.$modal.msgSuccess('发布成功')
      } finally {
        this.loading = false
      }
    },
    async onClear() {
      try {
        await this.$modal.confirm('确定要清空所有菜单吗？')
        this.loading = true
        await MpMenuApi.deleteMenu(this.accountId)
        this.resetForm()
        await this.getList()
        this.$modal.msgSuccess('清空成功')
      } finally {
        this.loading = false
      }
    },
    menuListToBackend() {
      return this.menuList.map(item => {
        const menu = this.menuToBackend(item)
        if (item.children && item.children.length > 0) {
          menu.children = item.children.map(child => this.menuToBackend(child))
        }
        return menu
      })
    },
    menuToBackend(menu) {
      const reply = menu.reply || {}
      return {
        ...menu,
        children: undefined,
        reply: undefined,
        replyMessageType: reply.type,
        replyContent: reply.content,
        replyMediaId: reply.mediaId,
        replyMediaUrl: reply.url,
        replyTitle: reply.title,
        replyDescription: reply.description,
        replyThumbMediaId: reply.thumbMediaId,
        replyThumbMediaUrl: reply.thumbMediaUrl,
        replyArticles: reply.articles,
        replyMusicUrl: reply.musicUrl,
        replyHqMusicUrl: reply.hqMusicUrl
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.query-card { margin-bottom: 16px; }
.clearfix { *zoom: 1; }
.clearfix::after { display: table; clear: both; content: ''; }

.weixin-hd {
  position: relative;
  bottom: 426px;
  left: 0;
  width: 300px;
  height: 64px;
  color: #fff;
  text-align: center;
  background: transparent url('./assets/menu_head.png') no-repeat 0 0;
  background-size: 100%;
}

.weixin-title {
  position: absolute;
  top: 33px;
  left: 0;
  width: 100%;
  color: #fff;
  font-size: 14px;
  text-align: center;
}

.weixin-menu {
  padding-left: 43px;
  font-size: 12px;
  background: transparent url('./assets/menu_foot.png') no-repeat 0 0;
}

.public-account-management {
  width: 1200px;
  margin: 0 auto;

  .left {
    position: relative;
    display: block;
    float: left;
    width: 350px;
    height: 715px;
    padding: 518px 25px 88px;
    background: url('./assets/iphone_backImg.png') no-repeat;
    background-size: 100% auto;
    box-sizing: border-box;

    .save_div {
      margin-top: 15px;
      text-align: center;
    }
  }

  .right {
    float: left;
    width: 63%;
    padding: 20px;
    margin-left: 20px;
    background-color: #e8e7e7;
    box-sizing: border-box;
  }
}
</style>
