import Vue from 'vue'
import Router from 'vue-router'
/* Layout */
import Layout from '@/layout'
import ParentView from '@/components/ParentView'

Vue.use(Router)

/**
 * Note: 路由配置项
 *
 * hidden: true                   // 【重要】当设置 true 的时候该路由不会再侧边栏出现 如 401，login 等页面，或者如一些编辑页面 /edit/1
 * alwaysShow: true               // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * path: '/login',                // 【重要】访问的 URL 路径
 * component: Layout,             // 【重要】对应的组件；也可以是 (resolve) => require(['@/views/login'], resolve),
 * redirect: noRedirect           // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'             // 【重要】设定路由的名字，一定要填写不然使用 <keep-alive> 时会出现各种问题
 * meta : {
    noCache: true                // 【重要】如果设置为 true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'               // 【重要】设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'             // 【重要】设置该路由的图标，对应路径 src/assets/icons/svg
    breadcrumb: false            // 如果设置为 false，则不会在 breadcrumb 面包屑中显示
    activeMenu: '/system/user'   // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes = [
  {
    path: '/pms/kb/document/share/:token',
    component: () => import('@/views/pms/kb/document/share/index.vue'),
    name: 'PmsKnowledgeDocumentShare',
    hidden: true,
    meta: { hidden: true, title: '知识文档分享', noTagsView: true }
  },
  {
    path: '/pms',
    component: Layout,
    name: 'PmsCenter',
    hidden: true,
    meta: { hidden: true },
    children: [
      {
        path: 'pm/iteration/detail/:id(\\d+)',
        name: 'PmsIterationDetail',
        meta: { title: '迭代详情', noCache: true, hidden: true, activeMenu: '/pms/pm/project/list' },
        component: () => import('@/views/pms/pm/iteration/detail/index.vue')
      },
      {
        path: 'pm/project/detail/:id(\\d+)',
        name: 'PmsProjectDetail',
        meta: { title: '项目详情', noCache: true, hidden: true, viewKey: 'PmsProjectDetail', activeMenu: '/pms/pm/project/list' },
        component: () => import('@/views/pms/pm/project/detail/index.vue')
      },
      {
        path: 'pm/project/config/:id(\\d+)',
        name: 'PmsProjectConfig',
        meta: { title: '项目设置', noCache: true, hidden: true, activeMenu: '/pms/pm/project/list' },
        component: () => import('@/views/pms/pm/project/config/index.vue')
      },
      {
        path: 'kb/library/:libraryId(\\d+)',
        name: 'PmsKnowledgeLibraryDetail',
        meta: { title: '知识库详情', noCache: true, hidden: true, canTo: true, viewKey: 'PmsKnowledgeDocument', activeMenu: '/pms/kb/library' },
        component: () => import('@/views/pms/kb/document/index.vue')
      },
      {
        path: 'kb/library/:libraryId(\\d+)/folder/:folderId(\\d+)',
        name: 'PmsKnowledgeFolderDetail',
        meta: { title: '文件夹详情', noCache: true, hidden: true, canTo: true, viewKey: 'PmsKnowledgeDocument', activeMenu: '/pms/kb/library' },
        component: () => import('@/views/pms/kb/document/index.vue')
      },
      {
        path: 'kb/library/:libraryId(\\d+)/document/:documentId(\\d+)',
        name: 'PmsKnowledgeDocumentDetail',
        meta: { title: '文档详情', noCache: true, hidden: true, canTo: true, viewKey: 'PmsKnowledgeDocument', activeMenu: '/pms/kb/library' },
        component: () => import('@/views/pms/kb/document/index.vue')
      }
    ]
  },
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: (resolve) => require(['@/views/redirect'], resolve)
      }
    ]
  },
  {
    path: '/login',
    component: (resolve) => require(['@/views/login'], resolve),
    hidden: true
  },
  {
    path: '/sso',
    component: (resolve) => require(['@/views/sso'], resolve),
    hidden: true
  },
  {
    path: '/social-login',
    component: (resolve) => require(['@/views/socialLogin'], resolve),
    hidden: true
  },
  {
    path: '/404',
    component: (resolve) => require(['@/views/error/404'], resolve),
    hidden: true
  },
  {
    path: '/401',
    component: (resolve) => require(['@/views/error/401'], resolve),
    hidden: true
  },
  {
    path: '/500',
    component: (resolve) => require(['@/views/error/500'], resolve),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'index',
    children: [{
        path: 'index',
        component: (resolve) => require(['@/views/index'], resolve),
        name: '首页',
        meta: {title: '首页', icon: 'dashboard', affix: true}
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [{
        path: 'profile',
        component: (resolve) => require(['@/views/Profile/Index'], resolve),
        name: 'Profile',
        meta: {title: '个人中心', icon: 'user'}
      }, {
        path: 'notify-message',
        component: (resolve) => require(['@/views/system/notify/my/index'], resolve),
        name: 'MyNotifyMessage',
        meta: { title: '我的站内信', icon: 'message' },
    }]
  },
  {
    // CRM clue/contact entries remain hidden because production menus come from permissions.
    // Keeping direct routes here lets notifications and isolated smoke tests open the Vue3-aligned pages.
    path: '/crm',
    component: Layout,
    name: 'CrmCenter',
    hidden: true,
    redirect: 'noredirect',
    children: [{
      path: 'customer/detail/:id',
      component: (resolve) => require(['@/views/crm/customer/detail/index'], resolve),
      name: 'CrmCustomerDetail',
      meta: {
        title: '客户详情',
        noCache: true,
        activeMenu: '/crm/customer'
      }
    }, {
      path: '__smoke/customer',
      component: (resolve) => require(['@/views/crm/customer/index'], resolve),
      name: 'CrmCustomerSmoke',
      meta: { title: '客户列表', activeMenu: '/crm/customer' }
    }, {
      path: '__smoke/backlog',
      component: (resolve) => require(['@/views/crm/backlog/index'], resolve),
      name: 'CrmBacklogSmoke',
      meta: { title: '待办事项', activeMenu: '/crm/backlog' }
    }, {
      path: '__smoke/customer/pool',
      component: (resolve) => require(['@/views/crm/customer/pool/index'], resolve),
      name: 'CrmCustomerPoolSmoke',
      meta: { title: '客户公海', activeMenu: '/crm/customer/pool' }
    }, {
      // CRM 配置烟测入口使用独立前缀，避免遮蔽生产动态菜单的同名路由。
      path: '__smoke/config/customer-limit-config',
      component: (resolve) => require(['@/views/crm/customer/limitConfig/index'], resolve),
      name: 'CrmCustomerLimitConfigSmoke',
      meta: { title: '客户限制配置', activeMenu: '/crm/config/customer-limit-config' }
    }, {
      path: '__smoke/config/customer-pool-config',
      component: (resolve) => require(['@/views/crm/customer/poolConfig/index'], resolve),
      name: 'CrmCustomerPoolConfigSmoke',
      meta: { title: '客户公海配置', activeMenu: '/crm/config/customer-pool-config' }
    }, {
      path: '__smoke/performance/config',
      component: (resolve) => require(['@/views/crm/performance/config/index'], resolve),
      name: 'CrmPerformanceConfigSmoke',
      meta: { title: '业绩目标设置', activeMenu: '/crm/performance/config' }
    }, {
      path: '__smoke/statistics/performance-target',
      component: (resolve) => require(['@/views/crm/statistics/performanceTarget/index'], resolve),
      name: 'CrmPerformanceTargetSmoke',
      meta: { title: '业绩目标完成情况', activeMenu: '/crm/statistics/performance-target' }
    }, {
      path: '__smoke/statistics/performance',
      component: (resolve) => require(['@/views/crm/statistics/performance/index'], resolve),
      name: 'CrmStatisticsPerformanceSmoke',
      meta: { title: '员工业绩', activeMenu: '/crm/statistics/performance' }
    }, {
      path: '__smoke/statistics/funnel',
      component: (resolve) => require(['@/views/crm/statistics/funnel/index'], resolve),
      name: 'CrmStatisticsFunnelSmoke',
      meta: { title: '销售漏斗分析', activeMenu: '/crm/statistics/funnel' }
    }, {
      path: '__smoke/statistics/product',
      component: (resolve) => require(['@/views/crm/statistics/product/index'], resolve),
      name: 'CrmStatisticsProductSmoke',
      meta: { title: '产品销售分析', activeMenu: '/crm/statistics/product' }
    }, {
      path: '__smoke/statistics/portrait',
      component: (resolve) => require(['@/views/crm/statistics/portrait/index'], resolve),
      name: 'CrmStatisticsPortraitSmoke',
      meta: { title: '客户画像', activeMenu: '/crm/statistics/portrait' }
    }, {
      path: '__smoke/statistics/customer',
      component: (resolve) => require(['@/views/crm/statistics/customer/index'], resolve),
      name: 'CrmStatisticsCustomerSmoke',
      meta: { title: '员工客户分析', activeMenu: '/crm/statistics/customer' }
    }, {
      path: '__smoke/statistics/rank',
      component: (resolve) => require(['@/views/crm/statistics/rank/index'], resolve),
      name: 'CrmStatisticsRankSmoke',
      meta: { title: '排行榜', activeMenu: '/crm/statistics/rank' }
    }, {
      path: '__smoke/business',
      component: (resolve) => require(['@/views/crm/business/index'], resolve),
      name: 'CrmBusinessSmoke',
      meta: { title: '商机管理', activeMenu: '/crm/business' }
    }, {
      path: 'business/detail/:id',
      component: (resolve) => require(['@/views/crm/business/detail/index'], resolve),
      name: 'CrmBusinessDetail',
      meta: { title: '商机详情', noCache: true, activeMenu: '/crm/business' }
    }, {
      path: '__smoke/business/status',
      component: (resolve) => require(['@/views/crm/business/status/index'], resolve),
      name: 'CrmBusinessStatusSmoke',
      meta: { title: '商机状态', activeMenu: '/crm/business/status' }
    }, {
      path: '__smoke/clue',
      component: (resolve) => require(['@/views/crm/clue/index'], resolve),
      name: 'CrmClueSmoke',
      meta: { title: '线索管理', activeMenu: '/crm/clue' }
    }, {
      path: 'clue/detail/:id',
      component: (resolve) => require(['@/views/crm/clue/detail/index'], resolve),
      name: 'CrmClueDetail',
      meta: { title: '线索详情', activeMenu: '/crm/clue' }
    }, {
      path: '__smoke/contact',
      component: (resolve) => require(['@/views/crm/contact/index'], resolve),
      name: 'CrmContactSmoke',
      meta: { title: '联系人管理', activeMenu: '/crm/contact' }
    }, {
      path: 'contact/detail/:id',
      component: (resolve) => require(['@/views/crm/contact/detail/index'], resolve),
      name: 'CrmContactDetail',
      meta: { title: '联系人详情', activeMenu: '/crm/contact' }
    }, {
      path: '__smoke/product',
      component: (resolve) => require(['@/views/crm/product/index'], resolve),
      name: 'CrmProductSmoke',
      meta: { title: '产品管理', activeMenu: '/crm/product' }
    }, {
      path: 'product/detail/:id',
      component: (resolve) => require(['@/views/crm/product/detail/index'], resolve),
      name: 'CrmProductDetail',
      meta: { title: '产品详情', noCache: true, activeMenu: '/crm/product' }
    }, {
      path: '__smoke/contract',
      component: (resolve) => require(['@/views/crm/contract/index'], resolve),
      name: 'CrmContractSmoke',
      meta: { title: '合同管理', activeMenu: '/crm/contract' }
    }, {
      path: 'contract/detail/:id',
      component: (resolve) => require(['@/views/crm/contract/detail/index'], resolve),
      name: 'CrmContractDetail',
      meta: { title: '合同详情', activeMenu: '/crm/contract' }
    }, {
      path: '__smoke/contract/config',
      component: (resolve) => require(['@/views/crm/contract/config/index'], resolve),
      name: 'CrmContractConfigSmoke',
      meta: { title: '合同配置', activeMenu: '/crm/contract' }
    }, {
      path: '__smoke/receivable',
      component: (resolve) => require(['@/views/crm/receivable/index'], resolve),
      name: 'CrmReceivableSmoke',
      meta: { title: '回款管理', activeMenu: '/crm/receivable' }
    }, {
      path: 'receivable/detail/:id',
      component: (resolve) => require(['@/views/crm/receivable/detail/index'], resolve),
      name: 'CrmReceivableDetail',
      meta: { title: '回款详情', activeMenu: '/crm/receivable' }
    }, {
      path: '__smoke/receivable-plan',
      component: (resolve) => require(['@/views/crm/receivable/plan/index'], resolve),
      name: 'CrmReceivablePlanCanonicalSmoke',
      meta: { title: '回款计划', activeMenu: '/crm/receivable-plan' }
    }, {
      path: 'receivable-plan/detail/:id',
      component: (resolve) => require(['@/views/crm/receivable/plan/detail/index'], resolve),
      name: 'CrmReceivablePlanDetail',
      meta: { title: '回款计划详情', activeMenu: '/crm/receivable-plan' }
    }, {
      path: '__smoke/receivable/plan',
      component: (resolve) => require(['@/views/crm/receivable/plan/index'], resolve),
      name: 'CrmReceivablePlanSmoke',
      meta: { title: '回款计划', activeMenu: '/crm/receivable' }
    }, {
      path: '__smoke/receivable/plan/detail/:id',
      component: (resolve) => require(['@/views/crm/receivable/plan/detail/index'], resolve),
      name: 'CrmReceivablePlanDetailSmoke',
      meta: { title: '回款计划详情', activeMenu: '/crm/receivable' }
    }]
  },
  {
    path: '/dict',
    component: Layout,
    hidden: true,
    children: [{
        path: 'type/data/:dictType',
        component: (resolve) => require(['@/views/system/dict/data'], resolve),
        name: 'SystemDictData',
        meta: {title: '字典数据', icon: '', activeMenu: '/system/dict'}
      }
    ]
  },
  {
    path: '/fms/auxiliary',
    component: Layout,
    name: 'FmsAuxiliaryRoot',
    hidden: true,
    children: [{
      path: 'type/item/:auxiliaryTypeId',
      redirect: (to) => ({
        path: '/fms/config/auxiliary',
        query: { auxiliaryTypeId: to.params.auxiliaryTypeId }
      }),
      name: 'FmsAuxiliaryItem',
      meta: {
        title: '辅助核算项目',
        noCache: true,
        hidden: true,
        canTo: true,
        icon: '',
        activeMenu: '/fms/config/auxiliary'
      }
    }]
  },
  {
    path: '/job',
    component: Layout,
    name: 'JobL',
    hidden: true,
    children: [{
        path: 'job-log',
        component: (resolve) => require(['@/views/infra/job/logger/index'], resolve),
        name: 'InfraJobLog',
        meta: {title: '调度日志', activeMenu: '/infra/job'}
      }
    ]
  }, {
    path: '/codegen',
    component: Layout,
    hidden: true,
    children: [{
        // Canonical route: the table id is passed as query.id.
        path: 'edit',
        component: (resolve) => require(['@/views/infra/codegen/editTable'], resolve),
        name: 'InfraCodegenEditTable',
        meta: {title: '修改生成配置', activeMenu: '/infra/codegen'}
      }, {
        // Keep old deep links working while callers migrate to query.id.
        path: 'edit/:tableId(\\d+)',
        component: (resolve) => require(['@/views/infra/codegen/editTable'], resolve),
        name: 'InfraCodegenEditTableLegacy',
        meta: {title: '修改生成配置', activeMenu: '/infra/codegen'}
      }
    ]
  },
  {
    path: '/fms/__smoke/config/account-set',
    component: Layout,
    hidden: true,
    children: [{
      path: '',
      component: (resolve) => require(['@/views/fms/config/account-set/index'], resolve),
      name: 'FmsAccountSetSmoke',
      meta: { title: '账套管理', activeMenu: '/fms/config/account-set' }
    }]
  },
  {
    // 独立烟测入口不遮蔽 Vue3 对应的权限动态菜单。
    path: '/fms/__smoke/config/subject',
    component: Layout,
    hidden: true,
    children: [{
      path: '',
      component: (resolve) => require(['@/views/fms/config/subject/index'], resolve),
      name: 'FmsSubjectSmoke',
      meta: { title: '科目设置', activeMenu: '/fms/config/subject' }
    }]
  },
  {
    path: '/fms/__smoke/config/currency',
    component: Layout,
    hidden: true,
    children: [{
      path: '',
      component: (resolve) => require(['@/views/fms/config/currency/index'], resolve),
      name: 'FmsCurrencySmoke',
      meta: { title: '币别设置', activeMenu: '/fms/config/currency' }
    }]
  },
  {
    // FMS 结账页烟测入口；生产菜单仍由权限动态生成。
    path: '/fms',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [{
      path: '__smoke/closing',
      component: (resolve) => require(['@/views/fms/closing/index'], resolve),
      name: 'FmsClosingSmoke',
      meta: { title: '期末结账', activeMenu: '/fms/closing' }
    }, {
      path: '__smoke/config/auxiliary',
      component: (resolve) => require(['@/views/fms/config/auxiliary/index'], resolve),
      name: 'FmsAuxiliarySmoke',
      meta: { title: '辅助核算', activeMenu: '/fms/config/auxiliary' }
    }, {
      path: '__smoke/config/digest',
      component: (resolve) => require(['@/views/fms/config/digest/index'], resolve),
      name: 'FmsDigestSmoke',
      meta: { title: '凭证摘要', activeMenu: '/fms/config/digest' }
    }, {
      path: '__smoke/config/finance-indicator',
      component: (resolve) => require(['@/views/fms/config/finance-indicator/index'], resolve),
      name: 'FmsFinanceIndicatorSmoke',
      meta: { title: '财务指标', activeMenu: '/fms/config/finance-indicator' }
    }, {
      path: '__smoke/config/finance-parameter',
      component: (resolve) => require(['@/views/fms/config/finance-parameter/index'], resolve),
      name: 'FmsFinanceParameterSmoke',
      meta: { title: '财务参数', activeMenu: '/fms/config/finance-parameter' }
    }, {
      path: '__smoke/home',
      component: (resolve) => require(['@/views/fms/home/index'], resolve),
      name: 'FmsHomeSmoke',
      meta: { title: '财务工作台', activeMenu: '/fms/home' }
    }]
  },
  {
    // AI 详情和表单页是 Vue3 的隐藏静态路由；列表仍由权限菜单提供。
    path: '/ai',
    component: Layout,
    name: 'Ai',
    hidden: true,
    redirect: 'noredirect',
    children: [{
      path: 'image/square',
      component: (resolve) => require(['@/views/ai/image/square/index'], resolve),
      name: 'AiImageSquare',
      meta: { title: '绘图作品', noCache: false }
    }, {
      path: 'knowledge/document',
      component: (resolve) => require(['@/views/ai/knowledge/document/index'], resolve),
      name: 'AiKnowledgeDocument',
      meta: { title: '知识库文档', noCache: false, hidden: true, activeMenu: '/ai/knowledge' }
    }, {
      path: 'knowledge/document/create',
      component: (resolve) => require(['@/views/ai/knowledge/document/form/index'], resolve),
      name: 'AiKnowledgeDocumentCreate',
      meta: { title: '创建文档', noCache: true, hidden: true, activeMenu: '/ai/knowledge' }
    }, {
      path: 'knowledge/document/update',
      component: (resolve) => require(['@/views/ai/knowledge/document/form/index'], resolve),
      name: 'AiKnowledgeDocumentUpdate',
      meta: { title: '修改文档', noCache: true, hidden: true, activeMenu: '/ai/knowledge' }
    }, {
      path: 'knowledge/retrieval',
      component: (resolve) => require(['@/views/ai/knowledge/knowledge/retrieval/index'], resolve),
      name: 'AiKnowledgeRetrieval',
      meta: { title: '文档召回测试', noCache: true, hidden: true, activeMenu: '/ai/knowledge' }
    }, {
      path: 'knowledge/segment',
      component: (resolve) => require(['@/views/ai/knowledge/segment/index'], resolve),
      name: 'AiKnowledgeSegment',
      meta: { title: '知识库分段', noCache: true, hidden: true, activeMenu: '/ai/knowledge' }
    }, {
      path: 'console/workflow/create',
      component: (resolve) => require(['@/views/ai/workflow/form/index'], resolve),
      name: 'AiWorkflowCreate',
      meta: { title: '设计 AI 工作流', noCache: true, hidden: true, canTo: true, activeMenu: '/ai/console/workflow' }
    }, {
      path: 'console/workflow/:type/:id',
      component: (resolve) => require(['@/views/ai/workflow/form/index'], resolve),
      name: 'AiWorkflowUpdate',
      meta: { title: '设计 AI 工作流', noCache: true, hidden: true, canTo: true, activeMenu: '/ai/console/workflow' }
    }]
  },
  {
    // 内容管理页面由权限菜单提供；保留直达入口便于通知链接和部署前烟测。
    path: '/mall/promotion',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [{
      path: '__smoke/article',
      component: (resolve) => require(['@/views/mall/promotion/article/index'], resolve),
      name: 'MallPromotionArticleSmoke',
      meta: { title: '文章管理', activeMenu: '/mall/promotion/article' }
    }, {
      path: '__smoke/article/category',
      component: (resolve) => require(['@/views/mall/promotion/article/category/index'], resolve),
      name: 'MallPromotionArticleCategorySmoke',
      meta: { title: '文章分类', activeMenu: '/mall/promotion/article/category' }
    }, {
      path: '__smoke/banner',
      component: (resolve) => require(['@/views/mall/promotion/banner/index'], resolve),
      name: 'MallPromotionBannerSmoke',
      meta: { title: 'Banner 管理', activeMenu: '/mall/promotion/banner' }
    }, {
      path: '__smoke/bargain-activity',
      component: (resolve) => require(['@/views/mall/promotion/bargain/activity/index'], resolve),
      name: 'MallPromotionBargainActivitySmoke',
      meta: { title: '砍价活动', activeMenu: '/mall/promotion/bargain-activity' }
    }, {
      path: '__smoke/bargain-record',
      component: (resolve) => require(['@/views/mall/promotion/bargain/record/index'], resolve),
      name: 'MallPromotionBargainRecordSmoke',
      meta: { title: '砍价记录', activeMenu: '/mall/promotion/bargain-record' }
    }, {
      path: '__smoke/discount-activity',
      component: (resolve) => require(['@/views/mall/promotion/discountActivity/index'], resolve),
      name: 'MallPromotionDiscountActivitySmoke',
      meta: { title: '限时折扣', activeMenu: '/mall/promotion/discount-activity' }
    }, {
      path: '__smoke/combination-activity',
      component: (resolve) => require(['@/views/mall/promotion/combination/activity/index'], resolve),
      name: 'MallPromotionCombinationActivitySmoke',
      meta: { title: '拼团活动', activeMenu: '/mall/promotion/combination-activity' }
    }, {
      path: '__smoke/combination-record',
      component: (resolve) => require(['@/views/mall/promotion/combination/record/index'], resolve),
      name: 'MallPromotionCombinationRecordSmoke',
      meta: { title: '拼团记录', activeMenu: '/mall/promotion/combination-record' }
    }, {
      path: '__smoke/point-activity',
      component: (resolve) => require(['@/views/mall/promotion/point/activity/index'], resolve),
      name: 'MallPromotionPointActivitySmoke',
      meta: { title: '积分商城活动', activeMenu: '/mall/promotion/point-activity' }
    }, {
      path: '__smoke/reward-activity',
      component: (resolve) => require(['@/views/mall/promotion/rewardActivity/index'], resolve),
      name: 'MallPromotionRewardActivitySmoke',
      meta: { title: '满减送', activeMenu: '/mall/promotion/youhui/reward-activity' }
    }, {
      path: '__smoke/seckill-activity',
      component: (resolve) => require(['@/views/mall/promotion/seckill/activity/index'], resolve),
      name: 'MallPromotionSeckillActivitySmoke',
      meta: { title: '秒杀活动', activeMenu: '/mall/promotion/seckill-activity' }
    }, {
      path: '__smoke/seckill-config',
      component: (resolve) => require(['@/views/mall/promotion/seckill/config/index'], resolve),
      name: 'MallPromotionSeckillConfigSmoke',
      meta: { title: '秒杀时段', activeMenu: '/mall/promotion/seckill-config' }
    }, {
      path: '__smoke/diy-page',
      component: (resolve) => require(['@/views/mall/promotion/diy/page/index'], resolve),
      name: 'MallPromotionDiyPageSmoke',
      meta: { title: '装修页面', activeMenu: '/mall/promotion/diy-template/diy-page' }
    }]
  },
  {
    // Vue3 的装修详情使用独立 /diy 前缀；页面管理仍由权限动态菜单提供。
    path: '/diy',
    component: Layout,
    name: 'DiyCenter',
    hidden: true,
    meta: { hidden: true },
    children: [{
      path: 'template/decorate/:id',
      component: (resolve) => require(['@/views/mall/promotion/diy/template/decorate'], resolve),
      name: 'DiyTemplateDecorate',
      meta: {
        title: '模板装修',
        noCache: false,
        hidden: true,
        activeMenu: '/mall/promotion/diy-template/diy-template'
      }
    }, {
      path: 'page/decorate/:id',
      component: (resolve) => require(['@/views/mall/promotion/diy/page/decorate'], resolve),
      name: 'DiyPageDecorate',
      meta: {
        title: '页面装修',
        noCache: false,
        hidden: true,
        activeMenu: '/mall/promotion/diy-template/diy-page'
      }
    }]
  },
  {
    // ERP menu-independent smoke routes use a private prefix so dynamic menu
    // routes keep the same names and permission semantics as Vue3.
    path: '/erp',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [{
      path: '__smoke/home',
      component: (resolve) => require(['@/views/erp/home/index'], resolve),
      name: 'ErpHomeSmoke',
      meta: { title: 'ERP 首页', activeMenu: '/erp/home' }
    }, {
      path: '__smoke/product/unit',
      component: (resolve) => require(['@/views/erp/product/unit/index'], resolve),
      name: 'ErpProductUnitSmoke',
      meta: { title: '产品单位', activeMenu: '/erp/product/unit' }
    }, {
      path: '__smoke/purchase/order',
      component: (resolve) => require(['@/views/erp/purchase/order/index'], resolve),
      name: 'ErpPurchaseOrderSmoke',
      meta: { title: '采购订单', activeMenu: '/erp/purchase/order' }
    }, {
      path: '__smoke/purchase/in',
      component: (resolve) => require(['@/views/erp/purchase/in/index'], resolve),
      name: 'ErpPurchaseInSmoke',
      meta: { title: '采购入库', activeMenu: '/erp/purchase/in' }
    }, {
      path: '__smoke/purchase/return',
      component: (resolve) => require(['@/views/erp/purchase/return/index'], resolve),
      name: 'ErpPurchaseReturnSmoke',
      meta: { title: '采购退货', activeMenu: '/erp/purchase/return' }
    }, {
      path: '__smoke/stock/check',
      component: (resolve) => require(['@/views/erp/stock/check/index'], resolve),
      name: 'ErpStockCheckSmoke',
      meta: { title: '库存盘点', activeMenu: '/erp/stock/check' }
    }, {
      path: '__smoke/stock/in',
      component: (resolve) => require(['@/views/erp/stock/in/index'], resolve),
      name: 'ErpStockInSmoke',
      meta: { title: '其它入库', activeMenu: '/erp/stock/in' }
    }, {
      path: '__smoke/stock/move',
      component: (resolve) => require(['@/views/erp/stock/move/index'], resolve),
      name: 'ErpStockMoveSmoke',
      meta: { title: '库存调拨', activeMenu: '/erp/stock/move' }
    }, {
      path: '__smoke/stock/out',
      component: (resolve) => require(['@/views/erp/stock/out/index'], resolve),
      name: 'ErpStockOutSmoke',
      meta: { title: '其它出库', activeMenu: '/erp/stock/out' }
    }, {
      path: '__smoke/stock/record',
      component: (resolve) => require(['@/views/erp/stock/record/index'], resolve),
      name: 'ErpStockRecordSmoke',
      meta: { title: '库存明细', activeMenu: '/erp/stock/record' }
    }, {
      path: '__smoke/stock/stock',
      component: (resolve) => require(['@/views/erp/stock/stock/index'], resolve),
      name: 'ErpStockSmoke',
      meta: { title: '产品库存', activeMenu: '/erp/stock/stock' }
    }, {
      // 销售订单烟测使用独立前缀，避免遮蔽生产动态菜单路由。
      path: '__smoke/sale/order',
      component: (resolve) => require(['@/views/erp/sale/order/index'], resolve),
      name: 'ErpSaleOrderSmoke',
      meta: { title: '销售订单', activeMenu: '/erp/sale/order' }
    }, {
      path: '__smoke/sale/out',
      component: (resolve) => require(['@/views/erp/sale/out/index'], resolve),
      name: 'ErpSaleOutSmoke',
      meta: { title: '销售出库', activeMenu: '/erp/sale/out' }
    }, {
      path: '__smoke/sale/return',
      component: (resolve) => require(['@/views/erp/sale/return/index'], resolve),
      name: 'ErpSaleReturnSmoke',
      meta: { title: '销售退货', activeMenu: '/erp/sale/return' }
    }, {
      path: '__smoke/finance/payment',
      component: (resolve) => require(['@/views/erp/finance/payment/index'], resolve),
      name: 'ErpFinancePaymentSmoke',
      meta: { title: '采购付款', activeMenu: '/erp/finance/payment' }
    }, {
      path: '__smoke/finance/receipt',
      component: (resolve) => require(['@/views/erp/finance/receipt/index'], resolve),
      name: 'ErpFinanceReceiptSmoke',
      meta: { title: '销售收款', activeMenu: '/erp/finance/receipt' }
    }]
  },
  {
    path: '/wms',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [{
      path: '__smoke/home',
      component: (resolve) => require(['@/views/wms/home/index'], resolve),
      name: 'WmsHomeSmoke',
      meta: { title: 'WMS 首页', activeMenu: '/wms/home' }
    }, {
      path: '__smoke/item',
      component: (resolve) => require(['@/views/wms/md/item/index'], resolve),
      name: 'WmsItemSmoke',
      meta: { title: '商品管理', activeMenu: '/wms/item' }
    }, {
      path: '__smoke/item/brand',
      component: (resolve) => require(['@/views/wms/md/item/brand/index'], resolve),
      name: 'WmsItemBrandSmoke',
      meta: { title: '商品品牌', activeMenu: '/wms/item' }
    }, {
      path: '__smoke/item/category',
      component: (resolve) => require(['@/views/wms/md/item/category/index'], resolve),
      name: 'WmsItemCategorySmoke',
      meta: { title: '商品分类', activeMenu: '/wms/item' }
    }, {
      path: '__smoke/inventory/index',
      component: (resolve) => require(['@/views/wms/inventory/index/index'], resolve),
      name: 'WmsInventorySmoke',
      meta: { title: '库存统计', activeMenu: '/wms/inventory/index' }
    }, {
      path: '__smoke/inventory/history',
      component: (resolve) => require(['@/views/wms/inventory/history/index'], resolve),
      name: 'WmsInventoryHistorySmoke',
      meta: { title: '库存流水', activeMenu: '/wms/inventory/history' }
    }, {
      path: '__smoke/order/receipt',
      component: (resolve) => require(['@/views/wms/order/receipt/index'], resolve),
      name: 'WmsReceiptOrderSmoke',
      meta: { title: '入库单', activeMenu: '/wms/order/receipt' }
    }, {
      path: '__smoke/order/check',
      component: (resolve) => require(['@/views/wms/order/check/index'], resolve),
      name: 'WmsCheckOrderSmoke',
      meta: { title: '盘库单', activeMenu: '/wms/order/check' }
    }, {
      path: '__smoke/order/movement',
      component: (resolve) => require(['@/views/wms/order/movement/index'], resolve),
      name: 'WmsMovementOrderSmoke',
      meta: { title: '移库单', activeMenu: '/wms/order/movement' }
    }, {
      path: '__smoke/order/shipment',
      component: (resolve) => require(['@/views/wms/order/shipment/index'], resolve),
      name: 'WmsShipmentOrderSmoke',
      meta: { title: '出库单', activeMenu: '/wms/order/shipment' }
    }]
  },
  {
    path: '/bpm',
    component: Layout,
    name: 'bpm',
    hidden: true,
    meta: { hidden: true },
    children: [{
        path: 'oa/leave/create',
        component: (resolve) => require(['@/views/bpm/oa/leave/create'], resolve),
        name: 'OALeaveCreate',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '发起 OA 请假',
          activeMenu: '/bpm/oa/leave'
        }
      }, {
        path: 'oa/leave/detail',
        component: (resolve) => require(['@/views/bpm/oa/leave/detail'], resolve),
        name: 'OALeaveDetail',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '查看 OA 请假',
          activeMenu: '/bpm/oa/leave'
        }
      }
    ]
  },
  {
    path: '/bpm',
    component: Layout,
    hidden: true,
    children: [{
      path: 'manager/form/edit',
      component: (resolve) => require(['@/views/bpm/form/editor/index'], resolve),
      name: 'BpmFormEditor',
      meta: {
        noCache: true,
        hidden: true,
        canTo: true,
        title: '设计流程表单',
        activeMenu: '/bpm/manager/form'
      }
    }, {
        path: 'manager/definition',
        component: (resolve) => require(['@/views/bpm/model/definition/index'], resolve),
        name: 'BpmProcessDefinition',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '流程定义',
          activeMenu: '/bpm/manager/model'
        }
      }, {
        path: 'manager/model/create',
        component: (resolve) => require(['@/views/bpm/model/form/index'], resolve),
        name: 'BpmModelCreate',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '创建流程',
          activeMenu: '/bpm/manager/model'
        }
      }, {
        path: 'manager/model/:type/:id',
        component: (resolve) => require(['@/views/bpm/model/form/index'], resolve),
        name: 'BpmModelUpdate',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '修改流程',
          activeMenu: '/bpm/manager/model'
        }
      }, {
        path: 'process-instance/detail',
        component: (resolve) => require(['@/views/bpm/processInstance/detail/index'], resolve),
        name: 'BpmProcessInstanceDetail',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '流程详情',
          activeMenu: '/bpm/task/my'
        },
        props: (route) => ({
          id: route.query.id,
          taskId: route.query.taskId,
          activityId: route.query.activityId
        })
      }, {
        path: 'process-instance/report',
        component: (resolve) => require(['@/views/bpm/processInstance/report/index'], resolve),
        name: 'BpmProcessInstanceReport',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          title: '数据报表',
          activeMenu: '/bpm/manager/model'
        }
      }
    ]
  },
  {
    // HRM 详情和表单页是 Vue3 的隐藏静态路由；列表仍由权限菜单提供。
    path: '/hrm',
    component: Layout,
    name: 'HrmCenter',
    hidden: true,
    children: [{
      path: 'portal/opening-guide',
      component: (resolve) => require(['@/views/hrm/portal/opening-guide/index'], resolve),
      name: 'HrmPortalOpeningGuide',
      meta: {
        title: '员工端开通引导',
        noCache: true,
        hidden: true,
        activeMenu: '/hrm/portal/home'
      }
    }, {
      path: 'recruit/post/detail/:id',
      component: (resolve) => require(['@/views/hrm/recruit/post/detail/index'], resolve),
      name: 'HrmRecruitPostDetail',
      meta: {
        title: '招聘职位详情',
        noCache: true,
        hidden: true,
        activeMenu: '/hrm/recruit/post'
      }
    }, {
      path: 'recruit/candidate/detail/:id',
      component: (resolve) => require(['@/views/hrm/recruit/candidate/detail/index'], resolve),
      name: 'HrmRecruitCandidateDetail',
      meta: {
        title: '招聘候选人详情',
        noCache: true,
        hidden: true,
        activeMenu: '/hrm/recruit/candidate'
      }
    }, {
      path: 'employee/detail/:id',
      component: (resolve) => require(['@/views/hrm/employee/detail/index'], resolve),
      name: 'HrmEmployeeDetail',
      meta: {
        title: '员工档案详情',
        noCache: true,
        hidden: true,
        activeMenu: '/hrm/employee/list'
      }
    }, {
      path: 'dept/detail/:id',
      component: (resolve) => require(['@/views/hrm/dept/detail/index'], resolve),
      name: 'HrmDeptDetail',
      meta: {
        title: '组织详情',
        noCache: true,
        hidden: true,
        activeMenu: '/hrm/dept'
      }
    }, {
      path: 'attendance/month/detail/:employeeId',
      component: (resolve) => require(['@/views/hrm/attendance/month/detail/index'], resolve),
      name: 'HrmAttendanceMonthDetail',
      meta: {
        title: '月度考勤详情',
        noCache: true,
        hidden: true,
        activeMenu: '/hrm/attendance/month'
      }
    }, {
      path: 'performance/plan/detail/:id',
      component: (resolve) => require(['@/views/hrm/performance/plan/detail/index'], resolve),
      name: 'HrmPerformancePlanDetail',
      meta: {
        title: '绩效计划详情',
        noCache: true,
        hidden: true,
        activeMenu: '/hrm/performance/plan'
      }
    }, {
      path: 'performance/plan/form',
      component: (resolve) => require(['@/views/hrm/performance/plan/form/index'], resolve),
      name: 'HrmPerformancePlanForm',
      meta: {
        title: 'KPI 考核配置',
        noCache: true,
        hidden: true,
        canTo: true,
        activeMenu: '/hrm/performance/plan'
      }
    }, {
      path: 'performance/assessment/employee/:employeeId',
      component: (resolve) => require(['@/views/hrm/performance/assessment/employee/index'], resolve),
      name: 'HrmPerformanceAssessmentEmployee',
      meta: {
        title: '员工绩效档案',
        noCache: true,
        hidden: true,
        activeMenu: '/hrm/performance/assessment'
      }
    }, {
      path: 'performance/assessment/detail/:id',
      component: (resolve) => require(['@/views/hrm/performance/assessment/detail/index'], resolve),
      name: 'HrmPerformanceAssessmentDetail',
      meta: {
        title: '员工考核详情',
        noCache: true,
        hidden: true,
        activeMenu: '/hrm/performance/assessment'
      }
    }, {
      path: 'insurance/month-record/detail/:id',
      component: (resolve) => require(['@/views/hrm/insurance/month-record/detail/index'], resolve),
      name: 'HrmInsuranceMonthRecordDetail',
      meta: {
        title: '月度社保详情',
        noCache: true,
        hidden: true,
        activeMenu: '/hrm/insurance/month-record'
      }
    }, {
      path: 'salary/employee-info/detail/:id',
      component: (resolve) => require(['@/views/hrm/salary/employee-info/detail/index'], resolve),
      name: 'HrmSalaryEmployeeInfoDetail',
      meta: {
        title: '薪资档案详情',
        noCache: true,
        hidden: true,
        activeMenu: '/hrm/salary/employee-info'
      }
    }, {
      path: 'salary/history/detail/:id',
      component: (resolve) => require(['@/views/hrm/salary/month-record/detail/index'], resolve),
      name: 'HrmSalaryHistoryDetail',
      meta: {
        title: '历史工资详情',
        noCache: true,
        hidden: true,
        activeMenu: '/hrm/salary/history'
      }
    }, {
      path: 'salary/slip/detail/:id',
      component: (resolve) => require(['@/views/hrm/salary/slip/send-record/detail/index'], resolve),
      name: 'HrmSalarySlipSendRecordDetail',
      meta: {
        title: '工资条发放详情',
        noCache: true,
        hidden: true,
        activeMenu: '/hrm/salary/slip'
      }
    }]
  },
  {
    // MES 仓库配置和甘特编辑页是 Vue3 的隐藏静态路由。
    path: '/mes',
    component: Layout,
    name: 'MesWmRouter',
    hidden: true,
    children: [{
      path: 'wm/warehouse/location',
      component: (resolve) => require(['@/views/mes/wm/warehouse/location/index'], resolve),
      name: 'MesWmLocation',
      meta: {
        noCache: true,
        hidden: true,
        canTo: true,
        icon: '',
        title: '库区设置',
        activeMenu: '/mes/wm/warehouse'
      }
    }, {
      path: 'wm/warehouse/area',
      component: (resolve) => require(['@/views/mes/wm/warehouse/area/index'], resolve),
      name: 'MesWmArea',
      meta: {
        noCache: true,
        hidden: true,
        canTo: true,
        icon: '',
        title: '库位设置',
        activeMenu: '/mes/wm/warehouse'
      }
    }, {
      path: 'pro/task/gantt-edit',
      component: (resolve) => require(['@/views/mes/pro/task/edit/index'], resolve),
      name: 'MesProTaskGanttEdit',
      meta: {
        noCache: true,
        hidden: true,
        canTo: true,
        icon: '',
        title: '甘特图编辑',
        activeMenu: '/mes/pro/task'
      }
    }]
  },
  {
    // IoT 详情页由列表按名称跳转，保持与 Vue3 隐藏路由一致。
    path: '/iot',
    component: Layout,
    name: 'IOT',
    hidden: true,
    children: [{
      path: 'product/product/detail/:id',
      component: (resolve) => require(['@/views/iot/product/product/detail/index'], resolve),
      name: 'IoTProductDetail',
      meta: {
        title: '产品详情',
        noCache: true,
        hidden: true,
        activeMenu: '/iot/device/product'
      }
    }, {
      path: 'device/detail/:id',
      component: (resolve) => require(['@/views/iot/device/device/detail/index'], resolve),
      name: 'IoTDeviceDetail',
      meta: {
        title: '设备详情',
        noCache: true,
        hidden: true,
        activeMenu: '/iot/device/device'
      }
    }, {
      path: 'ota/operation/firmware/detail/:id',
      component: (resolve) => require(['@/views/iot/ota/firmware/detail/index'], resolve),
      name: 'IoTOtaFirmwareDetail',
      meta: {
        title: '固件详情',
        noCache: true,
        hidden: true,
        activeMenu: '/iot/operation/ota/firmware'
      }
    }]
  },
  {
    // Vue Router 3 需要显式的透传组件承载 Vue3 中的无组件分组路由。
    path: '/im',
    component: ParentView,
    name: 'Im',
    redirect: '/im/home/conversation',
    hidden: true,
    meta: { hidden: true, title: 'IM 即时通讯' },
    children: [{
      path: 'home',
      component: (resolve) => require(['@/views/im/home/index'], resolve),
      name: 'ImHome',
      redirect: '/im/home/conversation',
      meta: { hidden: true, title: '聊天' },
      children: [{
        path: 'conversation',
        component: (resolve) => require(['@/views/im/home/pages/conversation/index'], resolve),
        name: 'ImHomeConversation',
        meta: { hidden: true, title: '消息' }
      }, {
        path: 'contact',
        component: (resolve) => require(['@/views/im/home/pages/contact/index'], resolve),
        name: 'ImHomeContact',
        meta: { hidden: true, title: '通讯录' }
      }]
    }]
  },
  {
    // MP 页面的菜单无关烟测入口；生产菜单仍由权限动态生成。
    path: '/mp',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [{
      path: '__smoke/auto-reply',
      component: (resolve) => require(['@/views/mp/autoReply/index'], resolve),
      name: 'MpAutoReplySmoke',
      meta: { title: '自动回复', activeMenu: '/mp/auto-reply' }
    }, {
      path: '__smoke/message-template',
      component: (resolve) => require(['@/views/mp/messageTemplate/index'], resolve),
      name: 'MpMessageTemplateSmoke',
      meta: { title: '模板消息', activeMenu: '/mp/message-template' }
    }, {
      path: '__smoke/menu',
      component: (resolve) => require(['@/views/mp/menu/index'], resolve),
      name: 'MpMenuSmoke',
      meta: { title: '公众号菜单', activeMenu: '/mp/menu' }
    }, {
      path: '__smoke/draft',
      component: (resolve) => require(['@/views/mp/draft/index'], resolve),
      name: 'MpDraftSmoke',
      meta: { title: '公众号图文', activeMenu: '/mp/draft' }
    }, {
      path: '__smoke/material',
      component: (resolve) => require(['@/views/mp/material/index'], resolve),
      name: 'MpMaterialSmoke',
      meta: { title: '公众号素材', activeMenu: '/mp/material' }
    }]
  },
  {
    // Redis 页已存在，该直达入口用于核对最后一个 Infra 类型契约。
    path: '/infra',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [{
      path: '__smoke/redis',
      component: (resolve) => require(['@/views/infra/redis/index'], resolve),
      name: 'InfraRedisSmoke',
      meta: { title: 'Redis 监控', activeMenu: '/infra/redis' }
    }]
  },
  {
    // 会员详情由用户列表进入，保持与 Vue3 的隐藏详情路由一致。
    path: '/member',
    component: Layout,
    name: 'MemberCenter',
    hidden: true,
    meta: { hidden: true },
    children: [{
      path: 'user/detail/:id',
      component: (resolve) => require(['@/views/member/user/detail/index'], resolve),
      name: 'MemberUserDetail',
      meta: { title: '会员详情', noCache: true, hidden: true }
    }]
  },
  {
    // Mall 首页烟测入口使用独立前缀，避免遮蔽生产动态菜单。
    path: '/mall',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [{
      path: '__smoke/home',
      component: (resolve) => require(['@/views/mall/home/index'], resolve),
      name: 'MallHomeSmoke',
      meta: { title: '商城首页', activeMenu: '/mall/home' }
    }]
  },
  {
    // 商品表单和属性值是 Vue3 remaining.ts 的隐藏路由；列表只保留隔离的烟测入口。
    path: '/mall/product',
    component: Layout,
    name: 'ProductCenter',
    hidden: true,
    meta: { hidden: true },
    children: [{
      path: 'spu/add',
      component: (resolve) => require(['@/views/mall/product/spu/form/index'], resolve),
      name: 'ProductSpuAdd',
      meta: {
        noCache: false,
        hidden: true,
        canTo: true,
        icon: 'ep:edit',
        title: '商品添加',
        activeMenu: '/mall/product/spu'
      }
    }, {
      path: 'spu/edit/:id(\\d+)',
      component: (resolve) => require(['@/views/mall/product/spu/form/index'], resolve),
      name: 'ProductSpuEdit',
      meta: {
        noCache: true,
        hidden: true,
        canTo: true,
        icon: 'ep:edit',
        title: '商品编辑',
        activeMenu: '/mall/product/spu'
      }
    }, {
      path: 'spu/detail/:id(\\d+)',
      component: (resolve) => require(['@/views/mall/product/spu/form/index'], resolve),
      name: 'ProductSpuDetail',
      meta: {
        noCache: true,
        hidden: true,
        canTo: true,
        icon: 'ep:view',
        title: '商品详情',
        activeMenu: '/mall/product/spu'
      }
    }, {
      path: 'property/value/:propertyId(\\d+)',
      component: (resolve) => require(['@/views/mall/product/property/value'], resolve),
      name: 'ProductPropertyValue',
      meta: {
        noCache: true,
        hidden: true,
        canTo: true,
        icon: 'ep:view',
        title: '商品属性值',
        activeMenu: '/product/property'
      }
    }, {
      path: '__smoke/spu',
      component: (resolve) => require(['@/views/mall/product/spu/index'], resolve),
      name: 'ProductSpuSmoke',
      meta: { title: '商品 SPU', activeMenu: '/mall/product/spu' }
    }, {
      path: '__smoke/brand',
      component: (resolve) => require(['@/views/mall/product/brand/index'], resolve),
      name: 'ProductBrandSmoke',
      meta: { title: '商品品牌', activeMenu: '/product/brand' }
    }, {
      path: '__smoke/category',
      component: (resolve) => require(['@/views/mall/product/category/index'], resolve),
      name: 'ProductCategorySmoke',
      meta: { title: '商品分类', activeMenu: '/product/category' }
    }, {
      path: '__smoke/comment',
      component: (resolve) => require(['@/views/mall/product/comment/index'], resolve),
      name: 'ProductCommentSmoke',
      meta: { title: '商品评价', activeMenu: '/product/comment' }
    }, {
      path: '__smoke/property',
      component: (resolve) => require(['@/views/mall/product/property/index'], resolve),
      name: 'ProductPropertySmoke',
      meta: { title: '商品属性', activeMenu: '/product/property' }
    }]
  },
  {
    // 交易详情是 Vue3 remaining.ts 的隐藏路由；列表页只保留隔离的烟测入口。
    path: '/mall/trade',
    component: Layout,
    name: 'TradeCenter',
    hidden: true,
    meta: { hidden: true },
    children: [{
      path: 'order/detail/:id(\\d+)',
      name: 'TradeOrderDetail',
      component: (resolve) => require(['@/views/mall/trade/order/detail'], resolve),
      meta: { title: '订单详情', icon: 'ep:view', activeMenu: '/mall/trade/order' }
    }, {
      path: 'after-sale/detail/:id(\\d+)',
      name: 'TradeAfterSaleDetail',
      component: (resolve) => require(['@/views/mall/trade/afterSale/detail/index'], resolve),
      meta: { title: '退款详情', icon: 'ep:view', activeMenu: '/mall/trade/after-sale' }
    }, {
      path: '__smoke/config',
      component: (resolve) => require(['@/views/mall/trade/config/index'], resolve),
      name: 'MallTradeConfigSmoke',
      meta: { title: '交易配置', activeMenu: '/mall/trade/config' }
    }, {
      path: '__smoke/brokerage/record',
      component: (resolve) => require(['@/views/mall/trade/brokerage/record/index'], resolve),
      name: 'MallBrokerageRecordSmoke',
      meta: { title: '佣金记录', activeMenu: '/mall/trade/brokerage/record' }
    }, {
      path: '__smoke/brokerage/user',
      component: (resolve) => require(['@/views/mall/trade/brokerage/user/index'], resolve),
      name: 'MallBrokerageUserSmoke',
      meta: { title: '分销用户', activeMenu: '/mall/trade/brokerage/user' }
    }, {
      path: '__smoke/brokerage/withdraw',
      component: (resolve) => require(['@/views/mall/trade/brokerage/withdraw/index'], resolve),
      name: 'MallBrokerageWithdrawSmoke',
      meta: { title: '佣金提现', activeMenu: '/mall/trade/brokerage/withdraw' }
    }, {
      path: '__smoke/delivery/express',
      component: (resolve) => require(['@/views/mall/trade/delivery/express/index'], resolve),
      name: 'MallDeliveryExpressSmoke',
      meta: { title: '快递公司', activeMenu: '/mall/trade/delivery/express' }
    }, {
      path: '__smoke/delivery/express-template',
      component: (resolve) => require(['@/views/mall/trade/delivery/expressTemplate/index'], resolve),
      name: 'MallDeliveryExpressTemplateSmoke',
      meta: { title: '运费模板', activeMenu: '/mall/trade/delivery/express-template' }
    }, {
      path: '__smoke/delivery/pick-up-store',
      component: (resolve) => require(['@/views/mall/trade/delivery/pickUpStore/index'], resolve),
      name: 'MallDeliveryPickUpStoreSmoke',
      meta: { title: '自提门店', activeMenu: '/mall/trade/delivery/pick-up-store' }
    }, {
      path: '__smoke/delivery/pick-up-order',
      component: (resolve) => require(['@/views/mall/trade/delivery/pickUpOrder/index'], resolve),
      name: 'MallDeliveryPickUpOrderSmoke',
      meta: { title: '自提核销', activeMenu: '/mall/trade/delivery/pick-up-order' }
    }]
  },
  {
    // Mall 统计页烟测使用独立前缀，生产菜单仍由权限动态生成。
    path: '/mall/statistics',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [{
      path: '__smoke/trade',
      component: (resolve) => require(['@/views/mall/statistics/trade/index'], resolve),
      name: 'MallStatisticsTradeSmoke',
      meta: { title: '交易统计', activeMenu: '/mall/statistics/trade' }
    }, {
      path: '__smoke/member',
      component: (resolve) => require(['@/views/mall/statistics/member/index'], resolve),
      name: 'MallStatisticsMemberSmoke',
      meta: { title: '会员统计', activeMenu: '/mall/statistics/member' }
    }, {
      path: '__smoke/product',
      component: (resolve) => require(['@/views/mall/statistics/product/index'], resolve),
      name: 'MallStatisticsProductSmoke',
      meta: { title: '商品统计', activeMenu: '/mall/statistics/product' }
    }]
  },
  {
    path: '/pay',
    component: Layout,
    name: 'pay',
    hidden: true,
    children: [{
      path: 'cashier',
      name: 'PayCashier',
      hidden: true,
      meta: {
        title: '收银台',
        noCache: true
      },
      component: (resolve) => require(['@/views/pay/cashier'], resolve)
    }]
  }
]

// 防止连续点击多次路由报错
let routerPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(err => err)
}

export default new Router({
  base: process.env.VUE_APP_APP_NAME ? process.env.VUE_APP_APP_NAME : "/",
  mode: 'history', // 去掉url中的#
  scrollBehavior: () => ({y: 0}),
  routes: constantRoutes
})
