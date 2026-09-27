<template>
  <div class="mp-menu-editor">
    <div class="configure_page">
      <div class="delete_btn">
        <el-button type="danger" size="small" icon="el-icon-delete" @click="$emit('delete')">
          删除当前菜单
        </el-button>
      </div>
      <div>
        <span>菜单名称：</span>
        <el-input
          v-model="menu.name"
          class="input_width"
          placeholder="请输入菜单名称"
          :maxlength="isParent ? 4 : 7"
          clearable
        />
      </div>
      <div v-if="isLeaf">
        <div class="menu_content">
          <span>菜单标识：</span>
          <el-input v-model="menu.menuKey" class="input_width" placeholder="请输入菜单 KEY" clearable />
        </div>
        <div class="menu_content">
          <span>菜单内容：</span>
          <el-select v-model="menu.type" clearable placeholder="请选择" class="menu_option">
            <el-option
              v-for="item in menuOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div v-if="menu.type === 'view'" class="configur_content">
          <span>跳转链接：</span>
          <el-input v-model="menu.url" class="input_width" placeholder="请输入链接" clearable />
        </div>
        <div v-if="menu.type === 'miniprogram'" class="configur_content">
          <div class="applet">
            <span>小程序的 appid ：</span>
            <el-input
              v-model="menu.miniProgramAppId"
              class="input_width"
              placeholder="请输入小程序的appid"
              clearable
            />
          </div>
          <div class="applet">
            <span>小程序的页面路径：</span>
            <el-input
              v-model="menu.miniProgramPagePath"
              class="input_width"
              placeholder="请输入小程序的页面路径，如：pages/index"
              clearable
            />
          </div>
          <div class="applet">
            <span>小程序的备用网页：</span>
            <el-input
              v-model="menu.url"
              class="input_width"
              placeholder="不支持小程序的老版本客户端将打开本网页"
              clearable
            />
          </div>
          <p class="blue">tips:需要和公众号进行关联才可以把小程序绑定带微信菜单上哟！</p>
        </div>
        <div v-if="menu.type === 'article_view_limited'" class="configur_content">
          <el-row>
            <div v-if="menu.replyArticles" class="select-item">
              <wx-news :articles="menu.replyArticles" />
              <el-row class="ope-row">
                <el-button type="danger" icon="el-icon-delete" circle @click="deleteMaterial" />
              </el-row>
            </div>
            <el-row v-else>
              <el-col :span="24" class="material-select-trigger">
                <el-button type="success" @click="showNewsDialog = true">
                  素材库选择<i class="el-icon-circle-check el-icon--right" />
                </el-button>
              </el-col>
            </el-row>
            <el-dialog
              title="选择图文"
              :visible.sync="showNewsDialog"
              width="80%"
              append-to-body
              destroy-on-close
            >
              <wx-material-select
                type="news"
                :account-id="accountId"
                @select-material="selectMaterial"
              />
            </el-dialog>
          </el-row>
        </div>
        <div
          v-if="menu.type === 'click' || menu.type === 'scancode_waitmsg'"
          class="configur_content"
        >
          <wx-reply-select v-if="hackResetWxReplySelect" v-model="menu.reply" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WxReplySelect from '@/views/mp/components/wx-reply'
import WxNews from '@/views/mp/components/wx-news'
import WxMaterialSelect from '@/views/mp/components/wx-material-select'
import menuOptions from './menuOptions'

export default {
  name: 'MpMenuEditor',
  components: { WxReplySelect, WxNews, WxMaterialSelect },
  model: { prop: 'value', event: 'input' },
  props: {
    accountId: { type: [Number, String], required: true },
    value: { type: Object, default: () => ({}) },
    isParent: { type: Boolean, default: true }
  },
  data() {
    return {
      menuOptions,
      showNewsDialog: false,
      hackResetWxReplySelect: false
    }
  },
  computed: {
    menu: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },
    isLeaf() {
      return !(this.menu.children && this.menu.children.length > 0)
    }
  },
  watch: {
    value: {
      immediate: true,
      handler() {
        this.hackResetWxReplySelect = false
        this.$nextTick(() => { this.hackResetWxReplySelect = true })
      }
    }
  },
  methods: {
    selectMaterial(item) {
      const articles = item && item.content && Array.isArray(item.content.newsItem)
        ? item.content.newsItem
        : []
      if (articles.length > 1) {
        this.$alert('您选择的是多图文，将默认跳转第一篇', '提示', {
          confirmButtonText: '确定'
        })
      }
      this.showNewsDialog = false
      this.$set(this.menu, 'articleId', item && item.articleId)
      this.$set(this.menu, 'replyArticles', articles.map(article => ({
        title: article.title,
        description: article.digest,
        picUrl: article.picUrl,
        url: article.url
      })))
    },
    deleteMaterial() {
      this.$delete(this.menu, 'articleId')
      this.$delete(this.menu, 'replyArticles')
    }
  }
}
</script>

<style lang="scss" scoped>
.configure_page {
  .delete_btn {
    margin-bottom: 15px;
    text-align: right;
  }

  .menu_content { margin-top: 20px; }

  .configur_content {
    padding: 20px 10px;
    margin-top: 20px;
    background-color: #fff;
    border-radius: 5px;

    .select-item {
      width: 280px;
      padding: 10px;
      margin: 0 auto 10px;
      border: 1px solid #eaeaea;
    }

    .ope-row {
      padding-top: 10px;
      text-align: center;
    }
  }

  .blue {
    margin-top: 10px;
    color: #29b6f6;
  }

  .applet {
    margin-bottom: 20px;

    span { width: 20%; }
  }

  .input_width { width: 40%; }
  .menu_option { width: 40%; }
}

.material-select-trigger { text-align: center; }
</style>
