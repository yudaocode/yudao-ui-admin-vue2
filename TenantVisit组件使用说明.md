# TenantVisit 租户下拉选择组件

## 概述

TenantVisit 是基于 yudao-ui-admin-vue3 项目开发的租户下拉选择组件，支持用户在不同租户之间进行切换。该组件完全集成了芋道项目的租户管理功能，提供了完整的权限控制、搜索功能和用户友好的交互体验。

## 功能特性

- ✅ **租户列表展示**：自动获取可用租户列表
- ✅ **租户切换**：支持用户在不同租户间切换
- ✅ **搜索功能**：当租户数量超过5个时，自动显示搜索框
- ✅ **权限控制**：基于 `system:tenant:query` 权限控制
- ✅ **状态标识**：显示租户状态（正常/禁用/系统租户）
- ✅ **本地存储**：自动保存当前租户信息到 localStorage
- ✅ **实时更新**：支持租户列表刷新
- ✅ **管理跳转**：快速跳转到租户管理页面
- ✅ **响应式设计**：适配不同屏幕尺寸

## 安装与集成

### 1. 组件文件结构

```
src/
├── components/
│   └── TenantVisit/
│       └── index.vue          # 主组件文件
├── layout/
│   └── components/
│       └── Navbar.vue         # 已集成的导航栏
├── store/
│   └── modules/
│       └── app.js             # 已添加租户状态管理
└── api/
    └── system/
        └── tenant.js          # 租户相关API
```

### 2. 自动集成

组件已自动集成到导航栏中，无需额外配置。组件会自动出现在导航栏右侧，用户可以直接使用。

### 3. 手动使用

如果需要在其他地方使用该组件：

```vue
<template>
  <div>
    <tenant-visit @tenant-change="handleTenantChange" />
  </div>
</template>

<script>
import TenantVisit from '@/components/TenantVisit'

export default {
  components: {
    TenantVisit
  },
  methods: {
    handleTenantChange(tenant) {
      console.log('租户已切换:', tenant)
      // 处理租户切换逻辑
    }
  }
}
</script>
```

## API 文档

### Props

目前组件不接受任何 props，所有配置都是内部自动处理。

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| tenant-change | 租户切换时触发 | (tenant: Object) 租户对象 |

### 租户对象结构

```javascript
{
  id: 1,                    // 租户ID
  name: "示例租户",          // 租户名称
  status: 0,               // 租户状态 (0:正常, 1:禁用)
  contactName: "联系人姓名", // 联系人
  contactMobile: "手机号",  // 联系电话
  packageId: 1,            // 租户套餐ID
  domain: "example.com",   // 绑定域名
  expireTime: "2024-12-31" // 过期时间
}
```

## 使用方法

### 基本使用

组件已集成到导航栏，用户可以直接点击租户选择器进行切换：

1. 点击导航栏右侧的租户选择器
2. 在下拉菜单中选择目标租户
3. 确认切换操作
4. 页面自动刷新并应用新租户环境

### 权限要求

使用该组件需要以下权限：
- `system:tenant:query`：查询租户列表权限

如果用户没有相应权限，组件将不会显示租户列表，只显示当前租户信息。

### 状态管理

组件自动与 Vuex store 集成，可以通过以下方式获取当前租户信息：

```javascript
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['currentTenant'])
  },
  mounted() {
    console.log('当前租户:', this.currentTenant)
  }
}
```

### 本地存储

租户信息会自动保存到 localStorage 中，键名为 `currentTenant`：

```javascript
// 获取当前租户
const tenant = JSON.parse(localStorage.getItem('currentTenant'))

// 手动设置租户（不推荐，建议使用组件）
localStorage.setItem('currentTenant', JSON.stringify({
  id: 1,
  name: '测试租户'
}))
```

## 自定义配置

### 样式自定义

可以通过 CSS 覆盖组件样式：

```scss
// 自定义选择器样式
.tenant-visit .tenant-dropdown .tenant-selector {
  background-color: #f5f5f5;
  border-radius: 8px;
}

// 自定义下拉菜单样式
.tenant-dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

// 自定义租户项样式
.tenant-dropdown-menu .tenant-item:hover {
  background-color: #e8f4fd;
}
```

### 功能扩展

如果需要在租户切换时执行自定义逻辑，可以监听 `tenant-change` 事件：

```javascript
methods: {
  handleTenantChange(tenant) {
    // 租户切换后的自定义逻辑
    console.log('切换到租户:', tenant.name)
    
    // 例如：更新用户权限
    this.$store.dispatch('user/refreshPermissions')
    
    // 例如：刷新特定数据
    this.refreshData()
    
    // 例如：发送统计数据
    this.sendAnalytics('tenant_switch', { tenantId: tenant.id })
  }
}
```

## 最佳实践

### 1. 权限检查

在使用租户相关功能前，建议先检查用户权限：

```javascript
// 检查是否有租户查询权限
if (this.$store.getters.permissions.includes('system:tenant:query')) {
  // 显示租户相关功能
} else {
  // 隐藏或禁用功能
}
```

### 2. 错误处理

处理租户切换可能出现的错误：

```javascript
methods: {
  async handleTenantChange(tenant) {
    try {
      // 执行切换前的准备工作
      await this.prepareTenantSwitch(tenant)
      
      // 租户切换成功后的处理
      this.$message.success(`已切换到租户：${tenant.name}`)
      
    } catch (error) {
      console.error('租户切换失败:', error)
      this.$message.error('租户切换失败，请重试')
    }
  }
}
```

### 3. 性能优化

对于租户列表较多的情况，组件已内置搜索功能和虚拟滚动优化，但仍建议：

- 合理设置租户列表的分页大小
- 避免频繁的租户切换操作
- 缓存租户列表数据

## 故障排除

### 常见问题

1. **组件不显示租户列表**
   - 检查用户是否有 `system:tenant:query` 权限
   - 确认 API 接口是否正常工作
   - 查看浏览器控制台是否有错误信息

2. **租户切换不生效**
   - 确认 localStorage 是否可正常读写
   - 检查 Vuex store 是否正确配置
   - 验证租户切换事件是否正确触发

3. **样式显示异常**
   - 确认 Element UI 样式是否正确加载
   - 检查是否有 CSS 冲突
   - 验证组件的 scoped 样式是否生效

### 调试建议

开启调试模式：

```javascript
// 在组件中临时添加调试日志
console.log('租户列表:', this.tenantList)
console.log('当前租户:', this.currentTenant)
console.log('用户权限:', this.$store.getters.permissions)
```

## 版本更新

### v1.0.0
- 初始版本发布
- 支持基本的租户切换功能
- 集成权限控制和搜索功能
- 完整的样式和交互设计

## 技术支持

如果在使用过程中遇到问题，可以：

1. 查看浏览器控制台的错误信息
2. 检查网络请求是否正常
3. 确认用户权限配置是否正确
4. 参考演示页面的实现方式

## 许可证

本组件基于 MIT 许可证开源，可以自由使用和修改。