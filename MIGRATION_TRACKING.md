# Vue3 + EP → Vue2 迁移追踪（逐文件 + 逐功能）

生成：2026-09-12，由 `scripts/generate-migration-tracking.js` 自动生成。等价映射经只读核对（实际查看双端文件），修订映射后重新运行脚本即可刷新。

## 口径（必读）

- 文件状态：**✅已对应**（目标存在同名/等价路径文件）｜**✅等价物**（目标以不同路径/命名实现同一功能）｜**🟡部分覆盖**（功能在但缺失部分能力）｜**🟡框架差异**（Vue3 机制在 Vue2 不需要或以别的方式实现）｜**❌真缺失**（目标无对应功能，需决策移植或不移植）。
- **文件已对应 ≠ 功能已验收**。功能验收以 `AI_CHAT_ACCEPTANCE.md`、`MIGRATION_PROGRESS.md` 及各浏览器测试日志为准；本表不重复其证据，只给索引与缺口。
- 文件存在率不是迁移完成率；逐功能分母见本文第三节。禁止用本表行数计算虚假百分比。
- Vue3 侧 `*.ts.bak`（4个mes备份文件）不计入分母。

## 一、逐文件总览

Vue3 源文件 2847 个：✅已对应/等价 2730（95.9%）、🟡部分覆盖 12、🟡框架差异 90、❌真缺失 15。

| 目录 | 源文件数 | 已对应/等价 | 部分 | 差异 | 真缺失 |
|---|---|---|---|---|---|
| views | 1866 | 1856 | 1 | 6 | 3 |
| api | 538 | 535 | 0 | 3 | 0 |
| components | 330 | 275 | 6 | 49 | 0 |
| hooks | 22 | 13 | 3 | 3 | 3 |
| utils | 28 | 25 | 0 | 3 | 0 |
| store | 10 | 7 | 0 | 0 | 3 |
| directives | 3 | 2 | 0 | 1 | 0 |
| router | 2 | 2 | 0 | 0 | 0 |
| layout | 48 | 15 | 2 | 25 | 6 |

### 按模块（views 一级目录）

| 模块 | 源文件数 | 已对应/等价 | 真缺失 |
|---|---|---|---|
| mes | 287 | 287 | 0 |
| hrm | 203 | 203 | 0 |
| mall | 186 | 186 | 0 |
| oa | 161 | 160 | 1（见2.1） |
| im | 139 | 139 | 0 |
| crm | 119 | 119 | 0 |
| iot | 96 | 96 | 0 |
| fms | 85 | 85 | 0 |
| pms | 83 | 83 | 0 |
| ai | 72 | 72 | 0 |
| mp | 72 | 72 | 0 |
| system | 68 | 68 | 0 |
| erp | 63 | 63 | 0 |
| bpm | 53 | 53 | 0 |
| infra | 52 | 52 | 0 |
| wms | 42 | 42 | 0 |
| member | 32 | 32 | 0 |
| pay | 23 | 23 | 0 |
| Login | 11 | 10 | 1（见2.1） |
| Profile | 7 | 7 | 0 |
| Home | 4 | 3 | 1（见2.1） |
| Error | 3 | 3 | 0 |
| report | 3 | 3 | 0 |
| IFrame | 1 | 1 | 0 |
| Redirect | 1 | 1 | 0 |

## 二、逐文件明细

### 2.1 ❌ 真缺失清单（需决策：移植 / 明确不移植）

| 源文件 | 说明 |
|---|---|
| views/Home/Index2.vue | 无第二套首页 |
| views/Login/components/QrCodeForm.vue | 后端无二维码ticket端点（两端均无API，Vue3侧亦仅静态二维码）；待后端支持 |
| views/oa/utils/format.ts | — |
| hooks/web/useConfigGlobal.ts | 无 ConfigGlobal 配置注入 |
| hooks/web/useGuide.ts | 无新手引导(driver.js) |
| hooks/web/useLocale.ts | 无语言切换 |
| store/modules/bpm/simpleWorkflow.ts | 死代码（Vue3侧零引用）；简单流程由 SimpleProcessDesignerV2 承担 |
| store/modules/locale.ts | 无i18n语言store（Vue2无多语言） |
| store/modules/lock.ts | 无锁屏功能 |
| layout/components/Footer/index.ts | 无Footer |
| layout/components/Footer/src/Footer.vue | 无Footer |
| layout/components/LocaleDropdown/index.ts | 无国际化 |
| layout/components/LocaleDropdown/src/LocaleDropdown.vue | 无国际化 |
| layout/components/UserInfo/src/components/LockDialog.vue | 无锁屏 |
| layout/components/UserInfo/src/components/LockPage.vue | 无锁屏 |

### 2.2 🟡 部分覆盖 / 框架差异 / 等价物映射

| 源文件 | 状态 | 目标等价物/说明 |
|---|---|---|
| views/Error/403.vue | 🟡部分覆盖 | views/error/401.vue（状态码差异，功能等价：无权限页） |
| views/Home/Index.vue | ✅等价物 | views/index.vue + views/dashboard/* |
| views/Home/echarts-data.ts | 🟡框架差异 | views/dashboard/mixins（图表数据逻辑） |
| views/Home/types.ts | 🟡框架差异 | 纯TS类型 |
| views/IFrame/index.vue | ✅等价物 | layout/components/InnerLink + IframeToggle + components/iFrame |
| views/Login/Login.vue | ✅等价物 | views/login.vue |
| views/Login/SocialLogin.vue | ✅等价物 | views/socialLogin.vue |
| views/Login/components/ForgetPasswordForm.vue | ✅等价物 | login.vue 忘记密码tab（sms scene=23 + reset-password 已接线，浏览器验证） |
| views/Login/components/LoginForm.vue | ✅等价物 | 并入 views/login.vue 账号密码tab |
| views/Login/components/LoginFormTitle.vue | ✅等价物 | 并入 views/login.vue |
| views/Login/components/MobileForm.vue | ✅等价物 | 并入 views/login.vue 短信验证码tab |
| views/Login/components/RegisterForm.vue | ✅等价物 | login.vue 注册tab（/system/auth/register 已接线，浏览器验证） |
| views/Login/components/SSOLogin.vue | ✅等价物 | views/sso.vue |
| views/Login/components/index.ts | 🟡框架差异 | 导出聚合barrel |
| views/Login/components/useLogin.ts | 🟡框架差异 | 逻辑并入 login.vue |
| views/Profile/components/index.ts | 🟡框架差异 | 导出聚合barrel |
| views/Redirect/Redirect.vue | ✅等价物 | views/redirect.vue |
| views/bpm/model/form/PrintTemplate/index.ts | 🟡框架差异 | 导出聚合；module 实现两端均存在 |
| api/fms/ledger/types.ts | 🟡框架差异 | 纯TS类型 |
| api/login/oauth2/index.ts | ✅等价物 | 并入 api/login.js |
| api/login/types.ts | 🟡框架差异 | 纯TS类型 |
| api/mall/product/history.ts | ✅等价物 | api/mall/product/history/index.js |
| api/mall/statistics/common.ts | 🟡框架差异 | 纯TS类型 |
| api/system/dict/dict.data.ts | ✅等价物 | api/system/dict/data.js（9函数全有） |
| api/system/dict/dict.type.ts | ✅等价物 | api/system/dict/type.js（8函数全有） |
| api/system/oauth2/client.ts | ✅等价物 | api/system/oauth2/oauth2Client.js |
| api/system/oauth2/token.ts | ✅等价物 | api/system/oauth2/oauth2Token.js |
| components/Card/index.ts | 🟡框架差异 | Vue2 直接用 el-card |
| components/Card/src/CardTitle.vue | 🟡框架差异 | 页面自建卡片标题 |
| components/ConfigGlobal/index.ts | 🟡框架差异 | ElConfigProvider 为 EP 特有 |
| components/ConfigGlobal/src/ConfigGlobal.vue | 🟡框架差异 | ElConfigProvider 为 EP 特有 |
| components/CountTo/index.ts | 🟡框架差异 | npm包 vue-count-to |
| components/CountTo/src/CountTo.vue | 🟡框架差异 | npm包 vue-count-to |
| components/Crontab/index.ts | 🟡框架差异 | 实现细节 |
| components/Crontab/src/Crontab.vue | ✅等价物 | components/Crontab/index.vue |
| components/Cropper/index.ts | 🟡框架差异 | 实现细节 |
| components/Cropper/src/CopperModal.vue | 🟡部分覆盖 | 同上 |
| components/Cropper/src/Cropper.vue | 🟡部分覆盖 | 仅 profile/userAvatar.vue 内联 vue-cropper |
| components/Cropper/src/CropperAvatar.vue | 🟡部分覆盖 | 同上 |
| components/Cropper/src/types.ts | 🟡框架差异 | 纯TS类型 |
| components/Descriptions/index.ts | 🟡框架差异 | Vue2 直接用 el-descriptions |
| components/Descriptions/src/Descriptions.vue | 🟡框架差异 | Vue2 直接用 el-descriptions |
| components/Descriptions/src/DescriptionsItemLabel.vue | 🟡框架差异 | Vue2 直接用 el-descriptions |
| components/Dialog/index.ts | 🟡框架差异 | 实现细节 |
| components/Dialog/src/Dialog.vue | ✅等价物 | components/Dialog/index.vue |
| components/DictTag/index.ts | 🟡框架差异 | 实现细节 |
| components/DictTag/src/DictTag.vue | ✅等价物 | components/DictTag/index.vue |
| components/Echart/index.ts | 🟡框架差异 | Vue2 直接用 echarts |
| components/Echart/src/Echart.vue | 🟡框架差异 | Vue2 直接用 echarts |
| components/Editor/index.ts | 🟡框架差异 | 实现细节 |
| components/Editor/src/Editor.vue | ✅等价物 | components/Editor/index.vue |
| components/Error/index.ts | 🟡框架差异 | 实现细节 |
| components/Error/src/Error.vue | 🟡部分覆盖 | views/error 仅401/404独立页 |
| components/Form/index.ts | 🟡框架差异 | Vue2 走 parser/render/FormCreate |
| components/Form/src/Form.vue | 🟡框架差异 | Vue2 走 parser/render/FormCreate |
| components/Form/src/componentMap.ts | 🟡框架差异 | Vue2 走 parser/render/FormCreate |
| components/Form/src/components/useRenderCheckbox.tsx | 🟡框架差异 | Vue2 走 parser/render/FormCreate |
| components/Form/src/components/useRenderRadio.tsx | 🟡框架差异 | Vue2 走 parser/render/FormCreate |
| components/Form/src/components/useRenderSelect.tsx | 🟡框架差异 | Vue2 走 parser/render/FormCreate |
| components/Form/src/helper.ts | 🟡框架差异 | Vue2 走 parser/render/FormCreate |
| components/Form/src/types.ts | 🟡框架差异 | 纯TS类型 |
| components/FormCreate/src/config/index.ts | 🟡框架差异 | 导出聚合barrel |
| components/FormCreate/src/type/index.ts | 🟡框架差异 | 纯TS类型 |
| components/Highlight/index.ts | 🟡框架差异 | Vue2 直接用 highlight.js |
| components/Highlight/src/Highlight.vue | 🟡框架差异 | Vue2 直接用 highlight.js |
| components/IFrame/index.ts | 🟡框架差异 | 实现细节 |
| components/IFrame/src/IFrame.vue | ✅等价物 | components/iFrame |
| components/ImageViewer/index.ts | 🟡框架差异 | el-image preview-src-list |
| components/ImageViewer/src/ImageViewer.vue | 🟡框架差异 | el-image preview-src-list |
| components/ImageViewer/src/types.ts | 🟡框架差异 | 纯TS类型 |
| components/JsonEditor/src/JsonEditor.vue | ✅等价物 | components/JsonEditor/index.vue（无jsoneditor依赖的等价实现，契约一致） |
| components/JsonEditor/types/index.ts | 🟡框架差异 | 纯TS类型 |
| components/RouterSearch/index.vue | ✅等价物 | components/HeaderSearch |
| components/Search/index.ts | 🟡框架差异 | Vue2 页面内联搜索表单 |
| components/Search/src/Search.vue | 🟡框架差异 | Vue2 页面内联搜索表单 |
| components/ShortcutDateRangePicker/index.vue | 🟡部分覆盖 | 页面级 Member/ProductDateRangePicker 替代 |
| components/SummaryCard/index.vue | 🟡部分覆盖 | 页面级 *SummaryCard 替代，无通用组件 |
| components/Table/index.ts | 🟡框架差异 | Vue2 直接用 el-table |
| components/Table/src/Table.vue | 🟡框架差异 | Vue2 直接用 el-table |
| components/Table/src/TableSelectForm.vue | 🟡框架差异 | Vue2 直接用 el-table |
| components/Table/src/helper.ts | 🟡框架差异 | Vue2 直接用 el-table |
| components/Table/src/types.ts | 🟡框架差异 | 纯TS类型 |
| components/Tinyflow/ui/index.d.ts | 🟡框架差异 | 纯TS声明（index.umd.js 目标一致） |
| components/Tinyflow/ui/index.umd.js | ✅等价物 | components/Tinyflow/ui/index.js（内容一致） |
| components/Tooltip/index.ts | 🟡框架差异 | Vue2 直接用 el-tooltip |
| components/Tooltip/src/Tooltip.vue | 🟡框架差异 | Vue2 直接用 el-tooltip |
| components/UploadFile/index.ts | 🟡框架差异 | 实现细节 |
| components/UploadFile/src/UploadFile.vue | ✅等价物 | components/UploadFile/index.vue |
| components/UploadFile/src/UploadImg.vue | ✅等价物 | components/UploadImg/index.vue |
| components/UploadFile/src/UploadImgs.vue | ✅等价物 | components/UploadImgs/index.vue |
| components/Verifition/index.ts | 🟡框架差异 | 实现细节 |
| components/Verifition/src/Verify/VerifyPoints.vue | ✅等价物 | components/Verifition/Verify/VerifyPoints.vue |
| components/Verifition/src/Verify/VerifySlide.vue | ✅等价物 | components/Verifition/Verify/VerifySlide.vue |
| components/Verifition/src/Verify/index.ts | 🟡框架差异 | 实现细节 |
| components/Verifition/src/Verify.vue | ✅等价物 | components/Verifition/Verify.vue |
| components/Verifition/src/utils/ase.ts | ✅等价物 | 复用既有 src/utils/ase.js（crypto-js，ECB/Pkcs7 一致） |
| components/Verifition/src/utils/util.ts | ✅等价物 | components/Verifition/utils/util.js |
| components/bpmnProcessDesigner/package/penal/task/data.ts | ✅等价物 | ElementTask.vue/PropertiesPanel.vue 内联实现且为超集（含SendTask/业务规则别名），深比较+浏览器验证 |
| components/index.ts | 🟡框架差异 | 全局注册方式差异 |
| hooks/event/useScrollTo.ts | ✅等价物 | utils/scroll-to.js |
| hooks/web/useCache.ts | ✅等价物 | plugins/cache.js ($cache) |
| hooks/web/useCrudSchemas.ts | ✅等价物 | utils/crudSchemas.js（纯函数 allSchemas/sortTableColumns；dict formatter为文本因EUI2.x限制） |
| hooks/web/useDesign.ts | 🟡框架差异 | scss module 约定 |
| hooks/web/useEmitt.ts | ✅等价物 | utils/eventBus.js（on/emit/off，注释含 useEmitt 映射） |
| hooks/web/useForm.ts | 🟡框架差异 | Vue2 直接操作 el-form ref（utils/ruoyi.js resetForm） |
| hooks/web/useI18n.ts | 🟡部分覆盖 | plugins/index.js translate() 仅硬编码简表，无 vue-i18n |
| hooks/web/useIcon.ts | 🟡框架差异 | 语法糖；Vue2 有 components/Icon + utils/icon.json |
| hooks/web/useMessage.ts | ✅等价物 | plugins/modal.js ($modal) |
| hooks/web/useNProgress.ts | ✅等价物 | permission.js 路由守卫 |
| hooks/web/useNetwork.ts | ✅等价物 | utils/network.js（networkMixin + onNetworkChange） |
| hooks/web/useNow.ts | ✅等价物 | utils/now.js（nowMixin + createNow，dayjs） |
| hooks/web/usePageLoading.ts | 🟡部分覆盖 | 仅 NProgress 顶条，无页面loading状态 |
| hooks/web/useTable.ts | 🟡部分覆盖 | 无统一 tableObject 封装（Pagination+page.js 替代） |
| hooks/web/useTagsView.ts | ✅等价物 | store/modules/tagsView.js + plugins/tab.js ($tab) |
| hooks/web/useTimeAgo.ts | ✅等价物 | utils/formatTime.js |
| hooks/web/useTitle.ts | ✅等价物 | store/settings + permission.js + vue-meta |
| hooks/web/useValidator.ts | ✅等价物 | utils/validate.js + utils/formRules.js（rules生成器已补，callback风格适配EUI） |
| hooks/web/useWatermark.ts | ✅等价物 | directive/module/watermark.js（v-watermark 指令，浏览器验证） |
| utils/dateUtil.ts | ✅等价物 | utils/dateUtils.js |
| utils/layout.ts | 🟡框架差异 | 框架差异 |
| utils/propTypes.ts | 🟡框架差异 | 纯TS工具 |
| utils/routerHelper.ts | ✅等价物 | store/modules/permission.js filterAsyncRouter/loadView |
| utils/tsxHelper.ts | 🟡框架差异 | Vue3 slots TS 辅助 |
| store/modules/mall/kefu.ts | ✅等价物 | store/modules/mallKefu.js |
| directives/index.ts | 🟡框架差异 | Vue2在 directive/index.js 统一注册 |
| directives/permission/hasPermi.ts | ✅等价物 | directive/permission/hasPermi.js |
| directives/permission/hasRole.ts | ✅等价物 | directive/permission/hasRole.js |
| router/modules/remaining.ts | ✅等价物 | router/index.js 内联静态路由（差异：源/403→目标/401 语义等价；/500 已补；/401、/404 两端一致） |
| layout/Layout.vue | ✅等价物 | layout/index.vue |
| layout/components/AppView.vue | ✅等价物 | layout/components/AppMain.vue |
| layout/components/Breadcrumb/index.ts | 🟡框架差异 | Vue2 全局组件 components/Breadcrumb |
| layout/components/Breadcrumb/src/Breadcrumb.vue | ✅等价物 | components/Breadcrumb |
| layout/components/Breadcrumb/src/helper.ts | 🟡框架差异 | 实现细节 |
| layout/components/Collapse/index.ts | 🟡框架差异 | components/Hamburger |
| layout/components/Collapse/src/Collapse.vue | ✅等价物 | components/Hamburger |
| layout/components/ContextMenu/index.ts | 🟡框架差异 | 内置于 TagsView |
| layout/components/ContextMenu/src/ContextMenu.vue | ✅等价物 | layout/components/TagsView 右键菜单 |
| layout/components/Logo/index.ts | 🟡框架差异 | 实现细节 |
| layout/components/Logo/src/Logo.vue | ✅等价物 | layout/components/Sidebar/Logo.vue |
| layout/components/Menu/index.ts | 🟡框架差异 | 实现细节 |
| layout/components/Menu/src/Menu.vue | ✅等价物 | layout/components/Sidebar |
| layout/components/Menu/src/components/useRenderMenuItem.tsx | 🟡框架差异 | Vue3 JSX实现 |
| layout/components/Menu/src/components/useRenderMenuTitle.tsx | 🟡框架差异 | Vue3 JSX实现 |
| layout/components/Menu/src/helper.ts | 🟡框架差异 | 实现细节 |
| layout/components/Menu/src/menuRoute.ts | 🟡框架差异 | 实现细节 |
| layout/components/Message/index.ts | 🟡框架差异 | 实现细节 |
| layout/components/Message/src/Message.vue | ✅等价物 | layout/components/Message |
| layout/components/Screenfull/index.ts | 🟡框架差异 | 实现细节 |
| layout/components/Screenfull/src/Screenfull.vue | ✅等价物 | components/Screenfull |
| layout/components/Setting/index.ts | 🟡框架差异 | 实现细节 |
| layout/components/Setting/src/Setting.vue | ✅等价物 | layout/components/Settings + components/RightPanel |
| layout/components/Setting/src/components/ColorRadioPicker.vue | 🟡框架差异 | 并入 Settings |
| layout/components/Setting/src/components/InterfaceDisplay.vue | 🟡框架差异 | 并入 Settings |
| layout/components/Setting/src/components/LayoutRadioPicker.vue | 🟡框架差异 | 并入 Settings |
| layout/components/Setting/src/useSetting.ts | 🟡框架差异 | 实现细节 |
| layout/components/SizeDropdown/index.ts | 🟡框架差异 | 实现细节 |
| layout/components/SizeDropdown/src/SizeDropdown.vue | ✅等价物 | components/SizeSelect |
| layout/components/TabMenu/index.ts | 🟡框架差异 | 实现细节 |
| layout/components/TabMenu/src/TabMenu.vue | ✅等价物 | components/TopNav |
| layout/components/TabMenu/src/helper.ts | 🟡框架差异 | 实现细节 |
| layout/components/TagsView/index.ts | 🟡框架差异 | 实现细节 |
| layout/components/TagsView/src/TagsView.vue | ✅等价物 | layout/components/TagsView |
| layout/components/TagsView/src/helper.ts | 🟡框架差异 | 实现细节 |
| layout/components/TenantVisit/index.vue | ✅等价物 | components/TenantVisit |
| layout/components/ThemeSwitch/index.ts | 🟡框架差异 | 实现细节 |
| layout/components/ThemeSwitch/src/ThemeSwitch.vue | 🟡部分覆盖 | 仅 ThemePicker 换色，缺明暗切换 |
| layout/components/ToolHeader.vue | ✅等价物 | 并入 layout/components/Navbar.vue |
| layout/components/UserInfo/index.ts | 🟡框架差异 | 实现细节 |
| layout/components/UserInfo/src/UserInfo.vue | 🟡部分覆盖 | 头像下拉在Navbar；缺锁屏弹窗 |
| layout/components/useRenderLayout.tsx | 🟡框架差异 | Vue3 JSX布局渲染 |

### 2.3 ✅ 已对应文件（按模块；未做逐项功能验收，默认"未验收"）

#### api/ai（14）

- ai/chat/conversation/index.ts（→ ai/chat/conversation.js）
- ai/chat/message/index.ts（→ ai/chat/message.js）
- ai/image/index.ts（→ ai/image/index.js）
- ai/knowledge/document/index.ts（→ ai/knowledge/document/index.js）
- ai/knowledge/knowledge/index.ts（→ ai/knowledge/knowledge/index.js）
- ai/knowledge/segment/index.ts（→ ai/knowledge/segment/index.js）
- ai/mindmap/index.ts（→ ai/mindmap/index.js）
- ai/model/apiKey/index.ts（→ ai/model/apiKey/index.js）
- ai/model/chatRole/index.ts（→ ai/model/chatRole/index.js）
- ai/model/model/index.ts（→ ai/model/model/index.js）
- ai/model/tool/index.ts（→ ai/model/tool/index.js）
- ai/music/index.ts（→ ai/music/index.js）
- ai/workflow/index.ts（→ ai/workflow/index.js）
- ai/write/index.ts（→ ai/write/index.js）

#### api/bpm（12）

- bpm/category/index.ts（→ bpm/category.js）
- bpm/comment/index.ts（→ bpm/comment.js）
- bpm/definition/index.ts（→ bpm/definition.js）
- bpm/form/index.ts（→ bpm/form.js）
- bpm/leave/index.ts（→ bpm/leave.js）
- bpm/model/index.ts（→ bpm/model.js）
- bpm/processExpression/index.ts（→ bpm/processExpression.js）
- bpm/processInstance/index.ts（→ bpm/processInstance.js）
- bpm/processListener/index.ts（→ bpm/processListener.js）
- bpm/simple/index.ts（→ bpm/simple.js）
- bpm/task/index.ts（→ bpm/task.js）
- bpm/userGroup/index.ts（→ bpm/userGroup.js）

#### api/crm（24）

- crm/business/index.ts（→ crm/business/index.js）
- crm/business/status/index.ts（→ crm/business/status/index.js）
- crm/clue/index.ts（→ crm/clue/index.js）
- crm/contact/index.ts（→ crm/contact/index.js）
- crm/contract/config/index.ts（→ crm/contract/config/index.js）
- crm/contract/index.ts（→ crm/contract/index.js）
- crm/customer/index.ts（→ crm/customer/index.js）
- crm/customer/limitConfig/index.ts（→ crm/customer/limitConfig/index.js）
- crm/customer/poolConfig/index.ts（→ crm/customer/poolConfig/index.js）
- crm/followup/index.ts（→ crm/followup/index.js）
- crm/operateLog/index.ts（→ crm/operateLog/index.js）
- crm/performance/config.ts（→ crm/performance/config.js）
- crm/permission/index.ts（→ crm/permission/index.js）
- crm/product/category/index.ts（→ crm/product/category/index.js）
- crm/product/index.ts（→ crm/product/index.js）
- crm/receivable/index.ts（→ crm/receivable/index.js）
- crm/receivable/plan/index.ts（→ crm/receivable/plan/index.js）
- crm/statistics/customer.ts（→ crm/statistics/customer.js）
- crm/statistics/funnel.ts（→ crm/statistics/funnel.js）
- crm/statistics/performance.ts（→ crm/statistics/performance.js）
- crm/statistics/performanceTarget.ts（→ crm/statistics/performanceTarget.js）
- crm/statistics/portrait.ts（→ crm/statistics/portrait.js）
- crm/statistics/product.ts（→ crm/statistics/product.js）
- crm/statistics/rank.ts（→ crm/statistics/rank.js）

#### api/erp（23）

- erp/finance/account/index.ts（→ erp/finance/account/index.js）
- erp/finance/payment/index.ts（→ erp/finance/payment/index.js）
- erp/finance/receipt/index.ts（→ erp/finance/receipt/index.js）
- erp/product/category/index.ts（→ erp/product/category/index.js）
- erp/product/product/index.ts（→ erp/product/product/index.js）
- erp/product/unit/index.ts（→ erp/product/unit/index.js）
- erp/purchase/in/index.ts（→ erp/purchase/in/index.js）
- erp/purchase/order/index.ts（→ erp/purchase/order/index.js）
- erp/purchase/return/index.ts（→ erp/purchase/return/index.js）
- erp/purchase/supplier/index.ts（→ erp/purchase/supplier/index.js）
- erp/sale/customer/index.ts（→ erp/sale/customer/index.js）
- erp/sale/order/index.ts（→ erp/sale/order/index.js）
- erp/sale/out/index.ts（→ erp/sale/out/index.js）
- erp/sale/return/index.ts（→ erp/sale/return/index.js）
- erp/statistics/purchase/index.ts（→ erp/statistics/purchase/index.js）
- erp/statistics/sale/index.ts（→ erp/statistics/sale/index.js）
- erp/stock/check/index.ts（→ erp/stock/check/index.js）
- erp/stock/in/index.ts（→ erp/stock/in/index.js）
- erp/stock/move/index.ts（→ erp/stock/move/index.js）
- erp/stock/out/index.ts（→ erp/stock/out/index.js）
- erp/stock/record/index.ts（→ erp/stock/record/index.js）
- erp/stock/stock/index.ts（→ erp/stock/stock/index.js）
- erp/stock/warehouse/index.ts（→ erp/stock/warehouse/index.js）

#### api/fms（25）

- fms/closing/period/index.ts（→ fms/closing/period/index.js）
- fms/closing/scheme/index.ts（→ fms/closing/scheme/index.js）
- fms/closing/template/index.ts（→ fms/closing/template/index.js）
- fms/closing/voucher/index.ts（→ fms/closing/voucher/index.js）
- fms/config/account-set/index.ts（→ fms/config/account-set/index.js）
- fms/config/account-user/index.ts（→ fms/config/account-user/index.js）
- fms/config/auxiliary/item/index.ts（→ fms/config/auxiliary/item/index.js）
- fms/config/auxiliary/type/index.ts（→ fms/config/auxiliary/type/index.js）
- fms/config/currency/index.ts（→ fms/config/currency/index.js）
- fms/config/digest/index.ts（→ fms/config/digest/index.js）
- fms/config/finance-indicator/index.ts（→ fms/config/finance-indicator/index.js）
- fms/config/finance-parameter/index.ts（→ fms/config/finance-parameter/index.js）
- fms/config/initial-balance/index.ts（→ fms/config/initial-balance/index.js）
- fms/config/subject/index.ts（→ fms/config/subject/index.js）
- fms/config/voucher-template/index.ts（→ fms/config/voucher-template/index.js）
- fms/config/voucher-template-category/index.ts（→ fms/config/voucher-template-category/index.js）
- fms/config/voucher-word/index.ts（→ fms/config/voucher-word/index.js）
- fms/home/index.ts（→ fms/home/index.js）
- fms/ledger/index.ts（→ fms/ledger/index.js）
- fms/report/balanceSheet/index.ts（→ fms/report/balanceSheet/index.js）
- fms/report/cashFlowStatement/index.ts（→ fms/report/cashFlowStatement/index.js）
- fms/report/incomeStatement/index.ts（→ fms/report/incomeStatement/index.js）
- fms/report/index.ts（→ fms/report/index.js）
- fms/voucher/index.ts（→ fms/voucher/index.js）
- fms/voucher/statistics/index.ts（→ fms/voucher/statistics/index.js）

#### api/hrm（62）

- hrm/attendance/clock/index.ts（→ hrm/attendance/clock/index.js）
- hrm/attendance/group/index.ts（→ hrm/attendance/group/index.js）
- hrm/attendance/holiday/index.ts（→ hrm/attendance/holiday/index.js）
- hrm/attendance/leave/index.ts（→ hrm/attendance/leave/index.js）
- hrm/attendance/statistics/index.ts（→ hrm/attendance/statistics/index.js）
- hrm/employee/certificate/index.ts（→ hrm/employee/certificate/index.js）
- hrm/employee/change-record/index.ts（→ hrm/employee/change-record/index.js）
- hrm/employee/config/index.ts（→ hrm/employee/config/index.js）
- hrm/employee/contact/index.ts（→ hrm/employee/contact/index.js）
- hrm/employee/contract/index.ts（→ hrm/employee/contract/index.js）
- hrm/employee/education-experience/index.ts（→ hrm/employee/education-experience/index.js）
- hrm/employee/file/index.ts（→ hrm/employee/file/index.js）
- hrm/employee/index.ts（→ hrm/employee/index.js）
- hrm/employee/personal-note/index.ts（→ hrm/employee/personal-note/index.js）
- hrm/employee/quit-info/index.ts（→ hrm/employee/quit-info/index.js）
- hrm/employee/salary-card/index.ts（→ hrm/employee/salary-card/index.js）
- hrm/employee/training-experience/index.ts（→ hrm/employee/training-experience/index.js）
- hrm/employee/work-experience/index.ts（→ hrm/employee/work-experience/index.js）
- hrm/home/index.ts（→ hrm/home/index.js）
- hrm/insurance/employee-info/index.ts（→ hrm/insurance/employee-info/index.js）
- hrm/insurance/month-record/employee/index.ts（→ hrm/insurance/month-record/employee/index.js）
- hrm/insurance/month-record/index.ts（→ hrm/insurance/month-record/index.js）
- hrm/insurance/scheme/index.ts（→ hrm/insurance/scheme/index.js）
- hrm/insurance/standard/index.ts（→ hrm/insurance/standard/index.js）
- hrm/operate-log/index.ts（→ hrm/operate-log/index.js）
- hrm/performance/assessment/index.ts（→ hrm/performance/assessment/index.js）
- hrm/performance/config/assessment-template/index.ts（→ hrm/performance/config/assessment-template/index.js）
- hrm/performance/config/result-template/index.ts（→ hrm/performance/config/result-template/index.js）
- hrm/performance/plan/index.ts（→ hrm/performance/plan/index.js）
- hrm/portal/attendance/clock/index.ts（→ hrm/portal/attendance/clock/index.js）
- hrm/portal/attendance/leave/index.ts（→ hrm/portal/attendance/leave/index.js）
- hrm/portal/attendance/statistics/index.ts（→ hrm/portal/attendance/statistics/index.js）
- hrm/portal/employee/certificate/index.ts（→ hrm/portal/employee/certificate/index.js）
- hrm/portal/employee/contact/index.ts（→ hrm/portal/employee/contact/index.js）
- hrm/portal/employee/education-experience/index.ts（→ hrm/portal/employee/education-experience/index.js）
- hrm/portal/employee/field-config/index.ts（→ hrm/portal/employee/field-config/index.js）
- hrm/portal/employee/index.ts（→ hrm/portal/employee/index.js）
- hrm/portal/employee/quit-info/index.ts（→ hrm/portal/employee/quit-info/index.js）
- hrm/portal/employee/training-experience/index.ts（→ hrm/portal/employee/training-experience/index.js）
- hrm/portal/employee/work-experience/index.ts（→ hrm/portal/employee/work-experience/index.js）
- hrm/portal/home/calendar/index.ts（→ hrm/portal/home/calendar/index.js）
- hrm/portal/insurance/record/index.ts（→ hrm/portal/insurance/record/index.js）
- hrm/portal/performance/assessment/index.ts（→ hrm/portal/performance/assessment/index.js）
- hrm/portal/salary/slip/index.ts（→ hrm/portal/salary/slip/index.js）
- hrm/recruit/candidate/index.ts（→ hrm/recruit/candidate/index.js）
- hrm/recruit/channel/index.ts（→ hrm/recruit/channel/index.js）
- hrm/recruit/config/index.ts（→ hrm/recruit/config/index.js）
- hrm/recruit/interview/index.ts（→ hrm/recruit/interview/index.js）
- hrm/recruit/post/index.ts（→ hrm/recruit/post/index.js）
- hrm/recruit/post/type/index.ts（→ hrm/recruit/post/type/index.js）
- hrm/salary/change-record/index.ts（→ hrm/salary/change-record/index.js）
- hrm/salary/config/change-template/index.ts（→ hrm/salary/config/change-template/index.js）
- hrm/salary/config/config/index.ts（→ hrm/salary/config/config/index.js）
- hrm/salary/config/group/index.ts（→ hrm/salary/config/group/index.js）
- hrm/salary/config/option/index.ts（→ hrm/salary/config/option/index.js）
- hrm/salary/config/tax-rule/index.ts（→ hrm/salary/config/tax-rule/index.js）
- hrm/salary/employee-info/index.ts（→ hrm/salary/employee-info/index.js）
- hrm/salary/month-record/employee/index.ts（→ hrm/salary/month-record/employee/index.js）
- hrm/salary/month-record/index.ts（→ hrm/salary/month-record/index.js）
- hrm/salary/slip/index.ts（→ hrm/salary/slip/index.js）
- hrm/salary/slip/send-record/index.ts（→ hrm/salary/slip/send-record/index.js）
- hrm/salary/slip/template/index.ts（→ hrm/salary/slip/template/index.js）

#### api/im（28）

- im/channel/material/index.ts（→ im/channel/material/index.js）
- im/conversation/read/index.ts（→ im/conversation/read/index.js）
- im/face/pack/index.ts（→ im/face/pack/index.js）
- im/face/useritem/index.ts（→ im/face/useritem/index.js）
- im/friend/index.ts（→ im/friend/index.js）
- im/friend/request/index.ts（→ im/friend/request/index.js）
- im/group/index.ts（→ im/group/index.js）
- im/group/member/index.ts（→ im/group/member/index.js）
- im/group/request/index.ts（→ im/group/request/index.js）
- im/manager/channel/index.ts（→ im/manager/channel/index.js）
- im/manager/channel/material/index.ts（→ im/manager/channel/material/index.js）
- im/manager/channel/message/index.ts（→ im/manager/channel/message/index.js）
- im/manager/face/item/index.ts（→ im/manager/face/item/index.js）
- im/manager/face/pack/index.ts（→ im/manager/face/pack/index.js）
- im/manager/face/userItem/index.ts（→ im/manager/face/userItem/index.js）
- im/manager/friend/index.ts（→ im/manager/friend/index.js）
- im/manager/friend/request/index.ts（→ im/manager/friend/request/index.js）
- im/manager/group/index.ts（→ im/manager/group/index.js）
- im/manager/group/request/index.ts（→ im/manager/group/request/index.js）
- im/manager/message/group/index.ts（→ im/manager/message/group/index.js）
- im/manager/message/private/index.ts（→ im/manager/message/private/index.js）
- im/manager/rtc/index.ts（→ im/manager/rtc/index.js）
- im/manager/sensitiveword/index.ts（→ im/manager/sensitiveword/index.js）
- im/manager/statistics/index.ts（→ im/manager/statistics/index.js）
- im/message/channel/index.ts（→ im/message/channel/index.js）
- im/message/group/index.ts（→ im/message/group/index.js）
- im/message/private/index.ts（→ im/message/private/index.js）
- im/rtc/index.ts（→ im/rtc/index.js）

#### api/infra（16）

- infra/apiAccessLog/index.ts（→ infra/apiAccessLog.js）
- infra/apiErrorLog/index.ts（→ infra/apiErrorLog.js）
- infra/codegen/index.ts（→ infra/codegen.js）
- infra/config/index.ts（→ infra/config.js）
- infra/dataSourceConfig/index.ts（→ infra/dataSourceConfig.js）
- infra/demo/demo01/index.ts（→ infra/demo/demo01/index.js）
- infra/demo/demo02/index.ts（→ infra/demo/demo02/index.js）
- infra/demo/demo03/erp/index.ts（→ infra/demo/demo03/erp/index.js）
- infra/demo/demo03/inner/index.ts（→ infra/demo/demo03/inner/index.js）
- infra/demo/demo03/normal/index.ts（→ infra/demo/demo03/normal/index.js）
- infra/file/index.ts（→ infra/file.js）
- infra/fileConfig/index.ts（→ infra/fileConfig.js）
- infra/job/index.ts（→ infra/job.js）
- infra/jobLog/index.ts（→ infra/jobLog.js）
- infra/redis/index.ts（→ infra/redis.js）
- infra/redis/types.ts

#### api/iot（16）

- iot/alert/config/index.ts（→ iot/alert/config/index.js）
- iot/alert/record/index.ts（→ iot/alert/record/index.js）
- iot/device/device/index.ts（→ iot/device/device/index.js）
- iot/device/group/index.ts（→ iot/device/group/index.js）
- iot/device/modbus/config/index.ts（→ iot/device/modbus/config/index.js）
- iot/device/modbus/point/index.ts（→ iot/device/modbus/point/index.js）
- iot/ota/firmware/index.ts（→ iot/ota/firmware/index.js）
- iot/ota/task/index.ts（→ iot/ota/task/index.js）
- iot/ota/task/record/index.ts（→ iot/ota/task/record/index.js）
- iot/product/category/index.ts（→ iot/product/category/index.js）
- iot/product/product/index.ts（→ iot/product/product/index.js）
- iot/rule/data/rule/index.ts（→ iot/rule/data/rule/index.js）
- iot/rule/data/sink/index.ts（→ iot/rule/data/sink/index.js）
- iot/rule/scene/index.ts（→ iot/rule/scene/index.js）
- iot/statistics/index.ts（→ iot/statistics/index.js）
- iot/thingmodel/index.ts（→ iot/thingmodel/index.js）

#### api/login（1）

- login/index.ts（→ login.js）

#### api/mall（38）

- mall/product/brand.ts（→ mall/product/brand.js）
- mall/product/category.ts（→ mall/product/category.js）
- mall/product/comment.ts（→ mall/product/comment.js）
- mall/product/favorite.ts（→ mall/product/favorite.js）
- mall/product/property.ts（→ mall/product/property.js）
- mall/product/spu.ts（→ mall/product/spu.js）
- mall/promotion/article/index.ts（→ mall/promotion/article/index.js）
- mall/promotion/articleCategory/index.ts（→ mall/promotion/articleCategory/index.js）
- mall/promotion/banner/index.ts（→ mall/promotion/banner/index.js）
- mall/promotion/bargain/bargainActivity.ts（→ mall/promotion/bargain/bargainActivity.js）
- mall/promotion/bargain/bargainHelp.ts（→ mall/promotion/bargain/bargainHelp.js）
- mall/promotion/bargain/bargainRecord.ts（→ mall/promotion/bargain/bargainRecord.js）
- mall/promotion/combination/combinationActivity.ts（→ mall/promotion/combination/combinationActivity.js）
- mall/promotion/combination/combinationRecord.ts（→ mall/promotion/combination/combinationRecord.js）
- mall/promotion/coupon/coupon.ts（→ mall/promotion/coupon/coupon.js）
- mall/promotion/coupon/couponTemplate.ts（→ mall/promotion/coupon/couponTemplate.js）
- mall/promotion/discount/discountActivity.ts（→ mall/promotion/discount/discountActivity.js）
- mall/promotion/diy/page.ts（→ mall/promotion/diy/page.js）
- mall/promotion/diy/template.ts（→ mall/promotion/diy/template.js）
- mall/promotion/kefu/conversation/index.ts（→ mall/promotion/kefu/conversation/index.js）
- mall/promotion/kefu/message/index.ts（→ mall/promotion/kefu/message/index.js）
- mall/promotion/point/index.ts（→ mall/promotion/point/index.js）
- mall/promotion/reward/rewardActivity.ts（→ mall/promotion/reward/rewardActivity.js）
- mall/promotion/seckill/seckillActivity.ts（→ mall/promotion/seckill/seckillActivity.js）
- mall/promotion/seckill/seckillConfig.ts（→ mall/promotion/seckill/seckillConfig.js）
- mall/statistics/member.ts（→ mall/statistics/member.js）
- mall/statistics/pay.ts（→ mall/statistics/pay.js）
- mall/statistics/product.ts（→ mall/statistics/product.js）
- mall/statistics/trade.ts（→ mall/statistics/trade.js）
- mall/trade/afterSale/index.ts（→ mall/trade/afterSale/index.js）
- mall/trade/brokerage/record/index.ts（→ mall/trade/brokerage/record/index.js）
- mall/trade/brokerage/user/index.ts（→ mall/trade/brokerage/user/index.js）
- mall/trade/brokerage/withdraw/index.ts（→ mall/trade/brokerage/withdraw/index.js）
- mall/trade/config/index.ts（→ mall/trade/config/index.js）
- mall/trade/delivery/express/index.ts（→ mall/trade/delivery/express/index.js）
- mall/trade/delivery/expressTemplate/index.ts（→ mall/trade/delivery/expressTemplate.js）
- mall/trade/delivery/pickUpStore/index.ts（→ mall/trade/delivery/pickUpStore/index.js）
- mall/trade/order/index.ts（→ mall/trade/order/index.js）

#### api/member（10）

- member/address/index.ts（→ member/address/index.js）
- member/config/index.ts（→ member/config/index.js）
- member/experience-record/index.ts（→ member/experience-record/index.js）
- member/group/index.ts（→ member/group/index.js）
- member/level/index.ts（→ member/level/index.js）
- member/point/record/index.ts（→ member/point/record/index.js）
- member/signin/config/index.ts（→ member/signin/config/index.js）
- member/signin/record/index.ts（→ member/signin/record/index.js）
- member/tag/index.ts（→ member/tag/index.js）
- member/user/index.ts（→ member/user/index.js）

#### api/mes（127）

- mes/cal/calendar/index.ts（→ mes/cal/calendar/index.js）
- mes/cal/holiday/index.ts（→ mes/cal/holiday/index.js）
- mes/cal/plan/index.ts（→ mes/cal/plan/index.js）
- mes/cal/plan/shift/index.ts（→ mes/cal/plan/shift/index.js）
- mes/cal/plan/team/index.ts（→ mes/cal/plan/team/index.js）
- mes/cal/team/index.ts（→ mes/cal/team/index.js）
- mes/cal/team/member/index.ts（→ mes/cal/team/member/index.js）
- mes/cal/team/shift/index.ts（→ mes/cal/team/shift/index.js）
- mes/dv/checkplan/index.ts（→ mes/dv/checkplan/index.js）
- mes/dv/checkplan/machinery/index.ts（→ mes/dv/checkplan/machinery/index.js）
- mes/dv/checkplan/subject/index.ts（→ mes/dv/checkplan/subject/index.js）
- mes/dv/checkrecord/index.ts（→ mes/dv/checkrecord/index.js）
- mes/dv/checkrecord/line/index.ts（→ mes/dv/checkrecord/line/index.js）
- mes/dv/machinery/index.ts（→ mes/dv/machinery/index.js）
- mes/dv/machinery/type/index.ts（→ mes/dv/machinery/type/index.js）
- mes/dv/maintenrecord/index.ts（→ mes/dv/maintenrecord/index.js）
- mes/dv/maintenrecord/line/index.ts（→ mes/dv/maintenrecord/line/index.js）
- mes/dv/repair/index.ts（→ mes/dv/repair/index.js）
- mes/dv/repair/line/index.ts（→ mes/dv/repair/line/index.js）
- mes/dv/subject/index.ts（→ mes/dv/subject/index.js）
- mes/home/index.ts（→ mes/home/index.js）
- mes/md/autocode/part/index.ts（→ mes/md/autocode/part/index.js）
- mes/md/autocode/record/index.ts（→ mes/md/autocode/record/index.js）
- mes/md/autocode/rule/index.ts（→ mes/md/autocode/rule/index.js）
- mes/md/client/index.ts（→ mes/md/client/index.js）
- mes/md/item/batchConfig/index.ts（→ mes/md/item/batchConfig/index.js）
- mes/md/item/index.ts（→ mes/md/item/index.js）
- mes/md/item/productBom/index.ts（→ mes/md/item/productBom/index.js）
- mes/md/item/productSip/index.ts（→ mes/md/item/productSip/index.js）
- mes/md/item/productSop/index.ts（→ mes/md/item/productSop/index.js）
- mes/md/item/type/index.ts（→ mes/md/item/type/index.js）
- mes/md/unitmeasure/index.ts（→ mes/md/unitmeasure/index.js）
- mes/md/vendor/index.ts（→ mes/md/vendor/index.js）
- mes/md/workstation/index.ts（→ mes/md/workstation/index.js）
- mes/md/workstation/machine/index.ts（→ mes/md/workstation/machine/index.js）
- mes/md/workstation/tool/index.ts（→ mes/md/workstation/tool/index.js）
- mes/md/workstation/worker/index.ts（→ mes/md/workstation/worker/index.js）
- mes/md/workstation/workshop/index.ts（→ mes/md/workstation/workshop/index.js）
- mes/pro/andon/config/index.ts（→ mes/pro/andon/config/index.js）
- mes/pro/andon/record/index.ts（→ mes/pro/andon/record/index.js）
- mes/pro/card/index.ts（→ mes/pro/card/index.js）
- mes/pro/card/process/index.ts（→ mes/pro/card/process/index.js）
- mes/pro/feedback/index.ts（→ mes/pro/feedback/index.js）
- mes/pro/process/content/index.ts（→ mes/pro/process/content/index.js）
- mes/pro/process/index.ts（→ mes/pro/process/index.js）
- mes/pro/route/index.ts（→ mes/pro/route/index.js）
- mes/pro/route/process/index.ts（→ mes/pro/route/process/index.js）
- mes/pro/route/product/index.ts（→ mes/pro/route/product/index.js）
- mes/pro/route/productbom/index.ts（→ mes/pro/route/productbom/index.js）
- mes/pro/task/index.ts（→ mes/pro/task/index.js）
- mes/pro/task/issue/index.ts（→ mes/pro/task/issue/index.js）
- mes/pro/workorder/bom/index.ts（→ mes/pro/workorder/bom/index.js）
- mes/pro/workorder/index.ts（→ mes/pro/workorder/index.js）
- mes/pro/workrecord/index.ts（→ mes/pro/workrecord/index.js）
- mes/qc/defect/index.ts（→ mes/qc/defect/index.js）
- mes/qc/defectrecord/index.ts（→ mes/qc/defectrecord/index.js）
- mes/qc/indicator/index.ts（→ mes/qc/indicator/index.js）
- mes/qc/indicatorresult/index.ts（→ mes/qc/indicatorresult/index.js）
- mes/qc/ipqc/index.ts（→ mes/qc/ipqc/index.js）
- mes/qc/ipqc/line/index.ts（→ mes/qc/ipqc/line/index.js）
- mes/qc/iqc/index.ts（→ mes/qc/iqc/index.js）
- mes/qc/iqc/line/index.ts（→ mes/qc/iqc/line/index.js）
- mes/qc/oqc/index.ts（→ mes/qc/oqc/index.js）
- mes/qc/oqc/line/index.ts（→ mes/qc/oqc/line/index.js）
- mes/qc/pendinginspect/index.ts（→ mes/qc/pendinginspect/index.js）
- mes/qc/rqc/index.ts（→ mes/qc/rqc/index.js）
- mes/qc/rqc/line/index.ts（→ mes/qc/rqc/line/index.js）
- mes/qc/template/index.ts（→ mes/qc/template/index.js）
- mes/qc/template/indicator/index.ts（→ mes/qc/template/indicator/index.js）
- mes/qc/template/item/index.ts（→ mes/qc/template/item/index.js）
- mes/tm/tool/index.ts（→ mes/tm/tool/index.js）
- mes/tm/tool/type/index.ts（→ mes/tm/tool/type/index.js）
- mes/wm/arrivalnotice/index.ts（→ mes/wm/arrivalnotice/index.js）
- mes/wm/arrivalnotice/line/index.ts（→ mes/wm/arrivalnotice/line/index.js）
- mes/wm/barcode/config/index.ts（→ mes/wm/barcode/config/index.js）
- mes/wm/barcode/index.ts（→ mes/wm/barcode/index.js）
- mes/wm/batch/index.ts（→ mes/wm/batch/index.js）
- mes/wm/itemconsume/line/index.ts（→ mes/wm/itemconsume/line/index.js）
- mes/wm/itemreceipt/detail/index.ts（→ mes/wm/itemreceipt/detail/index.js）
- mes/wm/itemreceipt/index.ts（→ mes/wm/itemreceipt/index.js）
- mes/wm/itemreceipt/line/index.ts（→ mes/wm/itemreceipt/line/index.js）
- mes/wm/materialstock/index.ts（→ mes/wm/materialstock/index.js）
- mes/wm/miscissue/index.ts（→ mes/wm/miscissue/index.js）
- mes/wm/miscissue/line/index.ts（→ mes/wm/miscissue/line/index.js）
- mes/wm/miscreceipt/index.ts（→ mes/wm/miscreceipt/index.js）
- mes/wm/miscreceipt/line/index.ts（→ mes/wm/miscreceipt/line/index.js）
- mes/wm/outsourceissue/detail/index.ts（→ mes/wm/outsourceissue/detail/index.js）
- mes/wm/outsourceissue/index.ts（→ mes/wm/outsourceissue/index.js）
- mes/wm/outsourceissue/line/index.ts（→ mes/wm/outsourceissue/line/index.js）
- mes/wm/outsourcereceipt/detail/index.ts（→ mes/wm/outsourcereceipt/detail/index.js）
- mes/wm/outsourcereceipt/index.ts（→ mes/wm/outsourcereceipt/index.js）
- mes/wm/outsourcereceipt/line/index.ts（→ mes/wm/outsourcereceipt/line/index.js）
- mes/wm/packages/index.ts（→ mes/wm/packages/index.js）
- mes/wm/packages/line/index.ts（→ mes/wm/packages/line/index.js）
- mes/wm/productissue/detail/index.ts（→ mes/wm/productissue/detail/index.js）
- mes/wm/productissue/index.ts（→ mes/wm/productissue/index.js）
- mes/wm/productissue/line/index.ts（→ mes/wm/productissue/line/index.js）
- mes/wm/productproduce/line/index.ts（→ mes/wm/productproduce/line/index.js）
- mes/wm/productreceipt/detail/index.ts（→ mes/wm/productreceipt/detail/index.js）
- mes/wm/productreceipt/index.ts（→ mes/wm/productreceipt/index.js）
- mes/wm/productreceipt/line/index.ts（→ mes/wm/productreceipt/line/index.js）
- mes/wm/productsales/detail/index.ts（→ mes/wm/productsales/detail/index.js）
- mes/wm/productsales/index.ts（→ mes/wm/productsales/index.js）
- mes/wm/productsales/line/index.ts（→ mes/wm/productsales/line/index.js）
- mes/wm/returnissue/detail/index.ts（→ mes/wm/returnissue/detail/index.js）
- mes/wm/returnissue/index.ts（→ mes/wm/returnissue/index.js）
- mes/wm/returnissue/line/index.ts（→ mes/wm/returnissue/line/index.js）
- mes/wm/returnsales/detail/index.ts（→ mes/wm/returnsales/detail/index.js）
- mes/wm/returnsales/index.ts（→ mes/wm/returnsales/index.js）
- mes/wm/returnsales/line/index.ts（→ mes/wm/returnsales/line/index.js）
- mes/wm/returnvendor/detail/index.ts（→ mes/wm/returnvendor/detail/index.js）
- mes/wm/returnvendor/index.ts（→ mes/wm/returnvendor/index.js）
- mes/wm/returnvendor/line/index.ts（→ mes/wm/returnvendor/line/index.js）
- mes/wm/salesnotice/index.ts（→ mes/wm/salesnotice/index.js）
- mes/wm/salesnotice/line/index.ts（→ mes/wm/salesnotice/line/index.js）
- mes/wm/sn/index.ts（→ mes/wm/sn/index.js）
- mes/wm/stocktaking/plan/index.ts（→ mes/wm/stocktaking/plan/index.js）
- mes/wm/stocktaking/plan/param/index.ts（→ mes/wm/stocktaking/plan/param/index.js）
- mes/wm/stocktaking/task/index.ts（→ mes/wm/stocktaking/task/index.js）
- mes/wm/stocktaking/task/line/index.ts（→ mes/wm/stocktaking/task/line/index.js）
- mes/wm/stocktaking/task/result/index.ts（→ mes/wm/stocktaking/task/result/index.js）
- mes/wm/transfer/detail/index.ts（→ mes/wm/transfer/detail/index.js）
- mes/wm/transfer/index.ts（→ mes/wm/transfer/index.js）
- mes/wm/transfer/line/index.ts（→ mes/wm/transfer/line/index.js）
- mes/wm/warehouse/area/index.ts（→ mes/wm/warehouse/area/index.js）
- mes/wm/warehouse/index.ts（→ mes/wm/warehouse/index.js）
- mes/wm/warehouse/location/index.ts（→ mes/wm/warehouse/location/index.js）

#### api/mp（11）

- mp/account/index.ts（→ mp/account.js）
- mp/autoReply/index.ts（→ mp/autoReply.js）
- mp/draft/index.ts（→ mp/draft.js）
- mp/freePublish/index.ts（→ mp/freePublish.js）
- mp/material/index.ts（→ mp/material.js）
- mp/menu/index.ts（→ mp/menu.js）
- mp/message/index.ts（→ mp/message.js）
- mp/messageTemplate/index.ts（→ mp/messageTemplate.js）
- mp/statistics/index.ts（→ mp/statistics.js）
- mp/tag/index.ts（→ mp/tag.js）
- mp/user/index.ts（→ mp/user.js）

#### api/oa（41）

- oa/announcement/index.ts（→ oa/announcement/index.js）
- oa/attendance/index.ts（→ oa/attendance/index.js）
- oa/contact/category/index.ts（→ oa/contact/category.js）
- oa/contact/index.ts（→ oa/contact/index.js）
- oa/discussion/index.ts（→ oa/discussion/index.js）
- oa/discussion/like/index.ts（→ oa/discussion/like/index.js）
- oa/discussion/reply/index.ts（→ oa/discussion/reply/index.js）
- oa/discussion/vote/index.ts（→ oa/discussion/vote/index.js）
- oa/file/favorite/index.ts（→ oa/file/favorite.js）
- oa/file/node/index.ts（→ oa/file/node.js）
- oa/file/permission/index.ts（→ oa/file/permission.js）
- oa/leave/index.ts（→ oa/leave/index.js）
- oa/mail/account/index.ts（→ oa/mail/account.js）
- oa/mail/folder/index.ts（→ oa/mail/folder.js）
- oa/mail/message/index.ts（→ oa/mail/message.js）
- oa/mail/provider/index.ts（→ oa/mail/provider.js）
- oa/meetingroom/booking/index.ts（→ oa/meetingroom/booking/index.js）
- oa/meetingroom/room/index.ts（→ oa/meetingroom/room/index.js）
- oa/note/category/index.ts（→ oa/note/category/index.js）
- oa/note/index.ts（→ oa/note/index.js）
- oa/officialdoc/receive/index.ts（→ oa/officialdoc/receive/index.js）
- oa/officialdoc/send/index.ts（→ oa/officialdoc/send/index.js）
- oa/officialdoc/template/index.ts（→ oa/officialdoc/template/index.js）
- oa/overtime/index.ts（→ oa/overtime/index.js）
- oa/plan/index.ts（→ oa/plan/index.js）
- oa/regular/index.ts（→ oa/regular/index.js）
- oa/reimbursement/index.ts（→ oa/reimbursement/index.js）
- oa/resign/index.ts（→ oa/resign/index.js）
- oa/schedule/index.ts（→ oa/schedule/index.js）
- oa/seal/apply/index.ts（→ oa/seal/apply/index.js）
- oa/seal/index.ts（→ oa/seal/index.js）
- oa/supply/apply/index.ts（→ oa/supply/apply/index.js）
- oa/supply/issue/index.ts（→ oa/supply/issue/index.js）
- oa/supply/item/index.ts（→ oa/supply/item/index.js）
- oa/task/index.ts（→ oa/task/index.js）
- oa/travel/apply/index.ts（→ oa/travel/apply/index.js）
- oa/travel/reimbursement/index.ts（→ oa/travel/reimbursement/index.js）
- oa/vehicle/apply/index.ts（→ oa/vehicle/apply/index.js）
- oa/vehicle/index.ts（→ oa/vehicle/index.js）
- oa/vehicle/return/index.ts（→ oa/vehicle/return/index.js）
- oa/workreport/index.ts（→ oa/workreport/index.js）

#### api/pay（11）

- pay/app/index.ts（→ pay/app.js）
- pay/channel/index.ts（→ pay/channel.js）
- pay/demo/order/index.ts（→ pay/demo/order/index.js）
- pay/demo/withdraw/index.ts（→ pay/demo/withdraw/index.js）
- pay/notify/index.ts（→ pay/notify.js）
- pay/order/index.ts（→ pay/order.js）
- pay/refund/index.ts（→ pay/refund.js）
- pay/transfer/index.ts（→ pay/transfer.js）
- pay/wallet/balance/index.ts（→ pay/wallet/balance/index.js）
- pay/wallet/rechargePackage/index.ts（→ pay/wallet/rechargePackage/index.js）
- pay/wallet/transaction/index.ts（→ pay/wallet/transaction/index.js）

#### api/pms（29）

- pms/kb/content/document/index.ts（→ pms/kb/content/document/index.js）
- pms/kb/content/document/label/index.ts（→ pms/kb/content/document/label/index.js）
- pms/kb/content/folder/index.ts（→ pms/kb/content/folder/index.js）
- pms/kb/content/permission/index.ts（→ pms/kb/content/permission/index.js）
- pms/kb/interaction/comment/index.ts（→ pms/kb/interaction/comment/index.js）
- pms/kb/interaction/favorite/index.ts（→ pms/kb/interaction/favorite/index.js）
- pms/kb/interaction/like/index.ts（→ pms/kb/interaction/like/index.js）
- pms/kb/interaction/share/index.ts（→ pms/kb/interaction/share/index.js）
- pms/kb/interaction/types.ts（→ pms/kb/interaction/types.js）
- pms/kb/interaction/view-record/index.ts（→ pms/kb/interaction/view-record/index.js）
- pms/kb/library/group/index.ts（→ pms/kb/library/group/index.js）
- pms/kb/library/index.ts（→ pms/kb/library/index.js）
- pms/kb/library/member/index.ts（→ pms/kb/library/member/index.js）
- pms/kb/library/template/index.ts（→ pms/kb/library/template/index.js）
- pms/kb/recycle/index.ts（→ pms/kb/recycle/index.js）
- pms/pm/iteration/index.ts（→ pms/pm/iteration/index.js）
- pms/pm/project/announcement/index.ts（→ pms/pm/project/announcement/index.js）
- pms/pm/project/favorite/index.ts（→ pms/pm/project/favorite/index.js）
- pms/pm/project/group/index.ts（→ pms/pm/project/group/index.js）
- pms/pm/project/index.ts（→ pms/pm/project/index.js）
- pms/pm/project/member/index.ts（→ pms/pm/project/member/index.js）
- pms/pm/project/template/index.ts（→ pms/pm/project/template/index.js）
- pms/pm/workbench/index.ts（→ pms/pm/workbench/index.js）
- pms/pm/workitem/activity/index.ts（→ pms/pm/workitem/activity/index.js）
- pms/pm/workitem/comment/index.ts（→ pms/pm/workitem/comment/index.js）
- pms/pm/workitem/index.ts（→ pms/pm/workitem/index.js）
- pms/pm/workitem/label/index.ts（→ pms/pm/workitem/label/index.js）
- pms/pm/workitem/status/index.ts（→ pms/pm/workitem/status/index.js）
- pms/pm/workitem/worklog/index.ts（→ pms/pm/workitem/worklog/index.js）

#### api/system（24）

- system/area/index.ts（→ system/area.js）
- system/dept/index.ts（→ system/dept.js）
- system/loginLog/index.ts（→ system/loginlog.js）
- system/mail/account/index.ts（→ system/mail/account.js）
- system/mail/log/index.ts（→ system/mail/log.js）
- system/mail/template/index.ts（→ system/mail/template.js）
- system/menu/index.ts（→ system/menu.js）
- system/notice/index.ts（→ system/notice.js）
- system/notify/message/index.ts（→ system/notify/message.js）
- system/notify/template/index.ts（→ system/notify/template.js）
- system/operatelog/index.ts（→ system/operatelog.js）
- system/permission/index.ts（→ system/permission.js）
- system/post/index.ts（→ system/post.js）
- system/role/index.ts（→ system/role.js）
- system/sms/smsChannel/index.ts（→ system/sms/smsChannel.js）
- system/sms/smsLog/index.ts（→ system/sms/smsLog.js）
- system/sms/smsTemplate/index.ts（→ system/sms/smsTemplate.js）
- system/social/client/index.ts（→ system/social/client.js）
- system/social/user/index.ts（→ system/social/user.js）
- system/tenant/index.ts（→ system/tenant.js）
- system/tenantPackage/index.ts（→ system/tenantPackage.js）
- system/user/index.ts（→ system/user.js）
- system/user/profile.ts（→ system/user/profile.js）
- system/user/socialUser.ts（→ system/user/socialUser.js）

#### api/wms（17）

- wms/home/index.ts（→ wms/home/index.js）
- wms/inventory/history/index.ts（→ wms/inventory/history/index.js）
- wms/inventory/index.ts（→ wms/inventory/index.js）
- wms/md/item/brand/index.ts（→ wms/md/item/brand/index.js）
- wms/md/item/category/index.ts（→ wms/md/item/category/index.js）
- wms/md/item/index.ts（→ wms/md/item/index.js）
- wms/md/item/sku/index.ts（→ wms/md/item/sku/index.js）
- wms/md/merchant/index.ts（→ wms/md/merchant/index.js）
- wms/md/warehouse/index.ts（→ wms/md/warehouse/index.js）
- wms/order/check/detail/index.ts（→ wms/order/check/detail/index.js）
- wms/order/check/index.ts（→ wms/order/check/index.js）
- wms/order/movement/detail/index.ts（→ wms/order/movement/detail/index.js）
- wms/order/movement/index.ts（→ wms/order/movement/index.js）
- wms/order/receipt/detail/index.ts（→ wms/order/receipt/detail/index.js）
- wms/order/receipt/index.ts（→ wms/order/receipt/index.js）
- wms/order/shipment/detail/index.ts（→ wms/order/shipment/detail/index.js）
- wms/order/shipment/index.ts（→ wms/order/shipment/index.js）

#### components（258）

- AppLinkInput/AppLinkSelectDialog.vue
- AppLinkInput/data.ts（→ AppLinkInput/data.js）
- AppLinkInput/index.vue
- Backtop/index.ts（→ Backtop/index.vue）
- Backtop/src/Backtop.vue（→ Backtop/index.vue）
- ColorInput/index.vue
- ContentDetailWrap/index.ts（→ ContentDetailWrap/index.vue）
- ContentDetailWrap/src/ContentDetailWrap.vue（→ ContentDetailWrap/index.vue）
- ContentWrap/index.ts（→ ContentWrap/index.vue）
- ContentWrap/src/ContentWrap.vue（→ ContentWrap/index.vue）
- DeptSelectForm/index.vue
- DiyEditor/components/ComponentContainer.vue
- DiyEditor/components/ComponentContainerProperty.vue
- DiyEditor/components/ComponentLibrary.vue
- DiyEditor/components/mobile/Carousel/config.ts（→ DiyEditor/components/mobile/Carousel/config.js）
- DiyEditor/components/mobile/Carousel/index.vue
- DiyEditor/components/mobile/Carousel/property.vue
- DiyEditor/components/mobile/CouponCard/component.tsx（→ DiyEditor/components/mobile/CouponCard/component.js）
- DiyEditor/components/mobile/CouponCard/config.ts（→ DiyEditor/components/mobile/CouponCard/config.js）
- DiyEditor/components/mobile/CouponCard/index.vue
- DiyEditor/components/mobile/CouponCard/property.vue
- DiyEditor/components/mobile/Divider/config.ts（→ DiyEditor/components/mobile/Divider/config.js）
- DiyEditor/components/mobile/Divider/index.vue
- DiyEditor/components/mobile/Divider/property.vue
- DiyEditor/components/mobile/FloatingActionButton/config.ts（→ DiyEditor/components/mobile/FloatingActionButton/config.js）
- DiyEditor/components/mobile/FloatingActionButton/index.vue
- DiyEditor/components/mobile/FloatingActionButton/property.vue
- DiyEditor/components/mobile/HotZone/components/HotZoneEditDialog/controller.ts（→ DiyEditor/components/mobile/HotZone/components/HotZoneEditDialog/controller.js）
- DiyEditor/components/mobile/HotZone/components/HotZoneEditDialog/index.vue
- DiyEditor/components/mobile/HotZone/config.ts（→ DiyEditor/components/mobile/HotZone/config.js）
- DiyEditor/components/mobile/HotZone/index.vue
- DiyEditor/components/mobile/HotZone/property.vue
- DiyEditor/components/mobile/ImageBar/config.ts（→ DiyEditor/components/mobile/ImageBar/config.js）
- DiyEditor/components/mobile/ImageBar/index.vue
- DiyEditor/components/mobile/ImageBar/property.vue
- DiyEditor/components/mobile/MagicCube/config.ts（→ DiyEditor/components/mobile/MagicCube/config.js）
- DiyEditor/components/mobile/MagicCube/index.vue
- DiyEditor/components/mobile/MagicCube/property.vue
- DiyEditor/components/mobile/MenuGrid/config.ts（→ DiyEditor/components/mobile/MenuGrid/config.js）
- DiyEditor/components/mobile/MenuGrid/index.vue
- DiyEditor/components/mobile/MenuGrid/property.vue
- DiyEditor/components/mobile/MenuList/config.ts（→ DiyEditor/components/mobile/MenuList/config.js）
- DiyEditor/components/mobile/MenuList/index.vue
- DiyEditor/components/mobile/MenuList/property.vue
- DiyEditor/components/mobile/MenuSwiper/config.ts（→ DiyEditor/components/mobile/MenuSwiper/config.js）
- DiyEditor/components/mobile/MenuSwiper/index.vue
- DiyEditor/components/mobile/MenuSwiper/property.vue
- DiyEditor/components/mobile/NavigationBar/components/CellProperty.vue
- DiyEditor/components/mobile/NavigationBar/config.ts（→ DiyEditor/components/mobile/NavigationBar/config.js）
- DiyEditor/components/mobile/NavigationBar/index.vue
- DiyEditor/components/mobile/NavigationBar/property.vue
- DiyEditor/components/mobile/NoticeBar/config.ts（→ DiyEditor/components/mobile/NoticeBar/config.js）
- DiyEditor/components/mobile/NoticeBar/index.vue
- DiyEditor/components/mobile/NoticeBar/property.vue
- DiyEditor/components/mobile/PageConfig/config.ts（→ DiyEditor/components/mobile/PageConfig/config.js）
- DiyEditor/components/mobile/PageConfig/property.vue
- DiyEditor/components/mobile/Popover/config.ts（→ DiyEditor/components/mobile/Popover/config.js）
- DiyEditor/components/mobile/Popover/index.vue
- DiyEditor/components/mobile/Popover/property.vue
- DiyEditor/components/mobile/ProductCard/config.ts（→ DiyEditor/components/mobile/ProductCard/config.js）
- DiyEditor/components/mobile/ProductCard/index.vue
- DiyEditor/components/mobile/ProductCard/property.vue
- DiyEditor/components/mobile/ProductList/config.ts（→ DiyEditor/components/mobile/ProductList/config.js）
- DiyEditor/components/mobile/ProductList/index.vue
- DiyEditor/components/mobile/ProductList/property.vue
- DiyEditor/components/mobile/PromotionArticle/config.ts（→ DiyEditor/components/mobile/PromotionArticle/config.js）
- DiyEditor/components/mobile/PromotionArticle/index.vue
- DiyEditor/components/mobile/PromotionArticle/property.vue
- DiyEditor/components/mobile/PromotionCombination/config.ts（→ DiyEditor/components/mobile/PromotionCombination/config.js）
- DiyEditor/components/mobile/PromotionCombination/index.vue
- DiyEditor/components/mobile/PromotionCombination/property.vue
- DiyEditor/components/mobile/PromotionPoint/config.ts（→ DiyEditor/components/mobile/PromotionPoint/config.js）
- DiyEditor/components/mobile/PromotionPoint/index.vue
- DiyEditor/components/mobile/PromotionPoint/property.vue
- DiyEditor/components/mobile/PromotionSeckill/config.ts（→ DiyEditor/components/mobile/PromotionSeckill/config.js）
- DiyEditor/components/mobile/PromotionSeckill/index.vue
- DiyEditor/components/mobile/PromotionSeckill/property.vue
- DiyEditor/components/mobile/SearchBar/config.ts（→ DiyEditor/components/mobile/SearchBar/config.js）
- DiyEditor/components/mobile/SearchBar/index.vue
- DiyEditor/components/mobile/SearchBar/property.vue
- DiyEditor/components/mobile/TabBar/config.ts（→ DiyEditor/components/mobile/TabBar/config.js）
- DiyEditor/components/mobile/TabBar/index.vue
- DiyEditor/components/mobile/TabBar/property.vue
- DiyEditor/components/mobile/TitleBar/config.ts（→ DiyEditor/components/mobile/TitleBar/config.js）
- DiyEditor/components/mobile/TitleBar/index.vue
- DiyEditor/components/mobile/TitleBar/property.vue
- DiyEditor/components/mobile/UserCard/config.ts（→ DiyEditor/components/mobile/UserCard/config.js）
- DiyEditor/components/mobile/UserCard/index.vue
- DiyEditor/components/mobile/UserCard/property.vue
- DiyEditor/components/mobile/UserCoupon/config.ts（→ DiyEditor/components/mobile/UserCoupon/config.js）
- DiyEditor/components/mobile/UserCoupon/index.vue
- DiyEditor/components/mobile/UserCoupon/property.vue
- DiyEditor/components/mobile/UserOrder/config.ts（→ DiyEditor/components/mobile/UserOrder/config.js）
- DiyEditor/components/mobile/UserOrder/index.vue
- DiyEditor/components/mobile/UserOrder/property.vue
- DiyEditor/components/mobile/UserWallet/config.ts（→ DiyEditor/components/mobile/UserWallet/config.js）
- DiyEditor/components/mobile/UserWallet/index.vue
- DiyEditor/components/mobile/UserWallet/property.vue
- DiyEditor/components/mobile/VideoPlayer/config.ts（→ DiyEditor/components/mobile/VideoPlayer/config.js）
- DiyEditor/components/mobile/VideoPlayer/index.vue
- DiyEditor/components/mobile/VideoPlayer/property.vue
- DiyEditor/components/mobile/index.ts（→ DiyEditor/components/mobile/index.js）
- DiyEditor/index.vue
- DiyEditor/util.ts（→ DiyEditor/util.js）
- DocAlert/index.vue
- Draggable/index.vue
- FilePreview/index.ts（→ FilePreview/index.js）
- FilePreview/src/FilePreview.vue
- FormCreate/index.ts（→ FormCreate/index.js）
- FormCreate/src/components/AreaSelect.vue
- FormCreate/src/components/DeptSelect.vue
- FormCreate/src/components/DictSelect.vue
- FormCreate/src/components/IframeComponent.vue
- FormCreate/src/components/useApiSelect.tsx（→ FormCreate/src/components/useApiSelect.js）
- FormCreate/src/config/selectRule.ts（→ FormCreate/src/config/selectRule.js）
- FormCreate/src/config/useAreaSelectRule.ts（→ FormCreate/src/config/useAreaSelectRule.js）
- FormCreate/src/config/useDictSelectRule.ts（→ FormCreate/src/config/useDictSelectRule.js）
- FormCreate/src/config/useEditorRule.ts（→ FormCreate/src/config/useEditorRule.js）
- FormCreate/src/config/useIframeRule.ts（→ FormCreate/src/config/useIframeRule.js）
- FormCreate/src/config/useSelectRule.ts（→ FormCreate/src/config/useSelectRule.js）
- FormCreate/src/config/useUploadFileRule.ts（→ FormCreate/src/config/useUploadFileRule.js）
- FormCreate/src/config/useUploadImgRule.ts（→ FormCreate/src/config/useUploadImgRule.js）
- FormCreate/src/config/useUploadImgsRule.ts（→ FormCreate/src/config/useUploadImgsRule.js）
- FormCreate/src/useFormCreateDesigner.ts（→ FormCreate/src/useFormCreateDesigner.js）
- FormCreate/src/utils/index.ts（→ FormCreate/src/utils/index.js）
- Icon/index.ts（→ Icon/index.js）
- Icon/src/Icon.vue
- Icon/src/IconSelect.vue
- Icon/src/data.ts（→ Icon/src/data.js）
- Infotip/index.ts（→ Infotip/index.vue）
- Infotip/src/Infotip.vue（→ Infotip/index.vue）
- InputPassword/index.ts（→ InputPassword/index.vue）
- InputPassword/src/InputPassword.vue（→ InputPassword/index.vue）
- InputWithColor/index.vue
- JsonEditor/index.ts（→ JsonEditor/index.vue）
- MagicCubeEditor/index.vue
- MagicCubeEditor/util.ts（→ MagicCubeEditor/util.js）
- Map/index.ts（→ Map/index.js）
- Map/src/MapDialog.vue
- Map/src/utils.ts（→ Map/src/utils.js）
- MarkdownView/index.vue
- OperateLogV2/index.ts（→ OperateLogV2/index.vue）
- OperateLogV2/src/OperateLogV2.vue（→ OperateLogV2/index.vue）
- Pagination/index.vue
- Qrcode/index.ts（→ Qrcode/index.js）
- Qrcode/src/Qrcode.vue
- SimpleProcessDesignerV2/src/NodeHandler.vue
- SimpleProcessDesignerV2/src/ProcessNodeTree.vue
- SimpleProcessDesignerV2/src/SimpleProcessDesigner.vue
- SimpleProcessDesignerV2/src/SimpleProcessModel.vue
- SimpleProcessDesignerV2/src/SimpleProcessViewer.vue
- SimpleProcessDesignerV2/src/consts.ts（→ SimpleProcessDesignerV2/src/consts.js）
- SimpleProcessDesignerV2/src/index.ts（→ SimpleProcessDesignerV2/src/index.js）
- SimpleProcessDesignerV2/src/node.ts（→ SimpleProcessDesignerV2/src/node.js）
- SimpleProcessDesignerV2/src/nodes/ChildProcessNode.vue
- SimpleProcessDesignerV2/src/nodes/CopyTaskNode.vue
- SimpleProcessDesignerV2/src/nodes/DelayTimerNode.vue
- SimpleProcessDesignerV2/src/nodes/EndEventNode.vue
- SimpleProcessDesignerV2/src/nodes/ExclusiveNode.vue
- SimpleProcessDesignerV2/src/nodes/InclusiveNode.vue
- SimpleProcessDesignerV2/src/nodes/ParallelNode.vue
- SimpleProcessDesignerV2/src/nodes/RouterNode.vue
- SimpleProcessDesignerV2/src/nodes/StartUserNode.vue
- SimpleProcessDesignerV2/src/nodes/TriggerNode.vue
- SimpleProcessDesignerV2/src/nodes/UserTaskNode.vue
- SimpleProcessDesignerV2/src/nodes-config/ChildProcessNodeConfig.vue
- SimpleProcessDesignerV2/src/nodes-config/ConditionNodeConfig.vue
- SimpleProcessDesignerV2/src/nodes-config/CopyTaskNodeConfig.vue
- SimpleProcessDesignerV2/src/nodes-config/DelayTimerNodeConfig.vue
- SimpleProcessDesignerV2/src/nodes-config/RouterNodeConfig.vue
- SimpleProcessDesignerV2/src/nodes-config/StartUserNodeConfig.vue
- SimpleProcessDesignerV2/src/nodes-config/TriggerNodeConfig.vue
- SimpleProcessDesignerV2/src/nodes-config/UserTaskNodeConfig.vue
- SimpleProcessDesignerV2/src/nodes-config/components/Condition.vue
- SimpleProcessDesignerV2/src/nodes-config/components/ConditionDialog.vue
- SimpleProcessDesignerV2/src/nodes-config/components/HttpRequestParamSetting.vue
- SimpleProcessDesignerV2/src/nodes-config/components/HttpRequestSetting.vue
- SimpleProcessDesignerV2/src/nodes-config/components/UserTaskListener.vue
- SimpleProcessDesignerV2/src/utils.ts（→ SimpleProcessDesignerV2/src/utils.js）
- SimpleProcessDesignerV2/theme/iconfont.ttf
- SimpleProcessDesignerV2/theme/iconfont.woff
- SimpleProcessDesignerV2/theme/iconfont.woff2
- SimpleProcessDesignerV2/theme/simple-process-designer.scss
- Sticky/index.ts（→ Sticky/index.vue）
- Sticky/src/Sticky.vue（→ Sticky/index.vue）
- Tinyflow/Tinyflow.vue
- Tinyflow/ui/index.css
- Tinyflow/ui/index.js
- UploadFile/src/useUpload.ts（→ UploadFile/src/useUpload.js）
- UserSelectForm/index.vue
- Verifition/src/Verify/VerifyPictureWord.vue（→ Verifition/Verify/VerifyPictureWord.vue）
- VerticalButtonGroup/index.vue
- bpmnProcessDesigner/package/designer/ProcessDesigner.vue
- bpmnProcessDesigner/package/designer/ProcessViewer.vue
- bpmnProcessDesigner/package/designer/index.ts（→ bpmnProcessDesigner/package/designer/index.js）
- bpmnProcessDesigner/package/designer/index2.ts（→ bpmnProcessDesigner/package/designer/index2.js）
- bpmnProcessDesigner/package/designer/plugins/content-pad/contentPadProvider.js
- bpmnProcessDesigner/package/designer/plugins/content-pad/index.js
- bpmnProcessDesigner/package/designer/plugins/defaultEmpty.js
- bpmnProcessDesigner/package/designer/plugins/descriptor/activitiDescriptor.json
- bpmnProcessDesigner/package/designer/plugins/descriptor/camundaDescriptor.json
- bpmnProcessDesigner/package/designer/plugins/descriptor/flowableDescriptor.json
- bpmnProcessDesigner/package/designer/plugins/extension-moddle/activiti/activitiExtension.js
- bpmnProcessDesigner/package/designer/plugins/extension-moddle/activiti/index.js
- bpmnProcessDesigner/package/designer/plugins/extension-moddle/camunda/extension.js
- bpmnProcessDesigner/package/designer/plugins/extension-moddle/camunda/index.js
- bpmnProcessDesigner/package/designer/plugins/extension-moddle/flowable/flowableExtension.js
- bpmnProcessDesigner/package/designer/plugins/extension-moddle/flowable/index.js
- bpmnProcessDesigner/package/designer/plugins/palette/CustomPalette.js
- bpmnProcessDesigner/package/designer/plugins/palette/index.js
- bpmnProcessDesigner/package/designer/plugins/palette/paletteProvider.js
- bpmnProcessDesigner/package/designer/plugins/translate/customTranslate.js
- bpmnProcessDesigner/package/designer/plugins/translate/zh.js
- bpmnProcessDesigner/package/index.ts（→ bpmnProcessDesigner/package/index.js）
- bpmnProcessDesigner/package/palette/ProcessPalette.vue
- bpmnProcessDesigner/package/penal/PropertiesPanel.vue
- bpmnProcessDesigner/package/penal/base/ElementBaseInfo.vue
- bpmnProcessDesigner/package/penal/custom-config/ElementCustomConfig.vue
- bpmnProcessDesigner/package/penal/custom-config/components/BoundaryEventTimer.vue
- bpmnProcessDesigner/package/penal/custom-config/components/UserTaskCustomConfig.vue
- bpmnProcessDesigner/package/penal/custom-config/data.ts（→ bpmnProcessDesigner/package/penal/custom-config/data.js）
- bpmnProcessDesigner/package/penal/flow-condition/FlowCondition.vue
- bpmnProcessDesigner/package/penal/form/ElementForm.vue
- bpmnProcessDesigner/package/penal/index.js
- bpmnProcessDesigner/package/penal/listeners/ElementListeners.vue
- bpmnProcessDesigner/package/penal/listeners/ProcessListenerDialog.vue
- bpmnProcessDesigner/package/penal/listeners/UserTaskListeners.vue
- bpmnProcessDesigner/package/penal/listeners/template.js
- bpmnProcessDesigner/package/penal/listeners/utilSelf.ts（→ bpmnProcessDesigner/package/penal/listeners/utilSelf.js）
- bpmnProcessDesigner/package/penal/multi-instance/ElementMultiInstance.vue
- bpmnProcessDesigner/package/penal/other/ElementOtherConfig.vue
- bpmnProcessDesigner/package/penal/properties/ElementProperties.vue
- bpmnProcessDesigner/package/penal/signal-message/SignalAndMessage.vue
- bpmnProcessDesigner/package/penal/task/ElementTask.vue
- bpmnProcessDesigner/package/penal/task/task-components/CallActivity.vue
- bpmnProcessDesigner/package/penal/task/task-components/HttpHeaderEditor.vue
- bpmnProcessDesigner/package/penal/task/task-components/ProcessExpressionDialog.vue
- bpmnProcessDesigner/package/penal/task/task-components/ReceiveTask.vue
- bpmnProcessDesigner/package/penal/task/task-components/ScriptTask.vue
- bpmnProcessDesigner/package/penal/task/task-components/ServiceTask.vue
- bpmnProcessDesigner/package/penal/task/task-components/UserTask.vue
- bpmnProcessDesigner/package/penal/time-event-config/CycleConfig.vue
- bpmnProcessDesigner/package/penal/time-event-config/DurationConfig.vue
- bpmnProcessDesigner/package/penal/time-event-config/TimeEventConfig.vue
- bpmnProcessDesigner/package/theme/element-variables.scss
- bpmnProcessDesigner/package/theme/index.scss
- bpmnProcessDesigner/package/theme/process-designer.scss
- bpmnProcessDesigner/package/theme/process-panel.scss
- bpmnProcessDesigner/package/utils.ts（→ bpmnProcessDesigner/package/utils.js）
- bpmnProcessDesigner/src/highlight/index.js
- bpmnProcessDesigner/src/modules/custom-renderer/CustomRenderer.js
- bpmnProcessDesigner/src/modules/custom-renderer/index.js
- bpmnProcessDesigner/src/modules/rules/CustomRules.js
- bpmnProcessDesigner/src/modules/rules/index.js
- bpmnProcessDesigner/src/translations.ts（→ bpmnProcessDesigner/src/translations.js）
- bpmnProcessDesigner/src/utils/directive/clickOutSide.js
- bpmnProcessDesigner/src/utils/index.js
- bpmnProcessDesigner/src/utils/xml2json.js

#### router（1）

- index.ts（→ index.js）

#### store（6）

- index.ts（→ index.js）
- modules/app.ts（→ modules/app.js）
- modules/dict.ts（→ modules/dict.js）
- modules/permission.ts（→ modules/permission.js）
- modules/tagsView.ts（→ modules/tagsView.js）
- modules/user.ts（→ modules/user.js）

#### utils（23）

- Logger.ts（→ Logger.js）
- auth.ts（→ auth.js）
- color.ts（→ color.js）
- constants.ts（→ constants.js）
- cron.ts（→ cron.js）
- dict.ts（→ dict.js）
- domUtils.ts（→ domUtils.js）
- download.ts（→ download.js）
- encrypt.ts（→ encrypt.js）
- file.ts（→ file.js）
- filt.ts（→ filt.js）
- formCreate.ts（→ formCreate.js）
- formRules.ts（→ formRules.js）
- formatTime.ts（→ formatTime.js）
- formatter.ts（→ formatter.js）
- index.ts（→ index.js）
- is.ts（→ is.js）
- jsencrypt.ts（→ jsencrypt.js）
- page.ts（→ page.js）
- permission.ts（→ permission.js）
- routeParams.ts（→ routeParams.js）
- tree.ts（→ tree.js）
- url.ts（→ url.js）

#### views/Error（2）

- Error/404.vue（→ error/404.vue）
- Error/500.vue（→ error/500.vue）

#### views/Profile（6）

- Profile/Index.vue
- Profile/components/BasicInfo.vue
- Profile/components/ProfileUser.vue
- Profile/components/ResetPwd.vue
- Profile/components/UserAvatar.vue
- Profile/components/UserSocial.vue

#### views/ai（72）

- ai/chat/index/components/conversation/ConversationList.vue
- ai/chat/index/components/conversation/ConversationUpdateForm.vue
- ai/chat/index/components/message/MessageFileUpload.vue
- ai/chat/index/components/message/MessageFiles.vue
- ai/chat/index/components/message/MessageKnowledge.vue
- ai/chat/index/components/message/MessageList.vue
- ai/chat/index/components/message/MessageListEmpty.vue
- ai/chat/index/components/message/MessageLoading.vue
- ai/chat/index/components/message/MessageNewConversation.vue
- ai/chat/index/components/message/MessageReasoning.vue
- ai/chat/index/components/message/MessageWebSearch.vue
- ai/chat/index/components/role/RoleCategoryList.vue
- ai/chat/index/components/role/RoleList.vue
- ai/chat/index/components/role/RoleRepository.vue
- ai/chat/index/index.vue
- ai/chat/manager/ChatConversationList.vue
- ai/chat/manager/ChatMessageList.vue
- ai/chat/manager/index.vue
- ai/image/index/components/ImageCard.vue
- ai/image/index/components/ImageDetail.vue
- ai/image/index/components/ImageList.vue
- ai/image/index/components/common/index.vue
- ai/image/index/components/dall3/index.vue
- ai/image/index/components/midjourney/index.vue
- ai/image/index/components/stableDiffusion/index.vue
- ai/image/index/index.vue
- ai/image/manager/index.vue
- ai/image/square/index.vue
- ai/knowledge/document/form/ProcessStep.vue
- ai/knowledge/document/form/SplitStep.vue
- ai/knowledge/document/form/UploadStep.vue
- ai/knowledge/document/form/index.vue
- ai/knowledge/document/index.vue
- ai/knowledge/knowledge/KnowledgeForm.vue
- ai/knowledge/knowledge/index.vue
- ai/knowledge/knowledge/retrieval/index.vue
- ai/knowledge/segment/KnowledgeSegmentForm.vue
- ai/knowledge/segment/index.vue
- ai/mindmap/index/components/Left.vue
- ai/mindmap/index/components/Right.vue
- ai/mindmap/index/index.vue
- ai/mindmap/manager/index.vue
- ai/model/apiKey/ApiKeyForm.vue
- ai/model/apiKey/index.vue
- ai/model/chatRole/ChatRoleForm.vue
- ai/model/chatRole/index.vue
- ai/model/model/ModelForm.vue
- ai/model/model/index.vue
- ai/model/tool/ToolForm.vue
- ai/model/tool/index.vue
- ai/music/index/index.vue
- ai/music/index/list/audioBar/index.vue
- ai/music/index/list/index.vue
- ai/music/index/list/songCard/index.vue
- ai/music/index/list/songInfo/index.vue
- ai/music/index/list/types.ts（→ ai/music/index/list/types.js）
- ai/music/index/mode/desc.vue
- ai/music/index/mode/index.vue
- ai/music/index/mode/lyric.vue
- ai/music/index/title/index.vue
- ai/music/manager/index.vue
- ai/utils/constants.ts（→ ai/utils/constants.js）
- ai/utils/utils.ts（→ ai/utils/utils.js）
- ai/workflow/form/BasicInfo.vue
- ai/workflow/form/WorkflowDesign.vue
- ai/workflow/form/index.vue
- ai/workflow/index.vue
- ai/write/index/components/Left.vue
- ai/write/index/components/Right.vue
- ai/write/index/components/Tag.vue
- ai/write/index/index.vue
- ai/write/manager/index.vue

#### views/bpm（52）

- bpm/category/CategoryForm.vue
- bpm/category/index.vue
- bpm/form/editor/index.vue
- bpm/form/index.vue
- bpm/group/UserGroupForm.vue
- bpm/group/index.vue
- bpm/model/CategoryDraggableModel.vue
- bpm/model/ModelImportForm.vue
- bpm/model/definition/index.vue
- bpm/model/form/BasicInfo.vue
- bpm/model/form/ExtraSettings.vue
- bpm/model/form/FormDesign.vue
- bpm/model/form/PrintTemplate/Index.vue
- bpm/model/form/PrintTemplate/MentionModal.vue
- bpm/model/form/PrintTemplate/module/elem-to-html.ts（→ bpm/model/form/PrintTemplate/module/elem-to-html.js）
- bpm/model/form/PrintTemplate/module/index.ts（→ bpm/model/form/PrintTemplate/module/index.js）
- bpm/model/form/PrintTemplate/module/menu/ProcessRecordMenu.ts（→ bpm/model/form/PrintTemplate/module/menu/ProcessRecordMenu.js）
- bpm/model/form/PrintTemplate/module/parse-elem-html.ts（→ bpm/model/form/PrintTemplate/module/parse-elem-html.js）
- bpm/model/form/PrintTemplate/module/plugin.ts（→ bpm/model/form/PrintTemplate/module/plugin.js）
- bpm/model/form/PrintTemplate/module/render-elem.ts（→ bpm/model/form/PrintTemplate/module/render-elem.js）
- bpm/model/form/PrintTemplate/module/utils/dom.ts（→ bpm/model/form/PrintTemplate/module/utils/dom.js）
- bpm/model/form/ProcessDesign.vue
- bpm/model/form/editor/index.vue
- bpm/model/form/index.vue
- bpm/model/index.vue
- bpm/oa/leave/create.vue
- bpm/oa/leave/detail.vue
- bpm/oa/leave/index.vue
- bpm/processExpression/ProcessExpressionForm.vue
- bpm/processExpression/index.vue
- bpm/processInstance/create/ProcessDefinitionDetail.vue
- bpm/processInstance/create/index.vue
- bpm/processInstance/detail/PrintDialog.vue
- bpm/processInstance/detail/ProcessInstanceBpmnViewer.vue
- bpm/processInstance/detail/ProcessInstanceCommentList.vue
- bpm/processInstance/detail/ProcessInstanceOperationButton.vue
- bpm/processInstance/detail/ProcessInstanceSimpleViewer.vue
- bpm/processInstance/detail/ProcessInstanceTaskList.vue
- bpm/processInstance/detail/ProcessInstanceTimeline.vue
- bpm/processInstance/detail/SignDialog.vue
- bpm/processInstance/detail/index.vue
- bpm/processInstance/index.vue
- bpm/processInstance/manager/index.vue
- bpm/processInstance/report/index.vue
- bpm/processListener/ProcessListenerForm.vue
- bpm/processListener/index.vue
- bpm/simple/SimpleModelDesign.vue
- bpm/task/components/TaskEvidenceCell.vue
- bpm/task/copy/index.vue
- bpm/task/done/index.vue
- bpm/task/manager/index.vue
- bpm/task/todo/index.vue

#### views/crm（119）

- crm/backlog/components/ClueFollowList.vue
- crm/backlog/components/ContractAuditList.vue
- crm/backlog/components/ContractRemindList.vue
- crm/backlog/components/CustomerFollowList.vue
- crm/backlog/components/CustomerPutPoolRemindList.vue
- crm/backlog/components/CustomerTodayContactList.vue
- crm/backlog/components/ReceivableAuditList.vue
- crm/backlog/components/ReceivablePlanRemindList.vue
- crm/backlog/components/common.ts（→ crm/backlog/components/common.js）
- crm/backlog/index.vue
- crm/business/BusinessForm.vue
- crm/business/BusinessUpdateStatusForm.vue
- crm/business/components/BusinessList.vue
- crm/business/components/BusinessListModal.vue
- crm/business/components/BusinessProductForm.vue
- crm/business/detail/BusinessDetailsHeader.vue
- crm/business/detail/BusinessDetailsInfo.vue
- crm/business/detail/BusinessProductList.vue
- crm/business/detail/index.vue
- crm/business/index.vue
- crm/business/status/BusinessStatusForm.vue
- crm/business/status/index.vue
- crm/clue/ClueForm.vue
- crm/clue/detail/ClueDetailsHeader.vue
- crm/clue/detail/ClueDetailsInfo.vue
- crm/clue/detail/index.vue
- crm/clue/index.vue
- crm/contact/ContactForm.vue
- crm/contact/components/ContactList.vue
- crm/contact/components/ContactListModal.vue
- crm/contact/detail/ContactDetailsHeader.vue
- crm/contact/detail/ContactDetailsInfo.vue
- crm/contact/detail/index.vue
- crm/contact/index.vue
- crm/contract/ContractForm.vue
- crm/contract/components/ContractList.vue
- crm/contract/components/ContractProductForm.vue
- crm/contract/config/index.vue
- crm/contract/detail/ContractDetailsHeader.vue
- crm/contract/detail/ContractDetailsInfo.vue
- crm/contract/detail/ContractProductList.vue
- crm/contract/detail/index.vue
- crm/contract/index.vue
- crm/customer/CustomerForm.vue
- crm/customer/CustomerImportForm.vue
- crm/customer/detail/CustomerDetailsHeader.vue
- crm/customer/detail/CustomerDetailsInfo.vue
- crm/customer/detail/index.vue
- crm/customer/index.vue
- crm/customer/limitConfig/CustomerLimitConfigForm.vue
- crm/customer/limitConfig/CustomerLimitConfigList.vue
- crm/customer/limitConfig/index.vue
- crm/customer/pool/CustomerDistributeForm.vue
- crm/customer/pool/index.vue
- crm/customer/poolConfig/index.vue
- crm/followup/FollowUpRecordForm.vue
- crm/followup/components/FollowUpRecordBusinessForm.vue
- crm/followup/components/FollowUpRecordContactForm.vue
- crm/followup/index.vue
- crm/performance/config/PerformanceConfigForm.vue
- crm/performance/config/index.vue
- crm/permission/components/PermissionForm.vue
- crm/permission/components/PermissionList.vue
- crm/permission/components/TransferForm.vue
- crm/product/ProductForm.vue
- crm/product/category/ProductCategoryForm.vue
- crm/product/category/index.vue
- crm/product/detail/ProductDetailsHeader.vue
- crm/product/detail/ProductDetailsInfo.vue
- crm/product/detail/index.vue
- crm/product/index.vue
- crm/receivable/ReceivableForm.vue
- crm/receivable/components/ReceivableList.vue
- crm/receivable/detail/ReceivableDetailsHeader.vue
- crm/receivable/detail/ReceivableDetailsInfo.vue
- crm/receivable/detail/index.vue
- crm/receivable/index.vue
- crm/receivable/plan/ReceivablePlanForm.vue
- crm/receivable/plan/components/ReceivablePlanList.vue
- crm/receivable/plan/detail/ReceivablePlanDetailsHeader.vue
- crm/receivable/plan/detail/ReceivablePlanDetailsInfo.vue
- crm/receivable/plan/detail/index.vue
- crm/receivable/plan/index.vue
- crm/statistics/customer/components/CustomerConversionStat.vue
- crm/statistics/customer/components/CustomerDealCycleByArea.vue
- crm/statistics/customer/components/CustomerDealCycleByProduct.vue
- crm/statistics/customer/components/CustomerDealCycleByUser.vue
- crm/statistics/customer/components/CustomerFollowUpSummary.vue
- crm/statistics/customer/components/CustomerFollowUpType.vue
- crm/statistics/customer/components/CustomerPoolSummary.vue
- crm/statistics/customer/components/CustomerSummary.vue
- crm/statistics/customer/index.vue
- crm/statistics/funnel/components/BusinessInversionRateSummary.vue
- crm/statistics/funnel/components/BusinessSummary.vue
- crm/statistics/funnel/components/FunnelBusiness.vue
- crm/statistics/funnel/index.vue
- crm/statistics/performance/components/ContractCountPerformance.vue
- crm/statistics/performance/components/ContractPricePerformance.vue
- crm/statistics/performance/components/ContractSummary.vue
- crm/statistics/performance/components/ReceivablePricePerformance.vue
- crm/statistics/performance/index.vue
- crm/statistics/performanceTarget/index.vue
- crm/statistics/portrait/components/PortraitCustomerArea.vue
- crm/statistics/portrait/components/PortraitCustomerIndustry.vue
- crm/statistics/portrait/components/PortraitCustomerLevel.vue
- crm/statistics/portrait/components/PortraitCustomerSource.vue
- crm/statistics/portrait/index.vue
- crm/statistics/product/components/ProductCategorySummary.vue
- crm/statistics/product/components/ProductSalesList.vue
- crm/statistics/product/index.vue
- crm/statistics/rank/components/ContactCountRank.vue
- crm/statistics/rank/components/ContractCountRank.vue
- crm/statistics/rank/components/ContractPriceRank.vue
- crm/statistics/rank/components/CustomerCountRank.vue
- crm/statistics/rank/components/FollowCountRank.vue
- crm/statistics/rank/components/FollowCustomerCountRank.vue
- crm/statistics/rank/components/ProductSalesRank.vue
- crm/statistics/rank/components/ReceivablePriceRank.vue
- crm/statistics/rank/index.vue

#### views/erp（63）

- erp/finance/account/AccountForm.vue
- erp/finance/account/index.vue
- erp/finance/payment/FinancePaymentForm.vue
- erp/finance/payment/components/FinancePaymentItemForm.vue
- erp/finance/payment/index.vue
- erp/finance/receipt/FinanceReceiptForm.vue
- erp/finance/receipt/components/FinanceReceiptItemForm.vue
- erp/finance/receipt/index.vue
- erp/home/components/SummaryCard.vue
- erp/home/components/TimeSummaryChart.vue
- erp/home/index.vue
- erp/product/category/ProductCategoryForm.vue
- erp/product/category/index.vue
- erp/product/product/ProductForm.vue
- erp/product/product/index.vue
- erp/product/unit/ProductUnitForm.vue
- erp/product/unit/index.vue
- erp/purchase/in/PurchaseInForm.vue
- erp/purchase/in/components/PurchaseInItemForm.vue
- erp/purchase/in/components/PurchaseInPaymentEnableList.vue
- erp/purchase/in/index.vue
- erp/purchase/order/PurchaseOrderForm.vue
- erp/purchase/order/components/PurchaseOrderInEnableList.vue
- erp/purchase/order/components/PurchaseOrderItemForm.vue
- erp/purchase/order/components/PurchaseOrderReturnEnableList.vue
- erp/purchase/order/index.vue
- erp/purchase/return/PurchaseReturnForm.vue
- erp/purchase/return/components/PurchaseReturnItemForm.vue
- erp/purchase/return/components/PurchaseReturnRefundEnableList.vue
- erp/purchase/return/index.vue
- erp/purchase/supplier/SupplierForm.vue
- erp/purchase/supplier/index.vue
- erp/sale/customer/CustomerForm.vue
- erp/sale/customer/index.vue
- erp/sale/order/SaleOrderForm.vue
- erp/sale/order/components/SaleOrderItemForm.vue
- erp/sale/order/components/SaleOrderOutEnableList.vue
- erp/sale/order/components/SaleOrderReturnEnableList.vue
- erp/sale/order/index.vue
- erp/sale/out/SaleOutForm.vue
- erp/sale/out/components/SaleOutItemForm.vue
- erp/sale/out/components/SaleOutReceiptEnableList.vue
- erp/sale/out/index.vue
- erp/sale/return/SaleReturnForm.vue
- erp/sale/return/components/SaleReturnItemForm.vue
- erp/sale/return/components/SaleReturnRefundEnableList.vue
- erp/sale/return/index.vue
- erp/stock/check/StockCheckForm.vue
- erp/stock/check/components/StockCheckItemForm.vue
- erp/stock/check/index.vue
- erp/stock/in/StockInForm.vue
- erp/stock/in/components/StockInItemForm.vue
- erp/stock/in/index.vue
- erp/stock/move/StockMoveForm.vue
- erp/stock/move/components/StockMoveItemForm.vue
- erp/stock/move/index.vue
- erp/stock/out/StockOutForm.vue
- erp/stock/out/components/StockOutItemForm.vue
- erp/stock/out/index.vue
- erp/stock/record/index.vue
- erp/stock/stock/index.vue
- erp/stock/warehouse/WarehouseForm.vue
- erp/stock/warehouse/index.vue

#### views/fms（85）

- fms/closing/ClosingSchemeCard.vue
- fms/closing/ClosingSchemeForm.vue
- fms/closing/ClosingSchemeList.vue
- fms/closing/ClosingStatusCard.vue
- fms/closing/ClosingTemplateForm.vue
- fms/closing/ClosingTemplateSelect.vue
- fms/closing/ProfitLossSettingsForm.vue
- fms/closing/SpecialClosingSettingsForm.vue
- fms/closing/index.vue
- fms/components/account-set/FmsAccountSetGuide.vue
- fms/components/account-set/FmsAccountSetSwitch.vue
- fms/components/print/FmsPrintPreview.vue
- fms/config/account-set/FmsAccountSetForm.vue
- fms/config/account-set/FmsAccountSetInitializeForm.vue
- fms/config/account-set/FmsAccountSetMemberForm.vue
- fms/config/account-set/index.vue
- fms/config/auxiliary/FmsAuxiliaryItemPanel.vue
- fms/config/auxiliary/FmsAuxiliaryTypeForm.vue
- fms/config/auxiliary/components/FmsAuxiliaryItemSelect.vue
- fms/config/auxiliary/components/FmsAuxiliaryTypeSelect.vue
- fms/config/auxiliary/index.vue
- fms/config/auxiliary/item/FmsAuxiliaryItemForm.vue
- fms/config/auxiliary/item/FmsAuxiliaryItemImportForm.vue
- fms/config/currency/FmsCurrencyForm.vue
- fms/config/currency/components/FmsCurrencySelect.vue
- fms/config/currency/index.vue
- fms/config/digest/FmsDigestForm.vue
- fms/config/digest/components/FmsDigestLibrary.vue
- fms/config/digest/index.vue
- fms/config/finance-indicator/FmsFinanceIndicatorForm.vue
- fms/config/finance-indicator/index.vue
- fms/config/finance-parameter/index.vue
- fms/config/initial-balance/FmsInitialAssistForm.vue
- fms/config/initial-balance/FmsInitialBalanceImportForm.vue
- fms/config/initial-balance/FmsTrialBalanceDialog.vue
- fms/config/initial-balance/index.vue
- fms/config/subject/FmsSubjectForm.vue
- fms/config/subject/FmsSubjectImportForm.vue
- fms/config/subject/components/FmsSubjectSelect.vue
- fms/config/subject/index.vue
- fms/config/voucher-template/FmsVoucherTemplateCategoryForm.vue
- fms/config/voucher-template/components/FmsVoucherTemplateCategoryManage.vue
- fms/config/voucher-template/components/FmsVoucherTemplateCategorySelect.vue
- fms/config/voucher-template/components/FmsVoucherTemplateSaveForm.vue
- fms/config/voucher-template/components/FmsVoucherTemplateSelect.vue
- fms/config/voucher-template/index.vue
- fms/config/voucher-word/FmsVoucherWordForm.vue
- fms/config/voucher-word/components/FmsVoucherWordSelect.vue
- fms/config/voucher-word/index.vue
- fms/home/components/FmsHomeMetricCards.vue
- fms/home/components/FmsHomeMetricCharts.vue
- fms/home/components/FmsHomeShortcuts.vue
- fms/home/index.vue
- fms/ledger/auxiliary-balance/index.vue
- fms/ledger/auxiliary-detail/index.vue
- fms/ledger/components/FmsLedgerMonthRangePicker.vue
- fms/ledger/components/FmsLedgerPrintButton.vue
- fms/ledger/components/FmsLedgerSearchBar.vue
- fms/ledger/detail/index.vue
- fms/ledger/general/index.vue
- fms/ledger/multi-column/index.vue
- fms/ledger/quantity-detail/index.vue
- fms/ledger/quantity-general/index.vue
- fms/ledger/subject-balance/index.vue
- fms/report/balance-sheet/index.vue
- fms/report/cash-flow-statement/index.vue
- fms/report/components/FmsReportCheckAlert.vue
- fms/report/components/FmsReportFormulaForm.vue
- fms/report/components/FmsReportPeriodBar.vue
- fms/report/components/FmsReportPrintButton.vue
- fms/report/income-statement/index.vue
- fms/store/fms.ts（→ fms/store/fms.js）
- fms/utils/constants.ts（→ fms/utils/constants.js）
- fms/utils/format.ts（→ fms/utils/format.js）
- fms/utils/print.ts（→ fms/utils/print.js）
- fms/voucher/components/FmsVoucherPrintForm.vue
- fms/voucher/components/print.ts（→ fms/voucher/components/print.js）
- fms/voucher/create/FmsVoucherShortcutHelp.vue
- fms/voucher/create/index.vue
- fms/voucher/list/FmsVoucherAttachmentForm.vue
- fms/voucher/list/FmsVoucherImportForm.vue
- fms/voucher/list/FmsVoucherMoveForm.vue
- fms/voucher/list/FmsVoucherTidyForm.vue
- fms/voucher/list/index.vue
- fms/voucher/statistics/index.vue

#### views/hrm（203）

- hrm/attendance/clock/AttendanceClockDailyDetail.vue
- hrm/attendance/clock/AttendanceClockForm.vue
- hrm/attendance/clock/AttendanceClockOverview.vue
- hrm/attendance/clock/AttendanceClockRecordList.vue
- hrm/attendance/clock/index.vue
- hrm/attendance/config/group/AttendanceGroupForm.vue
- hrm/attendance/config/group/AttendanceGroupPointForm.vue
- hrm/attendance/config/group/AttendanceGroupShiftForm.vue
- hrm/attendance/config/group/AttendanceGroupSpecialDateForm.vue
- hrm/attendance/config/group/AttendanceGroupWifiForm.vue
- hrm/attendance/config/group/index.vue
- hrm/attendance/config/holiday/AttendanceHolidayForm.vue
- hrm/attendance/config/holiday/index.vue
- hrm/attendance/leave/AttendanceLeaveProcessDetail.vue
- hrm/attendance/leave/index.vue
- hrm/attendance/month/detail/index.vue
- hrm/attendance/month/index.vue
- hrm/dept/detail/DeptDetailsHeader.vue
- hrm/dept/detail/DeptDetailsInfo.vue
- hrm/dept/detail/DeptEmployeeList.vue
- hrm/dept/detail/index.vue
- hrm/dept/index.vue
- hrm/employee/EmployeeCreateFromUserForm.vue
- hrm/employee/EmployeeDemoteForm.vue
- hrm/employee/EmployeeForm.vue
- hrm/employee/EmployeeFullTimeForm.vue
- hrm/employee/EmployeeImportForm.vue
- hrm/employee/EmployeeInsuranceSchemeForm.vue
- hrm/employee/EmployeePositionChangeForm.vue
- hrm/employee/EmployeePromoteForm.vue
- hrm/employee/EmployeeQuitForm.vue
- hrm/employee/EmployeeRegularForm.vue
- hrm/employee/EmployeeTransferForm.vue
- hrm/employee/components/HrmEmployeeSelect.vue
- hrm/employee/components/HrmEmployeeSelectDialog.vue
- hrm/employee/config/EmployeeArchiveFieldConfig.vue
- hrm/employee/config/EmployeeCreateFieldConfig.vue
- hrm/employee/config/index.vue
- hrm/employee/detail/EmployeeBasicInfo.vue
- hrm/employee/detail/EmployeeCertificateForm.vue
- hrm/employee/detail/EmployeeCertificateList.vue
- hrm/employee/detail/EmployeeChangeRecordList.vue
- hrm/employee/detail/EmployeeContactForm.vue
- hrm/employee/detail/EmployeeContactList.vue
- hrm/employee/detail/EmployeeContractForm.vue
- hrm/employee/detail/EmployeeContractList.vue
- hrm/employee/detail/EmployeeDetailsHeader.vue
- hrm/employee/detail/EmployeeDetailsInfo.vue
- hrm/employee/detail/EmployeeEducationExperienceForm.vue
- hrm/employee/detail/EmployeeEducationExperienceList.vue
- hrm/employee/detail/EmployeeInsuranceInfo.vue
- hrm/employee/detail/EmployeeInsuranceInfoForm.vue
- hrm/employee/detail/EmployeeMaterialFiles.vue
- hrm/employee/detail/EmployeePostInfo.vue
- hrm/employee/detail/EmployeeQuitInfo.vue
- hrm/employee/detail/EmployeeSalaryCardForm.vue
- hrm/employee/detail/EmployeeSalaryCardInfo.vue
- hrm/employee/detail/EmployeeSalaryChangeRecordList.vue
- hrm/employee/detail/EmployeeSalaryHistoryList.vue
- hrm/employee/detail/EmployeeSalaryInfo.vue
- hrm/employee/detail/EmployeeSalarySocialSecurity.vue
- hrm/employee/detail/EmployeeTrainingExperienceForm.vue
- hrm/employee/detail/EmployeeTrainingExperienceList.vue
- hrm/employee/detail/EmployeeWorkExperienceForm.vue
- hrm/employee/detail/EmployeeWorkExperienceList.vue
- hrm/employee/detail/index.vue
- hrm/employee/index.vue
- hrm/home/components/HrmHomeCalendar.vue
- hrm/home/components/HrmHomeEmployeeSurvey.vue
- hrm/home/components/HrmHomeRecruitSurvey.vue
- hrm/home/components/HrmHomeSalarySurvey.vue
- hrm/home/components/HrmHomeTodoSurvey.vue
- hrm/home/components/PersonalNoteForm.vue
- hrm/home/hr/index.vue
- hrm/home/team/components/HrmTeamOverview.vue
- hrm/home/team/components/HrmTeamSurvey.vue
- hrm/home/team/index.vue
- hrm/insurance/month-record/InsuranceFirstMonthForm.vue
- hrm/insurance/month-record/detail/InsuranceAddEmployeeForm.vue
- hrm/insurance/month-record/detail/InsuranceBatchEmployeeRecordForm.vue
- hrm/insurance/month-record/detail/InsuranceEmployeeRecordForm.vue
- hrm/insurance/month-record/detail/InsuranceMonthEmployeeDetail.vue
- hrm/insurance/month-record/detail/index.vue
- hrm/insurance/month-record/index.vue
- hrm/insurance/scheme/InsuranceSchemeForm.vue
- hrm/insurance/scheme/components/InsuranceSchemeSelect.vue
- hrm/insurance/scheme/index.vue
- hrm/performance/assessment/components/PerformanceProcessRecordTimeline.vue
- hrm/performance/assessment/detail/index.vue
- hrm/performance/assessment/employee/index.vue
- hrm/performance/assessment/index.vue
- hrm/performance/components/HrmPerformanceRaterLevelSelect.vue
- hrm/performance/config/assessment-template/PerformanceAssessmentDimensionForm.vue
- hrm/performance/config/assessment-template/PerformanceAssessmentTemplateForm.vue
- hrm/performance/config/assessment-template/components/PerformanceAssessmentConfigEditor.vue
- hrm/performance/config/assessment-template/components/PerformanceAssessmentTemplateSelect.vue
- hrm/performance/config/assessment-template/index.vue
- hrm/performance/config/result-template/PerformanceResultTemplateForm.vue
- hrm/performance/config/result-template/components/PerformanceResultLevelForm.vue
- hrm/performance/config/result-template/index.vue
- hrm/performance/plan/PerformancePlanAssessmentAddForm.vue
- hrm/performance/plan/detail/PerformancePlanDetailsHeader.vue
- hrm/performance/plan/detail/PerformancePlanDetailsInfo.vue
- hrm/performance/plan/detail/index.vue
- hrm/performance/plan/form/PerformancePlanBasicForm.vue
- hrm/performance/plan/form/PerformancePlanHandlerStageForm.vue
- hrm/performance/plan/form/PerformancePlanIndicatorForm.vue
- hrm/performance/plan/form/PerformancePlanProcessForm.vue
- hrm/performance/plan/form/PerformancePlanResultForm.vue
- hrm/performance/plan/form/PerformancePlanScopeForm.vue
- hrm/performance/plan/form/index.vue
- hrm/performance/plan/index.vue
- hrm/portal/attendance/leave/AttendanceLeaveForm.vue
- hrm/portal/attendance/report/AttendanceCalendar.vue
- hrm/portal/attendance/report/AttendanceLeaveList.vue
- hrm/portal/attendance/report/index.vue
- hrm/portal/employee/EmployeeBaseInfo.vue
- hrm/portal/employee/EmployeeForm.vue
- hrm/portal/employee/EmployeePostInfo.vue
- hrm/portal/employee/index.vue
- hrm/portal/home/EmployeeSurvey.vue
- hrm/portal/home/index.vue
- hrm/portal/insurance/record/InsuranceRecordDetail.vue
- hrm/portal/insurance/record/index.vue
- hrm/portal/opening-guide/index.vue
- hrm/portal/performance/assessment/PerformanceTaskTable.vue
- hrm/portal/performance/assessment/PerformanceTaskTabs.vue
- hrm/portal/performance/assessment/detail/index.vue
- hrm/portal/performance/assessment/history/index.vue
- hrm/portal/performance/assessment/index.vue
- hrm/portal/performance/assessment/process/PerformanceAppealForm.vue
- hrm/portal/performance/assessment/process/PerformanceHandleForm.vue
- hrm/portal/performance/assessment/process/PerformanceTargetConfirmForm.vue
- hrm/portal/performance/assessment/review/PerformanceQuotaForm.vue
- hrm/portal/performance/assessment/review/PerformanceReviewForm.vue
- hrm/portal/salary/slip/index.vue
- hrm/recruit/candidate/RecruitCandidateChannelListForm.vue
- hrm/recruit/candidate/RecruitCandidateCleanForm.vue
- hrm/recruit/candidate/RecruitCandidateEliminateForm.vue
- hrm/recruit/candidate/RecruitCandidateForm.vue
- hrm/recruit/candidate/RecruitCandidatePostListForm.vue
- hrm/recruit/candidate/RecruitCandidateStatusListForm.vue
- hrm/recruit/candidate/RecruitInterviewForm.vue
- hrm/recruit/candidate/RecruitInterviewResultForm.vue
- hrm/recruit/candidate/detail/RecruitCandidateDetailsHeader.vue
- hrm/recruit/candidate/detail/RecruitCandidateDetailsInfo.vue
- hrm/recruit/candidate/detail/RecruitCandidateInterviewList.vue
- hrm/recruit/candidate/detail/RecruitCandidateMaterialFiles.vue
- hrm/recruit/candidate/detail/index.vue
- hrm/recruit/candidate/index.vue
- hrm/recruit/channel/RecruitChannelDeleteForm.vue
- hrm/recruit/channel/RecruitChannelForm.vue
- hrm/recruit/channel/components/RecruitChannelSelect.vue
- hrm/recruit/channel/index.vue
- hrm/recruit/post/RecruitPostForm.vue
- hrm/recruit/post/components/RecruitPostSelect.vue
- hrm/recruit/post/detail/RecruitPostDetailsHeader.vue
- hrm/recruit/post/detail/RecruitPostDetailsInfo.vue
- hrm/recruit/post/detail/index.vue
- hrm/recruit/post/index.vue
- hrm/recruit/setting/eliminate/components/RecruitEliminateReasonSelect.vue
- hrm/recruit/setting/eliminate/index.vue
- hrm/salary/config/change-template/SalaryChangeTemplateForm.vue
- hrm/salary/config/change-template/components/SalaryChangeTemplateSelect.vue
- hrm/salary/config/change-template/index.vue
- hrm/salary/config/config/index.vue
- hrm/salary/config/group/SalaryGroupForm.vue
- hrm/salary/config/group/index.vue
- hrm/salary/config/option/SalaryOptionForm.vue
- hrm/salary/config/option/components/SalaryChangeOptionSelect.vue
- hrm/salary/config/option/components/SalaryOptionSelect.vue
- hrm/salary/config/option/index.vue
- hrm/salary/config/tax-rule/SalaryTaxRuleForm.vue
- hrm/salary/config/tax-rule/components/SalaryTaxRuleSelect.vue
- hrm/salary/config/tax-rule/index.vue
- hrm/salary/employee-info/SalaryEmployeeInfoBatchForm.vue
- hrm/salary/employee-info/SalaryEmployeeInfoForm.vue
- hrm/salary/employee-info/SalaryEmployeeInfoImportForm.vue
- hrm/salary/employee-info/detail/SalaryChangeRecordList.vue
- hrm/salary/employee-info/detail/SalaryEmployeeInfoDetails.vue
- hrm/salary/employee-info/detail/index.vue
- hrm/salary/employee-info/index.vue
- hrm/salary/month-record/SalaryBatchEmployeeRecordForm.vue
- hrm/salary/month-record/SalaryMonthComputeForm.vue
- hrm/salary/month-record/SalaryPayrollReadinessAlert.vue
- hrm/salary/month-record/SalaryPayrollReadinessEmployeeList.vue
- hrm/salary/month-record/detail/SalaryMonthEmployeeRecordList.vue
- hrm/salary/month-record/detail/SalaryMonthRecordDetailsInfo.vue
- hrm/salary/month-record/detail/index.vue
- hrm/salary/month-record/history/index.vue
- hrm/salary/month-record/index.vue
- hrm/salary/slip/send-record/SalarySlipSendForm.vue
- hrm/salary/slip/send-record/detail/SalarySlipDetail.vue
- hrm/salary/slip/send-record/detail/SalarySlipList.vue
- hrm/salary/slip/send-record/detail/index.vue
- hrm/salary/slip/send-record/index.vue
- hrm/salary/slip/template/SalarySlipTemplateForm.vue
- hrm/salary/slip/template/SalarySlipTemplateOptionEditor.vue
- hrm/utils/batch.ts（→ hrm/utils/batch.js）
- hrm/utils/constants.ts（→ hrm/utils/constants.js）
- hrm/utils/employee.ts（→ hrm/utils/employee.js）
- hrm/utils/format.ts（→ hrm/utils/format.js）
- hrm/utils/performance.ts（→ hrm/utils/performance.js）

#### views/im（139）

- im/home/components/ContextMenu.vue
- im/home/components/PagedScroller.vue
- im/home/components/ResizableAside.vue
- im/home/components/ToolBar.vue
- im/home/components/card/CardBubble.vue
- im/home/components/card/CardLineLabel.vue
- im/home/components/friend/FriendAddDialog.vue
- im/home/components/friend/FriendItem.vue
- im/home/components/group/GroupAdminSetDialog.vue
- im/home/components/group/GroupAvatar.vue
- im/home/components/group/GroupCreateDialog.vue
- im/home/components/group/GroupInfo.vue
- im/home/components/group/GroupInfoCard.vue
- im/home/components/group/GroupItem.vue
- im/home/components/group/GroupMember.vue
- im/home/components/group/GroupMemberAddDialog.vue
- im/home/components/group/GroupMemberGrid.vue
- im/home/components/group/GroupMemberItem.vue
- im/home/components/group/GroupMemberRemoveDialog.vue
- im/home/components/group/GroupMuteMemberDialog.vue
- im/home/components/group/GroupOwnerTransferDialog.vue
- im/home/components/group/GroupRequestListDialog.vue
- im/home/components/picker/ConversationPickerPanel.vue
- im/home/components/picker/FriendPickerPanel.vue
- im/home/components/picker/GroupMemberPickerPanel.vue
- im/home/components/picker/picker-dialog.scss
- im/home/components/rtc/RtcCallContainer.vue
- im/home/components/rtc/RtcCallIncoming.vue
- im/home/components/rtc/RtcCallInviting.vue
- im/home/components/rtc/RtcCallMemberPickerDialog.vue
- im/home/components/rtc/RtcCallParticipantTile.vue
- im/home/components/rtc/RtcCallRunning.vue
- im/home/components/rtc/RtcGroupCallBanner.vue
- im/home/components/user/RecommendCardDialog.vue
- im/home/components/user/UserAvatar.vue
- im/home/components/user/UserInfo.vue
- im/home/components/user/UserInfoCard.vue
- im/home/composables/useFriendBuckets.ts（→ im/home/composables/useFriendBuckets.js）
- im/home/composables/useGroupCallMembers.ts（→ im/home/composables/useGroupCallMembers.js）
- im/home/composables/useLiveKitRoom.ts（→ im/home/composables/useLiveKitRoom.js）
- im/home/composables/useMediaStreamElement.ts（→ im/home/composables/useMediaStreamElement.js）
- im/home/composables/useMediaUploader.ts（→ im/home/composables/useMediaUploader.js）
- im/home/composables/useMessageMultiSelect.ts（→ im/home/composables/useMessageMultiSelect.js）
- im/home/composables/useMessagePuller.ts（→ im/home/composables/useMessagePuller.js）
- im/home/composables/useMessageSender.ts（→ im/home/composables/useMessageSender.js）
- im/home/composables/useMuteOverlay.ts（→ im/home/composables/useMuteOverlay.js）
- im/home/composables/useSelectedItems.ts（→ im/home/composables/useSelectedItems.js）
- im/home/composables/useVoicePlayer.ts（→ im/home/composables/useVoicePlayer.js）
- im/home/index.vue
- im/home/pages/contact/FriendList.vue
- im/home/pages/contact/FriendRequestDetail.vue
- im/home/pages/contact/FriendRequestList.vue
- im/home/pages/contact/GroupDetail.vue
- im/home/pages/contact/GroupList.vue
- im/home/pages/contact/index.vue
- im/home/pages/conversation/components/conversation/ConversationGroupSide.vue
- im/home/pages/conversation/components/conversation/ConversationItem.vue
- im/home/pages/conversation/components/conversation/ConversationPrivateSide.vue
- im/home/pages/conversation/components/input/FacePicker.vue
- im/home/pages/conversation/components/input/MentionPicker.vue
- im/home/pages/conversation/components/input/MessageInput.vue
- im/home/pages/conversation/components/input/MessageMultiSelectBar.vue
- im/home/pages/conversation/components/input/VoiceRecorder.vue
- im/home/pages/conversation/components/message/GroupPinnedMessage.vue
- im/home/pages/conversation/components/message/GroupRequestPending.vue
- im/home/pages/conversation/components/message/MaterialBubble.vue
- im/home/pages/conversation/components/message/MessageBubble.vue
- im/home/pages/conversation/components/message/MessageHistory.vue
- im/home/pages/conversation/components/message/MessageItem.vue
- im/home/pages/conversation/components/message/MessagePanel.vue
- im/home/pages/conversation/components/message/MessageReadStatus.vue
- im/home/pages/conversation/components/message/ReplyPreview.vue
- im/home/pages/conversation/components/message/TipSegments.vue
- im/home/pages/conversation/components/message/forward/MessageForwardDialog.vue
- im/home/pages/conversation/components/message/forward/MessageMergeDetailDialog.vue
- im/home/pages/conversation/components/message/forward/keys.ts（→ im/home/pages/conversation/components/message/forward/keys.js）
- im/home/pages/conversation/index.vue
- im/home/store/channelStore.ts（→ im/home/store/channelStore.js）
- im/home/store/conversationStore.ts（→ im/home/store/conversationStore.js）
- im/home/store/faceStore.ts（→ im/home/store/faceStore.js）
- im/home/store/friendStore.ts（→ im/home/store/friendStore.js）
- im/home/store/groupRequestStore.ts（→ im/home/store/groupRequestStore.js）
- im/home/store/groupStore.ts（→ im/home/store/groupStore.js）
- im/home/store/messageStore.ts（→ im/home/store/messageStore.js）
- im/home/store/rtcStore.ts（→ im/home/store/rtcStore.js）
- im/home/store/uiStore.ts（→ im/home/store/uiStore.js）
- im/home/store/websocketStore.ts（→ im/home/store/websocketStore.js）
- im/home/types/index.ts（→ im/home/types/index.js）
- im/manager/channel/list/ChannelForm.vue
- im/manager/channel/list/components/ChannelSelect.vue
- im/manager/channel/list/index.vue
- im/manager/channel/material/ChannelMaterialForm.vue
- im/manager/channel/material/components/MaterialSelect.vue
- im/manager/channel/material/index.vue
- im/manager/channel/message/ChannelMessageSendForm.vue
- im/manager/channel/message/index.vue
- im/manager/face/pack/FacePackForm.vue
- im/manager/face/pack/FacePackItemDrawer.vue
- im/manager/face/pack/FacePackItemForm.vue
- im/manager/face/pack/index.vue
- im/manager/face/userItem/index.vue
- im/manager/friend/index.vue
- im/manager/friend/request/index.vue
- im/manager/group/GroupBanForm.vue
- im/manager/group/GroupDetail.vue
- im/manager/group/components/GroupSelect.vue
- im/manager/group/components/GroupSelectDialog.vue
- im/manager/group/index.vue
- im/manager/group/request/index.vue
- im/manager/message/MessageContentPreview.vue
- im/manager/message/group/GroupMessageDetail.vue
- im/manager/message/group/index.vue
- im/manager/message/private/PrivateMessageDetail.vue
- im/manager/message/private/index.vue
- im/manager/rtc/RtcCallDetail.vue
- im/manager/rtc/index.vue
- im/manager/sensitiveword/SensitiveWordForm.vue
- im/manager/sensitiveword/index.vue
- im/manager/statistics/components/GroupSizeChart.vue
- im/manager/statistics/components/MessageTrendChart.vue
- im/manager/statistics/components/MessageTypeChart.vue
- im/manager/statistics/components/OverviewCards.vue
- im/manager/statistics/components/TopSendersChart.vue
- im/manager/statistics/components/UserTrendChart.vue
- im/manager/statistics/index.vue
- im/utils/channel.ts（→ im/utils/channel.js）
- im/utils/config.ts（→ im/utils/config.js）
- im/utils/constants.ts（→ im/utils/constants.js）
- im/utils/conversation.ts（→ im/utils/conversation.js）
- im/utils/db.ts（→ im/utils/db.js）
- im/utils/emoji.ts（→ im/utils/emoji.js）
- im/utils/group.ts（→ im/utils/group.js）
- im/utils/image.ts（→ im/utils/image.js）
- im/utils/message.ts（→ im/utils/message.js）
- im/utils/messageSync.ts（→ im/utils/messageSync.js）
- im/utils/pull.ts（→ im/utils/pull.js）
- im/utils/resourceRequest.ts（→ im/utils/resourceRequest.js）
- im/utils/time.ts（→ im/utils/time.js）
- im/utils/user.ts（→ im/utils/user.js）

#### views/infra（52）

- infra/apiAccessLog/ApiAccessLogDetail.vue
- infra/apiAccessLog/index.vue
- infra/apiErrorLog/ApiErrorLogDetail.vue
- infra/apiErrorLog/index.vue
- infra/build/index.vue
- infra/codegen/EditTable.vue（→ infra/codegen/editTable.vue）
- infra/codegen/ImportTable.vue（→ infra/codegen/importTable.vue）
- infra/codegen/PreviewCode.vue
- infra/codegen/components/BasicInfoForm.vue
- infra/codegen/components/ColumInfoForm.vue
- infra/codegen/components/GenerateInfoForm.vue
- infra/codegen/components/index.ts（→ infra/codegen/components/index.js）
- infra/codegen/index.vue
- infra/config/ConfigForm.vue
- infra/config/index.vue
- infra/dataSourceConfig/DataSourceConfigForm.vue
- infra/dataSourceConfig/index.vue
- infra/demo/demo01/Demo01ContactForm.vue
- infra/demo/demo01/index.vue
- infra/demo/demo02/Demo02CategoryForm.vue
- infra/demo/demo02/index.vue
- infra/demo/demo03/erp/Demo03StudentForm.vue
- infra/demo/demo03/erp/components/Demo03CourseForm.vue
- infra/demo/demo03/erp/components/Demo03CourseList.vue
- infra/demo/demo03/erp/components/Demo03GradeForm.vue
- infra/demo/demo03/erp/components/Demo03GradeList.vue
- infra/demo/demo03/erp/index.vue
- infra/demo/demo03/inner/Demo03StudentForm.vue
- infra/demo/demo03/inner/components/Demo03CourseForm.vue
- infra/demo/demo03/inner/components/Demo03CourseList.vue
- infra/demo/demo03/inner/components/Demo03GradeForm.vue
- infra/demo/demo03/inner/components/Demo03GradeList.vue
- infra/demo/demo03/inner/index.vue
- infra/demo/demo03/normal/Demo03StudentForm.vue
- infra/demo/demo03/normal/components/Demo03CourseForm.vue
- infra/demo/demo03/normal/components/Demo03GradeForm.vue
- infra/demo/demo03/normal/index.vue
- infra/druid/index.vue
- infra/file/FileForm.vue
- infra/file/index.vue
- infra/fileConfig/FileConfigForm.vue
- infra/fileConfig/index.vue
- infra/job/JobDetail.vue
- infra/job/JobForm.vue
- infra/job/index.vue
- infra/job/logger/JobLogDetail.vue
- infra/job/logger/index.vue
- infra/redis/index.vue
- infra/server/index.vue
- infra/skywalking/index.vue
- infra/swagger/index.vue
- infra/webSocket/index.vue

#### views/iot（96）

- iot/alert/config/AlertConfigForm.vue
- iot/alert/config/index.vue
- iot/alert/record/index.vue
- iot/device/device/DeviceForm.vue
- iot/device/device/DeviceGroupForm.vue
- iot/device/device/DeviceImportForm.vue
- iot/device/device/detail/DeviceDetailConfig.vue
- iot/device/device/detail/DeviceDetailsHeader.vue
- iot/device/device/detail/DeviceDetailsInfo.vue
- iot/device/device/detail/DeviceDetailsMessage.vue
- iot/device/device/detail/DeviceDetailsSimulator.vue
- iot/device/device/detail/DeviceDetailsSubDevice.vue
- iot/device/device/detail/DeviceDetailsThingModel.vue
- iot/device/device/detail/DeviceDetailsThingModelEvent.vue
- iot/device/device/detail/DeviceDetailsThingModelProperty.vue
- iot/device/device/detail/DeviceDetailsThingModelPropertyHistory.vue
- iot/device/device/detail/DeviceDetailsThingModelService.vue
- iot/device/device/detail/DeviceModbusConfig.vue
- iot/device/device/detail/DeviceModbusConfigForm.vue
- iot/device/device/detail/DeviceModbusPointForm.vue
- iot/device/device/detail/index.vue
- iot/device/device/index.vue
- iot/device/group/DeviceGroupForm.vue
- iot/device/group/index.vue
- iot/home/components/ComparisonCard.vue
- iot/home/components/DeviceCountCard.vue
- iot/home/components/DeviceMapCard.vue
- iot/home/components/DeviceStateCountCard.vue
- iot/home/components/MessageTrendCard.vue
- iot/home/index.vue
- iot/ota/firmware/OtaFirmwareForm.vue
- iot/ota/firmware/detail/index.vue
- iot/ota/firmware/index.vue
- iot/ota/task/OtaTaskDetail.vue
- iot/ota/task/OtaTaskForm.vue
- iot/ota/task/OtaTaskList.vue
- iot/product/category/ProductCategoryForm.vue
- iot/product/category/index.vue
- iot/product/product/ProductForm.vue
- iot/product/product/components/ProductSelect.vue
- iot/product/product/detail/ProductDetailsHeader.vue
- iot/product/product/detail/ProductDetailsInfo.vue
- iot/product/product/detail/index.vue
- iot/product/product/index.vue
- iot/rule/data/index.vue
- iot/rule/data/rule/DataRuleForm.vue
- iot/rule/data/rule/components/SourceConfigForm.vue
- iot/rule/data/rule/index.vue
- iot/rule/data/sink/DataSinkForm.vue
- iot/rule/data/sink/config/DatabaseConfigForm.vue
- iot/rule/data/sink/config/HttpConfigForm.vue
- iot/rule/data/sink/config/KafkaMQConfigForm.vue
- iot/rule/data/sink/config/MqttConfigForm.vue
- iot/rule/data/sink/config/RabbitMQConfigForm.vue
- iot/rule/data/sink/config/RedisStreamConfigForm.vue
- iot/rule/data/sink/config/RocketMQConfigForm.vue
- iot/rule/data/sink/config/TcpConfigForm.vue
- iot/rule/data/sink/config/WebSocketConfigForm.vue
- iot/rule/data/sink/config/components/KeyValueEditor.vue
- iot/rule/data/sink/config/index.ts（→ iot/rule/data/sink/config/index.js）
- iot/rule/data/sink/index.vue
- iot/rule/scene/form/RuleSceneForm.vue
- iot/rule/scene/form/configs/AlertConfig.vue
- iot/rule/scene/form/configs/ConditionConfig.vue
- iot/rule/scene/form/configs/CurrentTimeConditionConfig.vue
- iot/rule/scene/form/configs/DeviceControlConfig.vue
- iot/rule/scene/form/configs/DeviceTriggerConfig.vue
- iot/rule/scene/form/configs/MainConditionInnerConfig.vue
- iot/rule/scene/form/configs/SubConditionGroupConfig.vue
- iot/rule/scene/form/configs/TimerConditionGroupConfig.vue
- iot/rule/scene/form/inputs/JsonParamsInput.vue
- iot/rule/scene/form/inputs/ValueInput.vue
- iot/rule/scene/form/sections/ActionSection.vue
- iot/rule/scene/form/sections/BasicInfoSection.vue
- iot/rule/scene/form/sections/TriggerSection.vue
- iot/rule/scene/form/selectors/DeviceSelector.vue
- iot/rule/scene/form/selectors/OperatorSelector.vue
- iot/rule/scene/form/selectors/ProductSelector.vue
- iot/rule/scene/form/selectors/PropertySelector.vue
- iot/rule/scene/index.vue
- iot/thingmodel/ThingModelEvent.vue
- iot/thingmodel/ThingModelForm.vue
- iot/thingmodel/ThingModelInputOutputParam.vue
- iot/thingmodel/ThingModelProperty.vue
- iot/thingmodel/ThingModelService.vue
- iot/thingmodel/ThingModelTSL.vue
- iot/thingmodel/components/DataDefinition.vue
- iot/thingmodel/components/index.ts（→ iot/thingmodel/components/index.js）
- iot/thingmodel/dataSpecs/ThingModelArrayDataSpecs.vue
- iot/thingmodel/dataSpecs/ThingModelEnumDataSpecs.vue
- iot/thingmodel/dataSpecs/ThingModelNumberDataSpecs.vue
- iot/thingmodel/dataSpecs/ThingModelStructDataSpecs.vue
- iot/thingmodel/dataSpecs/index.ts（→ iot/thingmodel/dataSpecs/index.js）
- iot/thingmodel/index.vue
- iot/utils/constants.ts（→ iot/utils/constants.js）
- iot/utils/sceneRule.ts（→ iot/utils/sceneRule.js）

#### views/mall（186）

- mall/home/components/ComparisonCard.vue
- mall/home/components/MemberStatisticsCard.vue
- mall/home/components/OperationDataCard.vue
- mall/home/components/ShortcutCard.vue
- mall/home/components/TradeTrendCard.vue
- mall/home/index.vue
- mall/product/brand/BrandForm.vue
- mall/product/brand/index.vue
- mall/product/category/CategoryForm.vue
- mall/product/category/components/ProductCategorySelect.vue
- mall/product/category/index.vue
- mall/product/comment/CommentForm.vue
- mall/product/comment/ReplyForm.vue
- mall/product/comment/index.vue
- mall/product/property/PropertyForm.vue
- mall/product/property/index.vue
- mall/product/property/value/ValueForm.vue
- mall/product/property/value/index.vue（→ mall/product/property/value.vue）
- mall/product/spu/components/SkuList.vue
- mall/product/spu/components/SkuTableSelect.vue
- mall/product/spu/components/SpuShowcase.vue
- mall/product/spu/components/SpuTableSelect.vue
- mall/product/spu/components/index.ts（→ mall/product/spu/components/index.js）
- mall/product/spu/form/DeliveryForm.vue
- mall/product/spu/form/DescriptionForm.vue
- mall/product/spu/form/InfoForm.vue
- mall/product/spu/form/OtherForm.vue
- mall/product/spu/form/ProductAttributes.vue
- mall/product/spu/form/ProductPropertyAddForm.vue
- mall/product/spu/form/SkuForm.vue
- mall/product/spu/form/index.vue
- mall/product/spu/index.vue
- mall/promotion/article/ArticleForm.vue
- mall/promotion/article/category/ArticleCategoryForm.vue
- mall/promotion/article/category/index.vue
- mall/promotion/article/index.vue
- mall/promotion/banner/BannerForm.vue
- mall/promotion/banner/index.vue
- mall/promotion/bargain/activity/BargainActivityForm.vue
- mall/promotion/bargain/activity/bargainActivity.data.ts（→ mall/promotion/bargain/activity/bargainActivity.data.js）
- mall/promotion/bargain/activity/index.vue
- mall/promotion/bargain/record/BargainRecordListDialog.vue
- mall/promotion/bargain/record/index.vue
- mall/promotion/combination/activity/CombinationActivityForm.vue
- mall/promotion/combination/activity/combinationActivity.data.ts（→ mall/promotion/combination/activity/combinationActivity.data.js）
- mall/promotion/combination/activity/index.vue
- mall/promotion/combination/components/CombinationShowcase.vue
- mall/promotion/combination/components/CombinationTableSelect.vue
- mall/promotion/combination/record/CombinationRecordListDialog.vue
- mall/promotion/combination/record/index.vue
- mall/promotion/components/SpuAndSkuList.vue
- mall/promotion/components/SpuSelect.vue
- mall/promotion/components/index.ts（→ mall/promotion/components/index.js）
- mall/promotion/coupon/components/CouponSelect.vue
- mall/promotion/coupon/components/CouponSendForm.vue
- mall/promotion/coupon/components/index.ts（→ mall/promotion/coupon/components/index.js）
- mall/promotion/coupon/formatter.ts（→ mall/promotion/coupon/formatter.js）
- mall/promotion/coupon/index.vue
- mall/promotion/coupon/template/CouponTemplateForm.vue
- mall/promotion/coupon/template/index.vue
- mall/promotion/discountActivity/DiscountActivityForm.vue
- mall/promotion/discountActivity/discountActivity.data.ts（→ mall/promotion/discountActivity/discountActivity.data.js）
- mall/promotion/discountActivity/index.vue
- mall/promotion/diy/page/DiyPageForm.vue
- mall/promotion/diy/page/decorate.vue
- mall/promotion/diy/page/index.vue
- mall/promotion/diy/template/DiyTemplateForm.vue
- mall/promotion/diy/template/decorate.vue
- mall/promotion/diy/template/index.vue
- mall/promotion/kefu/components/KeFuConversationList.vue
- mall/promotion/kefu/components/KeFuMessageList.vue
- mall/promotion/kefu/components/asserts/a.png
- mall/promotion/kefu/components/asserts/aini.png
- mall/promotion/kefu/components/asserts/aixin.png
- mall/promotion/kefu/components/asserts/baiyan.png
- mall/promotion/kefu/components/asserts/bizui.png
- mall/promotion/kefu/components/asserts/buhaoyisi.png
- mall/promotion/kefu/components/asserts/bukesiyi.png
- mall/promotion/kefu/components/asserts/dajing.png
- mall/promotion/kefu/components/asserts/danao.png
- mall/promotion/kefu/components/asserts/daxiao.png
- mall/promotion/kefu/components/asserts/dianzan.png
- mall/promotion/kefu/components/asserts/emo.png
- mall/promotion/kefu/components/asserts/esi.png
- mall/promotion/kefu/components/asserts/fadai.png
- mall/promotion/kefu/components/asserts/fankun.png
- mall/promotion/kefu/components/asserts/feiwen.png
- mall/promotion/kefu/components/asserts/fennu.png
- mall/promotion/kefu/components/asserts/ganga.png
- mall/promotion/kefu/components/asserts/ganmao.png
- mall/promotion/kefu/components/asserts/hanyan.png
- mall/promotion/kefu/components/asserts/haochi.png
- mall/promotion/kefu/components/asserts/hongxin.png
- mall/promotion/kefu/components/asserts/huaixiao.png
- mall/promotion/kefu/components/asserts/jingkong.png
- mall/promotion/kefu/components/asserts/jingshu.png
- mall/promotion/kefu/components/asserts/jingya.png
- mall/promotion/kefu/components/asserts/kaixin.png
- mall/promotion/kefu/components/asserts/keai.png
- mall/promotion/kefu/components/asserts/keshui.png
- mall/promotion/kefu/components/asserts/kun.png
- mall/promotion/kefu/components/asserts/lengku.png
- mall/promotion/kefu/components/asserts/liuhan.png
- mall/promotion/kefu/components/asserts/liukoushui.png
- mall/promotion/kefu/components/asserts/liulei.png
- mall/promotion/kefu/components/asserts/mengbi.png
- mall/promotion/kefu/components/asserts/mianwubiaoqing.png
- mall/promotion/kefu/components/asserts/nanguo.png
- mall/promotion/kefu/components/asserts/outu.png
- mall/promotion/kefu/components/asserts/picture.svg
- mall/promotion/kefu/components/asserts/shengqi.png
- mall/promotion/kefu/components/asserts/shuizhuo.png
- mall/promotion/kefu/components/asserts/tianshi.png
- mall/promotion/kefu/components/asserts/xiaodiaoya.png
- mall/promotion/kefu/components/asserts/xiaoku.png
- mall/promotion/kefu/components/asserts/xinsui.png
- mall/promotion/kefu/components/asserts/xiong.png
- mall/promotion/kefu/components/asserts/yiwen.png
- mall/promotion/kefu/components/asserts/yun.png
- mall/promotion/kefu/components/asserts/ziya.png
- mall/promotion/kefu/components/index.ts（→ mall/promotion/kefu/components/index.js）
- mall/promotion/kefu/components/member/MemberInfo.vue
- mall/promotion/kefu/components/member/OrderBrowsingHistory.vue
- mall/promotion/kefu/components/member/ProductBrowsingHistory.vue
- mall/promotion/kefu/components/message/MessageItem.vue
- mall/promotion/kefu/components/message/OrderItem.vue
- mall/promotion/kefu/components/message/ProductItem.vue
- mall/promotion/kefu/components/tools/EmojiSelectPopover.vue
- mall/promotion/kefu/components/tools/PictureSelectUpload.vue
- mall/promotion/kefu/components/tools/constants.ts（→ mall/promotion/kefu/components/tools/constants.js）
- mall/promotion/kefu/components/tools/emoji.ts（→ mall/promotion/kefu/components/tools/emoji.js）
- mall/promotion/kefu/index.vue
- mall/promotion/point/activity/PointActivityForm.vue
- mall/promotion/point/activity/index.vue
- mall/promotion/point/activity/pointActivity.data.ts（→ mall/promotion/point/activity/pointActivity.data.js）
- mall/promotion/point/components/PointShowcase.vue
- mall/promotion/point/components/PointTableSelect.vue
- mall/promotion/rewardActivity/RewardForm.vue
- mall/promotion/rewardActivity/components/RewardRule.vue
- mall/promotion/rewardActivity/components/RewardRuleCouponSelect.vue
- mall/promotion/rewardActivity/index.vue
- mall/promotion/seckill/activity/SeckillActivityForm.vue
- mall/promotion/seckill/activity/index.vue
- mall/promotion/seckill/activity/seckillActivity.data.ts（→ mall/promotion/seckill/activity/seckillActivity.data.js）
- mall/promotion/seckill/components/SeckillShowcase.vue
- mall/promotion/seckill/components/SeckillTableSelect.vue
- mall/promotion/seckill/config/SeckillConfigForm.vue
- mall/promotion/seckill/config/index.vue
- mall/statistics/member/components/MemberFunnelCard.vue
- mall/statistics/member/components/MemberTerminalCard.vue
- mall/statistics/member/index.vue
- mall/statistics/product/components/ProductRank.vue
- mall/statistics/product/components/ProductSummary.vue
- mall/statistics/product/index.vue
- mall/statistics/trade/components/TradeStatisticValue.vue
- mall/statistics/trade/index.vue
- mall/trade/afterSale/detail/index.vue
- mall/trade/afterSale/form/AfterSaleDisagreeForm.vue
- mall/trade/afterSale/index.vue
- mall/trade/brokerage/record/index.vue
- mall/trade/brokerage/user/BrokerageOrderListDialog.vue
- mall/trade/brokerage/user/BrokerageUserCreateForm.vue
- mall/trade/brokerage/user/BrokerageUserListDialog.vue
- mall/trade/brokerage/user/BrokerageUserUpdateForm.vue
- mall/trade/brokerage/user/index.vue
- mall/trade/brokerage/withdraw/BrokerageWithdrawRejectForm.vue
- mall/trade/brokerage/withdraw/index.vue
- mall/trade/config/index.vue
- mall/trade/delivery/express/ExpressForm.vue
- mall/trade/delivery/express/index.vue
- mall/trade/delivery/expressTemplate/ExpressTemplateForm.vue
- mall/trade/delivery/expressTemplate/index.vue
- mall/trade/delivery/pickUpOrder/index.vue
- mall/trade/delivery/pickUpStore/DeliveryPickUpStoreBindForm.vue
- mall/trade/delivery/pickUpStore/PickUpStoreForm.vue
- mall/trade/delivery/pickUpStore/components/StoreStaffTableSelect.vue
- mall/trade/delivery/pickUpStore/index.vue
- mall/trade/order/components/OrderTableColumn.vue
- mall/trade/order/components/index.ts（→ mall/trade/order/components/index.js）
- mall/trade/order/detail/index.vue
- mall/trade/order/form/OrderDeliveryForm.vue
- mall/trade/order/form/OrderPickUpForm.vue
- mall/trade/order/form/OrderUpdateAddressForm.vue
- mall/trade/order/form/OrderUpdatePriceForm.vue
- mall/trade/order/form/OrderUpdateRemarkForm.vue
- mall/trade/order/index.vue

#### views/member（32）

- member/config/index.vue
- member/group/GroupForm.vue
- member/group/components/MemberGroupSelect.vue
- member/group/index.vue
- member/level/LevelForm.vue
- member/level/components/MemberLevelSelect.vue
- member/level/index.vue
- member/point/record/index.vue
- member/signin/config/SignInConfigForm.vue
- member/signin/config/index.vue
- member/signin/record/index.vue
- member/tag/TagForm.vue
- member/tag/components/MemberTagSelect.vue
- member/tag/index.vue
- member/user/UserForm.vue
- member/user/components/UserBalanceUpdateForm.vue
- member/user/components/UserLevelUpdateForm.vue
- member/user/components/UserPointUpdateForm.vue
- member/user/detail/UserAccountInfo.vue
- member/user/detail/UserAddressList.vue
- member/user/detail/UserAftersaleList.vue（→ member/user/detail/UserAfterSaleList.vue）
- member/user/detail/UserBalanceList.vue
- member/user/detail/UserBasicInfo.vue
- member/user/detail/UserBrokerageList.vue
- member/user/detail/UserCouponList.vue
- member/user/detail/UserExperienceRecordList.vue
- member/user/detail/UserFavoriteList.vue
- member/user/detail/UserOrderList.vue
- member/user/detail/UserPointList.vue
- member/user/detail/UserSignList.vue
- member/user/detail/index.vue
- member/user/index.vue

#### views/mes（287）

- mes/cal/calendar/CalendarDateCell.vue
- mes/cal/calendar/CalendarLegend.vue
- mes/cal/calendar/TeamView.vue
- mes/cal/calendar/TypeView.vue
- mes/cal/calendar/UserView.vue
- mes/cal/calendar/index.vue
- mes/cal/calendar/useCalendar.ts（→ mes/cal/calendar/useCalendar.js）
- mes/cal/holiday/HolidayForm.vue
- mes/cal/holiday/index.vue
- mes/cal/plan/CalPlanForm.vue
- mes/cal/plan/CalPlanTeamList.vue
- mes/cal/plan/CalShiftList.vue
- mes/cal/plan/index.vue
- mes/cal/team/CalTeamForm.vue
- mes/cal/team/CalTeamMemberList.vue
- mes/cal/team/components/CalTeamSelect.vue
- mes/cal/team/components/CalTeamSelectDialog.vue
- mes/cal/team/index.vue
- mes/dv/checkplan/CheckPlanForm.vue
- mes/dv/checkplan/CheckPlanMachineryList.vue
- mes/dv/checkplan/CheckPlanSubjectList.vue
- mes/dv/checkplan/components/DvCheckPlanSelect.vue
- mes/dv/checkplan/components/DvCheckPlanSelectDialog.vue
- mes/dv/checkplan/index.vue
- mes/dv/checkrecord/CheckRecordForm.vue
- mes/dv/checkrecord/CheckRecordLineList.vue
- mes/dv/checkrecord/index.vue
- mes/dv/machinery/MachineryCheckRecordList.vue
- mes/dv/machinery/MachineryForm.vue
- mes/dv/machinery/MachineryImportForm.vue
- mes/dv/machinery/MachineryMaintenRecordList.vue
- mes/dv/machinery/MachineryRepairList.vue
- mes/dv/machinery/components/DvMachinerySelect.vue
- mes/dv/machinery/components/DvMachinerySelectDialog.vue
- mes/dv/machinery/index.vue
- mes/dv/machinery/type/MachineryTypeForm.vue
- mes/dv/machinery/type/components/DvMachineryTypeSelect.vue
- mes/dv/machinery/type/components/MachineryTypeTree.vue
- mes/dv/machinery/type/index.vue
- mes/dv/maintenrecord/MaintenRecordForm.vue
- mes/dv/maintenrecord/MaintenRecordLineList.vue
- mes/dv/maintenrecord/index.vue
- mes/dv/repair/RepairForm.vue
- mes/dv/repair/RepairLineList.vue
- mes/dv/repair/index.vue
- mes/dv/subject/SubjectForm.vue
- mes/dv/subject/components/DvSubjectSelect.vue
- mes/dv/subject/components/DvSubjectSelectDialog.vue
- mes/dv/subject/index.vue
- mes/home/HomeAlertPanel.vue
- mes/home/HomeKpiCards.vue
- mes/home/HomeProductionTrend.vue
- mes/home/HomeShortcuts.vue
- mes/home/HomeWorkOrderChart.vue
- mes/home/index.vue
- mes/md/autocode/AutoCodePartForm.vue
- mes/md/autocode/AutoCodePartList.vue
- mes/md/autocode/AutoCodeRuleForm.vue
- mes/md/autocode/index.vue
- mes/md/client/ClientProductSalesLineList.vue
- mes/md/client/ClientProductSalesList.vue
- mes/md/client/MdClientForm.vue
- mes/md/client/MdClientImportForm.vue
- mes/md/client/components/MdClientSelect.vue
- mes/md/client/components/MdClientSelectDialog.vue
- mes/md/client/index.vue
- mes/md/item/MdItemBatchConfigForm.vue
- mes/md/item/MdItemForm.vue
- mes/md/item/MdItemImportForm.vue
- mes/md/item/MdProductBomForm.vue
- mes/md/item/MdProductSipForm.vue
- mes/md/item/MdProductSopForm.vue
- mes/md/item/components/MdItemSelect.vue
- mes/md/item/components/MdItemSelectDialog.vue
- mes/md/item/components/MdProductBomSelect.vue
- mes/md/item/components/MdProductBomSelectDialog.vue
- mes/md/item/index.vue
- mes/md/item/type/MdItemTypeForm.vue
- mes/md/item/type/components/MdItemTypeSelect.vue
- mes/md/item/type/components/MdItemTypeTree.vue
- mes/md/item/type/index.vue
- mes/md/unitmeasure/UnitMeasureForm.vue
- mes/md/unitmeasure/components/MdUnitMeasureSelect.vue
- mes/md/unitmeasure/index.vue
- mes/md/vendor/MdVendorForm.vue
- mes/md/vendor/MdVendorImportForm.vue
- mes/md/vendor/VendorItemReceiptLineList.vue
- mes/md/vendor/VendorItemReceiptList.vue
- mes/md/vendor/components/MdVendorSelect.vue
- mes/md/vendor/components/MdVendorSelectDialog.vue
- mes/md/vendor/index.vue
- mes/md/workstation/WorkstationForm.vue
- mes/md/workstation/WorkstationMachineList.vue
- mes/md/workstation/WorkstationToolList.vue
- mes/md/workstation/WorkstationWorkerList.vue
- mes/md/workstation/components/MdWorkshopSelect.vue
- mes/md/workstation/components/MdWorkstationSelect.vue
- mes/md/workstation/components/MdWorkstationSelectDialog.vue
- mes/md/workstation/index.vue
- mes/md/workstation/workshop/WorkshopForm.vue
- mes/md/workstation/workshop/index.vue
- mes/pro/andon/config/AndonConfigForm.vue
- mes/pro/andon/config/components/AndonConfigSelect.vue
- mes/pro/andon/record/AndonRecordForm.vue
- mes/pro/andon/record/index.vue
- mes/pro/card/CardForm.vue
- mes/pro/card/CardProcessList.vue
- mes/pro/card/components/ProCardSelect.vue
- mes/pro/card/components/ProCardSelectDialog.vue
- mes/pro/card/index.vue
- mes/pro/feedback/FeedbackForm.vue
- mes/pro/feedback/ItemConsumeList.vue
- mes/pro/feedback/ProductProduceList.vue
- mes/pro/feedback/index.vue
- mes/pro/process/ProProcessContentList.vue
- mes/pro/process/ProProcessForm.vue
- mes/pro/process/components/ProProcessSelect.vue
- mes/pro/process/index.vue
- mes/pro/route/RouteForm.vue
- mes/pro/route/RouteProcessList.vue
- mes/pro/route/RouteProductBomList.vue
- mes/pro/route/RouteProductList.vue
- mes/pro/route/index.vue
- mes/pro/task/ProTaskList.vue
- mes/pro/task/WorkOrderForm2.vue
- mes/pro/task/components/GanttChart.vue
- mes/pro/task/components/ProTaskSelect.vue
- mes/pro/task/components/ProTaskSelectDialog.vue
- mes/pro/task/edit/index.vue
- mes/pro/task/index.vue
- mes/pro/workorder/WorkOrderBomList.vue
- mes/pro/workorder/WorkOrderForm.vue
- mes/pro/workorder/WorkOrderItemList.vue
- mes/pro/workorder/components/ProWorkOrderSelect.vue
- mes/pro/workorder/components/ProWorkOrderSelectDialog.vue
- mes/pro/workorder/index.vue
- mes/pro/workrecord/WorkRecordStatusBar.vue
- mes/pro/workrecord/index.vue
- mes/qc/batchtrace/BatchTraceDetail.vue
- mes/qc/batchtrace/BatchTraceDetailList.vue
- mes/qc/batchtrace/index.vue
- mes/qc/defect/DefectForm.vue
- mes/qc/defect/index.vue
- mes/qc/defectrecord/components/DefectRecordInlineList.vue
- mes/qc/indicator/IndicatorForm.vue
- mes/qc/indicator/components/QcIndicatorSelect.vue
- mes/qc/indicator/components/QcIndicatorSelectDialog.vue
- mes/qc/indicator/index.vue
- mes/qc/indicatorresult/components/QcIndicatorResultForm.vue
- mes/qc/indicatorresult/components/QcIndicatorResultList.vue
- mes/qc/ipqc/IpqcForm.vue
- mes/qc/ipqc/IpqcLineList.vue
- mes/qc/ipqc/index.vue
- mes/qc/iqc/IqcForm.vue
- mes/qc/iqc/IqcLineList.vue
- mes/qc/iqc/index.vue
- mes/qc/oqc/OqcForm.vue
- mes/qc/oqc/OqcLineList.vue
- mes/qc/oqc/index.vue
- mes/qc/pendinginspect/index.vue
- mes/qc/rqc/RqcForm.vue
- mes/qc/rqc/RqcLineList.vue
- mes/qc/rqc/index.vue
- mes/qc/template/TemplateForm.vue
- mes/qc/template/TemplateIndicatorList.vue
- mes/qc/template/TemplateItemList.vue
- mes/qc/template/index.vue
- mes/tm/tool/ToolForm.vue
- mes/tm/tool/components/TmToolSelect.vue
- mes/tm/tool/components/TmToolSelectDialog.vue
- mes/tm/tool/index.vue
- mes/tm/tool/type/ToolTypeForm.vue
- mes/tm/tool/type/components/TmToolTypeList.vue
- mes/tm/tool/type/components/TmToolTypeSelect.vue
- mes/tm/tool/type/index.vue
- mes/utils/constants.ts（→ mes/utils/constants.js）
- mes/wm/arrivalnotice/ArrivalNoticeForm.vue
- mes/wm/arrivalnotice/ArrivalNoticeLineList.vue
- mes/wm/arrivalnotice/components/WmArrivalNoticeLineSelect.vue
- mes/wm/arrivalnotice/components/WmArrivalNoticeLineSelectDialog.vue
- mes/wm/arrivalnotice/components/WmArrivalNoticeSelect.vue
- mes/wm/arrivalnotice/components/WmArrivalNoticeSelectDialog.vue
- mes/wm/arrivalnotice/index.vue
- mes/wm/barcode/BarcodeForm.vue
- mes/wm/barcode/components/Barcode.vue
- mes/wm/barcode/components/BarcodeDetail.vue
- mes/wm/barcode/components/PrinterLabel.vue
- mes/wm/barcode/components/index.ts（→ mes/wm/barcode/components/index.js）
- mes/wm/barcode/config/BarcodeConfigForm.vue
- mes/wm/barcode/config/index.vue
- mes/wm/barcode/index.vue
- mes/wm/batch/BatchForm.vue
- mes/wm/batch/components/WmBatchSelect.vue
- mes/wm/batch/components/WmBatchSelectDialog.vue
- mes/wm/itemreceipt/ItemReceiptDetailForm.vue
- mes/wm/itemreceipt/ItemReceiptDetailList.vue
- mes/wm/itemreceipt/ItemReceiptForm.vue
- mes/wm/itemreceipt/ItemReceiptLineList.vue
- mes/wm/itemreceipt/index.vue
- mes/wm/materialstock/components/WmMaterialStockSelect.vue
- mes/wm/materialstock/components/WmMaterialStockSelectDialog.vue
- mes/wm/materialstock/index.vue
- mes/wm/miscissue/MiscIssueForm.vue
- mes/wm/miscissue/MiscIssueLineList.vue
- mes/wm/miscissue/index.vue
- mes/wm/miscreceipt/MiscReceiptForm.vue
- mes/wm/miscreceipt/MiscReceiptLineList.vue
- mes/wm/miscreceipt/index.vue
- mes/wm/outsourceissue/OutsourceIssueDetailForm.vue
- mes/wm/outsourceissue/OutsourceIssueDetailList.vue
- mes/wm/outsourceissue/OutsourceIssueForm.vue
- mes/wm/outsourceissue/OutsourceIssueLineList.vue
- mes/wm/outsourceissue/index.vue
- mes/wm/outsourcereceipt/OutsourceReceiptDetailForm.vue
- mes/wm/outsourcereceipt/OutsourceReceiptDetailList.vue
- mes/wm/outsourcereceipt/OutsourceReceiptForm.vue
- mes/wm/outsourcereceipt/OutsourceReceiptLineList.vue
- mes/wm/outsourcereceipt/index.vue
- mes/wm/packages/PackageForm.vue
- mes/wm/packages/PackageLineList.vue
- mes/wm/packages/SubPackageList.vue
- mes/wm/packages/components/WmPackageSelect.vue
- mes/wm/packages/components/WmPackageSelectDialog.vue
- mes/wm/packages/index.vue
- mes/wm/productissue/ProductIssueDetailForm.vue
- mes/wm/productissue/ProductIssueDetailList.vue
- mes/wm/productissue/ProductIssueForm.vue
- mes/wm/productissue/ProductIssueLineList.vue
- mes/wm/productissue/index.vue
- mes/wm/productreceipt/ProductReceiptDetailForm.vue
- mes/wm/productreceipt/ProductReceiptDetailList.vue
- mes/wm/productreceipt/ProductReceiptForm.vue
- mes/wm/productreceipt/ProductReceiptLineList.vue
- mes/wm/productreceipt/index.vue
- mes/wm/productsales/ProductSalesDetailForm.vue
- mes/wm/productsales/ProductSalesDetailList.vue
- mes/wm/productsales/ProductSalesForm.vue
- mes/wm/productsales/ProductSalesLineList.vue
- mes/wm/productsales/index.vue
- mes/wm/returnissue/ReturnIssueDetailForm.vue
- mes/wm/returnissue/ReturnIssueDetailList.vue
- mes/wm/returnissue/ReturnIssueForm.vue
- mes/wm/returnissue/ReturnIssueLineList.vue
- mes/wm/returnissue/index.vue
- mes/wm/returnsales/ReturnSalesDetailForm.vue
- mes/wm/returnsales/ReturnSalesDetailList.vue
- mes/wm/returnsales/ReturnSalesForm.vue
- mes/wm/returnsales/ReturnSalesLineList.vue
- mes/wm/returnsales/index.vue
- mes/wm/returnvendor/ReturnVendorDetailForm.vue
- mes/wm/returnvendor/ReturnVendorDetailList.vue
- mes/wm/returnvendor/ReturnVendorForm.vue
- mes/wm/returnvendor/ReturnVendorLineList.vue
- mes/wm/returnvendor/index.vue
- mes/wm/salesnotice/SalesNoticeForm.vue
- mes/wm/salesnotice/SalesNoticeLineList.vue
- mes/wm/salesnotice/components/WmSalesNoticeLineSelect.vue
- mes/wm/salesnotice/components/WmSalesNoticeLineSelectDialog.vue
- mes/wm/salesnotice/components/WmSalesNoticeSelect.vue
- mes/wm/salesnotice/components/WmSalesNoticeSelectDialog.vue
- mes/wm/salesnotice/index.vue
- mes/wm/sn/WmSnDetailDialog.vue
- mes/wm/sn/WmSnGenerateForm.vue
- mes/wm/sn/index.vue
- mes/wm/stocktaking/plan/StockTakingPlanForm.vue
- mes/wm/stocktaking/plan/StockTakingPlanParamList.vue
- mes/wm/stocktaking/plan/components/StockTakingPlanSelect.vue
- mes/wm/stocktaking/plan/components/StockTakingPlanSelectDialog.vue
- mes/wm/stocktaking/plan/index.vue
- mes/wm/stocktaking/task/StockTakingForm.vue
- mes/wm/stocktaking/task/StockTakingTaskLineList.vue
- mes/wm/stocktaking/task/StockTakingTaskResultList.vue
- mes/wm/stocktaking/task/index.vue
- mes/wm/transfer/TransferDetailForm.vue
- mes/wm/transfer/TransferDetailList.vue
- mes/wm/transfer/TransferForm.vue
- mes/wm/transfer/TransferLineList.vue
- mes/wm/transfer/index.vue
- mes/wm/warehouse/WarehouseForm.vue
- mes/wm/warehouse/area/AreaForm.vue
- mes/wm/warehouse/area/index.vue
- mes/wm/warehouse/components/WmWarehouseAreaSelect.vue
- mes/wm/warehouse/components/WmWarehouseLocationSelect.vue
- mes/wm/warehouse/components/WmWarehouseSelect.vue
- mes/wm/warehouse/index.vue
- mes/wm/warehouse/location/LocationForm.vue
- mes/wm/warehouse/location/index.vue

#### views/mp（72）

- mp/account/AccountForm.vue
- mp/account/index.vue
- mp/autoReply/components/ReplyForm.vue
- mp/autoReply/components/ReplyTable.vue
- mp/autoReply/components/types.ts（→ mp/autoReply/components/types.js）
- mp/autoReply/index.vue
- mp/components/wx-account-select/index.ts（→ mp/components/wx-account-select/index.js）
- mp/components/wx-account-select/main.vue
- mp/components/wx-location/index.ts（→ mp/components/wx-location/index.js）
- mp/components/wx-location/main.vue
- mp/components/wx-material-select/index.ts（→ mp/components/wx-material-select/index.js）
- mp/components/wx-material-select/main.vue
- mp/components/wx-material-select/types.ts（→ mp/components/wx-material-select/types.js）
- mp/components/wx-msg/card.scss
- mp/components/wx-msg/comment.scss
- mp/components/wx-msg/components/Msg.vue
- mp/components/wx-msg/components/MsgEvent.vue
- mp/components/wx-msg/components/MsgList.vue
- mp/components/wx-msg/index.ts（→ mp/components/wx-msg/index.js）
- mp/components/wx-msg/main.vue
- mp/components/wx-msg/types.ts（→ mp/components/wx-msg/types.js）
- mp/components/wx-music/index.ts（→ mp/components/wx-music/index.js）
- mp/components/wx-music/main.vue
- mp/components/wx-news/index.ts（→ mp/components/wx-news/index.js）
- mp/components/wx-news/main.vue
- mp/components/wx-reply/components/TabImage.vue
- mp/components/wx-reply/components/TabMusic.vue
- mp/components/wx-reply/components/TabNews.vue
- mp/components/wx-reply/components/TabText.vue
- mp/components/wx-reply/components/TabVideo.vue
- mp/components/wx-reply/components/TabVoice.vue
- mp/components/wx-reply/components/types.ts（→ mp/components/wx-reply/components/types.js）
- mp/components/wx-reply/index.ts（→ mp/components/wx-reply/index.js）
- mp/components/wx-reply/main.vue
- mp/components/wx-video-play/index.ts（→ mp/components/wx-video-play/index.js）
- mp/components/wx-video-play/main.vue
- mp/components/wx-voice-play/index.ts（→ mp/components/wx-voice-play/index.js）
- mp/components/wx-voice-play/main.vue
- mp/draft/components/CoverSelect.vue
- mp/draft/components/DraftTable.vue
- mp/draft/components/NewsForm.vue
- mp/draft/components/index.ts（→ mp/draft/components/index.js）
- mp/draft/components/types.ts（→ mp/draft/components/types.js）
- mp/draft/editor-config.ts（→ mp/draft/editor-config.js）
- mp/draft/index.vue
- mp/draft/mock.js
- mp/freePublish/index.vue
- mp/hooks/useUpload.ts（→ mp/hooks/useUpload.js）
- mp/material/components/ImageTable.vue
- mp/material/components/UploadFile.vue
- mp/material/components/UploadVideo.vue
- mp/material/components/VideoTable.vue
- mp/material/components/VoiceTable.vue
- mp/material/components/upload.ts（→ mp/material/components/upload.js）
- mp/material/index.vue
- mp/menu/assets/iphone_backImg.png
- mp/menu/assets/menu_foot.png
- mp/menu/assets/menu_head.png
- mp/menu/components/MenuEditor.vue
- mp/menu/components/MenuPreviewer.vue
- mp/menu/components/menuOptions.ts（→ mp/menu/components/menuOptions.js）
- mp/menu/components/types.ts（→ mp/menu/components/types.js）
- mp/menu/index.vue
- mp/message/MessageTable.vue
- mp/message/index.vue
- mp/messageTemplate/MessageTemplateSendForm.vue
- mp/messageTemplate/index.vue
- mp/statistics/index.vue
- mp/tag/TagForm.vue
- mp/tag/index.vue
- mp/user/UserForm.vue
- mp/user/index.vue

#### views/oa（160）

- oa/announcement/list/OaAnnouncementForm.vue
- oa/announcement/list/components/OaAnnouncementDetail.vue
- oa/announcement/list/index.vue
- oa/announcement/my/index.vue
- oa/attendance/list/OaAttendanceForm.vue
- oa/attendance/list/index.vue
- oa/attendance/my/index.vue
- oa/attendance/report/OaAttendanceMonthReport.vue
- oa/attendance/report/OaAttendanceWeekReport.vue
- oa/attendance/report/index.vue
- oa/contact/OaContactForm.vue
- oa/contact/OaContactShareDetail.vue
- oa/contact/components/OaContactCategoryForm.vue
- oa/contact/components/OaContactCategoryList.vue
- oa/contact/components/OaContactCategorySelect.vue
- oa/contact/components/OaContactDetail.vue
- oa/contact/index.vue
- oa/discussion/detail/OaDiscussionReply.vue
- oa/discussion/detail/OaDiscussionVote.vue
- oa/discussion/detail/index.vue
- oa/discussion/list/index.vue
- oa/discussion/manage/OaDiscussionForm.vue
- oa/discussion/manage/index.vue
- oa/file/OaFileNodeForm.vue
- oa/file/OaFilePermissionForm.vue
- oa/file/OaFilePermissionList.vue
- oa/file/OaFilePreview.vue
- oa/file/OaFileStorage.vue
- oa/file/OaFileUpload.vue
- oa/file/index.vue
- oa/home/components/OaHomeAnnouncement.vue
- oa/home/components/OaHomeAttendance.vue
- oa/home/components/OaHomeCalendar.vue
- oa/home/components/OaHomeContactCount.vue
- oa/home/components/OaHomeDiscussionCount.vue
- oa/home/components/OaHomeNote.vue
- oa/home/components/OaHomePanel.vue
- oa/home/components/OaHomePlan.vue
- oa/home/components/OaHomeTaskCount.vue
- oa/home/components/OaHomeTaskStatistics.vue
- oa/home/index.vue
- oa/leave/OaLeaveApplyDetail.vue
- oa/leave/OaLeaveApplyForm.vue
- oa/leave/detail/index.vue
- oa/leave/index.vue
- oa/mail/account/MailAccountForm.vue
- oa/mail/account/components/MailAccountSelect.vue
- oa/mail/account/components/MailAddressSelect.vue
- oa/mail/account/index.vue
- oa/mail/inbox/MailMessageDetail.vue
- oa/mail/inbox/MailMessageForm.vue
- oa/mail/inbox/MailMessageList.vue
- oa/mail/inbox/components/MailFolderList.vue
- oa/mail/inbox/index.vue
- oa/mail/provider/MailProviderForm.vue
- oa/mail/provider/components/MailProviderSelect.vue
- oa/mail/provider/index.vue
- oa/meetingroom/booking/OaMeetingRoomBookingDetail.vue
- oa/meetingroom/booking/OaMeetingRoomBookingForm.vue
- oa/meetingroom/booking/detail/index.vue
- oa/meetingroom/booking/index.vue
- oa/meetingroom/room/OaMeetingRoomForm.vue
- oa/meetingroom/room/components/OaMeetingRoomScheduleDialog.vue
- oa/meetingroom/room/components/OaMeetingRoomSelectDialog.vue
- oa/meetingroom/room/index.vue
- oa/note/OaNoteForm.vue
- oa/note/components/OaNoteCategoryForm.vue
- oa/note/components/OaNoteCategoryList.vue
- oa/note/components/OaNoteCategorySelect.vue
- oa/note/components/OaNoteDetail.vue
- oa/note/components/OaNoteShareForm.vue
- oa/note/components/OaNoteSidebar.vue
- oa/note/index.vue
- oa/officialdoc/components/OaOfficialDocPreview.vue
- oa/officialdoc/receive/OaOfficialDocReceiveDetail.vue
- oa/officialdoc/receive/OaOfficialDocReceiveForm.vue
- oa/officialdoc/receive/detail/index.vue
- oa/officialdoc/receive/index.vue
- oa/officialdoc/send/OaOfficialDocSendDetail.vue
- oa/officialdoc/send/OaOfficialDocSendForm.vue
- oa/officialdoc/send/detail/index.vue
- oa/officialdoc/send/index.vue
- oa/officialdoc/template/OaOfficialDocTemplateForm.vue
- oa/officialdoc/template/components/OaOfficialDocTemplateSelect.vue
- oa/officialdoc/template/index.vue
- oa/overtime/OaOvertimeApplyDetail.vue
- oa/overtime/OaOvertimeApplyForm.vue
- oa/overtime/detail/index.vue
- oa/overtime/index.vue
- oa/plan/list/OaPlanForm.vue
- oa/plan/list/index.vue
- oa/plan/report/index.vue
- oa/regular/OaRegularApplyDetail.vue
- oa/regular/OaRegularApplyForm.vue
- oa/regular/detail/index.vue
- oa/regular/index.vue
- oa/reimbursement/OaReimbursementDetail.vue
- oa/reimbursement/OaReimbursementForm.vue
- oa/reimbursement/detail/index.vue
- oa/reimbursement/index.vue
- oa/resign/OaResignApplyDetail.vue
- oa/resign/OaResignApplyForm.vue
- oa/resign/detail/index.vue
- oa/resign/index.vue
- oa/schedule/calendar/index.vue
- oa/schedule/list/components/OaScheduleDetail.vue
- oa/schedule/list/components/OaScheduleForm.vue
- oa/schedule/list/index.vue
- oa/seal/OaSealDetail.vue
- oa/seal/OaSealForm.vue
- oa/seal/apply/OaSealApplyDetail.vue
- oa/seal/apply/OaSealApplyForm.vue
- oa/seal/apply/detail/index.vue
- oa/seal/apply/index.vue
- oa/seal/components/OaSealSelect.vue
- oa/seal/index.vue
- oa/supply/apply/OaSupplyApplyDetail.vue
- oa/supply/apply/OaSupplyApplyForm.vue
- oa/supply/apply/detail/index.vue
- oa/supply/apply/index.vue
- oa/supply/issue/OaSupplyIssueForm.vue
- oa/supply/issue/OaSupplyReturnForm.vue
- oa/supply/issue/index.vue
- oa/supply/item/OaSupplyItemForm.vue
- oa/supply/item/OaSupplyStockForm.vue
- oa/supply/item/components/OaSupplyItemSelect.vue
- oa/supply/item/index.vue
- oa/task/list/OaTaskForm.vue
- oa/task/list/components/OaTaskDetail.vue
- oa/task/list/components/OaTaskFeedbackForm.vue
- oa/task/list/index.vue
- oa/task/my/index.vue
- oa/travel/apply/OaTravelApplyDetail.vue
- oa/travel/apply/OaTravelApplyForm.vue
- oa/travel/apply/components/OaTravelApplySelect.vue
- oa/travel/apply/detail/index.vue
- oa/travel/apply/index.vue
- oa/travel/reimbursement/OaTravelReimbursementDetail.vue
- oa/travel/reimbursement/OaTravelReimbursementForm.vue
- oa/travel/reimbursement/detail/index.vue
- oa/travel/reimbursement/index.vue
- oa/utils/constants.ts（→ oa/utils/constants.js）
- oa/vehicle/OaVehicleForm.vue
- oa/vehicle/apply/OaVehicleApplyDetail.vue
- oa/vehicle/apply/OaVehicleApplyForm.vue
- oa/vehicle/apply/components/OaVehicleApplySelect.vue
- oa/vehicle/apply/components/OaVehicleApplySelectDialog.vue
- oa/vehicle/apply/detail/index.vue
- oa/vehicle/apply/index.vue
- oa/vehicle/components/OaVehicleSelect.vue
- oa/vehicle/components/OaVehicleSelectDialog.vue
- oa/vehicle/index.vue
- oa/vehicle/return/OaVehicleReturnDetail.vue
- oa/vehicle/return/OaVehicleReturnForm.vue
- oa/vehicle/return/detail/index.vue
- oa/vehicle/return/index.vue
- oa/workreport/OaWorkReportForm.vue
- oa/workreport/index.vue
- oa/workreport/statistics/OaWorkReportStatisticsDetail.vue
- oa/workreport/statistics/index.vue

#### views/pay（23）

- pay/app/components/AppForm.vue
- pay/app/components/channel/AlipayChannelForm.vue
- pay/app/components/channel/MockChannelForm.vue
- pay/app/components/channel/WalletChannelForm.vue
- pay/app/components/channel/WeixinChannelForm.vue
- pay/app/index.vue
- pay/cashier/index.vue
- pay/demo/order/index.vue
- pay/demo/withdraw/DemoWithdrawForm.vue
- pay/demo/withdraw/index.vue
- pay/notify/NotifyDetail.vue
- pay/notify/index.vue
- pay/order/OrderDetail.vue
- pay/order/index.vue
- pay/refund/RefundDetail.vue
- pay/refund/index.vue
- pay/transfer/TransferDetail.vue
- pay/transfer/index.vue
- pay/wallet/balance/WalletForm.vue
- pay/wallet/balance/index.vue
- pay/wallet/rechargePackage/WalletRechargePackageForm.vue
- pay/wallet/rechargePackage/index.vue
- pay/wallet/transaction/WalletTransactionList.vue

#### views/pms（83）

- pms/kb/document/KnowledgeContentMoveDialog.vue
- pms/kb/document/KnowledgeContentPermissionForm.vue
- pms/kb/document/KnowledgeDocumentComment.vue
- pms/kb/document/KnowledgeDocumentCreateForm.vue
- pms/kb/document/KnowledgeDocumentDetail.vue
- pms/kb/document/KnowledgeDocumentShareDialog.vue
- pms/kb/document/KnowledgeDocumentUpdateForm.vue
- pms/kb/document/KnowledgeFileUploadForm.vue
- pms/kb/document/KnowledgeFolderDetail.vue
- pms/kb/document/KnowledgeFolderForm.vue
- pms/kb/document/KnowledgeLibraryHome.vue
- pms/kb/document/KnowledgeLibrarySidebar.vue
- pms/kb/document/KnowledgeRecycleDetail.vue
- pms/kb/document/KnowledgeRecyclePanel.vue
- pms/kb/document/components/KnowledgeDocumentLabelSelect.vue
- pms/kb/document/index.vue
- pms/kb/document/share/index.vue
- pms/kb/document/types.ts（→ pms/kb/document/types.js）
- pms/kb/favorite/index.vue
- pms/kb/label/KnowledgeLabelForm.vue
- pms/kb/label/KnowledgeLabelManageDialog.vue
- pms/kb/label/index.vue
- pms/kb/library/KnowledgeGroupForm.vue
- pms/kb/library/KnowledgeGroupManageDialog.vue
- pms/kb/library/KnowledgeLibraryForm.vue
- pms/kb/library/KnowledgeMemberForm.vue
- pms/kb/library/components/KnowledgeLibrarySelect.vue
- pms/kb/library/index.vue
- pms/kb/library-template/KnowledgeLibraryTemplateForm.vue
- pms/kb/library-template/index.vue
- pms/kb/recent/index.vue
- pms/kb/recycle/index.vue
- pms/kb/search/index.vue
- pms/kb/utils/constants.ts（→ pms/kb/utils/constants.js）
- pms/kb/utils/format.ts（→ pms/kb/utils/format.js）
- pms/kb/utils/permission.ts（→ pms/kb/utils/permission.js）
- pms/pm/iteration/components/IterationForm.vue
- pms/pm/iteration/components/IterationSelect.vue
- pms/pm/iteration/components/IterationStartForm.vue
- pms/pm/iteration/detail/index.vue
- pms/pm/iteration/list/IterationList.vue
- pms/pm/project/archive/index.vue
- pms/pm/project/components/ProjectForm.vue
- pms/pm/project/components/ProjectMemberSelect.vue
- pms/pm/project/config/ProjectAnnouncementForm.vue
- pms/pm/project/config/ProjectAnnouncementList.vue
- pms/pm/project/config/ProjectBasicInfo.vue
- pms/pm/project/config/ProjectCollaborationConfig.vue
- pms/pm/project/config/ProjectMemberForm.vue
- pms/pm/project/config/ProjectMemberList.vue
- pms/pm/project/config/index.vue
- pms/pm/project/detail/PlanningBoard.vue
- pms/pm/project/detail/ProjectGantt.vue
- pms/pm/project/detail/ProjectOverview.vue
- pms/pm/project/detail/ProjectWorkLog.vue
- pms/pm/project/detail/index.vue
- pms/pm/project/list/components/group/ProjectGroupForm.vue
- pms/pm/project/list/components/group/ProjectGroupList.vue
- pms/pm/project/list/index.vue
- pms/pm/project/recycle/index.vue
- pms/pm/project/template/ProjectTemplateForm.vue
- pms/pm/project/template/index.vue
- pms/pm/utils/constants.ts（→ pms/pm/utils/constants.js）
- pms/pm/utils/format.ts（→ pms/pm/utils/format.js）
- pms/pm/workbench/components/ProjectSelect.vue
- pms/pm/workbench/index.vue
- pms/pm/workitem/components/WorkItemSelect.vue
- pms/pm/workitem/detail/WorkItemActivity.vue
- pms/pm/workitem/detail/WorkItemComment.vue
- pms/pm/workitem/detail/WorkItemDetail.vue
- pms/pm/workitem/detail/WorkItemSubtaskList.vue
- pms/pm/workitem/form/WorkItemForm.vue
- pms/pm/workitem/import/WorkItemImportForm.vue
- pms/pm/workitem/label/WorkItemLabelForm.vue
- pms/pm/workitem/label/WorkItemLabelList.vue
- pms/pm/workitem/label/WorkItemLabelSelect.vue
- pms/pm/workitem/list/WorkItemAllList.vue
- pms/pm/workitem/list/WorkItemList.vue
- pms/pm/workitem/status/WorkItemStatusDeleteForm.vue
- pms/pm/workitem/status/WorkItemStatusList.vue
- pms/pm/workitem/status/WorkItemStatusSelect.vue
- pms/pm/workitem/worklog/WorkItemWorkLogForm.vue
- pms/pm/workitem/worklog/WorkItemWorkLogList.vue

#### views/report（3）

- report/goview/index.vue
- report/jmreport/bi.vue
- report/jmreport/index.vue

#### views/system（68）

- system/area/AreaForm.vue
- system/area/components/AreaSelect.vue
- system/area/index.vue
- system/dept/DeptForm.vue
- system/dept/components/DeptSelect.vue
- system/dept/components/DeptTreeSelect.vue
- system/dept/index.vue
- system/dict/DictTypeForm.vue
- system/dict/data/DictDataForm.vue
- system/dict/data/index.vue（→ system/dict/data.vue）
- system/dict/index.vue
- system/loginlog/LoginLogDetail.vue
- system/loginlog/index.vue
- system/mail/account/MailAccountForm.vue
- system/mail/account/index.vue
- system/mail/log/MailLogDetail.vue
- system/mail/log/index.vue
- system/mail/template/MailTemplateForm.vue
- system/mail/template/MailTemplateSendForm.vue
- system/mail/template/components/MailTemplateSelect.vue
- system/mail/template/index.vue
- system/menu/MenuForm.vue
- system/menu/index.vue
- system/notice/NoticeForm.vue
- system/notice/index.vue
- system/notify/message/NotifyMessageDetail.vue
- system/notify/message/index.vue
- system/notify/my/MyNotifyMessageDetail.vue
- system/notify/my/index.vue
- system/notify/template/NotifyTemplateForm.vue
- system/notify/template/NotifyTemplateSendForm.vue
- system/notify/template/components/NotifyTemplateSelect.vue
- system/notify/template/index.vue
- system/oauth2/client/ClientForm.vue
- system/oauth2/client/index.vue
- system/oauth2/token/index.vue
- system/operatelog/OperateLogDetail.vue
- system/operatelog/index.vue
- system/post/PostForm.vue
- system/post/index.vue
- system/role/RoleAssignMenuForm.vue
- system/role/RoleDataPermissionForm.vue
- system/role/RoleForm.vue
- system/role/components/RoleSelect.vue
- system/role/index.vue
- system/sms/channel/SmsChannelForm.vue
- system/sms/channel/index.vue
- system/sms/log/SmsLogDetail.vue
- system/sms/log/index.vue
- system/sms/template/SmsTemplateForm.vue
- system/sms/template/SmsTemplateSendForm.vue
- system/sms/template/components/SmsTemplateSelect.vue
- system/sms/template/index.vue
- system/social/client/SocialClientForm.vue
- system/social/client/index.vue
- system/social/user/SocialUserDetail.vue
- system/social/user/index.vue
- system/tenant/TenantForm.vue
- system/tenant/index.vue
- system/tenantPackage/TenantPackageForm.vue
- system/tenantPackage/index.vue
- system/user/UserAssignRoleForm.vue
- system/user/UserForm.vue
- system/user/UserImportForm.vue
- system/user/components/UserSelect.vue
- system/user/components/UserSelectDialogV2.vue
- system/user/components/UserSelectV2.vue
- system/user/index.vue

#### views/wms（42）

- wms/home/components/WmsHomeInventoryCharts.vue
- wms/home/components/WmsHomeOrderSummaryCards.vue
- wms/home/components/WmsHomeOrderTrendChart.vue
- wms/home/index.vue
- wms/inventory/components/InventorySelect.vue
- wms/inventory/history/index.vue
- wms/inventory/index/index.vue
- wms/md/item/ItemForm.vue
- wms/md/item/brand/ItemBrandForm.vue
- wms/md/item/brand/components/ItemBrandSelect.vue
- wms/md/item/brand/index.vue
- wms/md/item/category/ItemCategoryForm.vue
- wms/md/item/category/components/ItemCategorySelect.vue
- wms/md/item/category/components/ItemCategoryTree.vue
- wms/md/item/category/index.vue
- wms/md/item/index.vue
- wms/md/item/sku/components/ItemSkuSelect.vue
- wms/md/merchant/MerchantForm.vue
- wms/md/merchant/components/MerchantSelect.vue
- wms/md/merchant/index.vue
- wms/md/warehouse/WarehouseForm.vue
- wms/md/warehouse/components/WarehouseSelect.vue
- wms/md/warehouse/index.vue
- wms/order/check/CheckOrderDetail.vue
- wms/order/check/CheckOrderForm.vue
- wms/order/check/CheckOrderPrint.vue
- wms/order/check/index.vue
- wms/order/movement/MovementOrderDetail.vue
- wms/order/movement/MovementOrderForm.vue
- wms/order/movement/MovementOrderPrint.vue
- wms/order/movement/index.vue
- wms/order/receipt/ReceiptOrderDetail.vue
- wms/order/receipt/ReceiptOrderForm.vue
- wms/order/receipt/ReceiptOrderPrint.vue
- wms/order/receipt/index.vue
- wms/order/shipment/ShipmentOrderDetail.vue
- wms/order/shipment/ShipmentOrderForm.vue
- wms/order/shipment/ShipmentOrderPrint.vue
- wms/order/shipment/index.vue
- wms/utils/constants.ts（→ wms/utils/constants.js）
- wms/utils/format.ts（→ wms/utils/format.js）
- wms/utils/order.ts（→ wms/utils/order.js）

## 三、逐功能验收追踪

功能分母 = Vue3 `src/views` 下全部 `.vue` 页面（每个 SFC 计一个功能行），加上公共功能（登录/布局/组件）清单。状态口径：**通过/部分(浏览器)** = 可重跑测试脚本真实加载该 SFC（证据列脚本名）；**部分(静态)** = 仅静态契约/Node 级检查，未进浏览器；**待验收** = 无任何证据。状态只引用可重跑脚本与 `AI_CHAT_ACCEPTANCE.md` / `MIGRATION_PROGRESS.md`，/private/tmp 日志与文档叙述不算。

### ai（69 个功能页：通过(浏览器) 69 / 部分(浏览器) 0 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：文档缓存导航修复；知识库→文档→分段真实GET通过；AI聊天25组固定分母见 AI_CHAT_ACCEPTANCE.md（通过2/部分8/未验收15，真实后端0/25）

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| chat/index/components/conversation/ConversationList.vue | 通过 | AI_CHAT组：01通过/02通过/03通过/05通过/06通过/07通过/08通过 |
| chat/index/components/conversation/ConversationUpdateForm.vue | 通过 | AI_CHAT组：09通过(父级刷新为超集差异已记录) |
| chat/index/components/message/MessageFileUpload.vue | 通过 | AI_CHAT组：13通过 |
| chat/index/components/message/MessageFiles.vue | 通过 | AI_CHAT组：22通过 |
| chat/index/components/message/MessageKnowledge.vue | 通过 | AI_CHAT组：20通过 |
| chat/index/components/message/MessageList.vue | 通过 | AI_CHAT组：14通过/15通过/16通过/17通过/19通过 |
| chat/index/components/message/MessageListEmpty.vue | 通过 | AI_CHAT组：10通过(推荐词带词发送) |
| chat/index/components/message/MessageLoading.vue | 通过(浏览器) | final-ai-chat-browser-test.js |
| chat/index/components/message/MessageNewConversation.vue | 通过(浏览器) | final-ai-chat-browser-test.js |
| chat/index/components/message/MessageReasoning.vue | 通过 | AI_CHAT组：14通过 |
| chat/index/components/message/MessageWebSearch.vue | 通过 | AI_CHAT组：21通过 |
| chat/index/components/role/RoleCategoryList.vue | 通过(浏览器) | final-ai-chat-browser-test.js |
| chat/index/components/role/RoleList.vue | 通过 | AI_CHAT组：23通过/24通过 |
| chat/index/components/role/RoleRepository.vue | 通过 | AI_CHAT组：23通过(疑点#2目标更完整差异已记录)/25通过 |
| chat/index/index.vue | 通过 | AI_CHAT组：04通过/09通过/10通过/11通过/12通过/17通过/18通过 |
| chat/manager/ChatConversationList.vue | 通过(浏览器) | final-ai-chat-browser-test.js |
| chat/manager/ChatMessageList.vue | 通过(浏览器) | final-ai-chat-browser-test.js |
| chat/manager/index.vue | 通过 | AI_CHAT组：04通过/09通过/10通过/11通过/12通过/17通过/18通过 |
| image/index/components/ImageCard.vue | 通过(浏览器) | ai-domain-image-browser-test.js |
| image/index/components/ImageDetail.vue | 通过(浏览器) | ai-domain-image-browser-test.js |
| image/index/components/ImageList.vue | 通过(浏览器) | ai-domain-image-browser-test.js |
| image/index/components/common/index.vue | 通过(浏览器) | ai-domain-image-browser-test.js |
| image/index/components/dall3/index.vue | 通过(浏览器) | ai-domain-image-browser-test.js |
| image/index/components/midjourney/index.vue | 通过(浏览器) | final-ai-domain-browser-test.js |
| image/index/components/stableDiffusion/index.vue | 通过(浏览器) | final-ai-domain-browser-test.js |
| image/index/index.vue | 通过(浏览器) | ai-domain-image-browser-test.js |
| image/manager/index.vue | 通过(浏览器) | ai-domain-image-browser-test.js |
| image/square/index.vue | 通过(浏览器) | ai-domain-image-browser-test.js |
| knowledge/document/form/ProcessStep.vue | 通过(浏览器) | ai-tail-knowledge-document-browser-test.js |
| knowledge/document/form/SplitStep.vue | 通过(浏览器) | ai-tail-knowledge-document-browser-test.js |
| knowledge/document/form/UploadStep.vue | 通过(浏览器) | ai-tail-knowledge-document-browser-test.js |
| knowledge/document/form/index.vue | 通过(浏览器) | ai-tail-knowledge-document-browser-test.js |
| knowledge/document/index.vue | 通过(浏览器) | tail2-rest-tail-browser-test.js |
| knowledge/knowledge/KnowledgeForm.vue | 通过(浏览器) | ai-knowledge-dialog-browser-test.js（真实加载 SFC：create/update 提交载荷、必填校验、编辑回填、延迟详情、失败恢复、重开重置、全屏/销毁） |
| knowledge/knowledge/index.vue | 通过(浏览器) | ai-knowledge-app-browser-test.js（真实浏览器：列表 API、编辑弹窗回填、向量模型下拉与 /ai/model/simple-list 逐项一致、全屏切换、取消销毁、新增弹窗空白态） |
| knowledge/knowledge/retrieval/index.vue | 通过(浏览器) | final-ai-domain-browser-test.js |
| knowledge/segment/KnowledgeSegmentForm.vue | 通过(浏览器) | ai-knowledge-dialog-browser-test.js（真实加载 SFC：create/update 载荷、校验、回填、失败恢复、重开重置、全屏） |
| knowledge/segment/index.vue | 通过(浏览器) | sys-ai-rest-ai-knowledge-model-browser-test.js |
| mindmap/index/components/Left.vue | 通过(浏览器) | final-ai-domain-browser-test.js |
| mindmap/index/components/Right.vue | 通过(浏览器) | final-ai-domain-browser-test.js |
| mindmap/index/index.vue | 通过(浏览器) | ai-domain-write-mindmap-browser-test.js |
| mindmap/manager/index.vue | 通过(浏览器) | ai-domain-write-mindmap-browser-test.js |
| model/apiKey/ApiKeyForm.vue | 通过(浏览器) | last-ai-apikey/tool-role-browser-test.js |
| model/apiKey/index.vue | 通过(浏览器) | last-ai-apikey/tool-role-browser-test.js |
| model/chatRole/ChatRoleForm.vue | 通过(浏览器) | ai-role-repository-browser-test.js（真实加载 SFC：createMy/updateMy 载荷契约、必填校验、getChatRole 回填、deleteMy 直删、成功刷新；role 仓库卡片部分属 chat/index 子树不计） |
| model/chatRole/index.vue | 通过(浏览器) | last-ai-apikey/tool-role-browser-test.js |
| model/model/ModelForm.vue | 通过(浏览器) | sys-ai-rest-ai-knowledge-model-browser-test.js |
| model/model/index.vue | 通过(浏览器) | sys-ai-rest-ai-knowledge-model-browser-test.js |
| model/tool/ToolForm.vue | 通过(浏览器) | last-ai-apikey/tool-role-browser-test.js |
| model/tool/index.vue | 通过(浏览器) | last-ai-apikey/tool-role-browser-test.js |
| music/index/index.vue | 通过(浏览器) | ai-domain-music-browser-test.js |
| music/index/list/audioBar/index.vue | 通过(浏览器) | final-ai-write-music-browser-test.js |
| music/index/list/index.vue | 通过(浏览器) | final-ai-write-music-browser-test.js |
| music/index/list/songCard/index.vue | 通过(浏览器) | final-ai-write-music-browser-test.js |
| music/index/list/songInfo/index.vue | 通过(浏览器) | final-ai-write-music-browser-test.js |
| music/index/mode/desc.vue | 通过(浏览器) | final-ai-write-music-browser-test.js |
| music/index/mode/index.vue | 通过(浏览器) | final-ai-write-music-browser-test.js |
| music/index/mode/lyric.vue | 通过(浏览器) | final-ai-write-music-browser-test.js |
| music/index/title/index.vue | 通过(浏览器) | final-ai-write-music-browser-test.js |
| music/manager/index.vue | 通过(浏览器) | ai-domain-music-browser-test.js |
| workflow/form/BasicInfo.vue | 通过(浏览器) | final-ai-domain-browser-test.js |
| workflow/form/WorkflowDesign.vue | 通过(浏览器) | ai-tail-workflow-design-browser-test.js |
| workflow/form/index.vue | 通过(浏览器) | sys-ai-rest-ai-workflow-browser-test.js |
| workflow/index.vue | 通过(浏览器) | sys-ai-rest-ai-workflow-browser-test.js |
| write/index/components/Left.vue | 通过(浏览器) | final-ai-write-music-browser-test.js |
| write/index/components/Right.vue | 通过(浏览器) | final-ai-write-music-browser-test.js |
| write/index/components/Tag.vue | 通过(浏览器) | final-ai-write-music-browser-test.js |
| write/index/index.vue | 通过(浏览器) | ai-domain-write-mindmap-browser-test.js |
| write/manager/index.vue | 通过(浏览器) | ai-domain-write-mindmap-browser-test.js |

### bpm（45 个功能页：通过(浏览器) 45 / 部分(浏览器) 0 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：多组真实组件回归；空意见抄送/WAIT减签/节点必填缺陷修复通过；时间线选人、真实审批闭环待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| category/CategoryForm.vue | 通过(浏览器) | bpm-dialog-consumers-browser-test.js（真实加载 SFC：create/update 载荷、必填校验、成员选择、重命名紧凑模式宽度与字段裁剪、重开重置） |
| category/index.vue | 通过(浏览器) | bpm-admin-meta-lists-browser-test.js |
| form/editor/index.vue | 通过(浏览器) | bpm-dialog-consumers-browser-test.js（脚本读取 Vue2 路径 bpm/form/formEditor.vue，对应 Vue3 bpm/form/editor/index.vue：update/copy 两种模式、id 优先加载、保存弹窗命名、create/update 载荷） |
| form/index.vue | 通过(浏览器) | bpm-admin-meta-lists-browser-test.js |
| group/UserGroupForm.vue | 通过(浏览器) | bpm-dialog-consumers-browser-test.js（真实加载 SFC：create/update 载荷、成员多选回填与追加、必填校验、全屏、重开重置） |
| group/index.vue | 通过(浏览器) | bpm-admin-meta-lists-browser-test.js |
| model/CategoryDraggableModel.vue | 通过(浏览器) | bpm-admin-model-browser-test.js |
| model/ModelImportForm.vue | 通过(浏览器) | bpm-dialog-consumers-browser-test.js + bpm-print-editor-app-browser-test.js（真实加载 SFC 及真实页面导入弹窗：文件解析回填 key/name、手动改名、上传项移除、确定提交载荷、重开重置、全屏） |
| model/definition/index.vue | 通过(浏览器) | bpm-admin-definition-browser-test.js |
| model/form/BasicInfo.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| model/form/ExtraSettings.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| model/form/FormDesign.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| model/form/PrintTemplate/Index.vue | 通过(浏览器) | bpm-print-editor-app-browser-test.js（真实页面编辑器：工具栏、撤销/重做、图片插入、表格插入、流程字段 mention 插入与 HTML 序列化）+ bpm-print-editor-browser-test.js（读取 Vue2 路径 bpm/model/form/PrintTemplateEditor.vue 独立挂载，同类编辑器交互） |
| model/form/PrintTemplate/MentionModal.vue | 通过(浏览器) | bpm-print-editor-app-browser-test.js（真实页面经“搜索流程字段”搜索并插入 endTime mention，校验 mention 数量与序列化 id） |
| model/form/ProcessDesign.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| model/form/editor/index.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| model/form/index.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| model/index.vue | 通过(浏览器) | bpm-admin-model-browser-test.js |
| oa/leave/create.vue | 通过(浏览器) | oa-mig-reimbursement-browser-test.js |
| oa/leave/detail.vue | 通过(浏览器) | oa-mig-reimbursement-browser-test.js |
| oa/leave/index.vue | 通过(浏览器) | oa-mig-reimbursement-browser-test.js |
| processExpression/ProcessExpressionForm.vue | 通过(浏览器) | bpm-dialog-consumers-browser-test.js（真实加载 SFC：create/update 载荷、表达式必填校验、状态单选、全屏、重开重置） |
| processExpression/index.vue | 通过(浏览器) | bpm-admin-meta-lists-browser-test.js |
| processInstance/create/ProcessDefinitionDetail.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| processInstance/create/index.vue | 通过(浏览器) | bpm-lifecycle-browser-test.js（真实浏览器：流程定义搜索、选择定义、表单填写、发起提交、待办产生校验） |
| processInstance/detail/PrintDialog.vue | 通过(浏览器) | tail-bpm-process-instance-browser-test.js |
| processInstance/detail/ProcessInstanceBpmnViewer.vue | 通过(浏览器) | tail-bpm-process-instance-browser-test.js |
| processInstance/detail/ProcessInstanceCommentList.vue | 通过(浏览器) | tail-bpm-process-instance-browser-test.js |
| processInstance/detail/ProcessInstanceOperationButton.vue | 通过(浏览器) | bpm-operation-actions-browser-test.js（真实加载 SFC：抄送/通过/拒绝/减签/转办等动作弹窗、必填校验、WAIT 状态按钮门禁、成功回调、载荷断言） |
| processInstance/detail/ProcessInstanceSimpleViewer.vue | 通过(浏览器) | tail-bpm-process-instance-browser-test.js |
| processInstance/detail/ProcessInstanceTaskList.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| processInstance/detail/ProcessInstanceTimeline.vue | 通过(浏览器) | tail-bpm-process-instance-browser-test.js |
| processInstance/detail/SignDialog.vue | 通过(浏览器) | tail-bpm-process-instance-browser-test.js |
| processInstance/detail/index.vue | 通过(浏览器) | bpm-lifecycle-browser-test.js（真实浏览器流程实例详情页：操作栏“通过”、意见弹窗填写确定、后端流程状态流转校验） |
| processInstance/index.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| processInstance/manager/index.vue | 通过(浏览器) | tail-bpm-process-instance-browser-test.js |
| processInstance/report/index.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| processListener/ProcessListenerForm.vue | 通过(浏览器) | bpm-dialog-consumers-browser-test.js（真实加载 SFC：类型/事件联动（execution/task 事件列表）、值类型选择、create/update 载荷、必填校验、全屏） |
| processListener/index.vue | 通过(浏览器) | bpm-admin-meta-lists-browser-test.js |
| simple/SimpleModelDesign.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| task/components/TaskEvidenceCell.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| task/copy/index.vue | 通过(浏览器) | bpm-copy-users-browser-test.js（真实加载 SFC：列表渲染、分页、流程实例名搜索、详情跳转路由、列表失败恢复） |
| task/done/index.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| task/manager/index.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |
| task/todo/index.vue | 通过(浏览器) | tail2-bpm-tail-browser-test.js |

### crm（118 个功能页：通过(浏览器) 118 / 部分(浏览器) 0 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：跟进关联公共分页选择器真实组件回归通过；逐功能/权限/真实写入待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| backlog/components/ClueFollowList.vue | 通过(浏览器) | crm-infra-final-crm-status-backlog-browser-test.js |
| backlog/components/ContractAuditList.vue | 通过(浏览器) | crm-infra-final-crm-status-backlog-browser-test.js |
| backlog/components/ContractRemindList.vue | 通过(浏览器) | crm-infra-final-crm-status-backlog-browser-test.js |
| backlog/components/CustomerFollowList.vue | 通过(浏览器) | crm-infra-final-crm-status-backlog-browser-test.js |
| backlog/components/CustomerPutPoolRemindList.vue | 通过(浏览器) | crm-infra-final-crm-status-backlog-browser-test.js |
| backlog/components/CustomerTodayContactList.vue | 通过(浏览器) | crm-infra-final-crm-status-backlog-browser-test.js |
| backlog/components/ReceivableAuditList.vue | 通过(浏览器) | crm-infra-final-crm-status-backlog-browser-test.js |
| backlog/components/ReceivablePlanRemindList.vue | 通过(浏览器) | crm-infra-final-crm-status-backlog-browser-test.js |
| backlog/index.vue | 通过(浏览器) | crm-aux-pool-backlog-browser-test.js |
| business/BusinessForm.vue | 通过(浏览器) | crm-core-sales-browser-test.js |
| business/BusinessUpdateStatusForm.vue | 通过(浏览器) | last-crm-biz/form/receivable-rank-browser-test.js |
| business/components/BusinessList.vue | 通过(浏览器) | last-crm-biz/form/receivable-rank-browser-test.js |
| business/components/BusinessListModal.vue | 通过(浏览器) | crm-followup-relations-browser-test.js（真实 SFC：打开、全屏、分页、搜索、勾选确认回填） |
| business/components/BusinessProductForm.vue | 通过(浏览器) | tail2-rest-tail-browser-test.js |
| business/detail/BusinessDetailsHeader.vue | 通过(浏览器) | crm-infra-final-crm-detail-browser-test.js |
| business/detail/BusinessDetailsInfo.vue | 通过(浏览器) | crm-infra-final-crm-detail-browser-test.js |
| business/detail/BusinessProductList.vue | 通过(浏览器) | crm-infra-final-crm-detail-browser-test.js |
| business/detail/index.vue | 通过(浏览器) | crm-infra-final-crm-detail-browser-test.js |
| business/index.vue | 通过(浏览器) | crm-core-sales-browser-test.js |
| business/status/BusinessStatusForm.vue | 通过(浏览器) | crm-infra-final-crm-status-backlog-browser-test.js |
| business/status/index.vue | 通过(浏览器) | crm-infra-final-crm-status-backlog-browser-test.js |
| clue/ClueForm.vue | 通过(浏览器) | crm-core-sales-browser-test.js |
| clue/detail/ClueDetailsHeader.vue | 通过(浏览器) | tail-crm-detail-statistics-browser-test.js |
| clue/detail/ClueDetailsInfo.vue | 通过(浏览器) | tail-crm-detail-statistics-browser-test.js |
| clue/detail/index.vue | 通过(浏览器) | tail2-rest-tail-browser-test.js |
| clue/index.vue | 通过(浏览器) | crm-core-sales-browser-test.js |
| contact/ContactForm.vue | 通过(浏览器) | crm-core-customer-browser-test.js |
| contact/components/ContactList.vue | 通过(浏览器) | last-crm-biz/form/receivable-rank-browser-test.js |
| contact/components/ContactListModal.vue | 通过(浏览器) | crm-followup-relations-browser-test.js（真实 SFC：打开、全屏、第 11 页分页、名称搜索、勾选确认回填） |
| contact/detail/ContactDetailsHeader.vue | 通过(浏览器) | tail-crm-detail-statistics-browser-test.js |
| contact/detail/ContactDetailsInfo.vue | 通过(浏览器) | tail-crm-detail-statistics-browser-test.js |
| contact/detail/index.vue | 通过(浏览器) | tail2-rest-tail-browser-test.js |
| contact/index.vue | 通过(浏览器) | crm-core-customer-browser-test.js |
| contract/ContractForm.vue | 通过(浏览器) | crm-core-contract-browser-test.js |
| contract/components/ContractList.vue | 通过(浏览器) | last-crm-biz/form/receivable-rank-browser-test.js |
| contract/components/ContractProductForm.vue | 通过(浏览器) | last-crm-biz/form/receivable-rank-browser-test.js |
| contract/config/index.vue | 通过(浏览器) | hrm-crm-rest-crm-config-browser-test.js |
| contract/detail/ContractDetailsHeader.vue | 通过(浏览器) | final-crm-detail-browser-test.js |
| contract/detail/ContractDetailsInfo.vue | 通过(浏览器) | final-crm-detail-browser-test.js |
| contract/detail/ContractProductList.vue | 通过(浏览器) | final-crm-detail-browser-test.js |
| contract/detail/index.vue | 通过(浏览器) | final-crm-detail-browser-test.js |
| contract/index.vue | 通过(浏览器) | crm-core-contract-browser-test.js |
| customer/CustomerForm.vue | 通过(浏览器) | crm-core-customer-browser-test.js |
| customer/CustomerImportForm.vue | 通过(浏览器) | last-crm-biz/form/receivable-rank-browser-test.js |
| customer/detail/CustomerDetailsHeader.vue | 通过(浏览器) | final-crm-detail-browser-test.js |
| customer/detail/CustomerDetailsInfo.vue | 通过(浏览器) | final-crm-detail-browser-test.js |
| customer/detail/index.vue | 通过(浏览器) | final-crm-detail-browser-test.js |
| customer/index.vue | 通过(浏览器) | crm-core-customer-browser-test.js |
| customer/limitConfig/CustomerLimitConfigForm.vue | 通过(浏览器) | hrm-crm-rest-crm-plan-limit-browser-test.js |
| customer/limitConfig/CustomerLimitConfigList.vue | 通过(浏览器) | hrm-crm-rest-crm-plan-limit-browser-test.js |
| customer/limitConfig/index.vue | 通过(浏览器) | hrm-crm-rest-crm-plan-limit-browser-test.js |
| customer/pool/CustomerDistributeForm.vue | 通过(浏览器) | crm-aux-pool-backlog-browser-test.js |
| customer/pool/index.vue | 通过(浏览器) | crm-aux-pool-backlog-browser-test.js |
| customer/poolConfig/index.vue | 通过(浏览器) | crm-aux-pool-backlog-browser-test.js |
| followup/FollowUpRecordForm.vue | 通过(浏览器) | crm-followup-relations-browser-test.js（真实 SFC：客户模式打开、添加联系人/商机、跨页追加去重、搜索、取消、提交关联 ID、全屏） |
| followup/components/FollowUpRecordBusinessForm.vue | 通过(浏览器) | final-crm-detail-browser-test.js |
| followup/components/FollowUpRecordContactForm.vue | 通过(浏览器) | final-crm-detail-browser-test.js |
| followup/index.vue | 通过(浏览器) | crm-aux-pool-backlog-browser-test.js |
| performance/config/PerformanceConfigForm.vue | 通过(浏览器) | hrm-crm-rest-crm-config-browser-test.js |
| performance/config/index.vue | 通过(浏览器) | hrm-crm-rest-crm-config-browser-test.js |
| permission/components/PermissionForm.vue | 通过(浏览器) | crm-aux-permission-browser-test.js |
| permission/components/PermissionList.vue | 通过(浏览器) | crm-aux-permission-browser-test.js |
| permission/components/TransferForm.vue | 通过(浏览器) | crm-aux-permission-browser-test.js |
| product/ProductForm.vue | 通过(浏览器) | crm-aux-product-browser-test.js |
| product/category/ProductCategoryForm.vue | 通过(浏览器) | crm-aux-product-browser-test.js |
| product/category/index.vue | 通过(浏览器) | crm-aux-product-browser-test.js |
| product/detail/ProductDetailsHeader.vue | 通过(浏览器) | final-crm-detail-browser-test.js |
| product/detail/ProductDetailsInfo.vue | 通过(浏览器) | final-crm-detail-browser-test.js |
| product/detail/index.vue | 通过(浏览器) | final-crm-detail-browser-test.js |
| product/index.vue | 通过(浏览器) | crm-aux-product-browser-test.js |
| receivable/ReceivableForm.vue | 通过(浏览器) | crm-core-contract-browser-test.js |
| receivable/components/ReceivableList.vue | 通过(浏览器) | last-crm-biz/form/receivable-rank-browser-test.js |
| receivable/detail/ReceivableDetailsHeader.vue | 通过(浏览器) | crm-infra-final-crm-detail-browser-test.js |
| receivable/detail/ReceivableDetailsInfo.vue | 通过(浏览器) | crm-infra-final-crm-detail-browser-test.js |
| receivable/detail/index.vue | 通过(浏览器) | crm-infra-final-crm-detail-browser-test.js |
| receivable/index.vue | 通过(浏览器) | crm-core-contract-browser-test.js |
| receivable/plan/ReceivablePlanForm.vue | 通过(浏览器) | hrm-crm-rest-crm-plan-limit-browser-test.js |
| receivable/plan/components/ReceivablePlanList.vue | 通过(浏览器) | last-crm-biz/form/receivable-rank-browser-test.js |
| receivable/plan/detail/ReceivablePlanDetailsHeader.vue | 通过(浏览器) | last-crm-biz/form/receivable-rank-browser-test.js |
| receivable/plan/detail/ReceivablePlanDetailsInfo.vue | 通过(浏览器) | last-crm-biz/form/receivable-rank-browser-test.js |
| receivable/plan/detail/index.vue | 通过(浏览器) | last-crm-biz/form/receivable-rank-browser-test.js |
| receivable/plan/index.vue | 通过(浏览器) | hrm-crm-rest-crm-plan-limit-browser-test.js |
| statistics/customer/components/CustomerConversionStat.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/customer/components/CustomerDealCycleByArea.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/customer/components/CustomerDealCycleByProduct.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/customer/components/CustomerDealCycleByUser.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/customer/components/CustomerFollowUpSummary.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/customer/components/CustomerFollowUpType.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/customer/components/CustomerPoolSummary.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/customer/components/CustomerSummary.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/customer/index.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/funnel/components/BusinessInversionRateSummary.vue | 通过(浏览器) | tail-crm-detail-statistics-browser-test.js |
| statistics/funnel/components/BusinessSummary.vue | 通过(浏览器) | tail-crm-detail-statistics-browser-test.js |
| statistics/funnel/components/FunnelBusiness.vue | 通过(浏览器) | crm-funnel-chart-browser-test.js（真实 SFC/ECharts：数量/金额视角、切换不重查、PNG 导出、失败释放、空序列、销毁）+ crm-funnel-app-browser-test.js（真实路由图表值逐项核对与真实导出） |
| statistics/funnel/index.vue | 通过(浏览器) | crm-funnel-tabs-browser-test.js（真实父 SFC：页签切换/程序切换/查询/同页签不重载）+ crm-funnel-app-browser-test.js（真实路由 /crm/statistics/funnel 全交互） |
| statistics/performance/components/ContractCountPerformance.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/performance/components/ContractPricePerformance.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/performance/components/ContractSummary.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/performance/components/ReceivablePricePerformance.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/performance/index.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/performanceTarget/index.vue | 通过(浏览器) | crm-statistics-trend-browser-test.js |
| statistics/portrait/components/PortraitCustomerArea.vue | 通过(浏览器) | crm-statistics-distribution-browser-test.js |
| statistics/portrait/components/PortraitCustomerIndustry.vue | 通过(浏览器) | crm-statistics-distribution-browser-test.js |
| statistics/portrait/components/PortraitCustomerLevel.vue | 通过(浏览器) | crm-statistics-distribution-browser-test.js |
| statistics/portrait/components/PortraitCustomerSource.vue | 通过(浏览器) | crm-statistics-distribution-browser-test.js |
| statistics/portrait/index.vue | 通过(浏览器) | crm-statistics-distribution-browser-test.js |
| statistics/product/components/ProductCategorySummary.vue | 通过(浏览器) | crm-statistics-distribution-browser-test.js |
| statistics/product/components/ProductSalesList.vue | 通过(浏览器) | crm-statistics-distribution-browser-test.js |
| statistics/product/index.vue | 通过(浏览器) | crm-statistics-distribution-browser-test.js |
| statistics/rank/components/ContactCountRank.vue | 通过(浏览器) | last-crm-biz/form/receivable-rank-browser-test.js |
| statistics/rank/components/ContractCountRank.vue | 通过(浏览器) | tail-crm-detail-statistics-browser-test.js |
| statistics/rank/components/ContractPriceRank.vue | 通过(浏览器) | tail-crm-detail-statistics-browser-test.js |
| statistics/rank/components/CustomerCountRank.vue | 通过(浏览器) | tail-crm-detail-statistics-browser-test.js |
| statistics/rank/components/FollowCountRank.vue | 通过(浏览器) | tail-crm-detail-statistics-browser-test.js |
| statistics/rank/components/FollowCustomerCountRank.vue | 通过(浏览器) | tail-crm-detail-statistics-browser-test.js |
| statistics/rank/components/ProductSalesRank.vue | 通过(浏览器) | tail-crm-detail-statistics-browser-test.js |
| statistics/rank/components/ReceivablePriceRank.vue | 通过(浏览器) | tail-crm-detail-statistics-browser-test.js |
| statistics/rank/index.vue | 通过(浏览器) | crm-statistics-distribution-browser-test.js |

### erp（63 个功能页：通过(浏览器) 63 / 部分(浏览器) 0 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：库存产品表单删空回归；首页工具栏/ECharts下载缩放通过；单据联动待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| finance/account/AccountForm.vue | 通过(浏览器) | erp-admin-finance-browser-test.js |
| finance/account/index.vue | 通过(浏览器) | erp-admin-finance-browser-test.js |
| finance/payment/FinancePaymentForm.vue | 通过(浏览器) | erp-payment-form-browser-test.js |
| finance/payment/components/FinancePaymentItemForm.vue | 通过(浏览器) | erp-payment-form-browser-test.js |
| finance/payment/index.vue | 通过(浏览器) | erp-admin-finance-browser-test.js |
| finance/receipt/FinanceReceiptForm.vue | 通过(浏览器) | erp-payment-form-browser-test.js |
| finance/receipt/components/FinanceReceiptItemForm.vue | 通过(浏览器) | erp-payment-form-browser-test.js |
| finance/receipt/index.vue | 通过(浏览器) | erp-admin-finance-browser-test.js |
| home/components/SummaryCard.vue | 通过(浏览器) | erp-batch-home-browser-test.js |
| home/components/TimeSummaryChart.vue | 通过(浏览器) | erp-home-chart-browser-test.js |
| home/index.vue | 通过(浏览器) | erp-batch-home-browser-test.js |
| product/category/ProductCategoryForm.vue | 通过(浏览器) | erp-batch-product-browser-test.js |
| product/category/index.vue | 通过(浏览器) | erp-batch-product-browser-test.js |
| product/product/ProductForm.vue | 通过(浏览器) | erp-admin-trade-browser-test.js |
| product/product/index.vue | 通过(浏览器) | erp-admin-trade-browser-test.js |
| product/unit/ProductUnitForm.vue | 通过(浏览器) | erp-batch-product-browser-test.js |
| product/unit/index.vue | 通过(浏览器) | mes-erp-rest-erp-docs-browser-test.js |
| purchase/in/PurchaseInForm.vue | 通过(浏览器) | erp-more2-purchase-browser-test.js |
| purchase/in/components/PurchaseInItemForm.vue | 通过(浏览器) | erp-more2-purchase-browser-test.js |
| purchase/in/components/PurchaseInPaymentEnableList.vue | 通过(浏览器) | erp-batch-enable-lists-browser-test.js |
| purchase/in/index.vue | 通过(浏览器) | mes-erp-rest-erp-docs-browser-test.js |
| purchase/order/PurchaseOrderForm.vue | 通过(浏览器) | erp-more2-purchase-browser-test.js |
| purchase/order/components/PurchaseOrderInEnableList.vue | 通过(浏览器) | erp-batch-enable-lists-browser-test.js |
| purchase/order/components/PurchaseOrderItemForm.vue | 通过(浏览器) | erp-more2-purchase-browser-test.js |
| purchase/order/components/PurchaseOrderReturnEnableList.vue | 通过(浏览器) | erp-batch-enable-lists-browser-test.js |
| purchase/order/index.vue | 通过(浏览器) | erp-admin-trade-browser-test.js |
| purchase/return/PurchaseReturnForm.vue | 通过(浏览器) | erp-more2-purchase-browser-test.js |
| purchase/return/components/PurchaseReturnItemForm.vue | 通过(浏览器) | erp-more2-purchase-browser-test.js |
| purchase/return/components/PurchaseReturnRefundEnableList.vue | 通过(浏览器) | erp-batch-enable-lists-browser-test.js |
| purchase/return/index.vue | 通过(浏览器) | iot-erp-rest-erp-docs-browser-test.js |
| purchase/supplier/SupplierForm.vue | 通过(浏览器) | erp-batch-partner-browser-test.js |
| purchase/supplier/index.vue | 通过(浏览器) | erp-batch-partner-browser-test.js |
| sale/customer/CustomerForm.vue | 通过(浏览器) | erp-batch-partner-browser-test.js |
| sale/customer/index.vue | 通过(浏览器) | erp-batch-partner-browser-test.js |
| sale/order/SaleOrderForm.vue | 通过(浏览器) | erp-more2-sale-browser-test.js |
| sale/order/components/SaleOrderItemForm.vue | 通过(浏览器) | erp-more2-sale-browser-test.js |
| sale/order/components/SaleOrderOutEnableList.vue | 通过(浏览器) | erp-batch-enable-lists-browser-test.js |
| sale/order/components/SaleOrderReturnEnableList.vue | 通过(浏览器) | erp-batch-enable-lists-browser-test.js |
| sale/order/index.vue | 通过(浏览器) | erp-admin-trade-browser-test.js |
| sale/out/SaleOutForm.vue | 通过(浏览器) | erp-more2-sale-browser-test.js |
| sale/out/components/SaleOutItemForm.vue | 通过(浏览器) | erp-more2-sale-browser-test.js |
| sale/out/components/SaleOutReceiptEnableList.vue | 通过(浏览器) | erp-batch-enable-lists-browser-test.js |
| sale/out/index.vue | 通过(浏览器) | iot-erp-rest-erp-docs-browser-test.js |
| sale/return/SaleReturnForm.vue | 通过(浏览器) | erp-more2-sale-browser-test.js |
| sale/return/components/SaleReturnItemForm.vue | 通过(浏览器) | erp-more2-sale-browser-test.js |
| sale/return/components/SaleReturnRefundEnableList.vue | 通过(浏览器) | erp-batch-enable-lists-browser-test.js |
| sale/return/index.vue | 通过(浏览器) | iot-erp-rest-erp-docs-browser-test.js |
| stock/check/StockCheckForm.vue | 通过(浏览器) | erp-batch-stock-forms-browser-test.js |
| stock/check/components/StockCheckItemForm.vue | 通过(浏览器) | erp-stock-items-browser-test.js |
| stock/check/index.vue | 通过(浏览器) | erp-batch-stock-forms-browser-test.js |
| stock/in/StockInForm.vue | 通过(浏览器) | erp-batch-stock-forms-browser-test.js |
| stock/in/components/StockInItemForm.vue | 通过(浏览器) | erp-stock-items-browser-test.js |
| stock/in/index.vue | 通过(浏览器) | mes-erp-rest-erp-docs-browser-test.js |
| stock/move/StockMoveForm.vue | 通过(浏览器) | erp-batch-stock-forms-browser-test.js |
| stock/move/components/StockMoveItemForm.vue | 通过(浏览器) | erp-stock-items-browser-test.js |
| stock/move/index.vue | 通过(浏览器) | mes-erp-rest-erp-docs-browser-test.js |
| stock/out/StockOutForm.vue | 通过(浏览器) | erp-batch-stock-forms-browser-test.js |
| stock/out/components/StockOutItemForm.vue | 通过(浏览器) | erp-stock-items-browser-test.js |
| stock/out/index.vue | 通过(浏览器) | mes-erp-rest-erp-docs-browser-test.js |
| stock/record/index.vue | 通过(浏览器) | erp-admin-stock-browser-test.js |
| stock/stock/index.vue | 通过(浏览器) | erp-admin-stock-browser-test.js |
| stock/warehouse/WarehouseForm.vue | 通过(浏览器) | erp-admin-stock-browser-test.js |
| stock/warehouse/index.vue | 通过(浏览器) | erp-admin-stock-browser-test.js |

### fms（80 个功能页：通过(浏览器) 80 / 部分(浏览器) 0 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：财务指标/账套成员字典权限浏览器通过；凭证账簿报表闭环待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| closing/ClosingSchemeCard.vue | 通过(浏览器) | fms-batch-closing-settings-forms-browser-test.js |
| closing/ClosingSchemeForm.vue | 通过(浏览器) | fms-im-more2-fms-closing-report-browser-test.js |
| closing/ClosingSchemeList.vue | 通过(浏览器) | fms-im-more2-fms-closing-report-browser-test.js |
| closing/ClosingStatusCard.vue | 通过(浏览器) | fms-more-ledgers-closing-browser-test.js |
| closing/ClosingTemplateForm.vue | 通过(浏览器) | fms-batch-closing-settings-forms-browser-test.js |
| closing/ClosingTemplateSelect.vue | 通过(浏览器) | fms-batch-closing-settings-forms-browser-test.js |
| closing/ProfitLossSettingsForm.vue | 通过(浏览器) | fms-batch-closing-settings-forms-browser-test.js |
| closing/SpecialClosingSettingsForm.vue | 通过(浏览器) | fms-batch-closing-settings-forms-browser-test.js |
| closing/index.vue | 通过(浏览器) | fms-more-ledgers-closing-browser-test.js |
| components/account-set/FmsAccountSetGuide.vue | 通过(浏览器) | tail-fms-browser-test.js |
| components/account-set/FmsAccountSetSwitch.vue | 通过(浏览器) | tail-fms-browser-test.js |
| components/print/FmsPrintPreview.vue | 通过(浏览器) | fms-more3-voucher-print-help-browser-test.js |
| config/account-set/FmsAccountSetForm.vue | 通过(浏览器) | fms-more3-account-set-browser-test.js |
| config/account-set/FmsAccountSetInitializeForm.vue | 通过(浏览器) | fms-more3-account-set-browser-test.js |
| config/account-set/FmsAccountSetMemberForm.vue | 通过(浏览器) | fms-account-member-browser-test.js |
| config/account-set/index.vue | 通过(浏览器) | fms-more3-account-set-browser-test.js |
| config/auxiliary/FmsAuxiliaryItemPanel.vue | 通过(浏览器) | tail-fms-browser-test.js |
| config/auxiliary/FmsAuxiliaryTypeForm.vue | 通过(浏览器) | fms-batch-config-forms-browser-test.js |
| config/auxiliary/components/FmsAuxiliaryItemSelect.vue | 通过(浏览器) | fms-batch-config-forms-browser-test.js |
| config/auxiliary/components/FmsAuxiliaryTypeSelect.vue | 通过(浏览器) | fms-batch-config-forms-browser-test.js |
| config/auxiliary/index.vue | 通过(浏览器) | fms-admin-config-browser-test.js |
| config/auxiliary/item/FmsAuxiliaryItemForm.vue | 通过(浏览器) | fms-batch-config-forms-browser-test.js |
| config/auxiliary/item/FmsAuxiliaryItemImportForm.vue | 通过(浏览器) | fms-batch-config-forms-browser-test.js |
| config/currency/FmsCurrencyForm.vue | 通过(浏览器) | im-fms-more-fms-static-browser-test.js |
| config/currency/components/FmsCurrencySelect.vue | 通过(浏览器) | fms-batch-config-forms-browser-test.js |
| config/currency/index.vue | 通过(浏览器) | im-fms-more-fms-static-browser-test.js |
| config/digest/FmsDigestForm.vue | 通过(浏览器) | im-fms-more-fms-static-browser-test.js |
| config/digest/components/FmsDigestLibrary.vue | 通过(浏览器) | fms-batch-config-forms-browser-test.js |
| config/digest/index.vue | 通过(浏览器) | im-fms-more-fms-static-browser-test.js |
| config/finance-indicator/FmsFinanceIndicatorForm.vue | 通过(浏览器) | fms-finance-indicator-browser-test.js |
| config/finance-indicator/index.vue | 通过(浏览器) | tail-fms-browser-test.js |
| config/finance-parameter/index.vue | 通过(浏览器) | tail-fms-browser-test.js |
| config/initial-balance/FmsInitialAssistForm.vue | 通过(浏览器) | fms-more3-initial-balance-browser-test.js |
| config/initial-balance/FmsInitialBalanceImportForm.vue | 通过(浏览器) | fms-more3-initial-balance-browser-test.js |
| config/initial-balance/FmsTrialBalanceDialog.vue | 通过(浏览器) | fms-more3-initial-balance-browser-test.js |
| config/initial-balance/index.vue | 通过(浏览器) | fms-admin-ledger-browser-test.js |
| config/subject/FmsSubjectForm.vue | 通过(浏览器) | fms-batch-config-forms-browser-test.js |
| config/subject/FmsSubjectImportForm.vue | 通过(浏览器) | fms-batch-config-forms-browser-test.js |
| config/subject/components/FmsSubjectSelect.vue | 通过(浏览器) | fms-batch-config-forms-browser-test.js |
| config/subject/index.vue | 通过(浏览器) | fms-admin-config-browser-test.js |
| config/voucher-template/FmsVoucherTemplateCategoryForm.vue | 通过(浏览器) | fms-more3-voucher-template-browser-test.js |
| config/voucher-template/components/FmsVoucherTemplateCategoryManage.vue | 通过(浏览器) | tail-fms-browser-test.js |
| config/voucher-template/components/FmsVoucherTemplateCategorySelect.vue | 通过(浏览器) | tail-fms-browser-test.js |
| config/voucher-template/components/FmsVoucherTemplateSaveForm.vue | 通过(浏览器) | fms-more3-voucher-template-browser-test.js |
| config/voucher-template/components/FmsVoucherTemplateSelect.vue | 通过(浏览器) | fms-more3-voucher-template-browser-test.js |
| config/voucher-template/index.vue | 通过(浏览器) | fms-more3-voucher-template-browser-test.js |
| config/voucher-word/FmsVoucherWordForm.vue | 通过(浏览器) | fms-batch-config-forms-browser-test.js |
| config/voucher-word/components/FmsVoucherWordSelect.vue | 通过(浏览器) | fms-batch-config-forms-browser-test.js |
| config/voucher-word/index.vue | 通过(浏览器) | fms-admin-config-browser-test.js |
| home/components/FmsHomeMetricCards.vue | 通过(浏览器) | fms-batch-home-ledger-report-widgets-browser-test.js |
| home/components/FmsHomeMetricCharts.vue | 通过(浏览器) | fms-batch-home-ledger-report-widgets-browser-test.js |
| home/components/FmsHomeShortcuts.vue | 通过(浏览器) | fms-batch-home-ledger-report-widgets-browser-test.js |
| home/index.vue | 通过(浏览器) | fms-batch-home-ledger-report-widgets-browser-test.js |
| ledger/auxiliary-balance/index.vue | 通过(浏览器) | fms-admin-ledger-browser-test.js |
| ledger/auxiliary-detail/index.vue | 通过(浏览器) | fms-im-more2-fms-ledgers-browser-test.js |
| ledger/components/FmsLedgerMonthRangePicker.vue | 通过(浏览器) | fms-batch-home-ledger-report-widgets-browser-test.js |
| ledger/components/FmsLedgerPrintButton.vue | 通过(浏览器) | fms-batch-home-ledger-report-widgets-browser-test.js |
| ledger/components/FmsLedgerSearchBar.vue | 通过(浏览器) | fms-batch-home-ledger-report-widgets-browser-test.js |
| ledger/detail/index.vue | 通过(浏览器) | fms-admin-ledger-browser-test.js |
| ledger/general/index.vue | 通过(浏览器) | fms-admin-ledger-browser-test.js |
| ledger/multi-column/index.vue | 通过(浏览器) | fms-more-ledgers-quantity-multi-column-browser-test.js |
| ledger/quantity-detail/index.vue | 通过(浏览器) | fms-im-more2-fms-ledgers-browser-test.js |
| ledger/quantity-general/index.vue | 通过(浏览器) | fms-more-ledgers-quantity-multi-column-browser-test.js |
| ledger/subject-balance/index.vue | 通过(浏览器) | fms-im-more2-fms-ledgers-browser-test.js |
| report/balance-sheet/index.vue | 通过(浏览器) | fms-im-more2-fms-closing-report-browser-test.js |
| report/cash-flow-statement/index.vue | 通过(浏览器) | fms-admin-ledger-browser-test.js |
| report/components/FmsReportCheckAlert.vue | 通过(浏览器) | fms-batch-home-ledger-report-widgets-browser-test.js |
| report/components/FmsReportFormulaForm.vue | 通过(浏览器) | fms-more-ledgers-report-formula-browser-test.js |
| report/components/FmsReportPeriodBar.vue | 通过(浏览器) | fms-batch-home-ledger-report-widgets-browser-test.js |
| report/components/FmsReportPrintButton.vue | 通过(浏览器) | fms-batch-home-ledger-report-widgets-browser-test.js |
| report/income-statement/index.vue | 通过(浏览器) | fms-more-ledgers-report-formula-browser-test.js |
| voucher/components/FmsVoucherPrintForm.vue | 通过(浏览器) | fms-more3-voucher-print-help-browser-test.js |
| voucher/create/FmsVoucherShortcutHelp.vue | 通过(浏览器) | fms-more3-voucher-print-help-browser-test.js |
| voucher/create/index.vue | 通过(浏览器) | im-fms-rest-fms-voucher-create-browser-test.js + im-fms-rest-fms-voucher-detail-browser-test.js |
| voucher/list/FmsVoucherAttachmentForm.vue | 通过(浏览器) | fms-more-ledgers-voucher-list-forms-browser-test.js |
| voucher/list/FmsVoucherImportForm.vue | 通过(浏览器) | fms-more-ledgers-voucher-list-forms-browser-test.js |
| voucher/list/FmsVoucherMoveForm.vue | 通过(浏览器) | fms-more-ledgers-voucher-list-forms-browser-test.js |
| voucher/list/FmsVoucherTidyForm.vue | 通过(浏览器) | fms-more-ledgers-voucher-list-forms-browser-test.js |
| voucher/list/index.vue | 通过(浏览器) | fms-admin-voucher-browser-test.js |
| voucher/statistics/index.vue | 通过(浏览器) | im-fms-more-fms-static-browser-test.js |

### hrm（198 个功能页：通过(浏览器) 191 / 部分(浏览器) 0 / 部分(静态) 7 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：绩效试算/计划分步校验通过；其余入口/真实写入待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| attendance/clock/AttendanceClockDailyDetail.vue | 通过(浏览器) | hrm-batch-attendance-clock-forms-browser-test.js |
| attendance/clock/AttendanceClockForm.vue | 通过(浏览器) | hrm-batch-attendance-clock-forms-browser-test.js |
| attendance/clock/AttendanceClockOverview.vue | 通过(浏览器) | hrm-batch-attendance-clock-forms-browser-test.js |
| attendance/clock/AttendanceClockRecordList.vue | 通过(浏览器) | hrm-batch-attendance-clock-forms-browser-test.js |
| attendance/clock/index.vue | 通过(浏览器) | hrm-batch-attendance-clock-forms-browser-test.js |
| attendance/config/group/AttendanceGroupForm.vue | 通过(浏览器) | hrm-more4-attendance-group-browser-test.js |
| attendance/config/group/AttendanceGroupPointForm.vue | 通过(浏览器) | hrm-more4-attendance-group-browser-test.js |
| attendance/config/group/AttendanceGroupShiftForm.vue | 通过(浏览器) | hrm-more4-attendance-group-browser-test.js |
| attendance/config/group/AttendanceGroupSpecialDateForm.vue | 通过(浏览器) | hrm-more4-attendance-group-browser-test.js |
| attendance/config/group/AttendanceGroupWifiForm.vue | 通过(浏览器) | hrm-more4-attendance-group-browser-test.js |
| attendance/config/group/index.vue | 通过(浏览器) | hrm-more4-attendance-group-browser-test.js |
| attendance/config/holiday/AttendanceHolidayForm.vue | 通过(浏览器) | mes-hrm-rest-hrm-browser-test.js |
| attendance/config/holiday/index.vue | 通过(浏览器) | mes-hrm-rest-hrm-browser-test.js |
| attendance/leave/AttendanceLeaveProcessDetail.vue | 通过(浏览器) | hrm-batch-attendance-clock-forms-browser-test.js |
| attendance/leave/index.vue | 通过(浏览器) | hrm-admin-attendance-browser-test.js |
| attendance/month/detail/index.vue | 通过(浏览器) | hrm-batch-attendance-clock-forms-browser-test.js |
| attendance/month/index.vue | 通过(浏览器) | hrm-admin-attendance-browser-test.js |
| dept/detail/DeptDetailsHeader.vue | 通过(浏览器) | hrm-batch3-dept-team-insurance-browser-test.js |
| dept/detail/DeptDetailsInfo.vue | 通过(浏览器) | hrm-batch3-dept-team-insurance-browser-test.js |
| dept/detail/DeptEmployeeList.vue | 通过(浏览器) | hrm-batch3-dept-team-insurance-browser-test.js |
| dept/detail/index.vue | 通过(浏览器) | hrm-batch3-dept-team-insurance-browser-test.js |
| dept/index.vue | 通过(浏览器) | hrm-admin-performance-browser-test.js |
| employee/EmployeeCreateFromUserForm.vue | 通过(浏览器) | hrm-batch-attendance-clock-forms-browser-test.js |
| employee/EmployeeDemoteForm.vue | 通过(浏览器) | hrm-more2-employee-change-forms-browser-test.js |
| employee/EmployeeForm.vue | 通过(浏览器) | hrm-mes-more-employee-forms-browser-test.js |
| employee/EmployeeFullTimeForm.vue | 通过(浏览器) | hrm-more2-employee-change-forms-browser-test.js |
| employee/EmployeeImportForm.vue | 通过(浏览器) | hrm-mes-more-employee-forms-browser-test.js |
| employee/EmployeeInsuranceSchemeForm.vue | 通过(浏览器) | hrm-more2-insurance-note-leave-forms-browser-test.js |
| employee/EmployeePositionChangeForm.vue | 通过(浏览器) | hrm-more2-employee-change-forms-browser-test.js |
| employee/EmployeePromoteForm.vue | 通过(浏览器) | hrm-more2-employee-change-forms-browser-test.js |
| employee/EmployeeQuitForm.vue | 通过(浏览器) | hrm-mes-more-employee-forms-browser-test.js |
| employee/EmployeeRegularForm.vue | 通过(浏览器) | hrm-more2-employee-change-forms-browser-test.js |
| employee/EmployeeTransferForm.vue | 通过(浏览器) | hrm-more2-employee-change-forms-browser-test.js |
| employee/components/HrmEmployeeSelect.vue | 通过(浏览器) | hrm-batch-attendance-clock-forms-browser-test.js |
| employee/components/HrmEmployeeSelectDialog.vue | 通过(浏览器) | hrm-batch-attendance-clock-forms-browser-test.js |
| employee/config/EmployeeArchiveFieldConfig.vue | 通过(浏览器) | tail-misc-detail-browser-test.js |
| employee/config/EmployeeCreateFieldConfig.vue | 通过(浏览器) | tail-misc-detail-browser-test.js |
| employee/config/index.vue | 通过(浏览器) | tail-misc-detail-browser-test.js |
| employee/detail/EmployeeBasicInfo.vue | 通过(浏览器) | hrm-salary-ins-employee-detail-browser-test.js |
| employee/detail/EmployeeCertificateForm.vue | 通过(浏览器) | hrm-more5-employee-cert-contract-browser-test.js |
| employee/detail/EmployeeCertificateList.vue | 通过(浏览器) | hrm-more5-employee-cert-contract-browser-test.js |
| employee/detail/EmployeeChangeRecordList.vue | 通过(浏览器) | hrm-batch-employee-detail-forms-browser-test.js |
| employee/detail/EmployeeContactForm.vue | 通过(浏览器) | hrm-more4-employee-experience-browser-test.js |
| employee/detail/EmployeeContactList.vue | 通过(浏览器) | hrm-more4-employee-experience-browser-test.js |
| employee/detail/EmployeeContractForm.vue | 通过(浏览器) | hrm-more5-employee-cert-contract-browser-test.js |
| employee/detail/EmployeeContractList.vue | 通过(浏览器) | hrm-more5-employee-cert-contract-browser-test.js |
| employee/detail/EmployeeDetailsHeader.vue | 通过(浏览器) | hrm-batch-employee-detail-forms-browser-test.js |
| employee/detail/EmployeeDetailsInfo.vue | 通过(浏览器) | hrm-batch-employee-detail-forms-browser-test.js |
| employee/detail/EmployeeEducationExperienceForm.vue | 通过(浏览器) | hrm-more4-employee-experience-browser-test.js |
| employee/detail/EmployeeEducationExperienceList.vue | 通过(浏览器) | hrm-more4-employee-experience-browser-test.js |
| employee/detail/EmployeeInsuranceInfo.vue | 通过(浏览器) | hrm-batch-employee-detail-forms-browser-test.js |
| employee/detail/EmployeeInsuranceInfoForm.vue | 通过(浏览器) | hrm-batch-employee-detail-forms-browser-test.js |
| employee/detail/EmployeeMaterialFiles.vue | 通过(浏览器) | hrm-batch-employee-detail-forms-browser-test.js |
| employee/detail/EmployeePostInfo.vue | 通过(浏览器) | hrm-salary-ins-employee-detail-browser-test.js |
| employee/detail/EmployeeQuitInfo.vue | 通过(浏览器) | hrm-batch-employee-detail-forms-browser-test.js |
| employee/detail/EmployeeSalaryCardForm.vue | 通过(浏览器) | hrm-salary-ins-employee-detail-browser-test.js |
| employee/detail/EmployeeSalaryCardInfo.vue | 通过(浏览器) | hrm-salary-ins-employee-detail-browser-test.js |
| employee/detail/EmployeeSalaryChangeRecordList.vue | 通过(浏览器) | hrm-batch-employee-detail-forms-browser-test.js |
| employee/detail/EmployeeSalaryHistoryList.vue | 通过(浏览器) | hrm-batch-employee-detail-forms-browser-test.js |
| employee/detail/EmployeeSalaryInfo.vue | 通过(浏览器) | hrm-batch-employee-detail-forms-browser-test.js |
| employee/detail/EmployeeSalarySocialSecurity.vue | 通过(浏览器) | hrm-batch-employee-detail-forms-browser-test.js |
| employee/detail/EmployeeTrainingExperienceForm.vue | 通过(浏览器) | hrm-more4-employee-experience-browser-test.js |
| employee/detail/EmployeeTrainingExperienceList.vue | 通过(浏览器) | hrm-more4-employee-experience-browser-test.js |
| employee/detail/EmployeeWorkExperienceForm.vue | 通过(浏览器) | hrm-more4-employee-experience-browser-test.js |
| employee/detail/EmployeeWorkExperienceList.vue | 通过(浏览器) | hrm-more4-employee-experience-browser-test.js |
| employee/detail/index.vue | 通过(浏览器) | hrm-core-rest-employee-browser-test.js |
| employee/index.vue | 通过(浏览器) | hrm-core-rest-employee-browser-test.js |
| home/components/HrmHomeCalendar.vue | 通过(浏览器) | hrm-core-rest-home-portal-browser-test.js |
| home/components/HrmHomeEmployeeSurvey.vue | 通过(浏览器) | hrm-core-rest-home-portal-browser-test.js |
| home/components/HrmHomeRecruitSurvey.vue | 通过(浏览器) | hrm-core-rest-home-portal-browser-test.js |
| home/components/HrmHomeSalarySurvey.vue | 通过(浏览器) | hrm-more2-home-salary-survey-browser-test.js |
| home/components/HrmHomeTodoSurvey.vue | 通过(浏览器) | hrm-core-rest-home-portal-browser-test.js |
| home/components/PersonalNoteForm.vue | 通过(浏览器) | hrm-more2-insurance-note-leave-forms-browser-test.js |
| home/hr/index.vue | 通过(浏览器) | hrm-core-rest-home-portal-browser-test.js |
| home/team/components/HrmTeamOverview.vue | 通过(浏览器) | hrm-batch3-dept-team-insurance-browser-test.js |
| home/team/components/HrmTeamSurvey.vue | 通过(浏览器) | hrm-batch3-dept-team-insurance-browser-test.js |
| home/team/index.vue | 通过(浏览器) | hrm-batch3-dept-team-insurance-browser-test.js |
| insurance/month-record/InsuranceFirstMonthForm.vue | 通过(浏览器) | hrm-more-insurance-month-forms-browser-test.js |
| insurance/month-record/detail/InsuranceAddEmployeeForm.vue | 通过(浏览器) | hrm-mes-more-insurance-add-batch-browser-test.js |
| insurance/month-record/detail/InsuranceBatchEmployeeRecordForm.vue | 通过(浏览器) | hrm-mes-more-insurance-add-batch-browser-test.js |
| insurance/month-record/detail/InsuranceEmployeeRecordForm.vue | 通过(浏览器) | hrm-more-insurance-month-forms-browser-test.js |
| insurance/month-record/detail/InsuranceMonthEmployeeDetail.vue | 通过(浏览器) | hrm-batch3-dept-team-insurance-browser-test.js |
| insurance/month-record/detail/index.vue | 通过(浏览器) | hrm-batch3-dept-team-insurance-browser-test.js |
| insurance/month-record/index.vue | 通过(浏览器) | hrm-batch3-dept-team-insurance-browser-test.js |
| insurance/scheme/InsuranceSchemeForm.vue | 通过(浏览器) | hrm-salary-ins-insurance-scheme-browser-test.js |
| insurance/scheme/components/InsuranceSchemeSelect.vue | 通过(浏览器) | tail-misc-detail-browser-test.js |
| insurance/scheme/index.vue | 通过(浏览器) | hrm-core-rest-insurance-salary-browser-test.js |
| performance/assessment/components/PerformanceProcessRecordTimeline.vue | 通过(浏览器) | hrm-batch-performance-salary-forms-browser-test.js |
| performance/assessment/detail/index.vue | 通过(浏览器) | tail-misc-detail-browser-test.js |
| performance/assessment/employee/index.vue | 通过(浏览器) | hrm-admin-performance-browser-test.js |
| performance/assessment/index.vue | 通过(浏览器) | hrm-admin-performance-browser-test.js |
| performance/components/HrmPerformanceRaterLevelSelect.vue | 通过(浏览器) | hrm-batch-performance-salary-forms-browser-test.js |
| performance/config/assessment-template/PerformanceAssessmentDimensionForm.vue | 通过(浏览器) | hrm-batch-performance-salary-forms-browser-test.js |
| performance/config/assessment-template/PerformanceAssessmentTemplateForm.vue | 通过(浏览器) | hrm-batch-performance-salary-forms-browser-test.js |
| performance/config/assessment-template/components/PerformanceAssessmentConfigEditor.vue | 通过(浏览器) | hrm-batch-performance-salary-forms-browser-test.js |
| performance/config/assessment-template/components/PerformanceAssessmentTemplateSelect.vue | 通过(浏览器) | hrm-batch-performance-salary-forms-browser-test.js |
| performance/config/assessment-template/index.vue | 通过(浏览器) | tail-misc-detail-browser-test.js |
| performance/config/result-template/PerformanceResultTemplateForm.vue | 通过(浏览器) | mes-hrm-rest-hrm-browser-test.js |
| performance/config/result-template/components/PerformanceResultLevelForm.vue | 通过(浏览器) | hrm-batch-performance-salary-forms-browser-test.js |
| performance/config/result-template/index.vue | 通过(浏览器) | mes-hrm-rest-hrm-browser-test.js |
| performance/plan/PerformancePlanAssessmentAddForm.vue | 部分(静态) | hrm-performance-full-migration-test.js |
| performance/plan/detail/PerformancePlanDetailsHeader.vue | 通过(浏览器) | hrm-more3-performance-plan-detail-browser-test.js |
| performance/plan/detail/PerformancePlanDetailsInfo.vue | 通过(浏览器) | hrm-more3-performance-plan-detail-browser-test.js |
| performance/plan/detail/index.vue | 通过(浏览器) | hrm-more3-performance-plan-detail-browser-test.js |
| performance/plan/form/PerformancePlanBasicForm.vue | 通过(浏览器) | tail-perf-plan-browser-test.js |
| performance/plan/form/PerformancePlanHandlerStageForm.vue | 通过(浏览器) | tail-perf-plan-browser-test.js |
| performance/plan/form/PerformancePlanIndicatorForm.vue | 通过(浏览器) | tail-perf-plan-browser-test.js |
| performance/plan/form/PerformancePlanProcessForm.vue | 通过(浏览器) | tail-perf-plan-browser-test.js |
| performance/plan/form/PerformancePlanResultForm.vue | 通过(浏览器) | tail-perf-plan-browser-test.js |
| performance/plan/form/PerformancePlanScopeForm.vue | 通过(浏览器) | tail-perf-plan-browser-test.js |
| performance/plan/form/index.vue | 通过(浏览器) | hrm-plan-validation-browser-test.js |
| performance/plan/index.vue | 通过(浏览器) | tail-perf-plan-browser-test.js |
| portal/attendance/leave/AttendanceLeaveForm.vue | 通过(浏览器) | hrm-more2-insurance-note-leave-forms-browser-test.js |
| portal/attendance/report/AttendanceCalendar.vue | 通过(浏览器) | tail-portal-rest-browser-test.js |
| portal/attendance/report/AttendanceLeaveList.vue | 通过(浏览器) | tail-portal-rest-browser-test.js |
| portal/attendance/report/index.vue | 通过(浏览器) | tail-portal-rest-browser-test.js |
| portal/employee/EmployeeBaseInfo.vue | 部分(静态) | hrm-portal-full-migration-test.js |
| portal/employee/EmployeeForm.vue | 部分(静态) | hrm-portal-full-migration-test.js |
| portal/employee/EmployeePostInfo.vue | 部分(静态) | hrm-portal-full-migration-test.js |
| portal/employee/index.vue | 通过(浏览器) | hrm-core-rest-home-portal-browser-test.js |
| portal/home/EmployeeSurvey.vue | 部分(静态) | hrm-portal-full-migration-test.js |
| portal/home/index.vue | 部分(静态) | hrm-portal-full-migration-test.js |
| portal/insurance/record/InsuranceRecordDetail.vue | 通过(浏览器) | tail-portal-rest-browser-test.js |
| portal/insurance/record/index.vue | 通过(浏览器) | tail-portal-rest-browser-test.js |
| portal/opening-guide/index.vue | 通过(浏览器) | tail-portal-rest-browser-test.js |
| portal/performance/assessment/PerformanceTaskTable.vue | 通过(浏览器) | tail-portal-perf-browser-test.js |
| portal/performance/assessment/PerformanceTaskTabs.vue | 通过(浏览器) | tail-portal-perf-browser-test.js |
| portal/performance/assessment/detail/index.vue | 通过(浏览器) | tail-portal-perf-browser-test.js |
| portal/performance/assessment/history/index.vue | 通过(浏览器) | tail-portal-perf-browser-test.js |
| portal/performance/assessment/index.vue | 通过(浏览器) | tail-portal-perf-browser-test.js |
| portal/performance/assessment/process/PerformanceAppealForm.vue | 通过(浏览器) | tail-portal-perf-browser-test.js |
| portal/performance/assessment/process/PerformanceHandleForm.vue | 通过(浏览器) | tail-portal-perf-browser-test.js |
| portal/performance/assessment/process/PerformanceTargetConfirmForm.vue | 通过(浏览器) | tail-portal-perf-browser-test.js |
| portal/performance/assessment/review/PerformanceQuotaForm.vue | 通过(浏览器) | tail-portal-perf-browser-test.js |
| portal/performance/assessment/review/PerformanceReviewForm.vue | 通过(浏览器) | hrm-review-preview-browser-test.js |
| portal/salary/slip/index.vue | 通过(浏览器) | tail-portal-rest-browser-test.js |
| recruit/candidate/RecruitCandidateChannelListForm.vue | 通过(浏览器) | hrm-batch3-recruit-candidate-forms-browser-test.js |
| recruit/candidate/RecruitCandidateCleanForm.vue | 通过(浏览器) | hrm-batch3-recruit-candidate-forms-browser-test.js |
| recruit/candidate/RecruitCandidateEliminateForm.vue | 通过(浏览器) | hrm-batch3-recruit-candidate-forms-browser-test.js |
| recruit/candidate/RecruitCandidateForm.vue | 通过(浏览器) | hrm-batch3-recruit-candidate-forms-browser-test.js |
| recruit/candidate/RecruitCandidatePostListForm.vue | 通过(浏览器) | hrm-batch3-recruit-candidate-forms-browser-test.js |
| recruit/candidate/RecruitCandidateStatusListForm.vue | 通过(浏览器) | hrm-batch3-recruit-candidate-forms-browser-test.js |
| recruit/candidate/RecruitInterviewForm.vue | 通过(浏览器) | hrm-batch3-recruit-candidate-forms-browser-test.js |
| recruit/candidate/RecruitInterviewResultForm.vue | 通过(浏览器) | hrm-batch3-recruit-candidate-forms-browser-test.js |
| recruit/candidate/detail/RecruitCandidateDetailsHeader.vue | 通过(浏览器) | tail-misc-detail-browser-test.js |
| recruit/candidate/detail/RecruitCandidateDetailsInfo.vue | 通过(浏览器) | tail-misc-detail-browser-test.js |
| recruit/candidate/detail/RecruitCandidateInterviewList.vue | 通过(浏览器) | tail-misc-detail-browser-test.js |
| recruit/candidate/detail/RecruitCandidateMaterialFiles.vue | 通过(浏览器) | tail-misc-detail-browser-test.js |
| recruit/candidate/detail/index.vue | 通过(浏览器) | tail-misc-detail-browser-test.js |
| recruit/candidate/index.vue | 通过(浏览器) | hrm-batch3-recruit-candidate-forms-browser-test.js |
| recruit/channel/RecruitChannelDeleteForm.vue | 通过(浏览器) | hrm-crm-rest-hrm-recruit-browser-test.js |
| recruit/channel/RecruitChannelForm.vue | 通过(浏览器) | hrm-crm-rest-hrm-recruit-browser-test.js |
| recruit/channel/components/RecruitChannelSelect.vue | 通过(浏览器) | hrm-crm-rest-hrm-recruit-browser-test.js |
| recruit/channel/index.vue | 通过(浏览器) | hrm-crm-rest-hrm-recruit-browser-test.js |
| recruit/post/RecruitPostForm.vue | 通过(浏览器) | hrm-crm-rest-hrm-recruit-browser-test.js |
| recruit/post/components/RecruitPostSelect.vue | 通过(浏览器) | hrm-batch3-recruit-candidate-forms-browser-test.js |
| recruit/post/detail/RecruitPostDetailsHeader.vue | 通过(浏览器) | hrm-batch3-recruit-candidate-forms-browser-test.js |
| recruit/post/detail/RecruitPostDetailsInfo.vue | 通过(浏览器) | hrm-batch3-recruit-candidate-forms-browser-test.js |
| recruit/post/detail/index.vue | 通过(浏览器) | hrm-batch3-recruit-candidate-forms-browser-test.js |
| recruit/post/index.vue | 通过(浏览器) | hrm-crm-rest-hrm-recruit-browser-test.js |
| recruit/setting/eliminate/components/RecruitEliminateReasonSelect.vue | 部分(静态) | hrm-recruit-full-migration-test.js |
| recruit/setting/eliminate/index.vue | 通过(浏览器) | hrm-crm-rest-hrm-recruit-browser-test.js |
| salary/config/change-template/SalaryChangeTemplateForm.vue | 通过(浏览器) | hrm-batch-performance-salary-forms-browser-test.js |
| salary/config/change-template/components/SalaryChangeTemplateSelect.vue | 通过(浏览器) | hrm-batch3-salary-employee-config-browser-test.js |
| salary/config/change-template/index.vue | 通过(浏览器) | hrm-batch3-salary-employee-config-browser-test.js |
| salary/config/config/index.vue | 通过(浏览器) | hrm-batch3-salary-employee-config-browser-test.js |
| salary/config/group/SalaryGroupForm.vue | 通过(浏览器) | mes-hrm-rest-hrm-browser-test.js |
| salary/config/group/index.vue | 通过(浏览器) | mes-hrm-rest-hrm-browser-test.js |
| salary/config/option/SalaryOptionForm.vue | 通过(浏览器) | hrm-batch-performance-salary-forms-browser-test.js |
| salary/config/option/components/SalaryChangeOptionSelect.vue | 通过(浏览器) | hrm-batch3-salary-employee-config-browser-test.js |
| salary/config/option/components/SalaryOptionSelect.vue | 通过(浏览器) | hrm-batch-performance-salary-forms-browser-test.js |
| salary/config/option/index.vue | 通过(浏览器) | hrm-admin-salary-browser-test.js |
| salary/config/tax-rule/SalaryTaxRuleForm.vue | 通过(浏览器) | mes-hrm-rest-hrm-browser-test.js |
| salary/config/tax-rule/components/SalaryTaxRuleSelect.vue | 通过(浏览器) | hrm-batch-performance-salary-forms-browser-test.js |
| salary/config/tax-rule/index.vue | 通过(浏览器) | mes-hrm-rest-hrm-browser-test.js |
| salary/employee-info/SalaryEmployeeInfoBatchForm.vue | 通过(浏览器) | hrm-salary-ins-salary-forms-browser-test.js |
| salary/employee-info/SalaryEmployeeInfoForm.vue | 通过(浏览器) | hrm-salary-ins-salary-forms-browser-test.js |
| salary/employee-info/SalaryEmployeeInfoImportForm.vue | 通过(浏览器) | hrm-batch3-salary-employee-config-browser-test.js |
| salary/employee-info/detail/SalaryChangeRecordList.vue | 通过(浏览器) | hrm-batch3-salary-employee-config-browser-test.js |
| salary/employee-info/detail/SalaryEmployeeInfoDetails.vue | 通过(浏览器) | hrm-batch3-salary-employee-config-browser-test.js |
| salary/employee-info/detail/index.vue | 通过(浏览器) | hrm-batch3-salary-employee-config-browser-test.js |
| salary/employee-info/index.vue | 通过(浏览器) | hrm-core-rest-insurance-salary-browser-test.js |
| salary/month-record/SalaryBatchEmployeeRecordForm.vue | 通过(浏览器) | hrm-more3-salary-month-record-browser-test.js |
| salary/month-record/SalaryMonthComputeForm.vue | 通过(浏览器) | hrm-more3-salary-month-record-browser-test.js |
| salary/month-record/SalaryPayrollReadinessAlert.vue | 通过(浏览器) | hrm-batch-performance-salary-forms-browser-test.js |
| salary/month-record/SalaryPayrollReadinessEmployeeList.vue | 通过(浏览器) | hrm-batch-performance-salary-forms-browser-test.js |
| salary/month-record/detail/SalaryMonthEmployeeRecordList.vue | 通过(浏览器) | hrm-more3-salary-month-record-browser-test.js |
| salary/month-record/detail/SalaryMonthRecordDetailsInfo.vue | 通过(浏览器) | hrm-more3-salary-month-record-browser-test.js |
| salary/month-record/detail/index.vue | 通过(浏览器) | hrm-more3-salary-month-record-browser-test.js |
| salary/month-record/history/index.vue | 通过(浏览器) | hrm-more3-salary-month-record-browser-test.js |
| salary/month-record/index.vue | 通过(浏览器) | hrm-admin-salary-browser-test.js |
| salary/slip/send-record/SalarySlipSendForm.vue | 通过(浏览器) | hrm-more-slip-send-browser-test.js |
| salary/slip/send-record/detail/SalarySlipDetail.vue | 通过(浏览器) | hrm-more-slip-detail-template-browser-test.js |
| salary/slip/send-record/detail/SalarySlipList.vue | 通过(浏览器) | hrm-more-slip-detail-template-browser-test.js |
| salary/slip/send-record/detail/index.vue | 通过(浏览器) | hrm-more-slip-detail-template-browser-test.js |
| salary/slip/send-record/index.vue | 通过(浏览器) | hrm-more-slip-send-browser-test.js |
| salary/slip/template/SalarySlipTemplateForm.vue | 通过(浏览器) | hrm-more-slip-detail-template-browser-test.js |
| salary/slip/template/SalarySlipTemplateOptionEditor.vue | 通过(浏览器) | hrm-more-slip-detail-template-browser-test.js |

### im（101 个功能页：通过(浏览器) 98 / 部分(浏览器) 1 / 部分(静态) 2 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：五弹窗专项通过；完整选人/消息收发/真实权限写入待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| home/components/ContextMenu.vue | 通过(浏览器) | im-batch-user-info-admin-browser-test.js |
| home/components/PagedScroller.vue | 通过(浏览器) | im-batch-user-info-admin-browser-test.js |
| home/components/ResizableAside.vue | 通过(浏览器) | tail-home-shell-browser-test.js |
| home/components/ToolBar.vue | 通过(浏览器) | tail-home-shell-browser-test.js |
| home/components/card/CardBubble.vue | 通过(浏览器) | final-im-cards-members-browser-test.js |
| home/components/card/CardLineLabel.vue | 通过(浏览器) | im-batch-user-info-admin-browser-test.js |
| home/components/friend/FriendAddDialog.vue | 通过(浏览器) | im-batch-contact-pages-browser-test.js |
| home/components/friend/FriendItem.vue | 通过(浏览器) | im-batch-contact-pages-browser-test.js |
| home/components/group/GroupAdminSetDialog.vue | 通过(浏览器) | final-im-picker-admin-browser-test.js |
| home/components/group/GroupAvatar.vue | 部分(静态) | im-home-contact-migration-test.js |
| home/components/group/GroupCreateDialog.vue | 通过(浏览器) | im-group-dialog-bindings-browser-test.js |
| home/components/group/GroupInfo.vue | 通过(浏览器) | im-batch-contact-pages-browser-test.js |
| home/components/group/GroupInfoCard.vue | 通过(浏览器) | final-im-cards-members-browser-test.js |
| home/components/group/GroupItem.vue | 通过(浏览器) | im-batch-contact-pages-browser-test.js |
| home/components/group/GroupMember.vue | 通过(浏览器) | final-im-cards-members-browser-test.js |
| home/components/group/GroupMemberAddDialog.vue | 通过(浏览器) | im-group-dialog-bindings-browser-test.js |
| home/components/group/GroupMemberGrid.vue | 通过(浏览器) | im-batch-user-info-admin-browser-test.js |
| home/components/group/GroupMemberItem.vue | 通过(浏览器) | final-im-cards-members-browser-test.js |
| home/components/group/GroupMemberRemoveDialog.vue | 通过(浏览器) | im-group-dialog-bindings-browser-test.js |
| home/components/group/GroupMuteMemberDialog.vue | 通过(浏览器) | im-group-mute-browser-test.js |
| home/components/group/GroupOwnerTransferDialog.vue | 通过(浏览器) | im-group-dialog-bindings-browser-test.js |
| home/components/group/GroupRequestListDialog.vue | 部分(浏览器) | im-group-dialog-bindings-browser-test.js |
| home/components/picker/ConversationPickerPanel.vue | 通过(浏览器) | tail-input-picker-browser-test.js |
| home/components/picker/FriendPickerPanel.vue | 通过(浏览器) | tail-input-picker-browser-test.js |
| home/components/picker/GroupMemberPickerPanel.vue | 通过(浏览器) | tail-input-picker-browser-test.js |
| home/components/rtc/RtcCallContainer.vue | 通过(浏览器) | final-im-rtc-states-browser-test.js |
| home/components/rtc/RtcCallIncoming.vue | 通过(浏览器) | final-im-rtc-states-browser-test.js |
| home/components/rtc/RtcCallInviting.vue | 通过(浏览器) | final-im-rtc-states-browser-test.js |
| home/components/rtc/RtcCallMemberPickerDialog.vue | 通过(浏览器) | final-im-picker-admin-browser-test.js |
| home/components/rtc/RtcCallParticipantTile.vue | 通过(浏览器) | final-im-rtc-states-browser-test.js |
| home/components/rtc/RtcCallRunning.vue | 通过(浏览器) | final-im-rtc-states-browser-test.js |
| home/components/rtc/RtcGroupCallBanner.vue | 通过(浏览器) | final-im-rtc-states-browser-test.js |
| home/components/user/RecommendCardDialog.vue | 通过(浏览器) | im-batch-user-info-admin-browser-test.js |
| home/components/user/UserAvatar.vue | 通过(浏览器) | im-batch-contact-pages-browser-test.js |
| home/components/user/UserInfo.vue | 通过(浏览器) | im-batch-user-info-admin-browser-test.js |
| home/components/user/UserInfoCard.vue | 通过(浏览器) | final-im-cards-members-browser-test.js |
| home/index.vue | 通过(浏览器) | tail-home-shell-browser-test.js |
| home/pages/contact/FriendList.vue | 通过(浏览器) | im-batch-contact-pages-browser-test.js |
| home/pages/contact/FriendRequestDetail.vue | 通过(浏览器) | im-batch-contact-pages-browser-test.js |
| home/pages/contact/FriendRequestList.vue | 通过(浏览器) | im-batch-contact-pages-browser-test.js |
| home/pages/contact/GroupDetail.vue | 通过(浏览器) | im-batch-contact-pages-browser-test.js |
| home/pages/contact/GroupList.vue | 通过(浏览器) | im-batch-contact-pages-browser-test.js |
| home/pages/contact/index.vue | 通过(浏览器) | im-batch-contact-pages-browser-test.js |
| home/pages/conversation/components/conversation/ConversationGroupSide.vue | 通过(浏览器) | im-more3-conversation-browser-test.js |
| home/pages/conversation/components/conversation/ConversationItem.vue | 通过(浏览器) | im-more3-conversation-browser-test.js |
| home/pages/conversation/components/conversation/ConversationPrivateSide.vue | 通过(浏览器) | tail-input-picker-browser-test.js |
| home/pages/conversation/components/input/FacePicker.vue | 通过(浏览器) | tail-input-picker-browser-test.js |
| home/pages/conversation/components/input/MentionPicker.vue | 通过(浏览器) | tail-input-picker-browser-test.js |
| home/pages/conversation/components/input/MessageInput.vue | 通过(浏览器) | tail-input-picker-browser-test.js |
| home/pages/conversation/components/input/MessageMultiSelectBar.vue | 通过(浏览器) | tail-input-picker-browser-test.js |
| home/pages/conversation/components/input/VoiceRecorder.vue | 通过(浏览器) | tail-input-picker-browser-test.js |
| home/pages/conversation/components/message/GroupPinnedMessage.vue | 通过(浏览器) | im-batch-message-bubbles-browser-test.js |
| home/pages/conversation/components/message/GroupRequestPending.vue | 部分(静态) | im-home-conversation-migration-test.js |
| home/pages/conversation/components/message/MaterialBubble.vue | 通过(浏览器) | im-mall-rich-html-browser-test.js |
| home/pages/conversation/components/message/MessageBubble.vue | 通过(浏览器) | im-batch-message-bubbles-browser-test.js |
| home/pages/conversation/components/message/MessageHistory.vue | 通过(浏览器) | tail-message-browser-test.js |
| home/pages/conversation/components/message/MessageItem.vue | 通过(浏览器) | tail-message-browser-test.js |
| home/pages/conversation/components/message/MessagePanel.vue | 通过(浏览器) | tail-message-browser-test.js |
| home/pages/conversation/components/message/MessageReadStatus.vue | 通过(浏览器) | im-batch-message-bubbles-browser-test.js |
| home/pages/conversation/components/message/ReplyPreview.vue | 通过(浏览器) | im-batch-message-bubbles-browser-test.js |
| home/pages/conversation/components/message/TipSegments.vue | 通过(浏览器) | im-batch-message-bubbles-browser-test.js |
| home/pages/conversation/components/message/forward/MessageForwardDialog.vue | 通过(浏览器) | im-batch-message-bubbles-browser-test.js |
| home/pages/conversation/components/message/forward/MessageMergeDetailDialog.vue | 通过(浏览器) | im-batch-message-bubbles-browser-test.js |
| home/pages/conversation/index.vue | 通过(浏览器) | im-more3-conversation-browser-test.js |
| manager/channel/list/ChannelForm.vue | 通过(浏览器) | im-fms-rest-im-manager-browser-test.js |
| manager/channel/list/components/ChannelSelect.vue | 通过(浏览器) | fms-im-more2-im-manager-browser-test.js |
| manager/channel/list/index.vue | 通过(浏览器) | im-fms-rest-im-manager-browser-test.js |
| manager/channel/material/ChannelMaterialForm.vue | 通过(浏览器) | im-channel-dialog-browser-test.js |
| manager/channel/material/components/MaterialSelect.vue | 通过(浏览器) | fms-im-more2-im-manager-browser-test.js |
| manager/channel/material/index.vue | 通过(浏览器) | im-fms-more-im-manager-browser-test.js |
| manager/channel/message/ChannelMessageSendForm.vue | 通过(浏览器) | im-channel-dialog-browser-test.js |
| manager/channel/message/index.vue | 通过(浏览器) | im-fms-more-im-manager-browser-test.js |
| manager/face/pack/FacePackForm.vue | 通过(浏览器) | im-fms-rest-im-manager-browser-test.js |
| manager/face/pack/FacePackItemDrawer.vue | 通过(浏览器) | im-fms-more-im-manager-browser-test.js |
| manager/face/pack/FacePackItemForm.vue | 通过(浏览器) | im-fms-more-im-manager-browser-test.js |
| manager/face/pack/index.vue | 通过(浏览器) | im-fms-rest-im-manager-browser-test.js |
| manager/face/userItem/index.vue | 通过(浏览器) | im-iot-rest-im-admin-browser-test.js |
| manager/friend/index.vue | 通过(浏览器) | im-iot-admin-im-lists-browser-test.js |
| manager/friend/request/index.vue | 通过(浏览器) | im-iot-admin-im-lists-browser-test.js |
| manager/group/GroupBanForm.vue | 通过(浏览器) | fms-im-more2-im-manager-browser-test.js |
| manager/group/GroupDetail.vue | 通过(浏览器) | fms-im-more2-im-manager-browser-test.js |
| manager/group/components/GroupSelect.vue | 通过(浏览器) | fms-im-more2-im-manager-browser-test.js |
| manager/group/components/GroupSelectDialog.vue | 通过(浏览器) | fms-im-more2-im-manager-browser-test.js |
| manager/group/index.vue | 通过(浏览器) | im-iot-rest-im-admin-browser-test.js |
| manager/group/request/index.vue | 通过(浏览器) | im-iot-rest-im-admin-browser-test.js |
| manager/message/MessageContentPreview.vue | 通过(浏览器) | im-batch-user-info-admin-browser-test.js |
| manager/message/group/GroupMessageDetail.vue | 通过(浏览器) | im-iot-admin-im-lists-browser-test.js |
| manager/message/group/index.vue | 通过(浏览器) | im-iot-admin-im-lists-browser-test.js |
| manager/message/private/PrivateMessageDetail.vue | 通过(浏览器) | im-iot-admin-im-lists-browser-test.js |
| manager/message/private/index.vue | 通过(浏览器) | im-iot-admin-im-lists-browser-test.js |
| manager/rtc/RtcCallDetail.vue | 通过(浏览器) | im-batch-user-info-admin-browser-test.js |
| manager/rtc/index.vue | 通过(浏览器) | im-fms-rest-im-manager-browser-test.js |
| manager/sensitiveword/SensitiveWordForm.vue | 通过(浏览器) | im-iot-rest-im-admin-browser-test.js |
| manager/sensitiveword/index.vue | 通过(浏览器) | im-iot-rest-im-admin-browser-test.js |
| manager/statistics/components/GroupSizeChart.vue | 通过(浏览器) | im-iot-more2-im-statistics-browser-test.js |
| manager/statistics/components/MessageTrendChart.vue | 通过(浏览器) | im-iot-more2-im-statistics-browser-test.js |
| manager/statistics/components/MessageTypeChart.vue | 通过(浏览器) | im-iot-more2-im-statistics-browser-test.js |
| manager/statistics/components/OverviewCards.vue | 通过(浏览器) | im-iot-more2-im-statistics-browser-test.js |
| manager/statistics/components/TopSendersChart.vue | 通过(浏览器) | im-iot-more2-im-statistics-browser-test.js |
| manager/statistics/components/UserTrendChart.vue | 通过(浏览器) | im-iot-more2-im-statistics-browser-test.js |
| manager/statistics/index.vue | 通过(浏览器) | im-iot-more2-im-statistics-browser-test.js |

### infra（51 个功能页：通过(浏览器) 50 / 部分(浏览器) 1 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：文件搜索/预览下载/复制链接通过；真实上传/任务闭环待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| apiAccessLog/ApiAccessLogDetail.vue | 通过(浏览器) | infra-admin-log-browser-test.js |
| apiAccessLog/index.vue | 通过(浏览器) | infra-admin-log-browser-test.js |
| apiErrorLog/ApiErrorLogDetail.vue | 通过(浏览器) | infra-admin-log-browser-test.js |
| apiErrorLog/index.vue | 通过(浏览器) | infra-admin-log-browser-test.js |
| build/index.vue | 通过(浏览器) | final-infra-iframe-browser-test.js |
| codegen/EditTable.vue | 部分(浏览器) | remaining-routes-browser-test.js（codegen-edit 路由挂载与 id 查询参数校验；表结构编辑交互未覆盖） |
| codegen/ImportTable.vue | 通过(浏览器) | tail2-rest-tail-browser-test.js |
| codegen/PreviewCode.vue | 通过(浏览器) | infra-admin-codegen-browser-test.js |
| codegen/components/BasicInfoForm.vue | 通过(浏览器) | infra-admin-codegen-browser-test.js |
| codegen/components/ColumInfoForm.vue | 通过(浏览器) | infra-admin-codegen-browser-test.js |
| codegen/components/GenerateInfoForm.vue | 通过(浏览器) | infra-admin-codegen-browser-test.js |
| codegen/index.vue | 通过(浏览器) | infra-admin-codegen-browser-test.js |
| config/ConfigForm.vue | 通过(浏览器) | infra-admin-config-job-browser-test.js |
| config/index.vue | 通过(浏览器) | infra-admin-config-job-browser-test.js |
| dataSourceConfig/DataSourceConfigForm.vue | 通过(浏览器) | mall-infra-tail-infra-browser-test.js |
| dataSourceConfig/index.vue | 通过(浏览器) | mall-infra-tail-infra-browser-test.js |
| demo/demo01/Demo01ContactForm.vue | 通过(浏览器) | crm-infra-final-infra-demo-browser-test.js |
| demo/demo01/index.vue | 通过(浏览器) | crm-infra-final-infra-demo-browser-test.js |
| demo/demo02/Demo02CategoryForm.vue | 通过(浏览器) | crm-infra-final-infra-demo-browser-test.js |
| demo/demo02/index.vue | 通过(浏览器) | crm-infra-final-infra-demo-browser-test.js |
| demo/demo03/erp/Demo03StudentForm.vue | 通过(浏览器) | crm-infra-final-infra-demo-browser-test.js |
| demo/demo03/erp/components/Demo03CourseForm.vue | 通过(浏览器) | tail-infra-demo03-subforms-browser-test.js |
| demo/demo03/erp/components/Demo03CourseList.vue | 通过(浏览器) | tail-infra-demo03-subforms-browser-test.js |
| demo/demo03/erp/components/Demo03GradeForm.vue | 通过(浏览器) | tail-infra-demo03-subforms-browser-test.js |
| demo/demo03/erp/components/Demo03GradeList.vue | 通过(浏览器) | tail-infra-demo03-subforms-browser-test.js |
| demo/demo03/erp/index.vue | 通过(浏览器) | crm-infra-final-infra-demo-browser-test.js |
| demo/demo03/inner/Demo03StudentForm.vue | 通过(浏览器) | tail-infra-demo03-subforms-browser-test.js |
| demo/demo03/inner/components/Demo03CourseForm.vue | 通过(浏览器) | tail-infra-demo03-subforms-browser-test.js |
| demo/demo03/inner/components/Demo03CourseList.vue | 通过(浏览器) | tail-infra-demo03-subforms-browser-test.js |
| demo/demo03/inner/components/Demo03GradeForm.vue | 通过(浏览器) | tail-infra-demo03-subforms-browser-test.js |
| demo/demo03/inner/components/Demo03GradeList.vue | 通过(浏览器) | tail-infra-demo03-subforms-browser-test.js |
| demo/demo03/inner/index.vue | 通过(浏览器) | crm-infra-final-infra-demo-browser-test.js |
| demo/demo03/normal/Demo03StudentForm.vue | 通过(浏览器) | tail-infra-demo03-subforms-browser-test.js |
| demo/demo03/normal/components/Demo03CourseForm.vue | 通过(浏览器) | tail-infra-demo03-subforms-browser-test.js |
| demo/demo03/normal/components/Demo03GradeForm.vue | 通过(浏览器) | tail-infra-demo03-subforms-browser-test.js |
| demo/demo03/normal/index.vue | 通过(浏览器) | crm-infra-final-infra-demo-browser-test.js |
| druid/index.vue | 通过(浏览器) | final-infra-iframe-browser-test.js |
| file/FileForm.vue | 通过(浏览器) | infra-file-upload-browser-test.js（真实加载 SFC：未上传校验、全屏、server/client 两种上传模式完整调用链与载荷、成功提示、失败保留） |
| file/index.vue | 通过(浏览器) | infra-file-browser-test.js（真实加载 SFC：类型筛选、文件链接/弹窗/下载/复制、图片预览器、成功提示） |
| fileConfig/FileConfigForm.vue | 通过(浏览器) | infra-admin-log-browser-test.js |
| fileConfig/index.vue | 通过(浏览器) | infra-admin-log-browser-test.js |
| job/JobDetail.vue | 通过(浏览器) | infra-admin-config-job-browser-test.js |
| job/JobForm.vue | 通过(浏览器) | infra-admin-config-job-browser-test.js |
| job/index.vue | 通过(浏览器) | infra-admin-config-job-browser-test.js |
| job/logger/JobLogDetail.vue | 通过(浏览器) | infra-admin-config-job-browser-test.js |
| job/logger/index.vue | 通过(浏览器) | infra-admin-config-job-browser-test.js |
| redis/index.vue | 通过(浏览器) | mall-infra-tail-infra-browser-test.js |
| server/index.vue | 通过(浏览器) | final-infra-iframe-browser-test.js |
| skywalking/index.vue | 通过(浏览器) | final-infra-iframe-browser-test.js |
| swagger/index.vue | 通过(浏览器) | final-infra-iframe-browser-test.js |
| webSocket/index.vue | 通过(浏览器) | final-infra-iframe-browser-test.js |

### iot（91 个功能页：通过(浏览器) 79 / 部分(浏览器) 0 / 部分(静态) 12 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：场景告警/设备控制/条件校验通过；今日条件双端共有缺陷

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| alert/config/AlertConfigForm.vue | 通过(浏览器) | im-iot-rest-iot-admin-browser-test.js |
| alert/config/index.vue | 通过(浏览器) | im-iot-rest-iot-admin-browser-test.js |
| alert/record/index.vue | 通过(浏览器) | im-iot-rest-iot-admin-browser-test.js |
| device/device/DeviceForm.vue | 通过(浏览器) | im-iot-admin-iot-device-browser-test.js |
| device/device/DeviceGroupForm.vue | 通过(浏览器) | tail-iot-device-detail-remaining-browser-test.js |
| device/device/DeviceImportForm.vue | 通过(浏览器) | tail-iot-device-detail-remaining-browser-test.js |
| device/device/detail/DeviceDetailConfig.vue | 通过(浏览器) | iot-more3-device-misc-browser-test.js |
| device/device/detail/DeviceDetailsHeader.vue | 通过(浏览器) | tail-iot-device-detail-remaining-browser-test.js |
| device/device/detail/DeviceDetailsInfo.vue | 通过(浏览器) | iot-more3-device-misc-browser-test.js |
| device/device/detail/DeviceDetailsMessage.vue | 通过(浏览器) | iot-more2-iot-detail-browser-test.js |
| device/device/detail/DeviceDetailsSimulator.vue | 通过(浏览器) | iot-more3-device-misc-browser-test.js |
| device/device/detail/DeviceDetailsSubDevice.vue | 通过(浏览器) | tail-iot-device-detail-remaining-browser-test.js |
| device/device/detail/DeviceDetailsThingModel.vue | 通过(浏览器) | tail-iot-device-detail-remaining-browser-test.js |
| device/device/detail/DeviceDetailsThingModelEvent.vue | 通过(浏览器) | ai-tail-iot-thingmodel-browser-test.js |
| device/device/detail/DeviceDetailsThingModelProperty.vue | 通过(浏览器) | ai-tail-iot-thingmodel-browser-test.js |
| device/device/detail/DeviceDetailsThingModelPropertyHistory.vue | 通过(浏览器) | tail-iot-device-detail-remaining-browser-test.js |
| device/device/detail/DeviceDetailsThingModelService.vue | 通过(浏览器) | ai-tail-iot-thingmodel-browser-test.js |
| device/device/detail/DeviceModbusConfig.vue | 通过(浏览器) | iot-more3-modbus-browser-test.js |
| device/device/detail/DeviceModbusConfigForm.vue | 通过(浏览器) | iot-more3-modbus-browser-test.js |
| device/device/detail/DeviceModbusPointForm.vue | 通过(浏览器) | iot-more3-modbus-browser-test.js |
| device/device/detail/index.vue | 通过(浏览器) | iot-more2-iot-detail-browser-test.js |
| device/device/index.vue | 通过(浏览器) | im-iot-admin-iot-device-browser-test.js |
| device/group/DeviceGroupForm.vue | 通过(浏览器) | im-iot-admin-iot-group-category-browser-test.js |
| device/group/index.vue | 通过(浏览器) | im-iot-admin-iot-group-category-browser-test.js |
| home/components/ComparisonCard.vue | 通过(浏览器) | iot-more2-iot-home-browser-test.js |
| home/components/DeviceCountCard.vue | 通过(浏览器) | iot-more2-iot-home-browser-test.js |
| home/components/DeviceMapCard.vue | 通过(浏览器) | iot-more3-device-misc-browser-test.js |
| home/components/DeviceStateCountCard.vue | 通过(浏览器) | iot-more2-iot-home-browser-test.js |
| home/components/MessageTrendCard.vue | 通过(浏览器) | iot-more2-iot-home-browser-test.js |
| home/index.vue | 通过(浏览器) | iot-more2-iot-home-browser-test.js |
| ota/firmware/OtaFirmwareForm.vue | 通过(浏览器) | im-iot-rest-iot-admin-browser-test.js |
| ota/firmware/detail/index.vue | 通过(浏览器) | tail-iot-device-detail-remaining-browser-test.js |
| ota/firmware/index.vue | 通过(浏览器) | im-iot-rest-iot-admin-browser-test.js |
| ota/task/OtaTaskDetail.vue | 通过(浏览器) | iot-more3-device-misc-browser-test.js |
| ota/task/OtaTaskForm.vue | 通过(浏览器) | iot-erp-rest-iot-pages-browser-test.js |
| ota/task/OtaTaskList.vue | 通过(浏览器) | iot-erp-rest-iot-pages-browser-test.js |
| product/category/ProductCategoryForm.vue | 通过(浏览器) | im-iot-admin-iot-group-category-browser-test.js |
| product/category/index.vue | 通过(浏览器) | im-iot-admin-iot-group-category-browser-test.js |
| product/product/ProductForm.vue | 通过(浏览器) | iot-erp-rest-iot-pages-browser-test.js |
| product/product/components/ProductSelect.vue | 通过(浏览器) | iot-more3-device-misc-browser-test.js |
| product/product/detail/ProductDetailsHeader.vue | 通过(浏览器) | tail-iot-device-detail-remaining-browser-test.js |
| product/product/detail/ProductDetailsInfo.vue | 通过(浏览器) | tail-iot-device-detail-remaining-browser-test.js |
| product/product/detail/index.vue | 通过(浏览器) | iot-more2-iot-detail-browser-test.js |
| product/product/index.vue | 通过(浏览器) | iot-erp-rest-iot-pages-browser-test.js |
| rule/data/index.vue | 通过(浏览器) | im-iot-more2-iot-rule-data-browser-test.js |
| rule/data/rule/DataRuleForm.vue | 通过(浏览器) | im-iot-more2-iot-rule-data-browser-test.js |
| rule/data/rule/components/SourceConfigForm.vue | 通过(浏览器) | im-iot-more2-iot-rule-data-browser-test.js |
| rule/data/rule/index.vue | 通过(浏览器) | im-iot-more2-iot-rule-data-browser-test.js |
| rule/data/sink/DataSinkForm.vue | 通过(浏览器) | im-iot-more2-iot-rule-data-browser-test.js |
| rule/data/sink/config/DatabaseConfigForm.vue | 通过(浏览器) | tail-iot-sink-config-remaining-browser-test.js |
| rule/data/sink/config/HttpConfigForm.vue | 通过(浏览器) | im-iot-more2-iot-rule-data-browser-test.js |
| rule/data/sink/config/KafkaMQConfigForm.vue | 通过(浏览器) | iot-more3-sink-config-browser-test.js |
| rule/data/sink/config/MqttConfigForm.vue | 通过(浏览器) | iot-more3-sink-config-browser-test.js |
| rule/data/sink/config/RabbitMQConfigForm.vue | 通过(浏览器) | iot-more3-sink-config-browser-test.js |
| rule/data/sink/config/RedisStreamConfigForm.vue | 通过(浏览器) | iot-more3-sink-config-browser-test.js |
| rule/data/sink/config/RocketMQConfigForm.vue | 通过(浏览器) | tail-iot-sink-config-remaining-browser-test.js |
| rule/data/sink/config/TcpConfigForm.vue | 通过(浏览器) | iot-more3-sink-config-browser-test.js |
| rule/data/sink/config/WebSocketConfigForm.vue | 通过(浏览器) | iot-more3-sink-config-browser-test.js |
| rule/data/sink/config/components/KeyValueEditor.vue | 通过(浏览器) | im-iot-more2-iot-rule-data-browser-test.js |
| rule/data/sink/index.vue | 通过(浏览器) | im-iot-more2-iot-rule-data-browser-test.js |
| rule/scene/form/RuleSceneForm.vue | 通过(浏览器) | iot-batch-scene-form-browser-test.js |
| rule/scene/form/configs/AlertConfig.vue | 通过(浏览器) | iot-alert-validation-browser-test.js |
| rule/scene/form/configs/ConditionConfig.vue | 通过(浏览器) | iot-condition-validation-browser-test.js |
| rule/scene/form/configs/CurrentTimeConditionConfig.vue | 通过(浏览器) | iot-condition-validation-browser-test.js + iot-today-parity-browser-test.js |
| rule/scene/form/configs/DeviceControlConfig.vue | 通过(浏览器) | iot-device-validation-browser-test.js |
| rule/scene/form/configs/DeviceTriggerConfig.vue | 部分(静态) | iot-migration-test.js |
| rule/scene/form/configs/MainConditionInnerConfig.vue | 通过(浏览器) | iot-condition-validation-browser-test.js |
| rule/scene/form/configs/SubConditionGroupConfig.vue | 部分(静态) | iot-migration-test.js |
| rule/scene/form/configs/TimerConditionGroupConfig.vue | 部分(静态) | iot-migration-test.js |
| rule/scene/form/inputs/JsonParamsInput.vue | 部分(静态) | iot-migration-test.js |
| rule/scene/form/inputs/ValueInput.vue | 部分(静态) | iot-migration-test.js |
| rule/scene/form/sections/ActionSection.vue | 部分(静态) | iot-migration-test.js |
| rule/scene/form/sections/BasicInfoSection.vue | 部分(静态) | iot-migration-test.js |
| rule/scene/form/sections/TriggerSection.vue | 部分(静态) | iot-migration-test.js |
| rule/scene/form/selectors/DeviceSelector.vue | 部分(静态) | iot-migration-test.js |
| rule/scene/form/selectors/OperatorSelector.vue | 部分(静态) | iot-migration-test.js |
| rule/scene/form/selectors/ProductSelector.vue | 部分(静态) | iot-migration-test.js |
| rule/scene/form/selectors/PropertySelector.vue | 部分(静态) | iot-migration-test.js |
| rule/scene/index.vue | 通过(浏览器) | iot-erp-rest-iot-pages-browser-test.js |
| thingmodel/ThingModelEvent.vue | 通过(浏览器) | iot-batch-thingmodel-misc-browser-test.js |
| thingmodel/ThingModelForm.vue | 通过(浏览器) | iot-more2-iot-thingmodel-browser-test.js |
| thingmodel/ThingModelInputOutputParam.vue | 通过(浏览器) | iot-batch-thingmodel-misc-browser-test.js |
| thingmodel/ThingModelProperty.vue | 通过(浏览器) | iot-more2-iot-thingmodel-browser-test.js |
| thingmodel/ThingModelService.vue | 通过(浏览器) | iot-batch-thingmodel-misc-browser-test.js |
| thingmodel/ThingModelTSL.vue | 通过(浏览器) | iot-batch-thingmodel-misc-browser-test.js |
| thingmodel/components/DataDefinition.vue | 通过(浏览器) | iot-more2-iot-thingmodel-browser-test.js |
| thingmodel/dataSpecs/ThingModelArrayDataSpecs.vue | 通过(浏览器) | iot-batch-thingmodel-misc-browser-test.js |
| thingmodel/dataSpecs/ThingModelEnumDataSpecs.vue | 通过(浏览器) | iot-more2-iot-thingmodel-browser-test.js |
| thingmodel/dataSpecs/ThingModelNumberDataSpecs.vue | 通过(浏览器) | iot-more2-iot-thingmodel-browser-test.js |
| thingmodel/dataSpecs/ThingModelStructDataSpecs.vue | 通过(浏览器) | iot-batch-thingmodel-misc-browser-test.js |
| thingmodel/index.vue | 通过(浏览器) | iot-more2-iot-thingmodel-browser-test.js |

### mall（124 个功能页：通过(浏览器) 124 / 部分(浏览器) 0 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：优惠券/分类对照通过；多选闭环/真实写入待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| home/components/ComparisonCard.vue | 通过(浏览器) | mall-final-tail-home-stat-browser-test.js |
| home/components/MemberStatisticsCard.vue | 通过(浏览器) | final-mall-home-browser-test.js |
| home/components/OperationDataCard.vue | 通过(浏览器) | final-mall-home-browser-test.js |
| home/components/ShortcutCard.vue | 通过(浏览器) | final-mall-home-browser-test.js |
| home/components/TradeTrendCard.vue | 通过(浏览器) | final-mall-home-browser-test.js |
| home/index.vue | 通过(浏览器) | mall-final-tail-home-stat-browser-test.js |
| product/brand/BrandForm.vue | 通过(浏览器) | mall-product-admin-browser-test.js |
| product/brand/index.vue | 通过(浏览器) | mall-product-admin-browser-test.js |
| product/category/CategoryForm.vue | 通过(浏览器) | final-mall-category-browser-test.js |
| product/category/components/ProductCategorySelect.vue | 通过(浏览器) | mall-category-select-parity-browser-test.js（单选父级展开/叶选/无清除 parity）+ mall-category-multiple-parity-browser-test.js（多选叶节点 ID parity）+ mall-coupon-form-browser-test.js（优惠券表单内展开/选择/编辑回填） |
| product/category/index.vue | 通过(浏览器) | final-mall-category-browser-test.js |
| product/comment/CommentForm.vue | 通过(浏览器) | mall-spu-diy-misc-browser-test.js |
| product/comment/ReplyForm.vue | 通过(浏览器) | mall-spu-diy-misc-browser-test.js |
| product/comment/index.vue | 通过(浏览器) | mall-spu-diy-misc-browser-test.js |
| product/property/PropertyForm.vue | 通过(浏览器) | mall-product-admin-browser-test.js |
| product/property/index.vue | 通过(浏览器) | mall-product-admin-browser-test.js |
| product/property/value/ValueForm.vue | 通过(浏览器) | mall-product-admin-browser-test.js |
| product/property/value/index.vue | 通过(浏览器) | mall-product-admin-browser-test.js |
| product/spu/components/SkuList.vue | 通过(浏览器) | mall-spu-diy-spu-form-browser-test.js |
| product/spu/components/SkuTableSelect.vue | 通过(浏览器) | final-mall-category-browser-test.js |
| product/spu/components/SpuShowcase.vue | 通过(浏览器) | mall-coupon-form-browser-test.js（点击加号打开选品、确认回显 productSpuIds、删除图标、编辑详情图片回填） |
| product/spu/components/SpuTableSelect.vue | 通过(浏览器) | mall-coupon-form-browser-test.js（选品弹窗分页、跨页勾选、名称/分类/日期搜索）+ mall-spu-date-parity-browser-test.js（真实 SFC 的日期选择器标记双端手输 parity） |
| product/spu/form/DeliveryForm.vue | 通过(浏览器) | mall-infra-tail-spu-subforms-browser-test.js |
| product/spu/form/DescriptionForm.vue | 通过(浏览器) | mall-infra-tail-spu-subforms-browser-test.js |
| product/spu/form/InfoForm.vue | 通过(浏览器) | mall-spu-diy-spu-form-browser-test.js |
| product/spu/form/OtherForm.vue | 通过(浏览器) | mall-infra-tail-spu-subforms-browser-test.js |
| product/spu/form/ProductAttributes.vue | 通过(浏览器) | mall-spu-diy-spu-form-browser-test.js |
| product/spu/form/ProductPropertyAddForm.vue | 通过(浏览器) | mall-spu-diy-spu-form-browser-test.js |
| product/spu/form/SkuForm.vue | 通过(浏览器) | mall-spu-diy-spu-form-browser-test.js |
| product/spu/form/index.vue | 通过(浏览器) | mall-spu-diy-spu-form-browser-test.js |
| product/spu/index.vue | 通过(浏览器) | mall-product-spu-browser-test.js |
| promotion/article/ArticleForm.vue | 通过(浏览器) | mall-rest-content-browser-test.js |
| promotion/article/category/ArticleCategoryForm.vue | 通过(浏览器) | mall-infra-tail-mall-browser-test.js |
| promotion/article/category/index.vue | 通过(浏览器) | mall-infra-tail-mall-browser-test.js |
| promotion/article/index.vue | 通过(浏览器) | mall-rest-content-browser-test.js |
| promotion/banner/BannerForm.vue | 通过(浏览器) | mall-rest-content-browser-test.js |
| promotion/banner/index.vue | 通过(浏览器) | mall-rest-content-browser-test.js |
| promotion/bargain/activity/BargainActivityForm.vue | 通过(浏览器) | mall-rest-activity-browser-test.js |
| promotion/bargain/activity/index.vue | 通过(浏览器) | mall-rest-activity-browser-test.js |
| promotion/bargain/record/BargainRecordListDialog.vue | 通过(浏览器) | mall-final-tail-records-browser-test.js |
| promotion/bargain/record/index.vue | 通过(浏览器) | mall-final-tail-records-browser-test.js |
| promotion/combination/activity/CombinationActivityForm.vue | 通过(浏览器) | mall-rest-activity-browser-test.js |
| promotion/combination/activity/index.vue | 通过(浏览器) | mall-rest-activity-browser-test.js |
| promotion/combination/components/CombinationShowcase.vue | 通过(浏览器) | tail-promo-showcase-tableselect-browser-test.js |
| promotion/combination/components/CombinationTableSelect.vue | 通过(浏览器) | tail-promo-showcase-tableselect-browser-test.js |
| promotion/combination/record/CombinationRecordListDialog.vue | 通过(浏览器) | mall-final-tail-records-browser-test.js |
| promotion/combination/record/index.vue | 通过(浏览器) | mall-final-tail-records-browser-test.js |
| promotion/components/SpuAndSkuList.vue | 通过(浏览器) | tail-promo-spu-coupon-browser-test.js |
| promotion/components/SpuSelect.vue | 通过(浏览器) | tail-promo-spu-coupon-browser-test.js |
| promotion/coupon/components/CouponSelect.vue | 通过(浏览器) | tail-promo-spu-coupon-browser-test.js |
| promotion/coupon/components/CouponSendForm.vue | 通过(浏览器) | tail-promo-spu-coupon-browser-test.js |
| promotion/coupon/index.vue | 通过(浏览器) | tail-promo-spu-coupon-browser-test.js |
| promotion/coupon/template/CouponTemplateForm.vue | 通过(浏览器) | mall-coupon-form-browser-test.js（真实 SFC：新增/编辑、必填与条件字段校验、全屏、折扣/领取/固定日期分支、指定商品/指定品类范围、create/update 载荷，API 为替身） |
| promotion/coupon/template/index.vue | 通过(浏览器) | tail-promo-spu-coupon-browser-test.js |
| promotion/discountActivity/DiscountActivityForm.vue | 通过(浏览器) | mall-product-promotion-browser-test.js |
| promotion/discountActivity/index.vue | 通过(浏览器) | mall-product-promotion-browser-test.js |
| promotion/diy/page/DiyPageForm.vue | 通过(浏览器) | mall-spu-diy-diy-browser-test.js |
| promotion/diy/page/decorate.vue | 通过(浏览器) | mall-spu-diy-diy-browser-test.js |
| promotion/diy/page/index.vue | 通过(浏览器) | mall-spu-diy-diy-browser-test.js |
| promotion/diy/template/DiyTemplateForm.vue | 通过(浏览器) | mall-spu-diy-diy-browser-test.js |
| promotion/diy/template/decorate.vue | 通过(浏览器) | mall-spu-diy-diy-browser-test.js |
| promotion/diy/template/index.vue | 通过(浏览器) | mall-spu-diy-diy-browser-test.js |
| promotion/kefu/components/KeFuConversationList.vue | 通过(浏览器) | tail-promo-kefu-browser-test.js |
| promotion/kefu/components/KeFuMessageList.vue | 通过(浏览器) | tail-promo-kefu-browser-test.js |
| promotion/kefu/components/member/MemberInfo.vue | 通过(浏览器) | tail-promo-kefu-browser-test.js |
| promotion/kefu/components/member/OrderBrowsingHistory.vue | 通过(浏览器) | tail-promo-kefu-browser-test.js |
| promotion/kefu/components/member/ProductBrowsingHistory.vue | 通过(浏览器) | tail-promo-kefu-browser-test.js |
| promotion/kefu/components/message/MessageItem.vue | 通过(浏览器) | tail-promo-kefu-browser-test.js |
| promotion/kefu/components/message/OrderItem.vue | 通过(浏览器) | tail-promo-kefu-browser-test.js |
| promotion/kefu/components/message/ProductItem.vue | 通过(浏览器) | tail-promo-kefu-browser-test.js |
| promotion/kefu/components/tools/EmojiSelectPopover.vue | 通过(浏览器) | tail-promo-kefu-browser-test.js |
| promotion/kefu/components/tools/PictureSelectUpload.vue | 通过(浏览器) | tail-promo-kefu-browser-test.js |
| promotion/kefu/index.vue | 通过(浏览器) | tail-promo-kefu-browser-test.js |
| promotion/point/activity/PointActivityForm.vue | 通过(浏览器) | mall-rest-activity-browser-test.js |
| promotion/point/activity/index.vue | 通过(浏览器) | mall-rest-activity-browser-test.js |
| promotion/point/components/PointShowcase.vue | 通过(浏览器) | tail-promo-showcase-tableselect-browser-test.js |
| promotion/point/components/PointTableSelect.vue | 通过(浏览器) | tail-promo-showcase-tableselect-browser-test.js |
| promotion/rewardActivity/RewardForm.vue | 通过(浏览器) | mall-rest-activity-browser-test.js |
| promotion/rewardActivity/components/RewardRule.vue | 通过(浏览器) | mall-rest-activity-browser-test.js |
| promotion/rewardActivity/components/RewardRuleCouponSelect.vue | 通过(浏览器) | mall-rest-activity-browser-test.js |
| promotion/rewardActivity/index.vue | 通过(浏览器) | mall-rest-activity-browser-test.js |
| promotion/seckill/activity/SeckillActivityForm.vue | 通过(浏览器) | mall-product-promotion-browser-test.js |
| promotion/seckill/activity/index.vue | 通过(浏览器) | mall-product-promotion-browser-test.js |
| promotion/seckill/components/SeckillShowcase.vue | 通过(浏览器) | tail-promo-showcase-tableselect-browser-test.js |
| promotion/seckill/components/SeckillTableSelect.vue | 通过(浏览器) | tail-promo-showcase-tableselect-browser-test.js |
| promotion/seckill/config/SeckillConfigForm.vue | 通过(浏览器) | mall-spu-diy-misc-browser-test.js |
| promotion/seckill/config/index.vue | 通过(浏览器) | mall-spu-diy-misc-browser-test.js |
| statistics/member/components/MemberFunnelCard.vue | 通过(浏览器) | mall-rest-statistics-store-browser-test.js |
| statistics/member/components/MemberTerminalCard.vue | 通过(浏览器) | mall-rest-statistics-store-browser-test.js |
| statistics/member/index.vue | 通过(浏览器) | mall-rest-statistics-store-browser-test.js |
| statistics/product/components/ProductRank.vue | 通过(浏览器) | mall-final-tail-home-stat-browser-test.js |
| statistics/product/components/ProductSummary.vue | 通过(浏览器) | final-mall-forms-browser-test.js |
| statistics/product/index.vue | 通过(浏览器) | mall-product-promotion-browser-test.js |
| statistics/trade/components/TradeStatisticValue.vue | 通过(浏览器) | mall-rest-statistics-store-browser-test.js |
| statistics/trade/index.vue | 通过(浏览器) | mall-rest-statistics-store-browser-test.js |
| trade/afterSale/detail/index.vue | 通过(浏览器) | mall-trade-after-sale-browser-test.js |
| trade/afterSale/form/AfterSaleDisagreeForm.vue | 通过(浏览器) | mall-trade-after-sale-browser-test.js |
| trade/afterSale/index.vue | 通过(浏览器) | mall-trade-after-sale-browser-test.js |
| trade/brokerage/record/index.vue | 通过(浏览器) | mall-spu-diy-misc-browser-test.js |
| trade/brokerage/user/BrokerageOrderListDialog.vue | 通过(浏览器) | mall-final-tail-brokerage-browser-test.js |
| trade/brokerage/user/BrokerageUserCreateForm.vue | 通过(浏览器) | final-mall-forms-browser-test.js |
| trade/brokerage/user/BrokerageUserListDialog.vue | 通过(浏览器) | mall-final-tail-brokerage-browser-test.js |
| trade/brokerage/user/BrokerageUserUpdateForm.vue | 通过(浏览器) | mall-final-tail-brokerage-browser-test.js |
| trade/brokerage/user/index.vue | 通过(浏览器) | mall-final-tail-brokerage-browser-test.js |
| trade/brokerage/withdraw/BrokerageWithdrawRejectForm.vue | 通过(浏览器) | mall-final-tail-brokerage-browser-test.js |
| trade/brokerage/withdraw/index.vue | 通过(浏览器) | mall-final-tail-brokerage-browser-test.js |
| trade/config/index.vue | 通过(浏览器) | mall-infra-tail-mall-browser-test.js |
| trade/delivery/express/ExpressForm.vue | 通过(浏览器) | mall-trade-delivery-browser-test.js |
| trade/delivery/express/index.vue | 通过(浏览器) | mall-trade-delivery-browser-test.js |
| trade/delivery/expressTemplate/ExpressTemplateForm.vue | 通过(浏览器) | mall-trade-delivery-browser-test.js |
| trade/delivery/expressTemplate/index.vue | 通过(浏览器) | mall-trade-delivery-browser-test.js |
| trade/delivery/pickUpOrder/index.vue | 通过(浏览器) | mall-trade-delivery-browser-test.js |
| trade/delivery/pickUpStore/DeliveryPickUpStoreBindForm.vue | 通过(浏览器) | final-mall-forms-browser-test.js |
| trade/delivery/pickUpStore/PickUpStoreForm.vue | 通过(浏览器) | mall-rest-statistics-store-browser-test.js |
| trade/delivery/pickUpStore/components/StoreStaffTableSelect.vue | 通过(浏览器) | final-mall-forms-browser-test.js |
| trade/delivery/pickUpStore/index.vue | 通过(浏览器) | mall-rest-statistics-store-browser-test.js |
| trade/order/components/OrderTableColumn.vue | 通过(浏览器) | member-detail-browser-test.js（会员详情订单页签中真实渲染：嵌套商品列、属性、售后状态 DictTag、图片预览） |
| trade/order/detail/index.vue | 通过(浏览器) | mall-trade-order-browser-test.js |
| trade/order/form/OrderDeliveryForm.vue | 通过(浏览器) | mall-trade-order-browser-test.js |
| trade/order/form/OrderPickUpForm.vue | 通过(浏览器) | mall-trade-order-browser-test.js |
| trade/order/form/OrderUpdateAddressForm.vue | 通过(浏览器) | mall-trade-order-browser-test.js |
| trade/order/form/OrderUpdatePriceForm.vue | 通过(浏览器) | mall-trade-order-browser-test.js |
| trade/order/form/OrderUpdateRemarkForm.vue | 通过(浏览器) | mall-trade-order-browser-test.js |
| trade/order/index.vue | 通过(浏览器) | mall-trade-order-browser-test.js |

### member（32 个功能页：通过(浏览器) 32 / 部分(浏览器) 0 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：详情刷新/订单列/收藏/售后通过；真实编辑写入待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| config/index.vue | 通过(浏览器) | sys-member-tail-member-browser-test.js |
| group/GroupForm.vue | 通过(浏览器) | member-taxonomy-dialog-browser-test.js（真实 SFC/Dialog：新增/编辑、状态单选、备注、全屏、必填、失败保留重试、详情拒绝恢复） |
| group/components/MemberGroupSelect.vue | 通过(浏览器) | final-member-selects-browser-test.js |
| group/index.vue | 通过(浏览器) | member-admin-taxonomy-browser-test.js |
| level/LevelForm.vue | 通过(浏览器) | member-level-form-browser-test.js（真实 SFC/Dialog/UploadImg：必填、数值字段 min/max/归零、图标回填与删除、全屏、create/update 载荷、保存失败保留重试） |
| level/components/MemberLevelSelect.vue | 通过(浏览器) | final-member-selects-browser-test.js |
| level/index.vue | 通过(浏览器) | member-admin-taxonomy-browser-test.js |
| point/record/index.vue | 通过(浏览器) | member-admin-record-browser-test.js |
| signin/config/SignInConfigForm.vue | 通过(浏览器) | sys-member-tail-member-browser-test.js |
| signin/config/index.vue | 通过(浏览器) | sys-member-tail-member-browser-test.js |
| signin/record/index.vue | 通过(浏览器) | member-admin-record-browser-test.js |
| tag/TagForm.vue | 通过(浏览器) | member-taxonomy-dialog-browser-test.js（真实 SFC/Dialog：新增/编辑、必填、全屏、失败保留重试、详情拒绝恢复） |
| tag/components/MemberTagSelect.vue | 通过(浏览器) | final-member-selects-browser-test.js |
| tag/index.vue | 通过(浏览器) | member-admin-taxonomy-browser-test.js |
| user/UserForm.vue | 通过(浏览器) | member-admin-user-browser-test.js |
| user/components/UserBalanceUpdateForm.vue | 通过(浏览器) | member-admin-user-browser-test.js |
| user/components/UserLevelUpdateForm.vue | 通过(浏览器) | member-admin-user-browser-test.js |
| user/components/UserPointUpdateForm.vue | 通过(浏览器) | member-admin-user-browser-test.js |
| user/detail/UserAccountInfo.vue | 通过(浏览器) | member-admin-record-browser-test.js |
| user/detail/UserAddressList.vue | 通过(浏览器) | member-admin-record-browser-test.js |
| user/detail/UserAftersaleList.vue | 通过(浏览器) | tail2-rest-tail-browser-test.js |
| user/detail/UserBalanceList.vue | 通过(浏览器) | sys-member-tail-member-browser-test.js |
| user/detail/UserBasicInfo.vue | 通过(浏览器) | member-admin-record-browser-test.js |
| user/detail/UserBrokerageList.vue | 通过(浏览器) | final-member-detail-rest-browser-test.js |
| user/detail/UserCouponList.vue | 通过(浏览器) | sys-member-tail-member-browser-test.js |
| user/detail/UserExperienceRecordList.vue | 通过(浏览器) | final-member-detail-rest-browser-test.js |
| user/detail/UserFavoriteList.vue | 通过(浏览器) | member-detail-browser-test.js（真实 SFC：分转元与 0 元格式化、图片预览、userId 查询） |
| user/detail/UserOrderList.vue | 通过(浏览器) | member-detail-browser-test.js（真实 SFC：订单行渲染、userId=42 查询、搜索、详情跳转） |
| user/detail/UserPointList.vue | 通过(浏览器) | sys-member-tail-member-browser-test.js |
| user/detail/UserSignList.vue | 通过(浏览器) | sys-member-tail-member-browser-test.js |
| user/detail/index.vue | 通过(浏览器) | member-detail-browser-test.js（真实 SFC：编辑接线刷新、订单/售后/收藏页签切换与搜索；其余 User* 明细子组件为桩） |
| user/index.vue | 通过(浏览器) | member-admin-user-browser-test.js |

### mes（284 个功能页：通过(浏览器) 110 / 部分(浏览器) 0 / 部分(静态) 174 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：出库拣货/换库存通过；生产流程/真实写入闭环待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| cal/calendar/CalendarDateCell.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/calendar/CalendarLegend.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/calendar/TeamView.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/calendar/TypeView.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/calendar/UserView.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/calendar/index.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/holiday/HolidayForm.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/holiday/index.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/plan/CalPlanForm.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/plan/CalPlanTeamList.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/plan/CalShiftList.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/plan/index.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/team/CalTeamForm.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/team/CalTeamMemberList.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/team/components/CalTeamSelect.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/team/components/CalTeamSelectDialog.vue | 部分(静态) | mes-cal-migration-test.js |
| cal/team/index.vue | 部分(静态) | mes-cal-migration-test.js |
| dv/checkplan/CheckPlanForm.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/checkplan/CheckPlanMachineryList.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/checkplan/CheckPlanSubjectList.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/checkplan/components/DvCheckPlanSelect.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/checkplan/components/DvCheckPlanSelectDialog.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/checkplan/index.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/checkrecord/CheckRecordForm.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/checkrecord/CheckRecordLineList.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/checkrecord/index.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/machinery/MachineryCheckRecordList.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/machinery/MachineryForm.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/machinery/MachineryImportForm.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/machinery/MachineryMaintenRecordList.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/machinery/MachineryRepairList.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/machinery/components/DvMachinerySelect.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/machinery/components/DvMachinerySelectDialog.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/machinery/index.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/machinery/type/MachineryTypeForm.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/machinery/type/components/DvMachineryTypeSelect.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/machinery/type/components/MachineryTypeTree.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/machinery/type/index.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/maintenrecord/MaintenRecordForm.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/maintenrecord/MaintenRecordLineList.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/maintenrecord/index.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/repair/RepairForm.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/repair/RepairLineList.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/repair/index.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/subject/SubjectForm.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/subject/components/DvSubjectSelect.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/subject/components/DvSubjectSelectDialog.vue | 部分(静态) | mes-dv-migration-test.js |
| dv/subject/index.vue | 部分(静态) | mes-dv-migration-test.js |
| home/HomeAlertPanel.vue | 部分(静态) | mes-home-migration-test.js |
| home/HomeKpiCards.vue | 部分(静态) | mes-home-migration-test.js |
| home/HomeProductionTrend.vue | 部分(静态) | mes-home-migration-test.js |
| home/HomeShortcuts.vue | 部分(静态) | mes-home-migration-test.js |
| home/HomeWorkOrderChart.vue | 部分(静态) | mes-home-migration-test.js |
| home/index.vue | 部分(静态) | mes-home-migration-test.js |
| md/autocode/AutoCodePartForm.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/autocode/AutoCodePartList.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/autocode/AutoCodeRuleForm.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/autocode/index.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/client/ClientProductSalesLineList.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/client/ClientProductSalesList.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/client/MdClientForm.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/client/MdClientImportForm.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/client/components/MdClientSelect.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/client/components/MdClientSelectDialog.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/client/index.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/item/MdItemBatchConfigForm.vue | 部分(静态) | mes-md-item-receipt-migration-test.js |
| md/item/MdItemForm.vue | 部分(静态) | mes-md-item-receipt-migration-test.js |
| md/item/MdItemImportForm.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/item/MdProductBomForm.vue | 部分(静态) | mes-md-item-receipt-migration-test.js |
| md/item/MdProductSipForm.vue | 部分(静态) | mes-md-item-receipt-migration-test.js |
| md/item/MdProductSopForm.vue | 部分(静态) | mes-md-item-receipt-migration-test.js |
| md/item/components/MdItemSelect.vue | 部分(静态) | mes-md-item-receipt-migration-test.js |
| md/item/components/MdItemSelectDialog.vue | 部分(静态) | mes-md-item-receipt-migration-test.js |
| md/item/components/MdProductBomSelect.vue | 部分(静态) | mes-md-item-receipt-migration-test.js |
| md/item/components/MdProductBomSelectDialog.vue | 部分(静态) | mes-md-item-receipt-migration-test.js |
| md/item/index.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/item/type/MdItemTypeForm.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/item/type/components/MdItemTypeSelect.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/item/type/components/MdItemTypeTree.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/item/type/index.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/unitmeasure/UnitMeasureForm.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/unitmeasure/components/MdUnitMeasureSelect.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/unitmeasure/index.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/vendor/MdVendorForm.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/vendor/MdVendorImportForm.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/vendor/VendorItemReceiptLineList.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/vendor/VendorItemReceiptList.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/vendor/components/MdVendorSelect.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/vendor/components/MdVendorSelectDialog.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/vendor/index.vue | 部分(静态) | mes-md-party-migration-test.js |
| md/workstation/WorkstationForm.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/workstation/WorkstationMachineList.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/workstation/WorkstationToolList.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/workstation/WorkstationWorkerList.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/workstation/components/MdWorkshopSelect.vue | 部分(静态) | mes-dv-migration-test.js |
| md/workstation/components/MdWorkstationSelect.vue | 部分(静态) | mes-pro-migration-test.js |
| md/workstation/components/MdWorkstationSelectDialog.vue | 部分(静态) | mes-pro-migration-test.js |
| md/workstation/index.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/workstation/workshop/WorkshopForm.vue | 部分(静态) | mes-md-core-migration-test.js |
| md/workstation/workshop/index.vue | 部分(静态) | mes-md-core-migration-test.js |
| pro/andon/config/AndonConfigForm.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/andon/config/components/AndonConfigSelect.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/andon/record/AndonRecordForm.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/andon/record/index.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/card/CardForm.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/card/CardProcessList.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/card/components/ProCardSelect.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/card/components/ProCardSelectDialog.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/card/index.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/feedback/FeedbackForm.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/feedback/ItemConsumeList.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/feedback/ProductProduceList.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/feedback/index.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/process/ProProcessContentList.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/process/ProProcessForm.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/process/components/ProProcessSelect.vue | 部分(静态) | mes-md-item-receipt-migration-test.js |
| pro/process/index.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/route/RouteForm.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/route/RouteProcessList.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/route/RouteProductBomList.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/route/RouteProductList.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/route/index.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/task/ProTaskList.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/task/WorkOrderForm2.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/task/components/GanttChart.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/task/components/ProTaskSelect.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/task/components/ProTaskSelectDialog.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/task/edit/index.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/task/index.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/workorder/WorkOrderBomList.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/workorder/WorkOrderForm.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/workorder/WorkOrderItemList.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/workorder/components/ProWorkOrderSelect.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/workorder/components/ProWorkOrderSelectDialog.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/workorder/index.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/workrecord/WorkRecordStatusBar.vue | 部分(静态) | mes-pro-migration-test.js |
| pro/workrecord/index.vue | 部分(静态) | mes-pro-migration-test.js |
| qc/batchtrace/BatchTraceDetail.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/batchtrace/BatchTraceDetailList.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/batchtrace/index.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/defect/DefectForm.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/defect/index.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/defectrecord/components/DefectRecordInlineList.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/indicator/IndicatorForm.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/indicator/components/QcIndicatorSelect.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/indicator/components/QcIndicatorSelectDialog.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/indicator/index.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/indicatorresult/components/QcIndicatorResultForm.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/indicatorresult/components/QcIndicatorResultList.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/ipqc/IpqcForm.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/ipqc/IpqcLineList.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/ipqc/index.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/iqc/IqcForm.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/iqc/IqcLineList.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/iqc/index.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/oqc/OqcForm.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/oqc/OqcLineList.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/oqc/index.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/pendinginspect/index.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/rqc/RqcForm.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/rqc/RqcLineList.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/rqc/index.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/template/TemplateForm.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/template/TemplateIndicatorList.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/template/TemplateItemList.vue | 部分(静态) | mes-qc-migration-test.js |
| qc/template/index.vue | 部分(静态) | mes-qc-migration-test.js |
| tm/tool/ToolForm.vue | 部分(静态) | mes-tm-tool-migration-test.js |
| tm/tool/components/TmToolSelect.vue | 部分(静态) | mes-tm-tool-migration-test.js |
| tm/tool/components/TmToolSelectDialog.vue | 部分(静态) | mes-tm-tool-migration-test.js |
| tm/tool/index.vue | 部分(静态) | mes-tm-tool-migration-test.js |
| tm/tool/type/ToolTypeForm.vue | 部分(静态) | mes-tm-tool-migration-test.js |
| tm/tool/type/components/TmToolTypeList.vue | 部分(静态) | mes-tm-tool-migration-test.js |
| tm/tool/type/components/TmToolTypeSelect.vue | 部分(静态) | mes-tm-tool-migration-test.js |
| tm/tool/type/index.vue | 部分(静态) | mes-tm-tool-migration-test.js |
| wm/arrivalnotice/ArrivalNoticeForm.vue | 通过(浏览器) | mes-wm-more4-arrivalnotice-browser-test.js |
| wm/arrivalnotice/ArrivalNoticeLineList.vue | 通过(浏览器) | mes-wm-more4-arrivalnotice-browser-test.js |
| wm/arrivalnotice/components/WmArrivalNoticeLineSelect.vue | 通过(浏览器) | mes-batch-wm-arrival-selects-browser-test.js |
| wm/arrivalnotice/components/WmArrivalNoticeLineSelectDialog.vue | 通过(浏览器) | mes-batch-wm-arrival-selects-browser-test.js |
| wm/arrivalnotice/components/WmArrivalNoticeSelect.vue | 通过(浏览器) | mes-batch-wm-arrival-selects-browser-test.js |
| wm/arrivalnotice/components/WmArrivalNoticeSelectDialog.vue | 通过(浏览器) | mes-batch-wm-arrival-selects-browser-test.js |
| wm/arrivalnotice/index.vue | 通过(浏览器) | mes-wm-more4-arrivalnotice-browser-test.js |
| wm/barcode/BarcodeForm.vue | 通过(浏览器) | mes-wm-admin-barcode-browser-test.js |
| wm/barcode/components/Barcode.vue | 通过(浏览器) | mes-batch-wm-barcode-config-browser-test.js |
| wm/barcode/components/BarcodeDetail.vue | 通过(浏览器) | mes-batch-wm-barcode-config-browser-test.js |
| wm/barcode/components/PrinterLabel.vue | 通过(浏览器) | mes-batch-wm-barcode-config-browser-test.js |
| wm/barcode/config/BarcodeConfigForm.vue | 通过(浏览器) | mes-batch-wm-barcode-config-browser-test.js |
| wm/barcode/config/index.vue | 通过(浏览器) | mes-batch-wm-barcode-config-browser-test.js |
| wm/barcode/index.vue | 通过(浏览器) | mes-wm-admin-barcode-browser-test.js |
| wm/batch/BatchForm.vue | 通过(浏览器) | mes-wm-admin-misc-stock-browser-test.js |
| wm/batch/components/WmBatchSelect.vue | 通过(浏览器) | mes-product-sales-batch-browser-test.js |
| wm/batch/components/WmBatchSelectDialog.vue | 通过(浏览器) | mes-batch-wm-batch-misc-lines-browser-test.js |
| wm/itemreceipt/ItemReceiptDetailForm.vue | 通过(浏览器) | mes-wm-more4-detail-pairs-browser-test.js |
| wm/itemreceipt/ItemReceiptDetailList.vue | 通过(浏览器) | mes-wm-more4-detail-pairs-browser-test.js |
| wm/itemreceipt/ItemReceiptForm.vue | 通过(浏览器) | mes-wm-admin-item-receipt-browser-test.js |
| wm/itemreceipt/ItemReceiptLineList.vue | 通过(浏览器) | mes-wm-more5-transfer-itemreceipt-browser-test.js |
| wm/itemreceipt/index.vue | 通过(浏览器) | mes-wm-admin-item-receipt-browser-test.js |
| wm/materialstock/components/WmMaterialStockSelect.vue | 通过(浏览器) | mes-wm-final-materialstock-browser-test.js |
| wm/materialstock/components/WmMaterialStockSelectDialog.vue | 通过(浏览器) | mes-wm-final-materialstock-browser-test.js |
| wm/materialstock/index.vue | 通过(浏览器) | mes-wm-admin-misc-stock-browser-test.js |
| wm/miscissue/MiscIssueForm.vue | 通过(浏览器) | mes-wm-admin-misc-stock-browser-test.js |
| wm/miscissue/MiscIssueLineList.vue | 通过(浏览器) | mes-batch-wm-batch-misc-lines-browser-test.js |
| wm/miscissue/index.vue | 通过(浏览器) | mes-wm-admin-misc-stock-browser-test.js |
| wm/miscreceipt/MiscReceiptForm.vue | 通过(浏览器) | hrm-mes-more-wm-forms-browser-test.js |
| wm/miscreceipt/MiscReceiptLineList.vue | 通过(浏览器) | mes-batch-wm-batch-misc-lines-browser-test.js |
| wm/miscreceipt/index.vue | 通过(浏览器) | mes-erp-rest-mes-wm-browser-test.js |
| wm/outsourceissue/OutsourceIssueDetailForm.vue | 通过(浏览器) | mes-wm-more5-outsource-issue-browser-test.js |
| wm/outsourceissue/OutsourceIssueDetailList.vue | 通过(浏览器) | mes-wm-more5-outsource-issue-browser-test.js |
| wm/outsourceissue/OutsourceIssueForm.vue | 通过(浏览器) | mes-wm-more5-outsource-issue-browser-test.js |
| wm/outsourceissue/OutsourceIssueLineList.vue | 通过(浏览器) | mes-wm-more5-outsource-issue-browser-test.js |
| wm/outsourceissue/index.vue | 通过(浏览器) | mes-erp-rest-mes-wm-browser-test.js |
| wm/outsourcereceipt/OutsourceReceiptDetailForm.vue | 通过(浏览器) | mes-wm-more5-outsource-receipt-browser-test.js |
| wm/outsourcereceipt/OutsourceReceiptDetailList.vue | 通过(浏览器) | mes-wm-more5-outsource-receipt-browser-test.js |
| wm/outsourcereceipt/OutsourceReceiptForm.vue | 通过(浏览器) | mes-wm-more5-outsource-receipt-browser-test.js |
| wm/outsourcereceipt/OutsourceReceiptLineList.vue | 通过(浏览器) | mes-wm-more5-outsource-receipt-browser-test.js |
| wm/outsourcereceipt/index.vue | 通过(浏览器) | mes-erp-rest-mes-wm-browser-test.js |
| wm/packages/PackageForm.vue | 通过(浏览器) | hrm-mes-more-wm-forms-browser-test.js |
| wm/packages/PackageLineList.vue | 通过(浏览器) | mes-wm-final-packages-rest-browser-test.js |
| wm/packages/SubPackageList.vue | 通过(浏览器) | mes-wm-final-packages-rest-browser-test.js |
| wm/packages/components/WmPackageSelect.vue | 通过(浏览器) | mes-wm-final-packages-rest-browser-test.js |
| wm/packages/components/WmPackageSelectDialog.vue | 通过(浏览器) | mes-wm-final-packages-rest-browser-test.js |
| wm/packages/index.vue | 通过(浏览器) | mes-wm-more3-master-browser-test.js |
| wm/productissue/ProductIssueDetailForm.vue | 通过(浏览器) | mes-batch-wm-issue-receipt-detail-pairs-browser-test.js |
| wm/productissue/ProductIssueDetailList.vue | 通过(浏览器) | mes-batch-wm-issue-receipt-detail-pairs-browser-test.js |
| wm/productissue/ProductIssueForm.vue | 通过(浏览器) | mes-wm-more3-issue-sales-browser-test.js |
| wm/productissue/ProductIssueLineList.vue | 通过(浏览器) | mes-batch-wm-issue-receipt-detail-pairs-browser-test.js |
| wm/productissue/index.vue | 通过(浏览器) | mes-wm-more3-issue-sales-browser-test.js |
| wm/productreceipt/ProductReceiptDetailForm.vue | 通过(浏览器) | mes-batch-wm-issue-receipt-detail-pairs-browser-test.js |
| wm/productreceipt/ProductReceiptDetailList.vue | 通过(浏览器) | mes-batch-wm-issue-receipt-detail-pairs-browser-test.js |
| wm/productreceipt/ProductReceiptForm.vue | 通过(浏览器) | mes-hrm-rest-mes-wm-browser-test.js |
| wm/productreceipt/ProductReceiptLineList.vue | 通过(浏览器) | mes-batch-wm-issue-receipt-detail-pairs-browser-test.js |
| wm/productreceipt/index.vue | 通过(浏览器) | mes-hrm-rest-mes-wm-browser-test.js |
| wm/productsales/ProductSalesDetailForm.vue | 通过(浏览器) | mes-product-sales-batch-browser-test.js |
| wm/productsales/ProductSalesDetailList.vue | 通过(浏览器) | mes-batch-wm-issue-receipt-detail-pairs-browser-test.js |
| wm/productsales/ProductSalesForm.vue | 通过(浏览器) | mes-wm-more4-sales-stock-browser-test.js |
| wm/productsales/ProductSalesLineList.vue | 通过(浏览器) | mes-wm-more4-sales-stock-browser-test.js |
| wm/productsales/index.vue | 通过(浏览器) | mes-wm-more4-sales-stock-browser-test.js |
| wm/returnissue/ReturnIssueDetailForm.vue | 通过(浏览器) | mes-batch-wm-return-flows-browser-test.js |
| wm/returnissue/ReturnIssueDetailList.vue | 通过(浏览器) | mes-batch-wm-return-flows-browser-test.js |
| wm/returnissue/ReturnIssueForm.vue | 通过(浏览器) | mes-wm-more3-return-flows-browser-test.js |
| wm/returnissue/ReturnIssueLineList.vue | 通过(浏览器) | mes-batch-wm-return-flows-browser-test.js |
| wm/returnissue/index.vue | 通过(浏览器) | mes-wm-more3-return-flows-browser-test.js |
| wm/returnsales/ReturnSalesDetailForm.vue | 通过(浏览器) | mes-batch-wm-return-flows-browser-test.js |
| wm/returnsales/ReturnSalesDetailList.vue | 通过(浏览器) | mes-batch-wm-return-flows-browser-test.js |
| wm/returnsales/ReturnSalesForm.vue | 通过(浏览器) | mes-wm-more3-return-flows-browser-test.js |
| wm/returnsales/ReturnSalesLineList.vue | 通过(浏览器) | mes-batch-wm-return-flows-browser-test.js |
| wm/returnsales/index.vue | 通过(浏览器) | mes-wm-more3-return-flows-browser-test.js |
| wm/returnvendor/ReturnVendorDetailForm.vue | 通过(浏览器) | mes-batch-wm-return-flows-browser-test.js |
| wm/returnvendor/ReturnVendorDetailList.vue | 通过(浏览器) | mes-batch-wm-return-flows-browser-test.js |
| wm/returnvendor/ReturnVendorForm.vue | 通过(浏览器) | mes-hrm-rest-mes-wm-browser-test.js |
| wm/returnvendor/ReturnVendorLineList.vue | 通过(浏览器) | mes-batch-wm-return-flows-browser-test.js |
| wm/returnvendor/index.vue | 通过(浏览器) | mes-hrm-rest-mes-wm-browser-test.js |
| wm/salesnotice/SalesNoticeForm.vue | 通过(浏览器) | mes-wm-more3-issue-sales-browser-test.js |
| wm/salesnotice/SalesNoticeLineList.vue | 通过(浏览器) | mes-wm-final-salesnotice-rest-browser-test.js |
| wm/salesnotice/components/WmSalesNoticeLineSelect.vue | 通过(浏览器) | mes-wm-final-salesnotice-rest-browser-test.js |
| wm/salesnotice/components/WmSalesNoticeLineSelectDialog.vue | 通过(浏览器) | mes-wm-final-salesnotice-rest-browser-test.js |
| wm/salesnotice/components/WmSalesNoticeSelect.vue | 通过(浏览器) | mes-wm-final-salesnotice-rest-browser-test.js |
| wm/salesnotice/components/WmSalesNoticeSelectDialog.vue | 通过(浏览器) | mes-wm-final-salesnotice-rest-browser-test.js |
| wm/salesnotice/index.vue | 通过(浏览器) | mes-wm-more3-issue-sales-browser-test.js |
| wm/sn/WmSnDetailDialog.vue | 通过(浏览器) | mes-wm-more3-master-browser-test.js |
| wm/sn/WmSnGenerateForm.vue | 通过(浏览器) | mes-wm-more3-master-browser-test.js |
| wm/sn/index.vue | 通过(浏览器) | mes-wm-more3-master-browser-test.js |
| wm/stocktaking/plan/StockTakingPlanForm.vue | 通过(浏览器) | mes-wm-more4-sales-stock-browser-test.js |
| wm/stocktaking/plan/StockTakingPlanParamList.vue | 通过(浏览器) | mes-wm-more4-sales-stock-browser-test.js |
| wm/stocktaking/plan/components/StockTakingPlanSelect.vue | 通过(浏览器) | mes-wm-final-stocktaking-rest-browser-test.js |
| wm/stocktaking/plan/components/StockTakingPlanSelectDialog.vue | 通过(浏览器) | mes-wm-final-stocktaking-rest-browser-test.js |
| wm/stocktaking/plan/index.vue | 通过(浏览器) | mes-erp-rest-mes-wm-browser-test.js |
| wm/stocktaking/task/StockTakingForm.vue | 通过(浏览器) | hrm-mes-more-wm-forms-browser-test.js |
| wm/stocktaking/task/StockTakingTaskLineList.vue | 通过(浏览器) | mes-wm-final-stocktaking-rest-browser-test.js |
| wm/stocktaking/task/StockTakingTaskResultList.vue | 通过(浏览器) | mes-wm-final-stocktaking-rest-browser-test.js |
| wm/stocktaking/task/index.vue | 通过(浏览器) | mes-erp-rest-mes-wm-browser-test.js |
| wm/transfer/TransferDetailForm.vue | 通过(浏览器) | mes-wm-more4-detail-pairs-browser-test.js |
| wm/transfer/TransferDetailList.vue | 通过(浏览器) | mes-wm-more4-detail-pairs-browser-test.js |
| wm/transfer/TransferForm.vue | 通过(浏览器) | mes-hrm-rest-mes-wm-browser-test.js |
| wm/transfer/TransferLineList.vue | 通过(浏览器) | mes-wm-more5-transfer-itemreceipt-browser-test.js |
| wm/transfer/index.vue | 通过(浏览器) | mes-hrm-rest-mes-wm-browser-test.js |
| wm/warehouse/WarehouseForm.vue | 通过(浏览器) | mes-hrm-rest-mes-wm-browser-test.js |
| wm/warehouse/area/AreaForm.vue | 通过(浏览器) | mes-wm-more3-master-browser-test.js |
| wm/warehouse/area/index.vue | 通过(浏览器) | mes-wm-more3-master-browser-test.js |
| wm/warehouse/components/WmWarehouseAreaSelect.vue | 通过(浏览器) | mes-wm-more5-warehouse-selects-browser-test.js |
| wm/warehouse/components/WmWarehouseLocationSelect.vue | 通过(浏览器) | mes-wm-more5-warehouse-selects-browser-test.js |
| wm/warehouse/components/WmWarehouseSelect.vue | 通过(浏览器) | mes-wm-more5-warehouse-selects-browser-test.js |
| wm/warehouse/index.vue | 通过(浏览器) | mes-hrm-rest-mes-wm-browser-test.js |
| wm/warehouse/location/LocationForm.vue | 通过(浏览器) | hrm-mes-more-wm-forms-browser-test.js |
| wm/warehouse/location/index.vue | 通过(浏览器) | mes-wm-more3-master-browser-test.js |

### mp（46 个功能页：通过(浏览器) 46 / 部分(浏览器) 0 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：消息账号/标签同步通过；素材/真实外部平台闭环待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| account/AccountForm.vue | 通过(浏览器) | mp-pms-tail-mp-account-freepublish-statistics-browser-test.js |
| account/index.vue | 通过(浏览器) | mp-pms-tail-mp-account-freepublish-statistics-browser-test.js |
| autoReply/components/ReplyForm.vue | 通过(浏览器) | mp-pms-tail-mp-autoreply-browser-test.js |
| autoReply/components/ReplyTable.vue | 通过(浏览器) | mp-pms-tail-mp-autoreply-browser-test.js |
| autoReply/index.vue | 通过(浏览器) | mp-pms-tail-mp-autoreply-browser-test.js |
| components/wx-account-select/main.vue | 通过(浏览器) | mp-batch-message-tag-user-forms-browser-test.js |
| components/wx-location/main.vue | 通过(浏览器) | mp-batch-message-tag-user-forms-browser-test.js |
| components/wx-material-select/main.vue | 通过(浏览器) | mp-batch-material-draft-forms-browser-test.js |
| components/wx-msg/components/Msg.vue | 通过(浏览器) | mp-batch-wx-reply-msg-menu-browser-test.js |
| components/wx-msg/components/MsgEvent.vue | 通过(浏览器) | mp-batch-wx-reply-msg-menu-browser-test.js |
| components/wx-msg/components/MsgList.vue | 通过(浏览器) | mp-batch-wx-reply-msg-menu-browser-test.js |
| components/wx-msg/main.vue | 通过(浏览器) | mp-batch-wx-reply-msg-menu-browser-test.js |
| components/wx-music/main.vue | 通过(浏览器) | mp-batch-message-tag-user-forms-browser-test.js |
| components/wx-news/main.vue | 通过(浏览器) | mp-batch-material-draft-forms-browser-test.js |
| components/wx-reply/components/TabImage.vue | 通过(浏览器) | mp-batch-wx-reply-msg-menu-browser-test.js |
| components/wx-reply/components/TabMusic.vue | 通过(浏览器) | mp-batch-wx-reply-msg-menu-browser-test.js |
| components/wx-reply/components/TabNews.vue | 通过(浏览器) | mp-batch-wx-reply-msg-menu-browser-test.js |
| components/wx-reply/components/TabText.vue | 通过(浏览器) | mp-batch-wx-reply-msg-menu-browser-test.js |
| components/wx-reply/components/TabVideo.vue | 通过(浏览器) | mp-batch-wx-reply-msg-menu-browser-test.js |
| components/wx-reply/components/TabVoice.vue | 通过(浏览器) | mp-batch-wx-reply-msg-menu-browser-test.js |
| components/wx-reply/main.vue | 通过(浏览器) | mp-batch-wx-reply-msg-menu-browser-test.js |
| components/wx-video-play/main.vue | 通过(浏览器) | mp-batch-material-draft-forms-browser-test.js |
| components/wx-voice-play/main.vue | 通过(浏览器) | mp-batch-material-draft-forms-browser-test.js |
| draft/components/CoverSelect.vue | 通过(浏览器) | mp-batch-material-draft-forms-browser-test.js |
| draft/components/DraftTable.vue | 通过(浏览器) | mp-batch-material-draft-forms-browser-test.js |
| draft/components/NewsForm.vue | 通过(浏览器) | mp-batch-material-draft-forms-browser-test.js |
| draft/index.vue | 通过(浏览器) | mp-pms-rest-mp-draft-menu-browser-test.js |
| freePublish/index.vue | 通过(浏览器) | mp-pms-tail-mp-account-freepublish-statistics-browser-test.js |
| material/components/ImageTable.vue | 通过(浏览器) | mp-batch-material-draft-forms-browser-test.js |
| material/components/UploadFile.vue | 通过(浏览器) | mp-batch-material-draft-forms-browser-test.js |
| material/components/UploadVideo.vue | 通过(浏览器) | mp-batch-material-draft-forms-browser-test.js |
| material/components/VideoTable.vue | 通过(浏览器) | mp-batch-material-draft-forms-browser-test.js |
| material/components/VoiceTable.vue | 通过(浏览器) | mp-batch-material-draft-forms-browser-test.js |
| material/index.vue | 通过(浏览器) | mp-material-tabs-browser-test.js |
| menu/components/MenuEditor.vue | 通过(浏览器) | mp-batch-wx-reply-msg-menu-browser-test.js |
| menu/components/MenuPreviewer.vue | 通过(浏览器) | mp-batch-wx-reply-msg-menu-browser-test.js |
| menu/index.vue | 通过(浏览器) | mp-pms-rest-mp-draft-menu-browser-test.js |
| message/MessageTable.vue | 通过(浏览器) | mp-batch-message-tag-user-forms-browser-test.js |
| message/index.vue | 通过(浏览器) | mp-active-pages-browser-test.js |
| messageTemplate/MessageTemplateSendForm.vue | 通过(浏览器) | mp-batch-message-tag-user-forms-browser-test.js |
| messageTemplate/index.vue | 通过(浏览器) | mp-pms-rest-mp-pages-browser-test.js |
| statistics/index.vue | 通过(浏览器) | mp-pms-tail-mp-account-freepublish-statistics-browser-test.js |
| tag/TagForm.vue | 通过(浏览器) | mp-batch-message-tag-user-forms-browser-test.js |
| tag/index.vue | 通过(浏览器) | mp-active-pages-browser-test.js |
| user/UserForm.vue | 通过(浏览器) | mp-batch-message-tag-user-forms-browser-test.js |
| user/index.vue | 通过(浏览器) | mp-pms-rest-mp-pages-browser-test.js |

### oa（159 个功能页：通过(浏览器) 159 / 部分(浏览器) 0 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：考勤三路由/周月报通过；真实考勤写入待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| announcement/list/OaAnnouncementForm.vue | 通过(浏览器) | oa-mig-announcement-browser-test.js |
| announcement/list/components/OaAnnouncementDetail.vue | 通过(浏览器) | oa-mig-announcement-browser-test.js |
| announcement/list/index.vue | 通过(浏览器) | oa-mig-announcement-browser-test.js |
| announcement/my/index.vue | 通过(浏览器) | oa-mig-announcement-browser-test.js |
| attendance/list/OaAttendanceForm.vue | 通过(浏览器) | oa-attendance-form-write-browser-test.js |
| attendance/list/index.vue | 通过(浏览器) | oa-attendance-form-write-browser-test.js |
| attendance/my/index.vue | 通过(浏览器) | tail2-oa-attendance-my-clock-browser-test.js |
| attendance/report/OaAttendanceMonthReport.vue | 通过(浏览器) | tail2-oa-attendance-report-browser-test.js |
| attendance/report/OaAttendanceWeekReport.vue | 通过(浏览器) | tail2-oa-attendance-report-browser-test.js |
| attendance/report/index.vue | 通过(浏览器) | tail2-oa-attendance-report-browser-test.js |
| contact/OaContactForm.vue | 通过(浏览器) | oa-mig-contact-browser-test.js |
| contact/OaContactShareDetail.vue | 通过(浏览器) | oa-mig-contact-browser-test.js |
| contact/components/OaContactCategoryForm.vue | 通过(浏览器) | oa-mig-contact-browser-test.js |
| contact/components/OaContactCategoryList.vue | 通过(浏览器) | oa-mig-contact-browser-test.js |
| contact/components/OaContactCategorySelect.vue | 通过(浏览器) | oa-mig-contact-browser-test.js |
| contact/components/OaContactDetail.vue | 通过(浏览器) | oa-mig-contact-browser-test.js |
| contact/index.vue | 通过(浏览器) | oa-mig-contact-browser-test.js |
| discussion/detail/OaDiscussionReply.vue | 通过(浏览器) | oa-mig-discussion-browser-test.js |
| discussion/detail/OaDiscussionVote.vue | 通过(浏览器) | oa-mig-discussion-browser-test.js |
| discussion/detail/index.vue | 通过(浏览器) | oa-mig-discussion-browser-test.js |
| discussion/list/index.vue | 通过(浏览器) | oa-mig-discussion-browser-test.js |
| discussion/manage/OaDiscussionForm.vue | 通过(浏览器) | oa-mig-discussion-browser-test.js |
| discussion/manage/index.vue | 通过(浏览器) | oa-mig-discussion-browser-test.js |
| file/OaFileNodeForm.vue | 通过(浏览器) | oa-mig-file-browser-test.js |
| file/OaFilePermissionForm.vue | 通过(浏览器) | oa-mig-file-browser-test.js |
| file/OaFilePermissionList.vue | 通过(浏览器) | oa-mig-file-browser-test.js |
| file/OaFilePreview.vue | 通过(浏览器) | oa-mig-file-browser-test.js |
| file/OaFileStorage.vue | 通过(浏览器) | oa-mig-file-browser-test.js |
| file/OaFileUpload.vue | 通过(浏览器) | oa-mig-file-browser-test.js |
| file/index.vue | 通过(浏览器) | oa-mig-file-browser-test.js |
| home/components/OaHomeAnnouncement.vue | 通过(浏览器) | oa-mig-home-browser-test.js |
| home/components/OaHomeAttendance.vue | 通过(浏览器) | oa-mig-home-browser-test.js |
| home/components/OaHomeCalendar.vue | 通过(浏览器) | oa-mig-home-browser-test.js |
| home/components/OaHomeContactCount.vue | 通过(浏览器) | oa-mig-home-browser-test.js |
| home/components/OaHomeDiscussionCount.vue | 通过(浏览器) | oa-mig-home-browser-test.js |
| home/components/OaHomeNote.vue | 通过(浏览器) | oa-mig-home-browser-test.js |
| home/components/OaHomePanel.vue | 通过(浏览器) | oa-mig-home-browser-test.js |
| home/components/OaHomePlan.vue | 通过(浏览器) | oa-mig-home-browser-test.js |
| home/components/OaHomeTaskCount.vue | 通过(浏览器) | oa-mig-home-browser-test.js |
| home/components/OaHomeTaskStatistics.vue | 通过(浏览器) | oa-mig-home-browser-test.js |
| home/index.vue | 通过(浏览器) | oa-mig-home-browser-test.js |
| leave/OaLeaveApplyDetail.vue | 通过(浏览器) | last-oa-leave-browser-test.js |
| leave/OaLeaveApplyForm.vue | 通过(浏览器) | last-oa-leave-browser-test.js |
| leave/detail/index.vue | 通过(浏览器) | last-oa-leave-browser-test.js |
| leave/index.vue | 通过(浏览器) | last-oa-leave-browser-test.js |
| mail/account/MailAccountForm.vue | 通过(浏览器) | oa-mig-mail-browser-test.js |
| mail/account/components/MailAccountSelect.vue | 通过(浏览器) | oa-mig-mail-browser-test.js |
| mail/account/components/MailAddressSelect.vue | 通过(浏览器) | oa-mig-mail-browser-test.js |
| mail/account/index.vue | 通过(浏览器) | oa-mig-mail-browser-test.js |
| mail/inbox/MailMessageDetail.vue | 通过(浏览器) | oa-mig-mail-browser-test.js |
| mail/inbox/MailMessageForm.vue | 通过(浏览器) | oa-mig-mail-browser-test.js |
| mail/inbox/MailMessageList.vue | 通过(浏览器) | oa-mig-mail-browser-test.js |
| mail/inbox/components/MailFolderList.vue | 通过(浏览器) | oa-mig-mail-browser-test.js |
| mail/inbox/index.vue | 通过(浏览器) | oa-mig-mail-browser-test.js |
| mail/provider/MailProviderForm.vue | 通过(浏览器) | oa-mig-mail-browser-test.js |
| mail/provider/components/MailProviderSelect.vue | 通过(浏览器) | oa-mig-mail-browser-test.js |
| mail/provider/index.vue | 通过(浏览器) | oa-mig-mail-browser-test.js |
| meetingroom/booking/OaMeetingRoomBookingDetail.vue | 通过(浏览器) | oa-mig-meetingroom-browser-test.js |
| meetingroom/booking/OaMeetingRoomBookingForm.vue | 通过(浏览器) | oa-mig-meetingroom-browser-test.js |
| meetingroom/booking/detail/index.vue | 通过(浏览器) | oa-mig-meetingroom-browser-test.js |
| meetingroom/booking/index.vue | 通过(浏览器) | oa-mig-meetingroom-browser-test.js |
| meetingroom/room/OaMeetingRoomForm.vue | 通过(浏览器) | oa-mig-meetingroom-browser-test.js |
| meetingroom/room/components/OaMeetingRoomScheduleDialog.vue | 通过(浏览器) | oa-mig-meetingroom-browser-test.js |
| meetingroom/room/components/OaMeetingRoomSelectDialog.vue | 通过(浏览器) | oa-mig-meetingroom-browser-test.js |
| meetingroom/room/index.vue | 通过(浏览器) | oa-mig-meetingroom-browser-test.js |
| note/OaNoteForm.vue | 通过(浏览器) | oa-mig-note-browser-test.js |
| note/components/OaNoteCategoryForm.vue | 通过(浏览器) | oa-mig-note-browser-test.js |
| note/components/OaNoteCategoryList.vue | 通过(浏览器) | oa-mig-note-browser-test.js |
| note/components/OaNoteCategorySelect.vue | 通过(浏览器) | oa-mig-note-browser-test.js |
| note/components/OaNoteDetail.vue | 通过(浏览器) | oa-mig-note-browser-test.js |
| note/components/OaNoteShareForm.vue | 通过(浏览器) | oa-mig-note-browser-test.js |
| note/components/OaNoteSidebar.vue | 通过(浏览器) | oa-mig-note-browser-test.js |
| note/index.vue | 通过(浏览器) | oa-mig-note-browser-test.js |
| officialdoc/components/OaOfficialDocPreview.vue | 通过(浏览器) | oa-mig-officialdoc-browser-test.js |
| officialdoc/receive/OaOfficialDocReceiveDetail.vue | 通过(浏览器) | oa-mig-officialdoc-browser-test.js |
| officialdoc/receive/OaOfficialDocReceiveForm.vue | 通过(浏览器) | oa-mig-officialdoc-browser-test.js |
| officialdoc/receive/detail/index.vue | 通过(浏览器) | oa-mig-officialdoc-browser-test.js |
| officialdoc/receive/index.vue | 通过(浏览器) | oa-mig-officialdoc-browser-test.js |
| officialdoc/send/OaOfficialDocSendDetail.vue | 通过(浏览器) | oa-mig-officialdoc-browser-test.js |
| officialdoc/send/OaOfficialDocSendForm.vue | 通过(浏览器) | oa-mig-officialdoc-browser-test.js |
| officialdoc/send/detail/index.vue | 通过(浏览器) | oa-mig-officialdoc-browser-test.js |
| officialdoc/send/index.vue | 通过(浏览器) | oa-mig-officialdoc-browser-test.js |
| officialdoc/template/OaOfficialDocTemplateForm.vue | 通过(浏览器) | oa-mig-officialdoc-browser-test.js |
| officialdoc/template/components/OaOfficialDocTemplateSelect.vue | 通过(浏览器) | oa-mig-officialdoc-browser-test.js |
| officialdoc/template/index.vue | 通过(浏览器) | oa-mig-officialdoc-browser-test.js |
| overtime/OaOvertimeApplyDetail.vue | 通过(浏览器) | oa-mig-apply-browser-test.js |
| overtime/OaOvertimeApplyForm.vue | 通过(浏览器) | oa-mig-apply-browser-test.js |
| overtime/detail/index.vue | 通过(浏览器) | oa-mig-apply-browser-test.js |
| overtime/index.vue | 通过(浏览器) | oa-mig-apply-browser-test.js |
| plan/list/OaPlanForm.vue | 通过(浏览器) | oa-mig-plan-schedule-browser-test.js |
| plan/list/index.vue | 通过(浏览器) | oa-mig-plan-schedule-browser-test.js |
| plan/report/index.vue | 通过(浏览器) | oa-mig-plan-schedule-browser-test.js |
| regular/OaRegularApplyDetail.vue | 通过(浏览器) | oa-mig-apply-browser-test.js |
| regular/OaRegularApplyForm.vue | 通过(浏览器) | oa-mig-apply-browser-test.js |
| regular/detail/index.vue | 通过(浏览器) | oa-mig-apply-browser-test.js |
| regular/index.vue | 通过(浏览器) | oa-mig-apply-browser-test.js |
| reimbursement/OaReimbursementDetail.vue | 通过(浏览器) | oa-mig-reimbursement-browser-test.js |
| reimbursement/OaReimbursementForm.vue | 通过(浏览器) | oa-mig-reimbursement-browser-test.js |
| reimbursement/detail/index.vue | 通过(浏览器) | oa-mig-reimbursement-browser-test.js |
| reimbursement/index.vue | 通过(浏览器) | oa-mig-reimbursement-browser-test.js |
| resign/OaResignApplyDetail.vue | 通过(浏览器) | oa-mig-apply-browser-test.js |
| resign/OaResignApplyForm.vue | 通过(浏览器) | oa-mig-apply-browser-test.js |
| resign/detail/index.vue | 通过(浏览器) | oa-mig-apply-browser-test.js |
| resign/index.vue | 通过(浏览器) | oa-mig-apply-browser-test.js |
| schedule/calendar/index.vue | 通过(浏览器) | oa-mig-plan-schedule-browser-test.js |
| schedule/list/components/OaScheduleDetail.vue | 通过(浏览器) | oa-mig-plan-schedule-browser-test.js |
| schedule/list/components/OaScheduleForm.vue | 通过(浏览器) | oa-mig-plan-schedule-browser-test.js |
| schedule/list/index.vue | 通过(浏览器) | oa-mig-plan-schedule-browser-test.js |
| seal/OaSealDetail.vue | 通过(浏览器) | oa-mig-seal-browser-test.js |
| seal/OaSealForm.vue | 通过(浏览器) | oa-mig-seal-browser-test.js |
| seal/apply/OaSealApplyDetail.vue | 通过(浏览器) | oa-mig-seal-browser-test.js |
| seal/apply/OaSealApplyForm.vue | 通过(浏览器) | oa-mig-seal-browser-test.js |
| seal/apply/detail/index.vue | 通过(浏览器) | oa-mig-seal-browser-test.js |
| seal/apply/index.vue | 通过(浏览器) | oa-mig-seal-browser-test.js |
| seal/components/OaSealSelect.vue | 通过(浏览器) | oa-mig-seal-browser-test.js |
| seal/index.vue | 通过(浏览器) | oa-mig-seal-browser-test.js |
| supply/apply/OaSupplyApplyDetail.vue | 通过(浏览器) | oa-mig-supply-browser-test.js |
| supply/apply/OaSupplyApplyForm.vue | 通过(浏览器) | oa-mig-supply-browser-test.js |
| supply/apply/detail/index.vue | 通过(浏览器) | oa-mig-supply-browser-test.js |
| supply/apply/index.vue | 通过(浏览器) | oa-mig-supply-browser-test.js |
| supply/issue/OaSupplyIssueForm.vue | 通过(浏览器) | oa-mig-supply-browser-test.js |
| supply/issue/OaSupplyReturnForm.vue | 通过(浏览器) | oa-mig-supply-browser-test.js |
| supply/issue/index.vue | 通过(浏览器) | oa-mig-supply-browser-test.js |
| supply/item/OaSupplyItemForm.vue | 通过(浏览器) | oa-mig-supply-browser-test.js |
| supply/item/OaSupplyStockForm.vue | 通过(浏览器) | oa-mig-supply-browser-test.js |
| supply/item/components/OaSupplyItemSelect.vue | 通过(浏览器) | oa-mig-supply-browser-test.js |
| supply/item/index.vue | 通过(浏览器) | oa-mig-supply-browser-test.js |
| task/list/OaTaskForm.vue | 通过(浏览器) | oa-mig-task-workreport-browser-test.js |
| task/list/components/OaTaskDetail.vue | 通过(浏览器) | oa-mig-task-workreport-browser-test.js |
| task/list/components/OaTaskFeedbackForm.vue | 通过(浏览器) | oa-mig-task-workreport-browser-test.js |
| task/list/index.vue | 通过(浏览器) | oa-mig-task-workreport-browser-test.js |
| task/my/index.vue | 通过(浏览器) | oa-mig-task-workreport-browser-test.js |
| travel/apply/OaTravelApplyDetail.vue | 通过(浏览器) | oa-mig-travel-browser-test.js |
| travel/apply/OaTravelApplyForm.vue | 通过(浏览器) | oa-mig-travel-browser-test.js |
| travel/apply/components/OaTravelApplySelect.vue | 通过(浏览器) | oa-mig-travel-browser-test.js |
| travel/apply/detail/index.vue | 通过(浏览器) | oa-mig-travel-browser-test.js |
| travel/apply/index.vue | 通过(浏览器) | oa-mig-travel-browser-test.js |
| travel/reimbursement/OaTravelReimbursementDetail.vue | 通过(浏览器) | oa-mig-travel-browser-test.js |
| travel/reimbursement/OaTravelReimbursementForm.vue | 通过(浏览器) | oa-mig-travel-browser-test.js |
| travel/reimbursement/detail/index.vue | 通过(浏览器) | oa-mig-travel-browser-test.js |
| travel/reimbursement/index.vue | 通过(浏览器) | oa-mig-travel-browser-test.js |
| vehicle/OaVehicleForm.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| vehicle/apply/OaVehicleApplyDetail.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| vehicle/apply/OaVehicleApplyForm.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| vehicle/apply/components/OaVehicleApplySelect.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| vehicle/apply/components/OaVehicleApplySelectDialog.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| vehicle/apply/detail/index.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| vehicle/apply/index.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| vehicle/components/OaVehicleSelect.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| vehicle/components/OaVehicleSelectDialog.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| vehicle/index.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| vehicle/return/OaVehicleReturnDetail.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| vehicle/return/OaVehicleReturnForm.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| vehicle/return/detail/index.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| vehicle/return/index.vue | 通过(浏览器) | oa-mig-vehicle-browser-test.js |
| workreport/OaWorkReportForm.vue | 通过(浏览器) | oa-mig-task-workreport-browser-test.js |
| workreport/index.vue | 通过(浏览器) | oa-mig-task-workreport-browser-test.js |
| workreport/statistics/OaWorkReportStatisticsDetail.vue | 通过(浏览器) | oa-mig-task-workreport-browser-test.js |
| workreport/statistics/index.vue | 通过(浏览器) | oa-mig-task-workreport-browser-test.js |

### pay（23 个功能页：通过(浏览器) 19 / 部分(浏览器) 4 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：套餐/收银台query.id通过；转账搜索字段冲突未盲改；真实支付退款待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| app/components/AppForm.vue | 通过(浏览器) | tail2-pay-tail-browser-test.js |
| app/components/channel/AlipayChannelForm.vue | 通过(浏览器) | tail2-pay-tail-browser-test.js |
| app/components/channel/MockChannelForm.vue | 通过(浏览器) | tail2-pay-tail-browser-test.js |
| app/components/channel/WalletChannelForm.vue | 通过(浏览器) | tail2-pay-tail-browser-test.js |
| app/components/channel/WeixinChannelForm.vue | 通过(浏览器) | tail2-pay-tail-browser-test.js |
| app/index.vue | 通过(浏览器) | system-pay-browser-test.js（真实路由：应用名筛选/重置、新增弹窗字段、首行 13+ 渠道入口、mock 渠道弹窗打开） |
| cashier/index.vue | 通过(浏览器) | pay-form-cashier-browser-test.js（订单加载、无效 ID 分支、模拟支付提交与关页）+ system-pay-browser-test.js（真实路由：渠道分组、条码/二维码展示模式，精确 GET 替身） |
| demo/order/index.vue | 通过(浏览器) | tail2-pay-tail-browser-test.js |
| demo/withdraw/DemoWithdrawForm.vue | 通过(浏览器) | tail2-pay-tail-browser-test.js |
| demo/withdraw/index.vue | 通过(浏览器) | tail2-pay-tail-browser-test.js |
| notify/NotifyDetail.vue | 部分(浏览器) | system-pay-browser-test.js（通知详情弹窗字段核对，条件性执行） |
| notify/index.vue | 通过(浏览器) | system-pay-browser-test.js（真实路由：关联编号筛选参数断言、重置） |
| order/OrderDetail.vue | 部分(浏览器) | system-pay-browser-test.js（详情弹窗字段核对，依赖真实数据行存在时可选执行） |
| order/index.vue | 通过(浏览器) | system-pay-browser-test.js（真实路由：商户单号筛选参数断言、重置） |
| refund/RefundDetail.vue | 部分(浏览器) | system-pay-browser-test.js（退款详情弹窗字段核对，条件性执行） |
| refund/index.vue | 通过(浏览器) | system-pay-browser-test.js（真实路由：商户退款单号筛选参数断言、重置） |
| transfer/TransferDetail.vue | 部分(浏览器) | system-pay-browser-test.js（转账单详情弹窗字段核对，条件性执行） |
| transfer/index.vue | 通过(浏览器) | system-pay-browser-test.js（真实路由：转账单号筛选参数断言、重置） |
| wallet/balance/WalletForm.vue | 通过(浏览器) | tail2-pay-tail-browser-test.js |
| wallet/balance/index.vue | 通过(浏览器) | system-pay-browser-test.js（真实路由：用户编号筛选参数断言、钱包明细弹窗打开） |
| wallet/rechargePackage/WalletRechargePackageForm.vue | 通过(浏览器) | pay-form-cashier-browser-test.js（真实 SFC：新增/编辑、状态必选校验、金额分转、create/update 载荷、重开清空） |
| wallet/rechargePackage/index.vue | 通过(浏览器) | tail2-pay-tail-browser-test.js |
| wallet/transaction/WalletTransactionList.vue | 通过(浏览器) | tail2-pay-tail-browser-test.js |

### pms（77 个功能页：通过(浏览器) 77 / 部分(浏览器) 0 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：项目/迭代/任务/工时真实闭环通过；知识库/附件/异常分支待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| kb/document/KnowledgeContentMoveDialog.vue | 通过(浏览器) | tail-pms-browser-test.js |
| kb/document/KnowledgeContentPermissionForm.vue | 通过(浏览器) | tail-pms-browser-test.js |
| kb/document/KnowledgeDocumentComment.vue | 通过(浏览器) | pms-batch-kb-rest-browser-test.js |
| kb/document/KnowledgeDocumentCreateForm.vue | 通过(浏览器) | pms-kb-template-browser-test.js |
| kb/document/KnowledgeDocumentDetail.vue | 通过(浏览器) | pms-kb-template-browser-test.js |
| kb/document/KnowledgeDocumentShareDialog.vue | 通过(浏览器) | tail-pms-browser-test.js |
| kb/document/KnowledgeDocumentUpdateForm.vue | 通过(浏览器) | pms-attachment-browser-test.js + pms-kb-template-browser-test.js |
| kb/document/KnowledgeFileUploadForm.vue | 通过(浏览器) | pms-attachment-browser-test.js + pms-kb-template-browser-test.js |
| kb/document/KnowledgeFolderDetail.vue | 通过(浏览器) | pms-kb-template-browser-test.js |
| kb/document/KnowledgeFolderForm.vue | 通过(浏览器) | pms-kb-template-browser-test.js |
| kb/document/KnowledgeLibraryHome.vue | 通过(浏览器) | pms-kb-template-browser-test.js |
| kb/document/KnowledgeLibrarySidebar.vue | 通过(浏览器) | tail-pms-browser-test.js |
| kb/document/KnowledgeRecycleDetail.vue | 通过(浏览器) | tail-pms-browser-test.js |
| kb/document/KnowledgeRecyclePanel.vue | 通过(浏览器) | tail-pms-browser-test.js |
| kb/document/components/KnowledgeDocumentLabelSelect.vue | 通过(浏览器) | tail-pms-browser-test.js |
| kb/document/index.vue | 通过(浏览器) | tail-pms-browser-test.js |
| kb/document/share/index.vue | 通过(浏览器) | tail-pms-browser-test.js |
| kb/favorite/index.vue | 通过(浏览器) | mp-pms-rest-pms-kb-browser-test.js |
| kb/label/KnowledgeLabelForm.vue | 通过(浏览器) | pms-batch-kb-rest-browser-test.js |
| kb/label/KnowledgeLabelManageDialog.vue | 通过(浏览器) | pms-batch-kb-rest-browser-test.js |
| kb/label/index.vue | 通过(浏览器) | mp-pms-rest-pms-kb-browser-test.js |
| kb/library-template/KnowledgeLibraryTemplateForm.vue | 通过(浏览器) | pms-kb-template-browser-test.js |
| kb/library-template/index.vue | 通过(浏览器) | pms-kb-template-browser-test.js |
| kb/library/KnowledgeGroupForm.vue | 通过(浏览器) | pms-batch-kb-rest-browser-test.js |
| kb/library/KnowledgeGroupManageDialog.vue | 通过(浏览器) | pms-batch-kb-rest-browser-test.js |
| kb/library/KnowledgeLibraryForm.vue | 通过(浏览器) | pms-kb-template-browser-test.js |
| kb/library/KnowledgeMemberForm.vue | 通过(浏览器) | pms-batch-kb-rest-browser-test.js |
| kb/library/components/KnowledgeLibrarySelect.vue | 通过(浏览器) | pms-batch-kb-rest-browser-test.js |
| kb/library/index.vue | 通过(浏览器) | pms-kb-template-browser-test.js |
| kb/recent/index.vue | 通过(浏览器) | mp-pms-rest-pms-kb-browser-test.js |
| kb/recycle/index.vue | 通过(浏览器) | mp-pms-rest-pms-kb-browser-test.js |
| kb/search/index.vue | 通过(浏览器) | pms-kb-template-browser-test.js |
| pm/iteration/components/IterationForm.vue | 通过(浏览器) | pms-lifecycle-browser-test.js + pms-iteration-form-browser-test.js |
| pm/iteration/components/IterationSelect.vue | 通过(浏览器) | pms-batch-workitem-rest-browser-test.js |
| pm/iteration/components/IterationStartForm.vue | 通过(浏览器) | pms-lifecycle-browser-test.js + pms-iteration-form-browser-test.js |
| pm/iteration/detail/index.vue | 通过(浏览器) | pms-project-iteration-detail-browser-test.js |
| pm/iteration/list/IterationList.vue | 通过(浏览器) | pms-lifecycle-browser-test.js + pms-iteration-form-browser-test.js |
| pm/project/archive/index.vue | 通过(浏览器) | tail-pms-browser-test.js |
| pm/project/components/ProjectForm.vue | 通过(浏览器) | pms-lifecycle-browser-test.js |
| pm/project/components/ProjectMemberSelect.vue | 通过(浏览器) | pms-batch-workitem-rest-browser-test.js |
| pm/project/config/ProjectAnnouncementForm.vue | 通过(浏览器) | pms-attachment-browser-test.js |
| pm/project/config/ProjectAnnouncementList.vue | 通过(浏览器) | pms-batch-project-config-browser-test.js |
| pm/project/config/ProjectBasicInfo.vue | 通过(浏览器) | pms-batch-project-config-browser-test.js |
| pm/project/config/ProjectCollaborationConfig.vue | 通过(浏览器) | pms-batch-project-config-browser-test.js |
| pm/project/config/ProjectMemberForm.vue | 通过(浏览器) | pms-batch-project-config-browser-test.js |
| pm/project/config/ProjectMemberList.vue | 通过(浏览器) | pms-batch-project-config-browser-test.js |
| pm/project/config/index.vue | 通过(浏览器) | pms-batch-project-config-browser-test.js |
| pm/project/detail/PlanningBoard.vue | 通过(浏览器) | pms-project-iteration-detail-browser-test.js |
| pm/project/detail/ProjectGantt.vue | 通过(浏览器) | pms-project-iteration-detail-browser-test.js |
| pm/project/detail/ProjectOverview.vue | 通过(浏览器) | pms-project-iteration-detail-browser-test.js |
| pm/project/detail/ProjectWorkLog.vue | 通过(浏览器) | pms-project-iteration-detail-browser-test.js |
| pm/project/detail/index.vue | 通过(浏览器) | pms-lifecycle-browser-test.js + pms-project-iteration-detail-browser-test.js + pms-workbench-browser-test.js |
| pm/project/list/components/group/ProjectGroupForm.vue | 通过(浏览器) | tail-pms-browser-test.js |
| pm/project/list/components/group/ProjectGroupList.vue | 通过(浏览器) | tail-pms-browser-test.js |
| pm/project/list/index.vue | 通过(浏览器) | pms-lifecycle-browser-test.js |
| pm/project/recycle/index.vue | 通过(浏览器) | tail-pms-browser-test.js |
| pm/project/template/ProjectTemplateForm.vue | 通过(浏览器) | pms-kb-template-browser-test.js |
| pm/project/template/index.vue | 通过(浏览器) | pms-kb-template-browser-test.js |
| pm/workbench/components/ProjectSelect.vue | 通过(浏览器) | tail-pms-browser-test.js |
| pm/workbench/index.vue | 通过(浏览器) | pms-workbench-browser-test.js |
| pm/workitem/components/WorkItemSelect.vue | 通过(浏览器) | pms-batch-workitem-rest-browser-test.js |
| pm/workitem/detail/WorkItemActivity.vue | 通过(浏览器) | pms-batch-workitem-rest-browser-test.js |
| pm/workitem/detail/WorkItemComment.vue | 通过(浏览器) | pms-batch-workitem-rest-browser-test.js |
| pm/workitem/detail/WorkItemDetail.vue | 通过(浏览器) | pms-lifecycle-browser-test.js + pms-workbench-browser-test.js |
| pm/workitem/detail/WorkItemSubtaskList.vue | 通过(浏览器) | pms-batch-workitem-rest-browser-test.js |
| pm/workitem/form/WorkItemForm.vue | 通过(浏览器) | pms-lifecycle-browser-test.js + pms-attachment-browser-test.js |
| pm/workitem/import/WorkItemImportForm.vue | 通过(浏览器) | pms-batch-workitem-rest-browser-test.js |
| pm/workitem/label/WorkItemLabelForm.vue | 通过(浏览器) | mp-pms-tail-pms-label-status-browser-test.js |
| pm/workitem/label/WorkItemLabelList.vue | 通过(浏览器) | mp-pms-tail-pms-label-status-browser-test.js |
| pm/workitem/label/WorkItemLabelSelect.vue | 通过(浏览器) | mp-pms-tail-pms-label-status-browser-test.js |
| pm/workitem/list/WorkItemAllList.vue | 通过(浏览器) | pms-batch-workitem-rest-browser-test.js |
| pm/workitem/list/WorkItemList.vue | 通过(浏览器) | pms-lifecycle-browser-test.js |
| pm/workitem/status/WorkItemStatusDeleteForm.vue | 通过(浏览器) | mp-pms-tail-pms-label-status-browser-test.js |
| pm/workitem/status/WorkItemStatusList.vue | 通过(浏览器) | mp-pms-tail-pms-label-status-browser-test.js |
| pm/workitem/status/WorkItemStatusSelect.vue | 通过(浏览器) | pms-batch-workitem-rest-browser-test.js |
| pm/workitem/worklog/WorkItemWorkLogForm.vue | 通过(浏览器) | pms-lifecycle-browser-test.js |
| pm/workitem/worklog/WorkItemWorkLogList.vue | 通过(浏览器) | pms-batch-workitem-rest-browser-test.js |

### report（3 个功能页：通过(浏览器) 3 / 部分(浏览器) 0 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：三入口/积木/BI通过；设计展示/GoView业务待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| goview/index.vue | 通过(浏览器) | report-entry-browser-test.js（真实入口 SFC + 公共 IFrame：双令牌拼接、GoView 地址、加载与清理） |
| jmreport/bi.vue | 通过(浏览器) | report-entry-browser-test.js（真实入口 SFC + 公共 IFrame：/drag/list 地址、文档提示、延迟加载与清理） |
| jmreport/index.vue | 通过(浏览器) | report-entry-browser-test.js（真实入口 SFC + 公共 IFrame：token 拼接、后端根地址、延迟加载、卸载清理） |

### system（68 个功能页：通过(浏览器) 67 / 部分(浏览器) 1 / 部分(静态) 0 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：令牌/站内信/角色权限通过；其余逐功能/真实写入待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| area/AreaForm.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| area/components/AreaSelect.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| area/index.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| dept/DeptForm.vue | 通过(浏览器) | system-admin-basic-browser-test.js |
| dept/components/DeptSelect.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| dept/components/DeptTreeSelect.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| dept/index.vue | 通过(浏览器) | system-admin-basic-browser-test.js |
| dict/DictTypeForm.vue | 通过(浏览器) | sys-ai-rest-system-dict-browser-test.js |
| dict/data/DictDataForm.vue | 通过(浏览器) | sys-ai-rest-system-dict-browser-test.js |
| dict/data/index.vue | 通过(浏览器) | sys-ai-rest-system-dict-browser-test.js |
| dict/index.vue | 通过(浏览器) | sys-ai-rest-system-dict-browser-test.js |
| loginlog/LoginLogDetail.vue | 通过(浏览器) | sys-member-tail-system-browser-test.js |
| loginlog/index.vue | 通过(浏览器) | sys-member-tail-system-browser-test.js |
| mail/account/MailAccountForm.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| mail/account/index.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| mail/log/MailLogDetail.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| mail/log/index.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| mail/template/MailTemplateForm.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| mail/template/MailTemplateSendForm.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| mail/template/components/MailTemplateSelect.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| mail/template/index.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| menu/MenuForm.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| menu/index.vue | 部分(浏览器) | system-pay-browser-test.js（真实浏览器：菜单名称筛选、新增弹窗字段渲染；菜单树编辑未覆盖） |
| notice/NoticeForm.vue | 通过(浏览器) | sys-ai-rest-system-notice-sms-browser-test.js |
| notice/index.vue | 通过(浏览器) | sys-ai-rest-system-notice-sms-browser-test.js |
| notify/message/NotifyMessageDetail.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| notify/message/index.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| notify/my/MyNotifyMessageDetail.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| notify/my/index.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| notify/template/NotifyTemplateForm.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| notify/template/NotifyTemplateSendForm.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| notify/template/components/NotifyTemplateSelect.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| notify/template/index.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| oauth2/client/ClientForm.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| oauth2/client/index.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| oauth2/token/index.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| operatelog/OperateLogDetail.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| operatelog/index.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| post/PostForm.vue | 通过(浏览器) | system-admin-basic-browser-test.js |
| post/index.vue | 通过(浏览器) | system-admin-basic-browser-test.js |
| role/RoleAssignMenuForm.vue | 通过(浏览器) | system-admin-role-menu-browser-test.js |
| role/RoleDataPermissionForm.vue | 通过(浏览器) | system-role-data-browser-test.js（真实加载 SFC：数据范围切换、部门树勾选/父子联动开关、全选/展开开关、提交载荷） |
| role/RoleForm.vue | 通过(浏览器) | system-admin-role-menu-browser-test.js |
| role/components/RoleSelect.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| role/index.vue | 通过(浏览器) | system-admin-role-menu-browser-test.js |
| sms/channel/SmsChannelForm.vue | 通过(浏览器) | sys-member-tail-system-browser-test.js |
| sms/channel/index.vue | 通过(浏览器) | sys-member-tail-system-browser-test.js |
| sms/log/SmsLogDetail.vue | 通过(浏览器) | sys-member-tail-system-browser-test.js |
| sms/log/index.vue | 通过(浏览器) | sys-member-tail-system-browser-test.js |
| sms/template/SmsTemplateForm.vue | 通过(浏览器) | sys-ai-rest-system-notice-sms-browser-test.js |
| sms/template/SmsTemplateSendForm.vue | 通过(浏览器) | sys-ai-rest-system-notice-sms-browser-test.js |
| sms/template/components/SmsTemplateSelect.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| sms/template/index.vue | 通过(浏览器) | sys-ai-rest-system-notice-sms-browser-test.js |
| social/client/SocialClientForm.vue | 通过(浏览器) | system-social-client-browser-test.js（真实加载 SFC：create/update、平台切换显隐（publicKey/agentId）、必填校验、全屏、重开重置） |
| social/client/index.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| social/user/SocialUserDetail.vue | 通过(浏览器) | system-social-user-detail-browser-test.js（真实加载 SFC：open 加载序列、只读 JSON 文本域、全屏、失败恢复、描述项标签与空值、20 行自适应）+ system-social-avatar-parity-browser-test.js（头像差异复现） |
| social/user/index.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| tenant/TenantForm.vue | 通过(浏览器) | sys-member-tail-system-browser-test.js |
| tenant/index.vue | 通过(浏览器) | sys-member-tail-system-browser-test.js |
| tenantPackage/TenantPackageForm.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| tenantPackage/index.vue | 通过(浏览器) | tail-system-tail-batch-browser-test.js |
| user/UserAssignRoleForm.vue | 通过(浏览器) | system-admin-user-browser-test.js |
| user/UserForm.vue | 通过(浏览器) | system-admin-user-browser-test.js |
| user/UserImportForm.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| user/components/UserSelect.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| user/components/UserSelectDialogV2.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| user/components/UserSelectV2.vue | 通过(浏览器) | tail2-system-tail-browser-test.js |
| user/index.vue | 通过(浏览器) | system-admin-user-browser-test.js |

### wms（39 个功能页：通过(浏览器) 34 / 部分(浏览器) 0 / 部分(静态) 5 / 待验收 0）

模块级证据（MIGRATION_PROGRESS）：分类回填/盘库导入通过；出入库真实闭环待验收

| 功能（源页面） | 验收状态 | 证据/缺口 |
|---|---|---|
| home/components/WmsHomeInventoryCharts.vue | 通过(浏览器) | tail-wms-browser-test.js |
| home/components/WmsHomeOrderSummaryCards.vue | 通过(浏览器) | tail-wms-browser-test.js |
| home/components/WmsHomeOrderTrendChart.vue | 通过(浏览器) | tail-wms-browser-test.js |
| home/index.vue | 通过(浏览器) | tail-wms-browser-test.js |
| inventory/components/InventorySelect.vue | 通过(浏览器) | wms-batch-selectors-browser-test.js |
| inventory/history/index.vue | 通过(浏览器) | wms-batch-md-items-browser-test.js |
| inventory/index/index.vue | 通过(浏览器) | wms-more2-md-inventory-browser-test.js |
| md/item/ItemForm.vue | 通过(浏览器) | wms-batch-md-items-browser-test.js |
| md/item/brand/ItemBrandForm.vue | 通过(浏览器) | wms-batch-md-items-browser-test.js |
| md/item/brand/components/ItemBrandSelect.vue | 通过(浏览器) | wms-batch-selectors-browser-test.js |
| md/item/brand/index.vue | 通过(浏览器) | wms-batch-md-items-browser-test.js |
| md/item/category/ItemCategoryForm.vue | 通过(浏览器) | wms-category-browser-test.js |
| md/item/category/components/ItemCategorySelect.vue | 通过(浏览器) | wms-category-browser-test.js |
| md/item/category/components/ItemCategoryTree.vue | 通过(浏览器) | wms-batch-selectors-browser-test.js |
| md/item/category/index.vue | 部分(静态) | wms-item-migration-test.js |
| md/item/index.vue | 通过(浏览器) | wms-batch-md-items-browser-test.js |
| md/item/sku/components/ItemSkuSelect.vue | 通过(浏览器) | wms-batch-selectors-browser-test.js |
| md/merchant/MerchantForm.vue | 通过(浏览器) | wms-more2-md-inventory-browser-test.js |
| md/merchant/components/MerchantSelect.vue | 通过(浏览器) | wms-batch-selectors-browser-test.js |
| md/merchant/index.vue | 通过(浏览器) | wms-more2-md-inventory-browser-test.js |
| md/warehouse/WarehouseForm.vue | 通过(浏览器) | wms-more2-md-inventory-browser-test.js |
| md/warehouse/components/WarehouseSelect.vue | 通过(浏览器) | wms-batch-selectors-browser-test.js |
| md/warehouse/index.vue | 通过(浏览器) | wms-more2-md-inventory-browser-test.js |
| order/check/CheckOrderDetail.vue | 通过(浏览器) | tail-wms-browser-test.js |
| order/check/CheckOrderForm.vue | 通过(浏览器) | wms-check-import-browser-test.js |
| order/check/CheckOrderPrint.vue | 通过(浏览器) | tail-wms-browser-test.js |
| order/check/index.vue | 通过(浏览器) | tail-wms-browser-test.js |
| order/movement/MovementOrderDetail.vue | 通过(浏览器) | tail-wms-browser-test.js |
| order/movement/MovementOrderForm.vue | 通过(浏览器) | wms-movement-form-browser-test.js |
| order/movement/MovementOrderPrint.vue | 通过(浏览器) | tail-wms-browser-test.js |
| order/movement/index.vue | 通过(浏览器) | tail-wms-browser-test.js |
| order/receipt/ReceiptOrderDetail.vue | 部分(静态) | wms-receipt-order-migration-test.js |
| order/receipt/ReceiptOrderForm.vue | 通过(浏览器) | wms-batch-receipt-shipment-browser-test.js |
| order/receipt/ReceiptOrderPrint.vue | 部分(静态) | wms-receipt-order-migration-test.js |
| order/receipt/index.vue | 通过(浏览器) | wms-batch-receipt-shipment-browser-test.js |
| order/shipment/ShipmentOrderDetail.vue | 部分(静态) | wms-shipment-order-test.js |
| order/shipment/ShipmentOrderForm.vue | 通过(浏览器) | wms-batch-receipt-shipment-browser-test.js |
| order/shipment/ShipmentOrderPrint.vue | 部分(静态) | wms-shipment-order-test.js |
| order/shipment/index.vue | 通过(浏览器) | wms-batch-receipt-shipment-browser-test.js |

### 公共功能（登录/布局/框架组件）

| 功能 | 验收状态 | 证据/缺口 |
|---|---|---|
| 账号密码登录 | 待验收 | login.vue 存在 |
| 短信验证码登录 | 待验收 | login.vue 存在 |
| 社交登录 | 待验收 | socialLogin.vue 存在 |
| SSO登录 | 待验收 | sso.vue 存在 |
| 二维码登录 | ❌后端不支持 | 后端无ticket端点，Vue3侧亦仅静态二维码；待后端提供接口 |
| 注册 | ✅已补 | login.vue 注册tab，/system/auth/register 接线，浏览器验证 |
| 忘记密码 | ✅已补 | login.vue 忘记密码tab，短信scene=23+重置密码接线，浏览器验证 |
| 锁屏 | ❌未迁移 | 源 lock store + LockDialog/LockPage，目标无 |
| 多语言(i18n) | ❌未迁移 | 源 locale store + useI18n；目标仅硬编码翻译简表 |
| 布局/导航(TagsView/菜单/面包屑等) | 待验收 | layout 各等价物存在 |
| 表单设计器 select/dict/area/iframe 规则 | ✅已补 | FormCreate config 5 规则文件移植，与源深比较一致，浏览器渲染字典选项通过 |
| 暗黑模式切换 | ❌未迁移 | 源 ThemeSwitch，目标仅 ThemePicker 换色 |
| 500错误页 | ✅已补 | views/error/500.vue + /500 路由；playwright 渲染通过 |
| 水印 | ✅已补 | v-watermark 指令（directive/module/watermark.js），浏览器验证 |
| 新手引导/事件总线 | ❌未迁移 | useGuide(driver.js)/useEmitt；Vue2无对应，待决策 |
| backtop/Sticky/密码强度/操作日志/部门选择 | ✅已补 | 5组件已移植并全局注册，浏览器冒烟通过 |
| 权限指令 hasPermi/hasRole | 待验收 | directive/permission/ 存在 |
| JsonEditor 组件 | ✅已修复 | 新增 components/JsonEditor（契约等价）；iot 两页面悬空引用消除；顺带修复 el-button 复用致 :disabled 失效 |

## 四、下一步

1. 逐功能验收按 `AI_CHAT_ACCEPTANCE.md`（AI聊天25组）与 `MIGRATION_PROGRESS.md`（19模块）推进，每组通过后回写对应清单与本表状态。
2. ❌真缺失清单逐项决策：移植（如500页/二维码登录）或明确记录"不移植"（如 vxe 封装类框架差异已在🟡中排除，剩余 miss 多为真实功能缺口）。
3. JsonEditor 悬空引用需优先处理（iot 两个页面运行时会报错）。
4. 重新生成：修补贴丁映射后运行 `node scripts/generate-migration-tracking.js`。
