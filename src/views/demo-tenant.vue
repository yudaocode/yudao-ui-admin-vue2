<template>
  <div class="demo-container">
    <div class="header">
      <h2>租户下拉选择组件演示</h2>
      <p>这是一个基于 yudao-ui-admin-vue3 项目的租户下拉选择组件演示页面</p>
    </div>
    
    <el-card class="demo-card">
      <div slot="header">
        <span>TenantVisit 组件演示</span>
      </div>
      
      <div class="demo-content">
        <h3>1. 基本使用</h3>
        <p>将 TenantVisit 组件放置在任何需要的位置：</p>
        <div class="demo-item">
          <tenant-visit @tenant-change="handleTenantChange" />
        </div>
        
        <h3>2. 当前租户信息</h3>
        <el-table :data="[currentTenantInfo]" style="width: 100%">
          <el-table-column prop="id" label="租户ID" width="100"></el-table-column>
          <el-table-column prop="name" label="租户名称" width="200"></el-table-column>
          <el-table-column prop="updateTime" label="最后更新时间"></el-table-column>
        </el-table>
        
        <h3>3. 组件特性</h3>
        <ul class="feature-list">
          <li>✅ 支持租户列表下拉选择</li>
          <li>✅ 显示当前选中租户</li>
          <li>✅ 支持租户搜索功能（当租户数量 > 5 时显示）</li>
          <li>✅ 权限控制（需要 system:tenant:query 权限）</li>
          <li>✅ 租户状态标识（正常/禁用/系统租户）</li>
          <li>✅ 点击管理租户跳转到租户管理页面</li>
          <li>✅ 租户切换后自动刷新页面</li>
          <li>✅ 本地存储当前租户信息</li>
        </ul>
        
        <h3>4. 使用说明</h3>
        <el-alert 
          title="使用提示" 
          type="info" 
          show-icon
          description="组件已自动集成到导航栏右侧，用户可以通过下拉菜单选择不同的租户进行切换。切换租户后页面会自动刷新以应用新的租户环境。"
        />
        
        <h3>5. 代码示例</h3>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="模板代码" name="template">
            <pre v-highlight><code class="html">{{templateCode}}</code></pre>
          </el-tab-pane>
          <el-tab-pane label="JavaScript 代码" name="script">
            <pre v-highlight><code class="javascript">{{scriptCode}}</code></pre>
          </el-tab-pane>
          <el-tab-pane label="样式代码" name="style">
            <pre v-highlight><code class="css">{{styleCode}}</code></pre>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script>
import TenantVisit from '@/components/TenantVisit'
import { mapGetters } from 'vuex'

export default {
  name: 'DemoTenant',
  components: {
    TenantVisit
  },
  data() {
    return {
      activeTab: 'template',
      templateCode: `<template>
  <div class="your-container">
    <!-- 在任何位置使用 TenantVisit 组件 -->
    <tenant-visit @tenant-change="handleTenantChange" />
  </div>
</template>`,
      scriptCode: `<script>
import TenantVisit from '@/components/TenantVisit'

export default {
  components: {
    TenantVisit
  },
  methods: {
    /**
     * 处理租户切换事件
     */
    handleTenantChange(tenant) {
      console.log('租户已切换:', tenant)
      // 可以在这里处理租户切换后的逻辑
      // 比如刷新用户权限、更新菜单等
    }
  }
}
</script>`,
      styleCode: `/* 组件已包含完整样式，无需额外配置 */
.tenant-visit {
  /* 可以根据需要调整位置和样式 */
}

/* 如果需要自定义样式，可以覆盖以下类 */
.tenant-dropdown .tenant-selector {
  /* 自定义选择器样式 */
}

.tenant-dropdown-menu {
  /* 自定义下拉菜单样式 */
}`
    }
  },
  computed: {
    ...mapGetters(['currentTenant']),
    currentTenantInfo() {
      return {
        id: this.currentTenant?.id || 0,
        name: this.currentTenant?.name || '系统租户',
        updateTime: new Date().toLocaleString()
      }
    }
  },
  methods: {
    /**
     * 处理租户切换事件
     */
    handleTenantChange(tenant) {
      console.log('演示页面 - 租户切换:', tenant)
      this.$message.success(`演示页面检测到租户切换: ${tenant.name}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.demo-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  .header {
    text-align: center;
    margin-bottom: 30px;
    
    h2 {
      color: #303133;
      margin-bottom: 10px;
    }
    
    p {
      color: #606266;
      font-size: 14px;
    }
  }
  
  .demo-card {
    .demo-content {
      h3 {
        color: #409eff;
        margin: 20px 0 10px 0;
        font-size: 16px;
        
        &:first-child {
          margin-top: 0;
        }
      }
      
      p {
        color: #606266;
        margin-bottom: 15px;
        line-height: 1.6;
      }
      
      .demo-item {
        padding: 15px;
        border: 1px dashed #e4e7ed;
        border-radius: 4px;
        margin-bottom: 20px;
        background-color: #fafafa;
        
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .feature-list {
        list-style: none;
        padding: 0;
        
        li {
          padding: 8px 0;
          color: #606266;
          font-size: 14px;
          border-bottom: 1px solid #f0f0f0;
          
          &:last-child {
            border-bottom: none;
          }
        }
      }
      
      pre {
        background-color: #f6f8fa;
        border: 1px solid #e1e4e8;
        border-radius: 6px;
        padding: 16px;
        overflow-x: auto;
        font-size: 13px;
        line-height: 1.45;
        
        code {
          background: none;
          padding: 0;
          border: none;
          color: #24292e;
        }
      }
    }
  }
}

// 代码高亮样式
.hljs {
  background: #f6f8fa !important;
}
</style>