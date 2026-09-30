<template>
  <div class="drawer-container">
    <div>
      <div class="setting-drawer-content">
        <div class="setting-drawer-title">
          <h3 class="drawer-title">主题风格设置</h3>
        </div>
        <div class="setting-drawer-block-checbox">
          <div class="setting-drawer-block-checbox-item" @click="handleTheme('theme-dark')">
            <img src="@/assets/images/dark.svg" alt="dark">
            <div v-if="sideTheme === 'theme-dark'" class="setting-drawer-block-checbox-selectIcon" style="display: block;">
              <i aria-label="图标: check" class="anticon anticon-check">
                <svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em" :fill="theme" aria-hidden="true"
                     focusable="false" class="">
                  <path
                    d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/>
                </svg>
              </i>
            </div>
          </div>
          <div class="setting-drawer-block-checbox-item" @click="handleTheme('theme-light')">
            <img src="@/assets/images/light.svg" alt="light">
            <div v-if="sideTheme === 'theme-light'" class="setting-drawer-block-checbox-selectIcon" style="display: block;">
              <i aria-label="图标: check" class="anticon anticon-check">
                <svg viewBox="64 64 896 896" data-icon="check" width="1em" height="1em" :fill="theme" aria-hidden="true"
                     focusable="false" class="">
                  <path
                    d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z"/>
                </svg>
              </i>
            </div>
          </div>
        </div>

        <div class="drawer-item">
          <span>主题颜色</span>
          <theme-picker style="float: right;height: 26px;margin: -3px 8px 0 0;" @change="themeChange" />
        </div>
      </div>

      <el-divider/>

      <h3 class="drawer-title">系统布局配置</h3>

      <div class="drawer-item">
        <span>开启 TopNav</span>
        <el-switch v-model="topNav" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>开启 Tags-Views</span>
        <el-switch v-model="tagsView" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>固定 Header</span>
        <el-switch v-model="fixedHeader" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>显示 Logo</span>
        <el-switch v-model="sidebarLogo" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>动态标题</span>
        <el-switch v-model="dynamicTitle" class="drawer-switch" />
      </div>

      <el-divider/>

      <h3 class="drawer-title">界面显示</h3>

      <div class="drawer-item">
        <span>面包屑</span>
        <el-switch v-model="breadcrumb" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>折叠图标</span>
        <el-switch v-model="hamburger" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>全屏图标</span>
        <el-switch v-model="screenfull" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>布局大小图标</span>
        <el-switch v-model="size" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>站内信图标</span>
        <el-switch v-model="message" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>IM 聊天图标</span>
        <el-switch v-model="im" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>菜单手风琴</span>
        <el-switch v-model="uniqueOpened" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>页脚</span>
        <el-switch v-model="footer" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>灰色模式</span>
        <el-switch v-model="greyMode" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>水印</span>
        <el-input v-model="watermarkText" size="mini" style="float: right; width: 180px" placeholder="输入水印文本"
                  @change="handleWatermark" />
      </div>

      <el-divider/>

      <el-button size="small" type="primary" plain icon="el-icon-document-add" @click="saveSetting">保存配置</el-button>
      <el-button size="small" plain icon="el-icon-refresh" @click="resetSetting">重置配置</el-button>
      <el-button size="small" type="success" plain icon="el-icon-copy-document" @click="copySetting">复制配置</el-button>
    </div>
  </div>
</template>

<script>
import ThemePicker from '@/components/ThemePicker'
import { setWatermark, clearWatermark } from '@/directive/module/watermark'

const buildSettingComputed = key => ({
  get() {
    return this.$store.state.settings[key]
  },
  set(val) {
    this.$store.dispatch('settings/changeSetting', { key, value: val })
  }
})

export default {
  components: { ThemePicker },
  data() {
    return {
      theme: this.$store.state.settings.theme,
      sideTheme: this.$store.state.settings.sideTheme,
      watermarkText: ''
    };
  },
  computed: {
    fixedHeader: buildSettingComputed('fixedHeader'),
    topNav: {
      get() {
        return this.$store.state.settings.topNav
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'topNav',
          value: val
        })
        if (!val) {
          this.$store.dispatch('app/toggleSideBarHide', false);
          this.$store.commit("SET_SIDEBAR_ROUTERS", this.$store.state.permission.defaultRoutes);
        }
      }
    },
    tagsView: buildSettingComputed('tagsView'),
    sidebarLogo: buildSettingComputed('sidebarLogo'),
    dynamicTitle: buildSettingComputed('dynamicTitle'),
    breadcrumb: buildSettingComputed('breadcrumb'),
    hamburger: buildSettingComputed('hamburger'),
    screenfull: buildSettingComputed('screenfull'),
    size: buildSettingComputed('size'),
    message: buildSettingComputed('message'),
    im: buildSettingComputed('im'),
    uniqueOpened: buildSettingComputed('uniqueOpened'),
    footer: buildSettingComputed('footer'),
    greyMode: buildSettingComputed('greyMode')
  },
  methods: {
    themeChange(val) {
      this.$store.dispatch('settings/changeSetting', {
        key: 'theme',
        value: val
      })
      this.theme = val;
    },
    handleTheme(val) {
      this.$store.dispatch('settings/changeSetting', {
        key: 'sideTheme',
        value: val
      })
      this.sideTheme = val;
    },
    handleWatermark(text) {
      if (text) {
        setWatermark(document.body, { text })
      } else {
        clearWatermark(document.body)
      }
    },
    copySetting() {
      const settings = this.$store.state.settings
      const text = Object.keys(settings)
        .filter(key => typeof settings[key] !== 'function')
        .map(key => `  ${key}: ${JSON.stringify(settings[key])}`)
        .join(',\n')
      const textarea = document.createElement('textarea')
      textarea.value = '{\n' + text + '\n}'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy') ? this.$modal.msgSuccess('复制成功') : this.$modal.msgError('复制失败')
      } catch (e) {
        this.$modal.msgError('复制失败')
      }
      document.body.removeChild(textarea)
    },
    saveSetting() {
      this.$modal.loading("正在保存到本地，请稍候...");
      const settings = this.$store.state.settings
      const picked = {}
      ;['topNav', 'tagsView', 'fixedHeader', 'sidebarLogo', 'dynamicTitle', 'breadcrumb',
        'hamburger', 'screenfull', 'size', 'message', 'im', 'uniqueOpened', 'footer', 'greyMode'
      ].forEach(key => { picked[key] = settings[key] })
      picked.sideTheme = this.sideTheme
      picked.theme = this.theme
      this.$cache.local.set("layout-setting", JSON.stringify(picked));
      setTimeout(this.$modal.closeLoading(), 1000)
    },
    resetSetting() {
      this.$modal.loading("正在清除设置缓存并刷新，请稍候...");
      this.$cache.local.remove("layout-setting")
      setTimeout("window.location.reload()", 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.setting-drawer-content {
  .setting-drawer-title {
    margin-bottom: 12px;
    color: rgba(0, 0, 0, .85);
    font-size: 14px;
    line-height: 22px;
    font-weight: bold;
  }

  .setting-drawer-block-checbox {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 20px;

    .setting-drawer-block-checbox-item {
      position: relative;
      margin-right: 16px;
      border-radius: 2px;
      cursor: pointer;

      img {
        width: 48px;
        height: 48px;
      }

      .setting-drawer-block-checbox-selectIcon {
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        padding-top: 15px;
        padding-left: 24px;
        color: #1890ff;
        font-weight: 700;
        font-size: 14px;
      }
    }
  }
}

.drawer-container {
  padding: 24px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;

  .drawer-title {
    margin-bottom: 12px;
    color: rgba(0, 0, 0, .85);
    font-size: 14px;
    line-height: 22px;
  }

  .drawer-item {
    color: rgba(0, 0, 0, .65);
    font-size: 14px;
    padding: 12px 0;
  }

  .drawer-switch {
    float: right
  }
}
</style>
