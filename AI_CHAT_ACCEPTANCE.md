# AI 聊天逐功能验收登记

基线日期：2026-09-12。源：`/Users/yunai/Java/yudao-ui-admin-vue3/src/views/ai/chat/index/`；目标：`/Users/yunai/IdeaProjects/test/yudao-ui-admin-vue2/src/views/ai/chat/index/`。

## 口径与停止条件

固定以下25个功能组作为本清单分母，不因修复方便而增删。新增源功能需明确更新基线。每组必须覆盖本行全部行为才记“通过”；只覆盖一部分记“部分”。“未验收”包含未测试及历史证据尚未逐项复核，不等于未开发。

当前模拟接口浏览器验收：**通过25组、部分0组、未验收0组、已确认未修复失败0组（25组全部通过，模拟接口口径收官）**。真实后端整组验收：**0/25有完整证明；只读真实链路已有首证（ai-chat-real-backend-test.js：01列表74条真实会话分组/03真实搜索过滤/04+14点击真实会话真实Markdown表格渲染/09真实模型选择器kimi-k2.6/23角色仓库打开/知识库API真实4条）**。发送类与写入类组待用户确认后补验。这不是代码迁移率，也不是全项目测试覆盖率；AI模型管理、知识库、工作流及其他18个业务模块不在此分母内。

推进规则：从未通过组选择一个明确缺口，先复现，再修复并验证；无代码/依赖变化且已通过的专项不单独反复运行。通过后转下一组。全量套件用于变更回归，不计入功能组完成数。源码共同缺陷单列，不机械复制。每次交付须说明净新增整组通过数、剩余失败和待验收项。

## 功能组

源文件在上述源根目录下；子组件路径省略`components/`，重复文件名省略已出现的目录。方法名用于定位，避免行号漂移。浏览器状态指模拟接口隔离测试，真实后端列全部待验收。

| ID | 必须覆盖的源功能 | 源文件/方法 | 浏览器状态 | 当前证据及缺口 |
|---|---|---|---|---|
| 01 | 历史加载、时间/置顶分组、默认首项、URL指定会话、空列表 | conversation/ConversationList:getChatConversationList；index:mounted | 通过 | I验证URL指定存在→选中并仅一次消息GET(数值id)、不存在→回退默认首项且对不存在id零GET（源对不存在id多发一次GET属源缺陷，保留目标并固化）；分组/默认首项/空列表复用R/N |
| 02 | 侧栏/空态新建、刷新选中、清草稿附件 | ConversationList:createConversation；index:handleConversationCreateSuccess | 通过 | N验证侧栏/空态新建均调createChatConversationMy({})、恰一次列表刷新、新会话按时间/置顶归位并自动选中、父级清空prompt+uploadFiles、API拒绝时错误可见且不刷新/不切换/不冒创建事件；源无创建中防重复门禁，不记缺口 |
| 03 | 标题搜索trim、清空恢复及时间分组 | ConversationList:searchConversation | 通过 | R验证大小写敏感trim过滤、中文/无匹配、全空格与清空按钮恢复全部分组、无额外GET、默认选中不变；修复前目标误用toLowerCase致大小写不敏感，已按源改为大小写敏感includes |
| 04 | 切换加载/到底/清草稿附件、流式中禁止切换 | index:handleConversationClick | 通过 | SW验证切换消息API参数、scrollToBottom序列、清prompt+uploadFiles、开关不被重置、流式中点击被拦截($alert且不切换不加载)、停止后可切换；登记表疑点#3双端同序按源行为断言 |
| 05 | 重命名回填、拒绝空白、取消不写入、刷新标题 | ConversationList:updateConversationTitle | 通过 | CRUD验证回填/取消零API/空白拒绝/成功后恰一次刷新；重命名当前项向父级重发on-conversation-click(带新标题)，非当前项不重发 |
| 06 | 置顶/取消及重新分组 | ConversationList:handleTop | 通过 | CRUD验证置顶/取消参数(pinned:true/false)、刷新后跨组移动(一天前↔置顶)、按钮文案切换；置顶组内顺序按源行为断言 |
| 07 | 删除会话确认、列表刷新、当前项详情清空 | ConversationList:deleteChatConversation | 通过 | CRUD验证确认文案含会话名/取消零副作用/删除后刷新+事件(带会话)/删非选中保持选中；父级真实联动：删当前项→handleConversationClear清空详情 |
| 08 | 清空未置顶、保留置顶、当前详情清空 | ConversationList:handleClearConversation | 通过 | CRUD验证确认文案/取消零副作用/恰一次ByUnpinned调用/未置顶全清置顶保留/事件一次；父级清空仅activeConversationId/conversation/messageList（源不清草稿附件，目标原有多清prompt+uploadFiles两行已移除对齐源，SW组交叉确认） |
| 09 | 设定回填、CHAT模型、数值范围、必填、保存取消重开及父页面刷新 | conversation/ConversationUpdateForm；index:handleConversationUpdateSuccess | 通过 | W验证取消重开回填、CHAT模型下拉、保存后父级刷详情+列表（源仅刷详情，目标额外刷列表属超集保留固化）、头部/侧栏新值 |
| 10 | 按钮/Enter发送、Shift+Enter、IME、重复发送、空内容/无会话、推荐词 | index:handleSendByKeydown/doSendMessage；message/MessageListEmpty | 通过 | C+ST+ER合证：4001字/按钮/流式Enter不重复、Shift+Enter换行、IME合成中Enter拦截合成后放行、推荐词点击带词发送、空内容/无会话toast |
| 11 | 流式占位/首包/追加/推理、结束/失败/停止及附件参数 | index:doSendMessageStream/stopStream/textRoll | 通过 | C+ST合证：双占位、首包替换且附件覆盖、chunk与推理累积、code!==0分支(未收内容弹占位/已收不弹)、error回调复位不重试、结束停止保草稿 |
| 12 | 上下文/联网默认值、生成中可切换、每次请求参数独立 | index:enableContext/enableWebSearch/sendChatMessageStream | 通过 | C：首次true/false，生成中改false/true，不改变当前请求，下次正确透传 |
| 13 | 附件多选、5个/10MB限制、进度/成功/失败/移除/外部清空 | message/MessageFileUpload | 通过 | FU验证多选顺序累积、第6个整批拦截、>10MB单文件跳过(恰10MB放行)、进度/成功/失败三态与移除、外部清空同步、clearFiles；生产修复formatFileSize对齐源(0 B/两位小数) |
| 14 | 标准type、头像时间、Markdown、系统设定、推理显示展开 | message/MessageList/MessageReasoning；index:messageList | 通过 | M+RM合证：真实markdown-it+highlight.js渲染(代码块/复制/未知语言回退)、推理块默认展开/收起、头像(角色/用户/兜底素材差异记录)与时间格式 |
| 15 | 用户/助手复制及成功反馈 | MessageList:copyContent | 通过 | CP验证用户/助手复制按钮、clipboard逐字内容(含换行尾随空格)、toast"复制成功！"与源一致、clipboard缺失时execCommand回退；复制失败目标多 toast 属目标增强记录不修 |
| 16 | 单条删除、非持久助手隐藏按钮、成功后父列表刷新 | MessageList:onDelete；index:handleMessageDelete | 通过 | M+ST合证：直接删除/失败/重试/隐藏按钮、父级getMessageList刷新(计数+内容更新)、生成中删除门禁拦截 |
| 17 | 编辑回填草稿、重发原内容 | MessageList:onEdit/onRefresh；index:handleMessageEdit/handleMessageRefresh | 通过 | ER验证回填不trim/不切换/清列表零重载、重发原值透传+开关+附件快照、生成中刷新按源无门禁并发双流、空内容与无会话toast；生产修复3处对齐源（移除刷新门禁/清空成功提示、半角叹号） |
| 18 | 清空当前消息确认、conversationId、空态/系统设定 | index:handlerMessageClear | 通过 | CL验证无会话早退零API、确认框文案/标题/type按源、取消零副作用、确认后恰一次deleteByConversationId、成功后静默（源无提示）、systemMessage回退渲染/无设定显空态、失败catch不冒异常 |
| 19 | 进入/新消息到底、上滚暂停跟随、顶部/底部按钮 | MessageList:scrollToBottom/handleScroll/handleGoBottom/handlerGoTop | 通过 | SC验证进入到底、流式跟随、距底>100px暂停跟随+回底按钮、handleGoBottom恢复跟随、handlerGoTop回顶；父级真实联动含header回顶按钮；scrollToBottom(true)忽略暂停态与源一致 |
| 20 | 知识引用聚合、标题/数量、分段详情 | message/MessageKnowledge | 通过 | KN验证按documentId聚合保序、标题+数量徽标、弹窗分段详情切换、空/ null 不渲染；组件零API（纯展示） |
| 21 | 联网引用数量/展开/详情/关闭/原文/图标失败 | message/MessageWebSearch | 通过 | WS验证数量徽标、展开收起、详情字段逐字、访问原文window.open('_blank','noopener,noreferrer')、关闭不折叠列表、图标onerror隐藏兜底、空/null不渲染 |
| 22 | 消息附件名称/图标及打开原URL | message/MessageFiles | 通过 | MF验证27张卡片图标/色class映射(bmp/svg补齐、音视频归document+is-audio/is-video、csv归is-file)、名称URL decode与?#剥离、兜底'unknown'、点击打开原URL逐字、无附件不渲染；生产修复MessageFiles图标/类型/文件名三处对齐源 |
| 23 | 角色仓库开关、我的/公共、搜索/分类、分页/筛选重置 | role/RoleRepository/RoleList | 通过 | RL验证抽屉懒挂载开关、我的/公共tab参数、分类筛选与全部→空、搜索重置页码、滚动分页loading门禁（pending中重复触发被阻断）、筛选重置替换列表；疑点#2见下方：源公共列表裸loading属性恒真（禁用公共分页），目标保留动态loading，属目标更完整的有记录差异 |
| 24 | 我的角色新增编辑删除、刷新、公共角色操作隐藏 | RoleRepository/RoleList；跨目录ai/model/chatRole/ChatRoleForm | 通过 | RL验证跨目录ChatRoleForm完整契约：新增隐藏管理端字段、必填阻断、createMy/updateMy载荷与源默认一致、编辑按id回填(getChatRole)、删除直接deleteMy无确认（源一致）、成功后刷新当前tab、公共卡片隐藏编辑/删除 |
| 25 | 使用角色创建会话、关闭标签、正确路由参数 | RoleRepository:handlerCardUse | 通过 | RL验证createChatConversationMy({roleId})→tagsView.delView(当前路由)→router.replace({name:'AiChat',query:{conversationId}})按源顺序，路由/关签mock断言 |

## 证据索引

- C：`ai-chat-composer-browser-test.js`，`/private/tmp/vue2-ai-composer-final.log`通过。实际主SFC/EUI；流式API、消息子组件、附件选择为替身，无真实模型调用/上传。
- S：`ai-conversation-settings-browser-test.js`，`/private/tmp/vue2-ai-conversation-final.log`通过。实际表单/Dialog/EUI，API/枚举替身。
- M：`ai-message-actions-browser-test.js`，`/private/tmp/vue2-ai-message-actions.log`通过。实际MessageList/EUI，API/Markdown等子渲染器替身，无真实删除。
- R：`ai-conversation-search-browser-test.js`，本轮新跑通过（日志未另存，重跑命令`node ai-conversation-search-browser-test.js`）。实际ConversationList SFC/EUI；列表API、头像、角色仓库子组件为替身，无网络/业务写入。曾失败于大小写不敏感（`/private/tmp/vue2-ai-search-before.log`），生产代码已修复。
- N：`ai-conversation-create-browser-test.js`，本轮新跑通过。实际ConversationList+父index SFC/EUI；会话API、消息API、附件/子组件为替身，route abort禁网、无业务写入。源端观察：createConversation无创建中防重复门禁（双端一致，不视为目标缺陷）。
- I：`ai-conversation-init-browser-test.js`，本轮新跑通过。URL指定会话存在/不存在、默认首项、空列表，真实双SFC全接线；源对不存在id多发一次GET属源缺陷，目标回退更完整（保留目标并固化）。
- SW：`ai-conversation-switch-browser-test.js`，本轮新跑通过。切换加载/清草稿附件/流式中拦截/停止后可切换，真实index+ConversationList。
- CRUD：`ai-conversation-crud-browser-test.js`，本轮新跑通过。05-08四组+父级真实联动；生产修复：index.vue handleConversationClear 移除多余清prompt/uploadFiles两行对齐源。
- CP：`ai-message-copy-browser-test.js`，本轮新跑通过。复制内容/反馈/回退，真实MessageList。
- SC：`ai-message-scroll-browser-test.js`，本轮新跑通过。滚动跟随/暂停/回底回顶阈值逐像素断言，真实MessageList+父级。
- ER：`ai-message-edit-resend-browser-test.js`，本轮新跑通过。17组父级联动，真实index+MessageList；源生成中刷新无门禁按源固化。
- CL：`ai-message-clear-browser-test.js`，本轮新跑通过。18组清空消息，真实index。
- KN：`ai-message-knowledge-browser-test.js`，本轮新跑通过。20组知识引用聚合与分段弹窗。
- WS：`ai-message-websearch-browser-test.js`，本轮新跑通过。21组联网引用展开/详情/原文/图标兜底。
- MF：`ai-message-files-browser-test.js`，本轮新跑通过。22组附件图标/名称/打开原URL（27卡片映射）。
- RL：`ai-role-repository-browser-test.js`，主代理终止挂死代理后亲自重跑通过。23/24/25组，真实RoleRepository/RoleList/RoleCategoryList/ChatRoleForm；疑点#2双端实测结论已记录。
- W：`ai-conversation-settings-wiring-browser-test.js`，本轮新跑通过。09组剩余：父级刷新接线+取消重开回填+CHAT模型下拉。
- ST：`ai-message-stream-browser-test.js`，本轮新跑通过。10/11/16组剩余：Shift+Enter/IME/推荐词、流式占位首包追加错误恢复、父级删除刷新。
- FU：`ai-message-fileupload-browser-test.js`，本轮新跑通过。13组：MessageFileUpload全契约（数量/大小/三态/移除/外部清空）。
- RM：`ai-message-reasoning-markdown-browser-test.js`，本轮新跑通过。14组：Markdown管道(真实markdown-it/hljs)+推理展开+头像时间。
- 本登记引用可读取的本地日志，不表示本轮重跑S/M。日志在临时目录，若丢失必须重新验证，不能凭清单直接恢复通过状态。

## 未机械移植的源端疑点

1. 源index的下载图标没有click处理；目标已有导出。它不计入源已实现功能组，目标导出单独保留待核查，不声称与源完全一致。
2. RoleRepository公共RoleList：源对公共列表写裸`loading`属性（恒真→禁用公共滚动分页，属源端quirk）；目标用动态`:loading="loading"`（公共可分页），判定目标更完整并保留，差异已固化在RL测试断言中，不视为缺口。
3. 生成中侧栏内部选中/删除动作与父级拦截的先后顺序待核验。

下一项建议：真实后端整组验收（当前0/25）或转向其他18个模块功能行验收；25组模拟接口口径已全部通过，禁止重跑已通过组充数。
