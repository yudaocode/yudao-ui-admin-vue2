# BPM 工作流迁移审计（Vue3 → Vue2）

> 审计日期：2026-09-05　> 结论：**BPM 核心迁移、真实写入闭环、静态契约、生产构建、主浏览器回归及本轮三组动态路由均已通过；这仍是有边界的验证，不等同于全仓 1:1 证明**

本文记录的是当前 Vue2 工作区、Vue3 参照代码和隔离运行环境中可以复核的结果。它不把“文件已存在”当作“功能已完整迁移”，也不把旧进程或旧接口的结果混入本轮结论。

### 2026-09-05 基准更新后的续迁状态

- 2026-09-08 BPM 操作按钮契约：移除 buttonsSetting 旧ID数组查找和已配置值兜底，按源直接读map（后端字段类型已核验）。真实SFC/EUI验证隐藏、自定义名称/动作、空名称保留、缺enable隐藏及无配置默认，并重跑抄送/WAIT减签（`/private/tmp/vue2-bpm-button-contract-browser.log`）；API替身，无真实流程写入，本批未完整构建。
- 2026-09-08 BPM 操作：空意见抄送、WAIT父任务减签已按源修复，保留其他操作RUNNING门禁及必填规则；真实SFC/EUI浏览器参数和门禁通过（`/private/tmp/vue2-bpm-operation-actions-browser.log`），无真实流程写入。IM五个群操作原生弹窗绑定也已修复并通过浏览器（`/private/tmp/vue2-im-group-dialog-bindings-browser.log`，picker/store/API替身）。全量218脚本+strict148通过（`/private/tmp/vue2-bpm-im-actions-suite.log`）；完整构建退出0、8警告（`/private/tmp/vue2-bpm-im-actions-build.log`，Bsajof产物），未部署。
- 2026-09-08 OA 月报：双端实测 clearable=false 仍可手输空月份为null，目标split同步抛错；引入与源同范围dayjs依赖并更新yarn锁，按源解析年月，不添加默认月份或接口兼容。真实月报SFC浏览器验证空值fixture拒绝后loading恢复及合法月份继续查询；双端输入组件对照通过。真实应用三考勤路由/周月报回归通过（`/private/tmp/vue2-oa-app-final.log`，1个编辑GET替身、错误门禁0、无业务写入）；完整生产构建通过（`/private/tmp/vue2-oa-month-build.log`，XK2fti产物，未部署）。参照仓库OA只有考勤，没有便签，不扩大迁移范围。
- 2026-09-08 Mall 分类多选：修复全选时旧目标输出父ID [7]、源输出末级[9,10] 的差异，Treeselect 使用 LEAF_PRIORITY。实际双端选中集合、取消部分、回填标签与增选独立末级浏览器通过（`/private/tmp/vue2-category-multiple-parity.log`）；单选/优惠券回归通过。RewardForm 原样传分类数组的消费路径已核验，不算真实活动写入。此前单选完整构建通过（`/private/tmp/vue2-mall-category-build.log`、8警告、0xugrj产物，未部署），不覆盖之后的多选修改。
- 2026-09-08 Mall 分类：优惠券接公共 ProductCategorySelect，移除重复树加载。单选父节点只展开、末级可选及无清空按钮按源修正；双端真实组件对照通过（`/private/tmp/vue2-mall-category-parity-browser.log`，源精确模板/等价 host、目标真实 SFC，树/API 替身）。优惠券真实 Treeselect 回填9、空分类必填、展开选末级及提交[9]通过（`/private/tmp/vue2-mall-coupon-category-browser.log`）；重跑此前交互，API仍为替身，无真实写入。本批未完整构建，多选语义尚未验收。
- 2026-09-08 Mall 优惠券共享弹窗：按源接默认 40% Dialog；全屏保留输入、重开清空及取消销毁浏览器通过，并重跑选品/校验/提交参数（`/private/tmp/vue2-mall-coupon-dialog-browser.log`）。原始商品选择日期组件双运行时对照通过（`/private/tmp/vue2-mall-date-parity.log`）：手输结束日期两边都是当天 00:00:00，未只修改 Vue2 日期语义；日历点选仍未覆盖。完整生产构建通过（`/private/tmp/vue2-mall-coupon-build.log`，8 警告，独立产物 ihGGfn，未部署）。API 等仍为替身，无真实优惠券写入。
- 2026-09-08 Mall 优惠券续迁：模板接回真实 SpuShowcase/SpuTableSelect，去除简单下拉替代，恢复源 required 规则与字段内校验。`/private/tmp/vue2-mall-coupon-browser.log` 真实 Vue2/EUI/表单/商品组件/Pagination 通过字段错误、条件分支、跨页选择、名称/分类查询、图片/删除/详情与新增编辑参数；API/字典/分类 Treeselect 替身，无真实优惠券写入，日期筛选与共享弹窗仍待验收。全量 218 静态脚本 + strict148 通过（`/private/tmp/vue2-mall-coupon-suite.log`）；本批未完整构建，getDicts 保留。
- 2026-09-08 MP/IM 最终回归：218 静态脚本 + strict148 全通过（`/private/tmp/vue2-mp-im-suite-final.log`）；完整生产构建退出 0、8 警告（`/private/tmp/vue2-mp-im-build.log`），独立产物 `/private/tmp/vue2-mp-im-build.WJ90s4/index.html`，未部署。getDicts 保留、diff 检查通过。Mall 优惠券商品选择及条件字段反馈已只读确认差异，尚未修复；总体目标仍未完成。
- 2026-09-08 MP/IM 续迁：消息账号切换即查询、重置保留账号、标签同步刷新和请求 finally；禁言弹窗使用 EUI visible.sync，频道素材/推送接回共享 Dialog 720px/640px。三组真实 Vue2/EUI 浏览器脚本重新通过，日志为 `/private/tmp/vue2-mp-active-pages-browser.log`、`/private/tmp/vue2-im-group-mute-browser.log`、`/private/tmp/vue2-im-channel-dialog-browser.log`。API 及部分业务选择器/编辑器替身，无真实公众号同步、禁言、上传或推送；不算全模块验收。
- 2026-09-08 今日时间条件完成双运行时核查：实际源 Vue3/EP、目标 Vue2/EUI 均拒绝 TODAY 的空 param，错误为 param required；合法 AT_TIME 对照两边通过。日志 `/private/tmp/vue2-iot-today-parity-browser.log`，隔离表单/绑定及图标替身、无接口；这是两边共有缺陷，未仅改 Vue2 规则。近期 MES/IoT 完整生产构建通过（`/private/tmp/vue2-mes-iot-build.log`，8 警告、未部署），本轮未重新全量静态回归。
- 2026-09-08 IoT 字段校验：四配置组件七处 validateField 改 EUI callback；告警清空保持 undefined。告警、设备控制、主/附加条件三组实际 Vue2/EUI 浏览器通过，API/选择器/JSON 编辑器替身，无真实设备调用。时间点/区间输入通过，今日条件整表验收尚待核，不扩大通过范围。全量 218 静态脚本 + strict148 通过（`/private/tmp/vue2-iot-field-validation-suite.log`），本轮未完整构建。
- 2026-09-08 MES 批次续迁：出库拣货明细接 WmBatchSelect 和共享 Dialog 960px，恢复批次 ID 查询编号及悬停详情。真实组件浏览器日志 `/private/tmp/vue2-mes-product-sales-batch-browser.log` 验证换库存、禁用、清空重开及模拟更新 ID 参数；API/其他选择器替身，无真实出库写入。IoT 场景规则 validateField().catch 的 EUI 契约差异列为下一项待修，本轮未完整生产构建。
- 2026-09-08 HRM 续迁：绩效试算失败清空旧预览；计划 validateField 改为 EUI callback Promise 校验当前已注册字段，步骤点击改 native。`/private/tmp/vue2-hrm-review-preview-browser.log` 和 `/private/tmp/vue2-hrm-plan-validation-browser.log` 通过真实 Vue2/EUI 专项；API 和计划业务子表单替身，无真实绩效写入。试算负向回归在内存恢复保留旧分数后准确失败。
- FMS/WMS 续迁：财务指标 open 初始化 loading 并保留请求序号保护、共享 Dialog 620px；账套成员字典权限/重开校验；WMS 分类标量回填及顶级分类/必填。三组真实组件浏览器日志 `/private/tmp/vue2-fms-finance-indicator-browser.log`、`/private/tmp/vue2-fms-account-member-browser.log`、`/private/tmp/vue2-wms-category-browser.log` 通过；API 和用户选择器为替身，无真实财务/授权/分类写入。本轮未完整生产构建。
- 公共 IFrame 续迁：load 事件驱动 loading、src 切换、销毁 about:blank/移除 onload、全屏属性及 CSS 自适应，不覆盖全局 resize。真实 Vue2/EUI 延迟文档浏览器通过（`/private/tmp/vue2-iframe-lifecycle-browser.log`），不代表真实报表平台验收。FMS/WMS 新发现的六项差异已登记 MIGRATION_PROGRESS.md 待修。上传/System 后完整构建先行通过（`/private/tmp/vue2-system-build.log`，8 警告），不覆盖随后 IFrame 变更。
- System 三项续迁完成专项浏览器：令牌实际 queryParams.pageNo 重置与 finally；站内信跨页选择、已读禁选、批量/全部/重置清空、阅读时间；角色共享 Dialog 800px、每次重置、逐 ID 非递归回填。日志 `/private/tmp/vue2-system-token-browser.log`、`/private/tmp/vue2-system-notify-selection-browser.log`、`/private/tmp/vue2-system-role-data-browser.log`。真实 Vue2/EUI/分页/树/共享 Dialog；API 替身，无真实强退、已读或权限写入。令牌旧逻辑内存负向回归准确失败。本轮未完整构建，不等于 System 全模块完成。
- 文件上传表单接回公共 useUpload 与共享 Dialog，补齐前端直传及弹窗全屏；真实 Vue2/EUI/Dialog/useUpload 浏览器在 server/client 模式验证空值校验、成功、失败、取消重开（`/private/tmp/vue2-infra-file-upload-browser.log`）。所有 API/存储为替身，禁止网络请求，不是实际文件上传验证；本次修改后未完整生产构建。System 下一轮已确认令牌搜索页码、站内信批量选择、角色数据权限重开状态缺口，尚待修复。
- 文件管理续迁：补 type 输入/回车搜索，图片直接按 row.url 预览、PDF 新窗口预览、其余 download 原始 URL，移除视频专属分支与 configId/path 重拼地址；使用项目剪贴板指令复制完整 URL。真实组件浏览器通过筛选/重置、PDF 跳转、ZIP/视频下载内容、剪贴板读取、图片预览（`/private/tmp/vue2-infra-file-browser.log`）。列表 API 为替身，文件由随机端口本地测试服务提供；无真实上传/删除，PDF 不宣称内容渲染。218 静态脚本+strict148通过（`/private/tmp/vue2-infra-file-suite.log`）。完整生产构建重新通过，产物 `/private/tmp/vue2-migration-build.A4e5S0`，日志 `/private/tmp/vue2-migration-build-latest.log`，8 条编译警告；未部署、提交或推送，getDicts 保留。
- 支付续迁：钱包充值套餐初始/重置状态改为 undefined，移除额外自动开启；收银台仅将字符串 query.id 转 Number，并仅解码字符串 returnUrl。真实 Vue2/EUI 浏览器验证状态必填阻止提交、显式状态/金额参数、编辑后再次新增重置，以及收银台数字 ID 的初始 GET/模拟提交和五组无效 ID 无 GET 通过（`/private/tmp/vue2-pay-status-cashier-browser.log`）。API 为替身，浏览器所有网络阻断，无真实支付或套餐写入；首轮测试计数器误用了浏览器只读 window.closed，改名后正常，未改生产逻辑过测。转账搜索源端/后端冲突仍保留未对齐，未提交、推送或完整构建。
- 会员收藏/售后续迁：收藏价格改用源 floatToFixed2 分转元，恢复收藏及售后商品图片预览；售后补状态下拉与三个输入框的 Enter 搜索。扩展真实详情/订单/售后/收藏组件浏览器测试，实际抽取仓库金额函数，验证 1234 分显示 12.34 元及零值、两处图片预览、Enter 请求、状态下拉/标签同步、重置及 userId 约束，通过（`/private/tmp/vue2-member-favorite-aftersale-browser.log`）；接口、编辑子表单及字典为替身，无真实业务写入。305 项会员契约通过，getDicts 原始导入/挂载保留。支付只读续审确认充值套餐默认状态、收银台 ID 类型待补；转账搜索源端/当前 JDK25 后端字段冲突，尚未更改。未完整构建、提交或推送。
- 会员续迁：详情编辑成功回调显式传当前 id；订单 tab 复用完整 OrderTableColumn，移除原简化列和不再使用的格式化方法。门店/物流选项先加载后请求订单，避免 Vue2 嵌套表格部分可见门店单元格不刷新；选项失败仍请求订单并释放 loading。真实组件浏览器验证编辑成功重新 GET 42、快递/自提商品规格、单价数量、售后状态、买家/收货地址、门店、图片预览、详情跳转及搜索 userId 通过（`/private/tmp/vue2-member-detail-browser-final.log`）。接口、编辑表单及字典为替身，不算真实会员写入。内存换回旧回调后，同一浏览器断言准确失败为 `[42, undefined]`，未修改生产文件做反向测试。305 项会员契约及定向静态检查通过；未完整构建、提交或推送。
- ERP 首页 TimeSummaryChart 补齐源 toolbox.dataZoom/brush/saveAsImage、legend、工具栏所需 grid 留白和 cross tooltip。真实 ECharts 浏览器验证销售/采购 PNG 文件名与内容、鼠标拖选 X 轴缩放和还原、框选/清除事件及卸载 dispose 通过（`/private/tmp/vue2-erp-home-chart-browser-verified.log`）。源与目标均无 brush 实例，工具栏入口/事件不等于实际区域框选通过；未为过测添加源外配置。全量 218 静态脚本+strict148通过（`/private/tmp/vue2-erp-home-chart-suite.log`），未真实 ERP 接口测试、完整构建、提交或推送。会员只读审计另确认详情编辑成功回调缺 ID、订单 tab 缺完整 OrderTableColumn，待续迁。
- CRM/ERP 续迁：CRM 跟进表单与关联联系人/商机选择器接共享 Dialog，源宽度 50%/40%/40%，补全全屏、遮罩关闭、关闭销毁；真实组件浏览器覆盖原分页/关联逻辑及全屏保留、取消/遮罩关闭、销毁重开通过（`/private/tmp/vue2-crm-followup-dialog-browser.log`）。ERP 库存入库、出库、调拨、盘点四个产品表单移除额外最后一行禁删和 items/disabled watcher 自动补行，初次加载默认行保持；实际删除唯一行并等待 Vue 更新、重新添加、父数组替换为空、初次默认行、只读操作限制通过（`/private/tmp/vue2-erp-stock-items-browser.log`）。ERP API/算术辅助为替身，不算金额计算或真实库存写入；CRM API/新增表单/路由为替身。只读另确认 ERP 首页统计图 toolbox 缺失，尚待后续补齐。getDicts 原始导入与全局挂载保留；未提交、推送或完整生产构建。
- AI/CRM 续迁：AI 知识库导航已追加真实应用测试（`ai-knowledge-app-browser-test.js`）：1029→49095 代理验证、共享认证锁、已有知识库/文档 GET、实际分段按钮、缓存返回/离开通过，无替身 API 或业务写入，日志 `/private/tmp/vue2-ai-knowledge-app-browser.log`。CRM 跟进关联移除固定前 100 条的内嵌选择器，接回 ContactListModal/BusinessListModal，按源行为去重追加。真实组件浏览器验证第 101 条、搜索/分页请求、客户约束、追加/重复/取消及提交 ID 通过（`/private/tmp/vue2-crm-followup-browser.log`）；关联 API、新增子表单和详情路由为替身，不扩大为真实 CRM 写入通过。339 项 CRM 客户详情契约与 13 个调用方的认证锁测试通过。全模块对齐仍未完成。
- AI 知识库续迁：修复文档缓存实例无条件监听知识库参数而抢走分段/其他模块导航的问题；仅在 AiKnowledgeDocument 路由初始化，返回缓存页及同页切换知识库仍刷新。新增真实 Vue2/VueRouter/EUI 浏览器回归（API 和目标页为替身），包含实际分段按钮、缓存实例复用、离开/返回、同页切换和缺失 ID 校验；将源码在内存替换回旧监听后，断言准确复现错误跳转。修复后浏览器通过（`/private/tmp/vue2-ai-knowledge-navigation-browser.log`），AI 279 项、全量 218 脚本及 strict 148 项通过（`/private/tmp/vue2-ai-navigation-suite.log`）。保留 getDicts 原始导入和全局挂载；未真实业务写入、完整构建、提交或推送。此项不代表 AI 全模块验收完成。
- 新增 `MIGRATION_PROGRESS.md`，按当前Vue3全部19个业务模块列出验收范围与待复核项，并单列公共组件/系统页面；已用当前目录验证无遗漏/多余模块。该表不把历史报告未复核误写为尚未开发，也不把局部测试换算成全仓完成百分比。
- 模型分组与流程定义的表单预览已对齐共享Dialog（源默认40%/800px），移除额外submitBtn/resetBtn覆盖，保留原表单配置；普通/自定义表单按formType分流，移除按残留formId打开普通表单的分支及额外提示。真实Vue2/EUI/form-create组件浏览器验证显式显示/隐藏按钮、全屏、关闭销毁、连续重开，以及自定义表单带formId仍跳自定义路径，通过（`/private/tmp/vue2-bpm-model-preview-verified-final.log`）；API/路由为替身，不算实际业务写入。
- 本轮模型预览变更后全量218个静态脚本+strict148项通过（`/private/tmp/vue2-bpm-model-preview-suite.log`），136项BPM元数据契约、BPM迁移/响应契约和定向diff检查通过；未完整构建、未提交或推送。预览未点击提交按钮；实际审批任务表单仍维持只读及隐藏按钮，不混淆不同消费者的源行为。
- BPM 流程监听器表单接入默认40%共享Dialog，补齐全屏/遮罩关闭/销毁，取消按钮不再额外按loading禁用，与源保持一致。真实组件浏览器验证必填、执行事件为开始/结束、切换任务类型清空旧事件并展示创建/指派/完成/删除/更新/超时、创建/编辑时原样提交type/event/valueType/value、全屏保留输入与关闭销毁，通过（`/private/tmp/vue2-bpm-listener-dialog-browser-final.log`）。测试明确等待旧下拉关闭及新选项出现，修正首轮读取旧浮层的时序问题，未修改生产事件逻辑。API为替身，真实监听器写入仍未覆盖。
- 本轮136项BPM元数据契约、BPM迁移/响应契约、浏览器脚本语法及定向diff检查通过；未重复全量suite或完整构建、未提交或推送。源按type而非valueType决定值输入标签的既有行为仍保留，未擅自纠正源功能。
- 模型分类重命名消费者已单独对齐：CategoryForm compact模式采用400px、fullscreen=false、无分类名标签、仅名称字段、取消在确定前；普通分类管理仍为40%及完整字段/全屏。真实组件浏览器验证重命名提交保留code/description/status/sort，仅改变name，以及随后打开普通表单恢复默认配置，通过（`/private/tmp/vue2-bpm-category-rename-browser.log`）。该测试使用替身API，不算真实分类写入。
- 本轮133项BPM元数据契约、BPM迁移及响应契约、定向diff检查通过；未重复全量suite或完整构建，不能沿用上一轮218脚本结果作为本轮全量证明。没有真实业务写入、提交或推送。
- 表达式Dialog迁移后全量218个静态脚本+strict148项通过（`/private/tmp/vue2-bpm-expression-dialog-suite.log`），定向diff检查通过。本轮未执行真实业务写入或完整构建、未提交或推送；整体对齐继续。
- 后续消费者差异待处理：模型分组 `CategoryDraggableModel.vue` 的分类重命名在源为400px且fullscreen=false，目标复用CategoryForm compact后仍为默认40%且允许全屏；不能把分类管理表单已对齐扩大为该重命名消费者已对齐。分组模型/流程定义表单详情仍有旧Dialog和额外覆盖submitBtn/resetBtn配置；流程监听器弹窗亦待迁移。本轮只读核对记录，未计为完成。
- BPM 流程表达式表单接入源默认40%共享 Dialog，移除额外500px、禁止遮罩关闭和4行textarea设定。真实组件浏览器验证名字/表达式必填、创建与编辑回填、原样表达式文本和数值状态提交、全屏保留输入、关闭销毁及再次创建重置通过（`/private/tmp/vue2-bpm-expression-dialog-browser-final.log`）；沿用真实Vue2/EUI，API为替身，不算实际表达式业务写入。该源码只有名称/状态/表达式，不存在另一个表达式类型字段。
- 分类/用户组Dialog迁移与测试依赖修正后，全量218个静态脚本+strict148项重新执行通过（`/private/tmp/vue2-bpm-metadata-dialog-suite-final.log`）；getDicts原始导入、API导出与全局挂载再次确认保留。整体迁移尚未完成。
- BPM 分类与用户组表单接入共享 Dialog，默认宽度从额外的500px改为源默认40%，恢复遮罩关闭、全屏、拖动及关闭销毁；保留直接 response.data 赋值，不增加 userIds/字段类型转换。用户组列表中陈旧的“userIds规范化”注释同步改为成员/详情加载说明。
- 真实 Vue2/EUI 组件浏览器补齐分类/用户组创建、必填校验、分类标志及排序、用户组多选成员、编辑回填及精确提交、全屏保留输入、关闭销毁、重新创建清空旧值和遮罩关闭，测试通过（`/private/tmp/vue2-bpm-metadata-dialog-browser-final.log`）。API为替身，不算实际分类/用户组业务写入证据。多选测试通过可见select容器操作，避免点击被tags输入层覆盖的底层input，不强制点击。
- 元数据契约测试补齐共享Dialog依赖及交互断言，129项通过（`/private/tmp/vue2-bpm-metadata-dialog-contract.log`）；初轮全量因测试依赖映射缺失失败，不能计为全量通过。浏览器脚本语法及定向diff检查通过，本轮未完整构建、未提交或推送。
- BPM 表单设计器清理历史路由兼容：列表修改/复制只传 type/id，编辑器只读取 query.id，移除 formId 优先兜底和要求保留兼容的旧测试。保存弹窗接入源同宽600px共享 Dialog。真实 Vue2/EUI/form-create/designer 浏览器验证 id=42/formId=99 时只加载42、仅 formId 时不加载旧表单、修改走 update、复制走 create 且不带旧主键、设计器字段保留、保存弹窗全屏/关闭销毁/重开保留编辑值通过（`/private/tmp/vue2-bpm-form-editor-dialog-browser-final.log`）。自定义设计器组件面板配置仍由独立 designer 浏览器测试覆盖；本测试接口为替身，不算实际表单写入。
- 本轮实际应用打印编辑器完整回归通过（`/private/tmp/vue2-bpm-print-app-regression.log`），4/4选项接口、撤销重做、提及、图片、表格、审批记录、确认回填和重开全部通过，全部错误/写请求门禁为0，没有保存模型。新增可选 `BPM_IMPORT_DIALOG_APP=1` 的模型导入实际页面测试目前**未通过**：真实模型页存在，但当前认证账号缺少 bpm:model:import，按钮被隐藏（`/private/tmp/vue2-bpm-import-permission-gate.log`）。未修改账号权限；不可把该入口算作实际页面已验证。
- 表单设计器上述改动后全量218个静态脚本+strict148项通过（`/private/tmp/vue2-bpm-form-editor-dialog-suite.log`）。浏览器组件测试补齐标准HTML来源和本地字体资源，使真实设计器可访问其localStorage；未屏蔽相关错误。认证状态复核mode600、无持久化access token、无残留锁。本轮未做真实业务写入、未完整构建、未提交或推送。
- BPM 模型导入与任务表单详情接入共享 Dialog（640px/600px），补齐全屏、拖动、关闭销毁；模型导入移除额外禁用遮罩关闭的配置，并按 Vue3 修正移除待导入文件时保留流程标识/名称，重开仍重置。smoke 导入标题定位同步改为共享标题插槽，`getDicts` 原导入/API/全局挂载保留。
- 新增 `bpm-dialog-consumers-browser-test.js`，使用真实 Vue2、Element UI、form-create 与替身 API。验证 JSON 文件预填与导入请求参数、移除文件保留字段、全屏保留值、遮罩关闭/销毁/重开重置，以及任务表单保存值、只读禁用、隐藏提交/重置按钮和连续重开换值，通过（`/private/tmp/vue2-bpm-dialog-consumers-final.log`）。不是模型导入真实后端写入证据。测试早期因缺 DOCTYPE 进入怪异模式，上传列表图标错误占满视口；已与真实 public/index.html 一样使用标准模式，未为此修改生产样式。
- 上述生产改动后全量 218 个静态脚本 + strict 148 项通过（`/private/tmp/vue2-bpm-dialog-consumers-suite.log`）；随后补充的 BPM Dialog 契约另行通过（`/private/tmp/vue2-bpm-dialog-contract.log`），定向 diff 检查和浏览器脚本语法检查通过。本轮未执行完整构建或全应用 smoke、未提交或推送，整体对齐仍未完成。
- 迭代状态流转测试更新后全量 218 个静态脚本 + strict 148 项通过（`/private/tmp/vue2-pms-iteration-transitions-suite.log`），写入安全测试及定向 diff 检查通过。认证状态复核 mode600、refresh-only、无残留锁。本轮未运行完整构建、未提交或推送，整体迁移仍未完成。
- PMS 迭代真实闭环扩展到开始/完成（`/private/tmp/vue2-pms-iteration-transitions.log`）：空周期触发必填且不提交；真实日期输入控件填写起止时间，开始后 API 校验 status=2 和精确时间戳；登记/编辑任务工时后取消一次完成确认，状态仍为2且没有 complete 请求；再次确认后 status=3、finishTime 有值，页面显示已完成并移除开始/完成菜单，任务仍归属原迭代。准确 9 次授权页面写请求，错误门禁为0。新增开始/完成请求安全契约约束唯一迭代、固定起止时间、请求顺序、精确查询参数及重复拒绝，测试通过。普通项目分支仍保持5次写入。
- 本轮唯一测试项目/迭代/任务/工时 `17/11/47/36` 已校验 marker 后回收、级联删除并逐项验证 not-exists；journal `/private/tmp/v2-e2e-9a08290e6b7f-pms-lifecycle.json` cleaned=true。本轮是新增实际后端状态流转证据，没有更改迭代生产状态逻辑。
- 并行只读 BPM 审计确认下一批共享 Dialog 缺口：`bpm/model/ModelImportForm.vue` 与 `bpm/processInstance/detail/ProcessInstanceTaskList.vue` 仍为原生 el-dialog，缺少源的全屏/拖动/销毁；模型导入还禁用了源默认允许的遮罩关闭。此条仅记录待办，尚未迁移；需要同步调整 smoke 的 `.el-dialog__title` 定位并验证文件预填/关闭及任务表单只读数据。
- 迭代真实写入分支、列表 tooltip/窄屏修复及新增契约后，全量 218 个静态脚本 + strict 148 项通过（`/private/tmp/vue2-pms-iteration-lifecycle-suite.log`），定向 diff 检查通过。本轮未重跑完整构建、未提交或推送；全仓功能对齐仍未完成。
- PMS 敏捷项目真实 UI 闭环通过（`/private/tmp/vue2-pms-iteration-real-lifecycle-second.log`）：创建私有敏捷项目、创建及编辑迭代、在任务表单选择该迭代、创建/编辑任务后 API 回读归属保持、登记/编辑工时并校验汇总；准确 7 次白名单页面写请求，页面/接口/网络错误为 0。新增 `PMS_ITERATION_FLOW=1` 分支与纯函数安全测试，仅允许本轮 projectId/iterationId/marker，禁止其他负责人、任意迭代关联及重复提交。原默认普通项目 5 次写入分支也复跑通过（`/private/tmp/vue2-pms-general-lifecycle-regression.log`）。迭代开始/完成真实写入仍未覆盖。
- 敏捷项目/迭代/任务/工时 `15/10/45/34` 已按 marker 校验、回收及级联删除并分别验证 not-exists，journal `/private/tmp/v2-e2e-622678eefd12-pms-lifecycle.json` cleaned=true。首轮项目/迭代 `14/9` 已同样清理；首轮测试在编辑回填前读取到空名称，改为显式等待对应 GET 响应及输入回填后通过，未修改生产回填逻辑。普通项目回归 journal `/private/tmp/v2-e2e-6bd1f33ecf5d-pms-lifecycle.json` 清理成功。认证状态为 mode600、refresh-only、无残留锁。
- 并行只读比对发现并修复迭代列表的 Element UI 语义差异：表格级 `show-overflow-tooltip` 在 Element UI 无效，改为逐列设置；工具栏补齐源代码的 flex-wrap 和居中对齐。真实 Vue2/Element UI 组件浏览器验证长迭代名称与负责人悬浮提示、390px 窄屏按钮换行通过（`/private/tmp/vue2-pms-iteration-forms-list-browser.log`），同时保留表单创建/编辑/开始、日期校验、关闭重开及失败恢复测试。该组件测试使用替身 API，不替代上述真实写入证据。
- PMS 迭代创建/编辑与开始迭代表单接入共享 Dialog，分别保持 Vue3 的 720px/520px。新增 `pms-iteration-form-browser-test.js` 使用真实 Vue2/Element UI 与替身 API，验证全屏保留输入、关闭后销毁、跨项目重新创建清空旧值、必填与起止时间校验、创建/编辑/开始的精确请求数据，以及提交失败保持弹窗并解除 loading；测试通过。此轮没有启动迭代真实后端写入，不将组件提交测试算作业务闭环。
- 迭代 Dialog 改动后全量 218 个静态脚本 + strict 148 项通过（`/private/tmp/vue2-iteration-dialog-suite.log`）；增强的迭代表单契约与 PMS 77/77 SFC 运行时绑定检查另行通过，定向 diff 检查通过。`getDicts` 原始导入、API 导出及 Vue.prototype 挂载仍保留；本轮未运行完整构建、未提交或推送。
- 工时表单与真实写入测试更新后，全量 **218 个静态/组件行为脚本 + strict 148 项契约通过**（`/private/tmp/vue2-pms-worklog-ui-suite.log`），PMS 运行时 77 SFC 检查及写入安全测试通过；不将这些计数扩大为全仓功能已对齐的结论。
- PMS 工时真实写入闭环通过（`/private/tmp/vue2-pms-worklog-ui-lifecycle.log`）：任务创建时设预估 8 小时，详情工时页登记 2 小时自动建议剩余 6，API 汇总确认；打开编辑将投入改为 3 时仍保留剩余 6，再手动改为 5，提交后汇总为实际 3/剩余 5、记录仍为 1 条，页面说明更新一致。工时表单同时按 Vue3 接入 `520px` 共享 Dialog。此次恰好 5 次授权 browser write（项目 create、任务 create/update、工时 create/update），无额外写请求或页面/接口/网络错误。
- 工时测试的项目/任务/工时记录 `13/44/33` 已按唯一标记回收并级联删除，分别验证其精确 not-exists 错误码；`/private/tmp/v2-e2e-7aec2e317022-pms-lifecycle.json` cleaned=true。新增工时写入白名单只接受本轮 workItemId/workLogId、唯一说明、1–8 投入与0–8剩余、单次 create/update；相应拒绝测试通过。认证状态复核为 mode600、refresh-only、无残留锁。原有业务数据未修改，附件、迭代与其他 BPM 深层写链路仍未被本轮覆盖。
- PMS 真实写入闭环进一步改为全部经业务页面发起：项目列表点击新建、填写唯一名称/描述、私有范围、默认封面和无额外成员，真实创建项目后进入其任务页完成任务新增与更名，逐步 API 回读并确认列表显示。准确三次 browser write：项目 create、工作项 create/update，结果通过（`/private/tmp/vue2-pms-project-ui-lifecycle-verified.log`）。项目创建表单同时接入 Vue3 同宽 `760px` 的共享 Dialog，实际页面测试全屏往返保留项目名称。项目/工作项 `12/43` 已按唯一 marker 核对、回收、删除并验证 not-exists；journal `/private/tmp/v2-e2e-52fc925407f0-pms-lifecycle.json` cleaned=true。原有业务数据未改动。
- 项目 UI 测试早期两轮仅在路由探测/路由返回值序列化处失败，没有创建 fixture；已使用 Vue Router 3.4.9 实际支持的动态菜单表与不返回路由对象的页面导航调用修正测试，不修改业务路由做兼容。该轮全量 **218 脚本 + strict 148 契约通过**（`/private/tmp/vue2-pms-project-ui-suite.log`），写入安全测试与 12 个认证调用者锁测试再次通过；认证恢复 mode 600、refresh-only、无残留锁。
- 本轮真实写入脚本与安全测试加入后，全量 **218 个静态/组件行为脚本 + strict 148 项契约通过**（`/private/tmp/vue2-pms-real-lifecycle-suite.log`）。真实写入通过结果独立见下文，未将静态数量替代业务闭环范围。
- PMS 首个真实写入闭环通过（`/private/tmp/vue2-pms-real-lifecycle-final.log`）：通过 API 创建唯一标记的私有项目作为 fixture，实际页面创建任务、读取详情校验、列表打开编辑、更名保存，再由真实 API 与主表体回读确认。浏览器只放行该项目/唯一标记下的一次 create 与一次 update，不添加他人、负责人、标签、附件、关联工作项或迭代；后端默认把当前操作者加入参与人，所以仅允许保留该本人。项目创建是 API setup，不能称为项目创建 UI 已验收；附件/审批/工时/迭代等写链路也不在此证据内。
- 该写入测试每次 finally 先核对 projectId/name/description 唯一标记，再回收并删除项目，检查项目和工作项返回各自明确的 not-exists 错误码。三轮 fixture 均确认清理：项目/工作项 `9/40`、`10/41`、`11/42`；对应 `/private/tmp/v2-e2e-b250da6df910-pms-lifecycle.json`、`/private/tmp/v2-e2e-c85adf8037c4-pms-lifecycle.json`、`/private/tmp/v2-e2e-2b899547aac9-pms-lifecycle.json` 的 cleaned 均为 true。前两轮失败分别来自过严的测试成员白名单、Element UI 固定列重复行选择器，未作为业务代码缺陷处理；最终按本人白名单与主表体选择器复跑通过。原有项目数据未修改。
- 新增 `pms-lifecycle-browser-test.js` 默认拒绝运行，须明确 `PMS_ISOLATED_WRITE=1`；静态 suite 排除真实写入入口。`pms-lifecycle-safety-test.js` 验证开关先于认证/网络、精确 origin/endpoint/method/项目/工作项/marker、本人参与人和拒绝重复请求/附件/关联对象。认证锁测试更新为 12 个调用者；最终 auth 状态已复核 mode 600、refresh-only、无残留锁。
- 本轮 PMS 四表单 Dialog 接入后，全量 **217 个静态/组件行为脚本 + strict 148 项契约通过**（`/private/tmp/vue2-pms-dialog-suite.log`），其中已包含新增共享 Dialog 契约。四表单真实浏览器及实际应用工作台/知识库回归通过，改动 diff 检查通过；本轮未重复运行完整构建，前述共享 Dialog 构建是此前单独执行的证据。
- PMS 四个表单继续接入共享 Dialog：工作项 `900px + scroll + 55vh`、公告 `680px`、知识库上传 `560px`、文档编辑 `defaultFullscreen + fullscreen + title slot`，逐项与当前 Vue3 对照；移除工作项另设的 `62vh` 内容滚动限制。真实四表单浏览器测试验证宽度/滚动区、全屏不丢值、保存关闭后内容销毁，并继续验证附件数组、知识库元数据和连续迭代入口。PMS 运行时检查支持并验证本地注册 canonical Dialog 的 value/input，来源 model 必须与目标一致，非简单放宽语法禁令。
- PMS 工作台与知识库实际应用复测通过（`/private/tmp/vue2-pms-dialog-workbench-app.log`、`/private/tmp/vue2-pms-dialog-kb-app.log`）：工作项创建/详情、8 blur/9 Escape、知识库 15 步/0 跳过，各错误/写请求门禁均为 0。四表单提交仍为替身接口，不算真实后端写入；其他模块的共享 Dialog 接入仍待逐个迁移。
- 共享 Dialog/OA 接入后的完整开发模式构建通过（`/private/tmp/vue2-shared-dialog-build.log`），产物位于独立临时目录 `/private/tmp/vue2-dialog-build.6fVjWv`，未覆盖用户已有构建目录。
- 新增 Vue2 共享 `Dialog` 并接入 OA 考勤编辑，补齐参照的默认 40% 宽度、标题操作、拖拽、全屏/默认全屏与重开重置、滚动高度、loading 内容替换、关闭期间 footer 禁用和关闭后销毁内容。复用 Element UI 的关闭拦截与弹层行为，不复用会覆盖 document 全局鼠标处理器的旧拖拽指令。真实 Vue2/Element UI 浏览器测试验证这些交互及 `before-close` 拒绝关闭；实际 `1029 → 49095` OA 页面验证全屏切换保留编辑值、取消后 textarea 真正销毁，全部错误/写请求门禁为 0（`/private/tmp/vue2-oa-dialog-fullscreen-app.log`），编辑记录仍为 1 个精确 GET fixture。
- 共享 Dialog 本轮既有全量 **216 脚本 + strict 148 项契约通过**（`/private/tmp/vue2-shared-dialog-suite.log`），新增 `dialog-contract-test.js` 随后单独执行通过，不能把它算入该次 216 脚本。Dialog 保留源的组件名，因此定向 ESLint 显式关闭旧仓库名称规则和 reserved-name 规则，其他检查通过。共享组件目前仅接入 OA 考勤表单，其他迁移页面尚未批量替换；不声明所有模块弹窗已经对齐。
- canonical 知识库上传切换及旧组件移除后，**216 个静态/组件行为脚本 + strict 148 项契约再次全量通过**（`/private/tmp/vue2-kb-canonical-upload-suite.log`）；四表单真实组件浏览器测试、PMS 77 SFC 运行时绑定检查再次通过。隔离应用知识库/模板 15 步、0 跳过、全部错误/写请求门禁为 0（`/private/tmp/vue2-kb-canonical-upload-app.log`）。这些结果仍不代表真实上传/业务提交写链路完成。
- 知识库上传续迁：`KnowledgeFileUploadForm` 与 `KnowledgeDocumentUpdateForm` 均恢复源的共享 `UploadFile`，保留各自文件类型/100 MB/单文件限制，Vue2 的 `input` 与 `update:fileSize` 分别回填内容和字节大小。`pms-attachment-browser-test.js` 现覆盖四个实际 PMS 表单，在真实 Vue2/Element UI/UploadFile 下验证知识库上传自动标题、扩展名、7 字节大小回填、编辑删除清空大小、替换后精确提交与原有项目附件/迭代测试；接口替身不算真实后端写入。旧知识库专用上传组件确认无调用方后移除，原文件已备份至 `/private/tmp/vue2-kb-upload-retired.m5jatP/KnowledgeFileUpload.vue`，可恢复。PMS 运行时契约现要求 canonical 上传组件，不再接受旧上传适配器。
- OA 实际应用再次复测通过（`/private/tmp/vue2-oa-attendance-deep-recheck.log`）：前后端 `1029 → 49095` 预检一致，管理/我的考勤/周月报全部通过，各错误与写请求门禁为 0；管理列表仍为空，编辑对话框用了 1 个精确 GET fixture，周/月报各返回 11 行真实数据。未执行打卡或修改考勤，不将只读回归和 fixture 弹窗等同于真实写入完成。
- 本轮 PMS 收尾全量回归通过：**216 个静态/组件行为脚本 + strict 148 项契约**（`/private/tmp/vue2-pms-attachments-final-suite.log`）。随后 OA 独立行为测试补强并由主线程复跑通过，覆盖编辑重开清旧值、精确 payload、校验不通过不写入、周报跨年周一/周日边界与异常恢复、月报数字年月及重置。OA 本轮未确认新的业务遗漏、未改生产代码；Vue3 Dialog 的拖拽/全屏/默认宽度/关闭销毁与 Vue2 普通弹窗仍有 UI 能力差异，不能声明 OA 完整等价。
- PMS 附件及提交续迁：工作项表单、项目公告表单已恢复源相同的 canonical `UploadFile v-model="formData.fileUrls"`，删除旧 FileUpload 的逗号串转换与工作项额外上传限制。真实 Vue2/Element UI/UploadFile + 实际两个表单的浏览器测试覆盖上传、含逗号 URL 保持单个数组项、新增/更新 payload、删除、重开清空；接口与上传传输是替身，不算真实后端写入。
- 上述浏览器测试另复现迭代入口串值：先从迭代 31 新建再从 32 新建，旧延迟 `resetFields()` 将新入口覆盖成 31。已移除重复字段重置，仍通过默认数据初始化与 open 后 clearValidate 清理状态，连续不同迭代入口测试通过。状态配置更新则删除 `status.projectId || this.projectId` / `workItemType` 的兼容兜底，仅新建使用当前上下文，已有状态原样提交；独立行为测试验证临时 ID 回填到初始状态、排序、看板及错误时 loading 恢复。
- 实际隔离 PMS 工作台/项目工作项浏览器复测通过：`1029 → 49095`，工作台、详情、列表、创建表单、导入与所有工作项入口，以及 8/8 blur、9/9 Escape；各错误/写请求门禁为 0。该次复测的状态设置入口受权限控制，未伪称真实状态写入完成；状态提交 payload 由独立替身行为测试验证。
- 本轮目录命名修复后的全量迁移回归通过：**215 个静态/组件行为脚本 + strict 148 项契约**（`/private/tmp/vue2-directory-names-suite.log`）。permission 模块定向 ESLint、改动 diff 检查及真实浏览器二次复测通过；本轮没有重新执行完整生产构建，不能把前轮构建结果标为本轮新结果。`getDicts` 导入、API 导出与 Vue 原型挂载均保留。
- 目录路由重名续迁：参照 Vue3 对父子同名目录的处理，在菜单扁平化之前统一分配冲突目录名，保留业务叶子 componentName、URL、缓存标识以及兄弟菜单；同时避免占用静态路由名。真实 `1029 → 49095` 应用审计确认动态内部重名和动静态名称冲突均为 0，覆盖此前 Demo/Express/PickUpStore/Ai/Im 五组问题。新增真实 Vue Router 匹配测试验证按名称和 URL 导航、静态名称预留与侧边栏一致性。邮件深链及可编辑/只读交互通过；启动阶段仍捕获 12 条其他 warning、3 条路由切换 GET abort，未将它们隐去或宣称全程零告警。
- 本轮共享 WangEditor 收尾后 **214 个静态/组件行为脚本 + strict 148 项契约通过**，完整构建通过。实际邮件深链与创建/只读交互复测通过；PMS 知识库/模板 15 步（0 skip）复测通过，所有页面/控制台/HTTP/API/网络/写请求门禁为 0。知识库测试首轮过早关闭弹窗取消模板图片请求，现等待真实编辑器内容图片加载完成再关闭，不忽略网络失败。
- 浏览器登录状态互斥改为真实状态文件路径派生的稳定锁键，覆盖全部 11 个刷新状态的浏览器脚本；统一先锁后读、刷新与写回期间保持锁。同文件跨 origin、token 轮换、symlink 与跨进程竞争、JSON 解析失败释放均有测试，不再使用会随 token 变化的锁键。
- 修复 9 个 `__smoke` 静态路由占用生产组件路由名的问题：仅烟测 name 增加 Smoke 后缀，路径及组件不变；新增所有烟测入口不得占用 canonical name 的约束。剩余动态容器 Demo/Express/PickUpStore 重名以及 Ai/Im 动静态容器冲突仍待对齐；邮件启动阶段 17 条 warning 单独保留，不能与交互阶段 console 门禁为 0 混为“全程无告警”。

- 共享 Editor 已进一步从 Quill 迁至同版本 WangEditor 5.7.0，而非仅映射属性：提供真实 `change(IDomEditor)`、`getEditorRef()`、深合并 editorConfig、目录区分的图片/视频上传、字符串/数字高度与动态只读；上传固定读取 `response.data`，不复制源中的双层响应兼容分支。全仓无旧 Quill/on-* 消费者，旧实例事件随内核退役；value/input、旧 readOnly 属性和用户要求的 getDicts 均保留。外部替换内容先清理失效选区，真实浏览器回归不再出现 Slate DOM/offset 错误；只读工具栏图片动作不可触发文件选择器。
- 公众号草稿 NewsForm 恢复使用共享 Editor 并传入完整 editorConfig。明确 server 配置优先于默认 infra customUpload，防止深合并后的默认上传器吞掉公众号接口；真实 WangEditor 文件选择上传测试使用拦截端点，验证 accountId/type 查询参数、租户/认证头、素材接口及 customInsert 返回值，且默认 infra 上传器未调用。测试未连接公众号外部服务或写入后端数据。

- 本轮共享组件续迁后，全套 **212 个静态/组件行为脚本 + strict 148 项契约通过**，完整开发构建通过。FormCreate 补回与源一致的 Editor、UploadFile、UploadImg、UploadImgs 四种设计规则（此前只移除了旧入口）；真实 FormCreate + Vue2 + Element UI + Quill 浏览器验证四个菜单、富文本插入/编辑、源格式只读/字符串高度规则渲染通过。
- 新 canonical `UploadFile` 使用现有固定响应上传适配器，支持 source 的目录、自动/手动、拖拽、禁用下载态及字符串/数组 model；不再把 canonical 名称指向旧 FileUpload。旧 FileUpload 与 getDicts 保留。真实 Element UI 浏览器验证上传完成、删除、手动提交、禁用态和重置；传输使用测试替身，无真实文件或后端数据写入。组件测试补充批次部分失败时成功项仍回填，四种属性面板与 Vue3 源规则深比较通过。
- BPM 打印编辑器完整应用入口已通过：`1029 → 49095` 模型创建页第 4 步、打印开关、编辑器 toolbar、撤销重做、`@endTime`、图片、普通表格和流程记录，确认回填再打开保持一致；modelId 为空、未保存/发布模型，所有错误和写请求门禁为 0。
- 共享 Editor 补齐字符串/数字高度、canonical readonly 和已有 readOnly 调用的动态禁用，以及 change 事件通道。实际邮件页面验证新增表单 200px/可编辑、测试发送 150px/不可编辑，所有错误/写请求门禁为 0。仍使用 Quill，editorConfig/directory/getEditorRef 和 WangEditor 对象 API 不在本轮“完整等价”结论中，后续仍须迁移。

- WangEditor 普通表格已新增实际浏览器操作：插入 2×2 表格、增加行、增加列至 3×3；图片、mention 与流程记录混合保存后重新打开验证。此时全套静态/行为回归为 211 个脚本 + strict 148 项通过；仍与真实后端写入验收分别记录。

- BPM 打印模板已从手写 contenteditable 改为与参照相同的 WangEditor 5.7.0 内核，通过 Vue2 非响应式实例直接挂载 Editor/Toolbar，不引入 Vue3 wrapper。流程记录模块已恢复真实 Slate inline/void、snabbdom 表格及 HTML 序列化；mention 使用官方 2.0.0 插件。无鉴权真实 Vue2/Element UI/Chromium 测试已验证网络图片插入、撤销/重做、`@` 搜索字段、流程记录、确认重开和销毁；完整构建及宿主生命周期测试通过，真实应用入口/普通表格操作仍在继续验证。
- PMS 行内编辑真实回归通过：8/8 blur、9/9 Escape，数据未改变，写请求及所有错误门禁为 0。补齐四个自定义 Select 的事件转发，对数字/日期控件保护 Escape keydown，避免父级 Drawer 先关闭而吞掉后续 keyup。

- 当前这一轮全套回归为 **208 个静态/组件行为脚本 + strict 148 项契约通过**，覆盖 19/19 模块；开发模式完整构建通过。该数量仅指此轮脚本集合，不表示全部功能已经完成迁移验收。

- 本轮继续删除 BPM 打印预览的字符串、`data.html` 和 JSON 文本兼容分支，固定消费 `response.data` 结构化打印协议；新增行为回归验证解析调用顺序及请求失败后的 loading 清理。邮件详情、代码生成预览恢复 `v-dompurify-html`，表单设计器补回 JSON/XML 高亮；未知扩展名代码按文本转义，真实 Chromium 验证危险源码仍完整可见且不产生可执行节点，高亮样式节点保留。DOMPurify 六类攻击载荷与更新/销毁测试通过。
- PMS 12 个实际菜单在 `1029 → 49095` 复跑通过 12/12，页面、控制台、HTTP、接口业务码、格式及请求失败门禁均为 0。修复 TagsView 在 nextTick 前捕获过期/缺失 refs 引发的路由切换异常，补充初次渲染、重定向、查询同步及销毁场景测试。这是只读菜单回归，不代表 PMS 写入闭环完成。`getDicts` 的原导入、API 导出和 Vue 原型注册保留。

Vue3 在 10:00 更新到 `aab14fb0e74720dd09e964ae066f8bbde9f9012e`，新增 PMS 和 OA，当前业务模块共 19 个。下方 344/344 动态路由、183 个静态脚本及构建数据属于更新前 17 模块的验证记录，不能证明新增模块完成；此前整体 88% 的估算已失效。

- 全模块契约现在从 Vue3 当前目录动态发现模块。新增 OA attendance 及 PMS 六个功能切片的文件/API/端点契约后，strict 恢复通过：148 项精选契约、19/19 个模块覆盖（这是静态覆盖范围，不是功能完成率）。PMS 切片从当前参照枚举全部 77 个 SFC、29 个 API 文件，新增目录未分配切片会直接失败；完整浏览器和写入验收仍须单独证明。
- OA attendance 的 6 个 Vue2 页面、9 个接口、2 类枚举已迁入；定向测试通过。`1029 → 49095` 的考勤管理、我的考勤、统计报表 3/3 动态路由浏览器复测通过，所有接口/渲染/控制台/网络错误门禁为 0；懒加载月报页签、打卡/编辑/删除写入链路尚不在该只读路由测试证据中。
- OA 全菜单扫描另有明确失败记录：隔离后端返回 13 个 OA 菜单，3 个考勤页面通过，10 个公告/通讯录/讨论/首页/邮件/便签/计划/日程/任务相关菜单因 Vue3 当前参照中也不存在对应前端页面而失败。保留该菜单与参照代码不一致的记录，不删除菜单、不伪造占位页面；随后仅按参照现有 attendance 范围复跑通过，不将其表述为后端所有 OA 菜单通过。
- PMS 的 29 个 API 源文件、144 个导出函数和端点逐项对齐；标签管理/表单/选择器、工时登记/汇总组件及公共常量、格式化、权限工具已迁入。标签及工时的模板编译和行为测试通过，项目中心、工作项主体、迭代、知识库及路由集成仍在迁移。
- 新 JDK25 服务运行于 `49095`，健康状态 UP，PMS 项目和 OA 考勤控制器已确认加载。OA 类来自 `yudao-hrm-all/ruoyi-vue-pro-jdk25/yudao-module-oa` 的本地编译产物。Vue2 `1029` 已切换代理 `49095`，HTTP 200、开发构建成功；Vue3 参照前端位于 `1030`。
- PMS 项目表单、项目/迭代成员选择器、迭代创建/启动表单、项目分组管理、归档和回收站已迁入。新增项目管理行为测试覆盖 4 个 SFC 的分页、恢复/彻底删除确认、分组新增/编辑校验、拖动排序、权限开关和异常状态恢复；属于组件行为验证，尚不计真实数据库写入闭环。
- PMS 项目中心列表与项目设置的 7 个组件继续落地。`pms-project-list-test.js` 验证项目范围 URL、Element UI 字符串页签到数字查询条件、星标趋势、分组移动与生命周期确认；`pms-project-config-test.js` 验证公告附件数组、成员级别和创建者按钮保护、归档/回收站跳转、协作类型筛选与设置页签 URL。两脚本均通过；浏览器验收需等待在迁移中的迭代列表/详情等依赖及静态路由闭合，不能用单组件编译替代全应用构建。
- 随后项目/迭代详情依赖与全部 7 条 PMS 隐藏路由已接入。`pms-router-test.js` 对比 Vue3 父路由及 7 条页面的路径、名称、组件和完整元数据，并验证公开分享匿名入口及私有文档保护；AppMain 支持这些路由的 `viewKey` 工作区复用。Node 22 全量 `build --mode dev` 成功（16.06 秒），知识库内容的 27 个 SFC 与 14 组行为测试通过。PMS 实际浏览器交互正在继续，尚无全模块通过结论。
- 项目模板两页随后完成，事项类型/状态/看板联动、排序、唯一初始状态与跨类型关联校验的 8 组行为测试通过。真实工作项详情暴露的空工时 `null 小时` 已修正为 `--`，保留 `0 小时`；这是展示边界修正，不改 API 返回形状。优先级色值保留主题变量并附 Element UI 默认颜色，避免依赖先访问 IM 才注入的全局 CSS。
- 全量静态回归曾发现新下载入口与旧 BPM 全局路径禁令冲突，已收敛为 `utils/download` 委托既有 `plugins/download` 的常规下载方法，仅保留源特有画布/Base64 能力；测试锁定无重复 Blob 内核及原 BPM 调用方边界。修正后 Node 22 全量静态套件通过；工作台/工作项只读浏览器的查询、页签、行内编辑打开、详情、表单/导入弹窗与看板/列表切换通过，所有错误门禁为 0，未提交写入。状态配置因权限入口隐藏，测试通过组件实例只读打开验证，不算该权限入口已验证可见。
- PMS 隐藏路由首次完整浏览器回归发现知识库分享和文档详情缺少 `dompurify-html` 指令，真实告警未忽略。现已增加与 Vue3 锁版本一致的 DOMPurify 3.3.1 和 Vue2 全局指令，恢复源富文本渲染/过滤语义；独立无认证 Chromium 测试验证安全富文本、6 类恶意输入、更新/空值/解绑，全部通过。FilePreview 同步修正未声明下载权限的默认值和 nullable fileType，与源行为一致。
- 工作项详情也已移除手写 HTML sanitizer，使用同一源语义指令，core 定向测试复验通过。安装安全渲染依赖并同步当前依赖锁后，全量开发构建再次通过（71.36 秒）；旧 202 脚本记录仍是此前全量结果，新增指令契约/真实 DOM 回归的证据单独列出，不冒充已重跑同一全量套件。
- 上述修复后 PMS 全部 7 条隐藏路由真实浏览器复测通过、0 跳过，所有写请求/页面/控制台/HTTP/API/格式/网络门禁为 0；另有项目与迭代详情 8 步真实只读交互通过（待规划/Gantt/工时/页签前后退/迭代编辑弹窗等）。项目模板、知识库深层操作与 OA 周/月报等专项验证仍在继续，不以这些路由结果代替完整写入验收。
- OA/PMS 工作台专项脚本曾因旧默认值使用 `49094` 刷新认证、页面经 `1029` 代理访问 `49095`，这份混合服务证据已作废并纠正。新增共享 `browser-backend-preflight.js`，在认证刷新之前从监听前端端口的存活进程核对显式 `VUE_APP_PROXY_TARGET`，不输出完整进程环境；故意指定旧后端时提前失败，认证文件 hash 不变且不创建锁。当前动态菜单、隐藏路由、PMS 详情/工作台、OA 和 KB/template 脚本均接入预检。
- 统一 `1029 → 49095` 后 OA 与 PMS 工作台专项完整复跑通过，全部错误与写请求门禁为 0。OA 覆盖管理/我的考勤筛选与日期重置、编辑弹窗只读检查、周报上一周/重置、月报懒加载和月份筛选；管理列表为空，因此编辑弹窗用了 1 个精确 GET fixture，不把它当作真实记录编辑成功，也从未执行打卡、修改或删除。
- DOMPurify 与后端预检接入后的全量静态套件再次通过：204 个静态脚本 + 148 项 strict 契约（19/19 模块覆盖）。知识库/模板深层浏览器、全部 PMS 运行时绑定审计和非 PMS 富文本渲染语义审计仍在继续；这些计数不替代功能或写入链路验收。
- 工作项核心和状态组件、知识库 library/template 已有定向编译和契约证据；项目详情、迭代详情、工作台、知识库内容以及项目中心剩余配置仍在继续迁移，暂不声明 PMS 全模块完成。
- IM 的 58 个 SFC 注册和 9 个命名 model 绑定修复后，消息查询的空收件人条件改用列表类型，2 项数据库回归测试通过。隔离后端更新后 4 条 IM 页面路由通过浏览器复测，各错误门禁为 0；其中首屏 1 次自动标记已读由浏览器精确本地模拟，未写入后端，不计为真实写链路。
- PMS 后端测试执行 236 项：234 项通过，2 项因 `PmsWorkItemActivityServiceImplTest` 缺少 `PmsWorkItemLabelService` 测试依赖而报错；本轮未修改该后端测试。
- 已纠正 `/crm`、`/ai`、`/pay` 父路由名称和 `/job/job-log` 的 `InfraJobLog` 名称，删除旧 `/job/log`。路由 AST 定向测试通过。

以上是进行中的迁移记录，未声明全仓功能或新增模块浏览器验收完成。

## 1. 范围与基线

| 项目 | 路径 / 版本 | 说明 |
| --- | --- | --- |
| Vue2 目标 | `/Users/yunai/IdeaProjects/test/yudao-ui-admin-vue2`，HEAD `01be9437dcda5d0d16c5d909f8958e1464c1e624` | Vue 2.7、Element UI；本轮改动尚未提交 |
| Vue3 参照 | `/Users/yunai/Java/yudao-ui-admin-vue3`，HEAD `0f73d3022c835edb839227b390e5daa0b1dcce27` | 逐页、逐 API、逐设计器模块对比 |
| 隔离后端 | `/Users/yunai/Java/ruoyi-vue-pro-jdk25`，验证时 HEAD `8e43004cf68a405cd3485f98f8a539b97ca6544a`，单体端口 `49094` | JDK 25；System/Infra/BPM 与业务模块同进程，IoT 与 TDengine 已启用；后端工作区既存改动未触碰 |
| 工作区边界 | Vue2 既有 `output/` 测试产物保留 | 未提交、未清理用户文件 |

## 2. 已对齐并有证据的能力

- 分类、模型、流程定义、流程实例、任务中心、OA 请假、流程表达式、流程监听器、用户组和表单管理的主页面、历史菜单入口及 CRUD 表单。
- form-create Vue2 适配：系统字段、用户/部门/字典/API/地区/iframe 组件，设计器扩展，以及 `ep:*` 图标、下载和时间工具适配。
- 模型导入/导出：`multipart/form-data` 导入 JSON，导出 `/bpm/model/export?id=...`；导出下载已在浏览器捕获。有效导入未提交，避免污染共享租户。
- 模型复制、保存/发布防重复提交、流程定义详情直接读取后端 `/bpm/process-definition/get` 返回的 `bpmnXml`；页面与 API 均使用 Vue3 当前名称、endpoint 和固定 `response.data` 响应语义，不再保留旧响应形状或字段别名。
- 用户组统一使用后端 `userIds`，流程实例管理筛选改为后端实际接收的 `processDefinitionKey`；OA 请假使用 `status` 并保留已结束申请的重新发起入口。
- 发起流程页面的表单/流程图标签、审批预览、START_USER_SELECT 人员选择及字段权限；详情时间线的审批人选择、任务证据、附件预览和运行态简单流程节点状态。
- 详情操作按钮读取任务 `buttonsSetting`；原本仅 URL 输入的签名弹窗已替换为 Element UI + 原生 canvas 绘制、清空、上传和成功回填，并接入审批操作。
- SimpleProcessDesignerV2 的八类内置节点均已拆出专用 Vue2 + Element UI 抽屉：`StartUserNodeConfig.vue`、`UserTaskNodeConfig.vue`、`CopyTaskNodeConfig.vue`、`ConditionNodeConfig.vue`、`DelayTimerNodeConfig.vue`、`TriggerNodeConfig.vue`、`RouterNodeConfig.vue`、`ChildProcessNodeConfig.vue`。配置 schema 会递归归一化旧 JSON、保留嵌套字段并执行节点级校验；静态检查确认 8/8 不再把内置节点折叠到 Generic 兜底，浏览器已实际打开并操作八类抽屉。候选人 ID 解析保留超出 JavaScript 安全整数范围的原始字符串，避免打开重存时破坏后端 Long；复合 ISO 时长（如 `PT1H30M`、`P1DT2H`、`PT30S`）按可编辑的最小分钟单位解析，不会把秒误当小时。ChildProcess 下拉选项沿用 Vue3 的索引 key，能够容纳后端返回的重复流程 key 而不触发 Vue 警告。
- 标准 BPMN 设计器已补齐 UserTask、ServiceTask、CallActivity 的核心配置，执行/任务监听器模板选择，多实例审批方式，消息/信号增改删与引用保护，以及 Flowable 时间事件和自定义扩展面板；SendTask/BusinessRuleTask 复用服务任务面板。CallActivity 采用与 Vue3 相同的 `calledElement` 手动输入，不再额外加载模型列表或保留第二套下拉，避免重复 key 和两套流程标识语义。UserTask 候选人配置按 descriptor 分支：Flowable 写 `CandidateStrategy/CandidateParam` 扩展，Activiti/Camunda 写各自 `Assignable` 顶层属性，避免非 Flowable 创建未知 moddle 类型。打开普通单实例 UserTask 只推断/展示当前状态，不会自动写入多实例 loop；只有明确切换多人审批方式才更新 BPMN。边界超时面板保留已存在的秒级 ISO 表达式，直到用户主动编辑时长。
- 模型更多设置已接入打印模板编辑器、标记解析、`@` MentionModal 以及四类 HTTP 通知参数编辑；标记协议与 Vue3 对齐。BPMN/SIMPLE 设计器切换时会清空并校验旧 modeler 引用，避免属性面板挂到已销毁的注入器。
- Vue3 的 canonical 入口已补齐：`src/views/bpm/form/editor/index.vue` 转发完整表单设计器，`src/views/bpm/model/form/editor/index.vue` 暴露 `modelId/modelKey/modelName/value` 与 `success/init-finished` 事件，`CategoryDraggableModel.vue` 承载分类内模型排序、权限动作和表单预览；`ProcessDesign` 会把 BPMN/SIMPLE 保存结果和 modeler 初始化事件向上转发，避免入口只存在文件而没有可用事件链。
- OA 创建/详情、表单编辑、流程定义、模型创建/编辑、流程发起、实例详情/报表等瞬态路由已采用 Vue3 同款隐藏/不缓存元数据；列表页仍保留 keep-alive 语义。详情路由显式传递 `id`、`taskId`、`activityId`；普通/业务表单枚举统一按数值归一化，业务发起路由和重发起流程按表单类型分流。Simple viewer 的可选 `simpleJson` 不会覆盖 `modelView` 初始化结果。
- 详情操作按钮已按后端状态语义收口：取消对所有非结束实例开放，减签仅在存在加签子任务时显示；撤回保留在“已办任务”历史任务入口，详情待办栏不再调用不适用的撤回接口。

## 2.1 针对反馈帖的对应关系

反馈帖指出的“自定义配置界面”和“任务分配规则入口”现在分别落在 Vue3 同款设计路径中：

- 标准 BPMN 设计器选中 UserTask 后，右侧属性面板的“自定义配置”提供操作按钮启用/显示名、表单字段只读/编辑/隐藏，以及拒绝、超时、审批人与发起人相同等规则；Simple 设计器的 UserTask/CopyTask 抽屉也提供相同的字段权限与按钮设置。
- 任务分配不再依赖独立的 `taskAssignRule` 页面或死接口（Vue3 最新版也没有该独立页面），而是在 UserTask 的“规则类型/候选策略”中配置角色、部门、岗位、用户、用户组、表单字段和表达式，并写回 `candidateStrategy/candidateParam`。这正是流程编辑页内的任务分配入口。
- “一级审批决定是否进入二级审批”仍是业务建模选择：不开发后端扩展时，应在表单中增加条件变量并在条件分支使用；若要求审批人点击通过时临时选择下一路径，需要把选择值作为流程变量提交并扩展审批操作，本轮没有虚构已实现该后端能力。
- 表单建议只保存申请业务数据；每位审批人的意见由任务/审批记录保存，避免多人会签覆盖同一个表单意见字段。

## 3. 已知边界（不把抽样通过冒充全量 1:1）

### 3.1 Simple 设计器（P1）

当前八类内置节点均有独立 Vue2 + Element UI 表单；`GenericNodeConfig.vue` 仅作为未知/历史节点 payload 的高级 JSON 兜底。专用表单已覆盖抄送候选策略、发起人权限与字段权限，但不等同于 Vue3 的全部交互细节。

仍需逐项回归：候选人策略的全部视觉分支、会签/加签/超时/按钮与字段权限的细节、监听器和子流程变量映射的边界组合，以及八类节点在组合/重开后的数据保持。Element UI 抽屉动作已改为默认 slot，避免 Vue3 `footer` slot 在 Vue2 中导致按钮不渲染。

### 3.2 BPMN 设计器 descriptor（已完成语义对齐，仍需真实 UI 回归）

三份 descriptor 已与 Vue3 参照做语义深对比：`src/components/bpmnProcessDesigner/package/designer/plugins/descriptor/flowableDescriptor.json` 共 67 个类型，Activiti/Camunda 的通用类型也保留了 `Assignable` 的 `candidateStrategy`、`candidateParam` 字符串属性；CallActivity、TaskListener、时间事件、字段权限、按钮、会签和自定义扩展类型均可被当前 bpmn-moddle 解析。与 Vue3 JSON 的六处差异是有意保留的属性命名差异（`ButtonsSetting` 的 `id/enable/displayName`、`FieldsPermission` 的 `field/title/permission` 使用无命名空间属性），原因是后端 `BpmnModelUtils.addExtensionElement(Map)` 写入无命名空间，而解析端按无命名空间读取。已用 bpmn-moddle 做自定义扩展、CallActivity 输入/输出、边界定时器和监听器 round-trip，结果保持不丢字段。

剩余工作是用浏览器在不同 `prefix`（Flowable/Activiti/Camunda）下逐面板保存、重新打开并导出 XML，确认真实 UI 操作与 descriptor round-trip 一致；非 Flowable 前缀不会挂载 Flowable 专属自定义配置，且标准 UserTask 已改用 descriptor 支持的候选人属性，避免创建未声明的 moddle 类型。

### 3.3 API、权限和菜单

当前主页面已按隔离后端实际契约使用 `/bpm/process-definition/get`、`bpmnXml`、`userIds`、`status` 等字段；已逐项核对 Vue3 API 导出和调用方，清理旧响应形状 fallback、字段别名、死 endpoint、任务分配规则死接口及孤立页面。业务 API 调用统一读取 `response.data`，不再同时兼容 `response`、`response.data`、`records/list` 等多种形状。

System 的 `getDicts` 是明确保留的 Vue2 公共入口，不属于本次需要删除的响应兼容层。`src/api/system/dict/data.js` 继续导出它，`src/main.js` 继续保留 `import { getDicts } from "@/api/system/dict/data";` 与 `Vue.prototype.getDicts = getDicts`。自动化契约会锁定这三处入口；同时锁定前端不得增加“知识库列表加载失败，请确认 AI 模块已启用”这类由前端臆造的模块状态提示，模块状态以真实 API 结果为准。

`src/utils/formGenerator.js` 已标注为 external-only deprecated helper，BPM 运行时没有任何引用；`components/parser`、`generator`、`render` 仍由独立的 infra builder/外部集成使用，本轮不做破坏性删除。

Vue3 与 Vue2 共同保留的三个导出（`myTodoTask`、`getFormFieldsPermission`、`exportProcessExpression`）没有在本次单端删除：它们仍属于两端相同的导出契约，当前后端也未提供对应 mapping 且仓库没有调用方。静态契约测试会持续锁定两端相同的名称和 endpoint；若后端决定清理，应同步修改 Vue3、Vue2 与测试，而不是单独制造两端漂移。

模型行操作同时受前端权限指令、`managerUserIds` 所有权和后端权限约束。隔离租户的权限种子缺少 `bpm:model:import`、`bpm:model:export`；浏览器烟测只对权限查询响应临时追加这两个标识以验证入口渲染，没有放开生产权限，也没有提交有效导入。

### 3.4 打印与详情交互（P2）

打印模板标记解析、预览、保存协议和 `@` 键 MentionModal（搜索、回车/点击插入）已覆盖；本轮已接入完整 WangEditor 内核并补测图片、撤销重做等交互。源打印页明确排除 `group-video`，也未配置本地图片上传服务；视频插入和本地图片上传不能误列为该页对齐缺口。隔离环境已跑通普通审批写入，但真实签名上传、转办、加签及更多业务表单写入仍属于后续扩展回归范围。

### 3.5 模型表单边界

流程设计步骤采用懒加载；保存/发布会临时挂载该步骤执行校验并在结束后恢复当前页，发布按钮也有防重入 loading。隔离环境已完成“创建模型 → 部署 SIMPLE → 浏览器列表确认 → 浏览器发起 → 浏览器审批并确认状态为 2 → 清理流程实例和模型”的可回收 6 步写链路；它证明主写链路可用，但不等于所有表单类型、会签/加签组合和异常分支均已覆盖。

## 4. 验证矩阵

| 检查 | 结果 |
| --- | --- |
| 静态迁移检查 | Node 22 下 `npm run test:migration`：PASS；自动发现并通过 **183** 个静态脚本，strict parity 通过 **136/136** selected contracts。契约额外锁定 `getDicts` 的导出、导入与原型挂载、固定 `response.data` 响应语义，以及禁止伪造 AI 模块未启用提示。 |
| Vue2 构建 | Node 22 + `NODE_OPTIONS='--max-old-space-size=8192 --openssl-legacy-provider'`：exit 0，`DONE Build complete`；共 **8 个**既有 warning，类型为 CSS 顺序、产物体积、Browserslist/依赖弃用提示，无构建错误。 |
| Vue2 源码解析 | 183 个静态脚本中的 Babel + Vue SFC parser 检查全部通过；生产构建覆盖实际引用源码。 |
| 隔离后端 | JDK 25 Boot 单体 `127.0.0.1:49094` 提供 System/Infra/BPM 及业务模块；IoT 与 TDengine 已启用。 |
| 前端代理 | Vue2 dev server `127.0.0.1:1029`，进程 cwd 为目标仓库，代理指向隔离后端 `127.0.0.1:49094`。 |
| 主浏览器自动化 | `smoke-test.js` 完整结果：**318/324 通过，6 项跳过，0 项失败**。6 项均有明确的数据或外部依赖边界：BPM 导入/导出权限种子、ERP 无可继续入库采购订单、Mall 售后首条数据状态不具备驳回动作、历史/外部图片、音频导航中止、form-create 外部 iframe。最终门禁中 pageerror、业务 API 非成功码、业务 HTTP 4xx/5xx、未允许网络失败和业务控制台错误均为 0。 |
| BPM 真实写链路 | **6/6 步通过**：创建模型、部署 SIMPLE、浏览器确认模型列表、浏览器发起流程、浏览器审批并确认状态为 2、清理流程实例及模型；fixture key 每次随机，清理失败会使测试失败，且已验证前端代理与直连 actuator 属于同一 JVM。 |
| 动态路由 group1 | `ai,bpm,crm,mall`：**89/89** 路由通过，写请求拦截、pageerror、控制台错误、HTTP/API 错误和未允许网络失败均为 0。 |
| 动态路由 group2 | `erp,fms,hrm,mes,wms`：**156/156** 路由通过，写请求拦截、pageerror、控制台错误、HTTP/API 错误和未允许网络失败均为 0。 |
| 动态路由 group3 | `system,infra,member,pay,mp,im,iot,report`：**99/99** 路由通过；blockedWrites、pageErrors、consoleErrors、httpErrors、apiCodeErrors、malformedApi、requestFailures 均为 0。另有 ignoredExternalAssets 23、ignoredExternalTelemetry 0、ignoredResourceConsole 5，均为精准分类的外部资源或资源加载提示，不计入业务成功门禁。 |
| 数据边界回归 | 静态检查覆盖精度安全的候选 ID、`PT1H30M/P1DT2H/PT30S` 复合时长、普通单实例 UserTask 不自动变多实例、边界 PT30S 原值保留；Node22 构建通过 |
| 外部资源噪声 | 仅对已识别且与业务接口无关的历史图片、音频导航和外部 iframe 单列 skip；不会放宽同源业务 API、HTTP、pageerror 或控制台错误门禁。 |

浏览器测试仅对 BPM 导入/导出权限种子使用渲染 fixture，没有伪造业务 API 成功。BPM 写链路在隔离环境使用唯一 fixture 并执行可验证清理。认证只复用权限为 `0600` 的本地临时 storage state，并在 Vue 启动前预刷新；脚本输出、报告与 URL 诊断均不记录访问令牌或刷新令牌。同一认证状态由原子锁强制串行，避免并发刷新互相作废。

这些结果证明当前抽样范围的静态契约、构建、BPM 主写链路和三组共 **344/344** 条动态路由可用，但不能仅凭通过数量宣称整个 Vue3 → Vue2 仓库已达成 1:1。后续结论仍应结合真实菜单权限、深层交互和更多可回收写操作的证据。

## 5. 隔离运行记录

| 服务 | 地址 |
| --- | --- |
| JDK 25 Boot 单体（System + Infra + BPM + 业务模块，含 IoT + TDengine） | `127.0.0.1:49094` |
| Vue2 前端 | `127.0.0.1:1029` |

截至 2026-09-05，本轮最终环境使用独立 JDK 25 Boot 单体 `49094`，前端 `1029` 的代理指向该端口；IoT 与 TDengine 已在此环境启用。端口和进程属于本次验证快照，不把旧端口、旧进程或 Cloud 诊断结果混入当前结论。

## 6. 下一步优先级

1. 继续覆盖八类节点组合/嵌套 JSON 的保存重开回归，并在可回收数据集上验证专用表单写回。
2. 在三种 `prefix` 下逐面板保存并导出 XML，补齐标准 BPMN 设计器的真实 UI round-trip 证据。
3. 扩展 BPM 可回收写测试至转办、加签、会签、签名及不同业务表单；当前普通“发起 → 审批 → 清理”主链路已经通过。
4. 继续验证 WangEditor 的完整应用入口、结构化表格及格式操作；后续新增 API 继续维持 Vue3 名称、endpoint 与固定 `response.data` 语义，不重新引入响应兼容 fallback。
