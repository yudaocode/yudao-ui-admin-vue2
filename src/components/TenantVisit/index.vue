<template>
  <div class="tenant-visit">
    <el-dropdown 
      trigger="click" 
      placement="bottom-start" 
      @command="handleTenantChange"
      class="tenant-dropdown"
    >
      <div class="tenant-selector">
        <i class="el-icon-office-building" style="margin-right: 5px;"></i>
        <span class="tenant-name">{{ currentTenantName }}</span>
        <i class="el-icon-arrow-down el-icon--right"></i>
      </div>
      
      <el-dropdown-menu slot="dropdown" class="tenant-dropdown-menu">
        <div class="tenant-header">
          <span>选择租户</span>
          <el-button 
            type="text" 
            size="mini" 
            @click="refreshTenantList"
            :loading="refreshing"
          >
            <i class="el-icon-refresh"></i>
          </el-button>
        </div>
        
        <div class="tenant-search" v-if="tenantList.length > 5">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索租户"
            size="mini"
            prefix-icon="el-icon-search"
            @input="handleSearch"
            clearable
          />
        </div>
        
        <div class="tenant-list">
          <template v-if="filteredTenantList.length > 0">
            <el-dropdown-item 
              v-for="tenant in filteredTenantList" 
              :key="tenant.id"
              :command="tenant"
              :class="{ 'is-active': currentTenantId === tenant.id }"
              class="tenant-item"
            >
              <div class="tenant-item-content">
                <div class="tenant-info">
                  <span class="tenant-name">{{ tenant.name }}</span>
                  <el-tag 
                    v-if="tenant.id === 0" 
                    type="danger" 
                    size="mini"
                    class="tenant-tag"
                  >
                    系统租户
                  </el-tag>
                  <el-tag 
                    v-else-if="tenant.status === 0" 
                    type="success" 
                    size="mini"
                    class="tenant-tag"
                  >
                    正常
                  </el-tag>
                  <el-tag 
                    v-else 
                    type="danger" 
                    size="mini"
                    class="tenant-tag"
                  >
                    禁用
                  </el-tag>
                </div>
                <div class="tenant-desc" v-if="tenant.contactName">
                  联系人：{{ tenant.contactName }}
                </div>
              </div>
              <i v-if="currentTenantId === tenant.id" class="el-icon-check tenant-check"></i>
            </el-dropdown-item>
          </template>
          
          <div v-else class="no-tenant">
            <i class="el-icon-info"></i>
            <span>暂无可选租户</span>
          </div>
        </div>
        
        <div class="tenant-footer" v-if="hasManagePermission">
          <el-divider style="margin: 10px 0;"></el-divider>
          <el-dropdown-item command="manage" class="manage-item">
            <i class="el-icon-setting"></i>
            <span>管理租户</span>
          </el-dropdown-item>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
import { getTenantPage } from '@/api/system/tenant'
import { mapGetters } from 'vuex'

export default {
  name: 'TenantVisit',
  data() {
    return {
      // 租户列表
      tenantList: [],
      // 过滤后的租户列表
      filteredTenantList: [],
      // 当前选中的租户ID
      currentTenantId: null,
      // 当前租户名称
      currentTenantName: '请选择租户',
      // 搜索关键词
      searchKeyword: '',
      // 加载状态
      loading: false,
      // 刷新状态
      refreshing: false,
      // 是否有管理权限
      hasManagePermission: false
    }
  },
  computed: {
    ...mapGetters(['permissions', 'roles'])
  },
  mounted() {
    this.init()
  },
  methods: {
    /**
     * 初始化组件
     */
    async init() {
      // 检查管理权限
      this.checkManagePermission()
      
      // 获取当前租户信息
      this.loadCurrentTenant()
      
      // 加载租户列表
      await this.loadTenantList()
    },
    
    /**
     * 检查管理权限
     */
    checkManagePermission() {
      this.hasManagePermission = this.checkPermission(['system:tenant:query'])
    },
    
    /**
     * 检查权限
     */
    checkPermission(permissions) {
      if (!permissions || permissions.length === 0) return true
      return permissions.some(permission => {
        return this.permissions.includes(permission)
      })
    },
    
    /**
     * 加载当前租户信息
     */
    loadCurrentTenant() {
      // 从 localStorage 或 sessionStorage 获取当前租户信息
      const tenantInfo = localStorage.getItem('currentTenant')
      if (tenantInfo) {
        try {
          const tenant = JSON.parse(tenantInfo)
          this.currentTenantId = tenant.id
          this.currentTenantName = tenant.name
        } catch (e) {
          console.error('解析租户信息失败:', e)
        }
      }
      
      // 如果没有租户信息，设置默认值
      if (!this.currentTenantId) {
        this.currentTenantId = 0
        this.currentTenantName = '系统租户'
      }
    },
    
    /**
     * 加载租户列表
     */
    async loadTenantList() {
      if (!this.hasManagePermission) {
        return
      }
      
      this.loading = true
      try {
        const response = await getTenantPage({
          pageNo: 1,
          pageSize: 100, // 获取前100个租户
          status: 0 // 只获取正常状态的租户
        })
        
        this.tenantList = response.data.list || []
        
        // 添加系统租户（如果不存在）
        const hasSystemTenant = this.tenantList.find(t => t.id === 0)
        if (!hasSystemTenant) {
          this.tenantList.unshift({
            id: 0,
            name: '系统租户',
            status: 0,
            contactName: '系统管理员'
          })
        }
        
        this.filteredTenantList = [...this.tenantList]
        
        // 如果当前租户不在列表中，添加到列表
        this.ensureCurrentTenantInList()
        
      } catch (error) {
        console.error('获取租户列表失败:', error)
        this.$message.error('获取租户列表失败')
      } finally {
        this.loading = false
      }
    },
    
    /**
     * 确保当前租户在列表中
     */
    ensureCurrentTenantInList() {
      if (this.currentTenantId && !this.tenantList.find(t => t.id === this.currentTenantId)) {
        this.tenantList.unshift({
          id: this.currentTenantId,
          name: this.currentTenantName,
          status: 0
        })
        this.filteredTenantList = [...this.tenantList]
      }
    },
    
    /**
     * 处理租户切换
     */
    async handleTenantChange(command) {
      if (command === 'manage') {
        // 跳转到租户管理页面
        this.$router.push('/system/tenant')
        return
      }
      
      if (!command || command.id === this.currentTenantId) {
        return
      }
      
      try {
        // 确认切换
        await this.$modal.confirm(
          `确定要切换到租户"${command.name}"吗？切换后页面将刷新。`,
          '切换租户',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        // 执行切换
        await this.switchTenant(command)
        
      } catch {
        // 用户取消操作
      }
    },
    
    /**
     * 切换租户
     */
    async switchTenant(tenant) {
      try {
        // 保存租户信息到本地存储
        localStorage.setItem('currentTenant', JSON.stringify({
          id: tenant.id,
          name: tenant.name
        }))
        
        // 更新当前租户信息
        this.currentTenantId = tenant.id
        this.currentTenantName = tenant.name
        
        // 发送租户切换事件
        this.$emit('tenant-change', tenant)
        
        // 如果需要，可以触发全局状态更新
        this.$store.dispatch('app/setCurrentTenant', tenant)
        
        this.$message.success(`已切换到租户"${tenant.name}"`)
        
        // 延迟刷新页面，让用户看到成功提示
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        
      } catch (error) {
        console.error('切换租户失败:', error)
        this.$message.error('切换租户失败')
      }
    },
    
    /**
     * 处理搜索
     */
    handleSearch() {
      if (!this.searchKeyword.trim()) {
        this.filteredTenantList = [...this.tenantList]
        return
      }
      
      const keyword = this.searchKeyword.toLowerCase()
      this.filteredTenantList = this.tenantList.filter(tenant => {
        return tenant.name.toLowerCase().includes(keyword) ||
               (tenant.contactName && tenant.contactName.toLowerCase().includes(keyword))
      })
    },
    
    /**
     * 刷新租户列表
     */
    async refreshTenantList() {
      this.refreshing = true
      try {
        await this.loadTenantList()
        this.$message.success('租户列表已刷新')
      } catch (error) {
        this.$message.error('刷新失败')
      } finally {
        this.refreshing = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tenant-visit {
  .tenant-dropdown {
    .tenant-selector {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.3s;
      color: #606266;
      font-size: 14px;
      min-width: 120px;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.025);
      }
      
      .tenant-name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 150px;
      }
    }
  }
}

.tenant-dropdown-menu {
  min-width: 280px;
  max-width: 320px;
  
  .tenant-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px 8px;
    font-weight: 600;
    color: #303133;
    border-bottom: 1px solid #EBEEF5;
    
    span {
      font-size: 14px;
    }
  }
  
  .tenant-search {
    padding: 8px 16px;
    border-bottom: 1px solid #EBEEF5;
  }
  
  .tenant-list {
    max-height: 300px;
    overflow-y: auto;
    
    .tenant-item {
      position: relative;
      padding: 0 !important;
      
      &.is-active {
        background-color: #f5f7fa;
        
        .tenant-item-content {
          .tenant-info .tenant-name {
            color: #409eff;
            font-weight: 600;
          }
        }
      }
      
      .tenant-item-content {
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        
        .tenant-info {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
          
          .tenant-name {
            font-size: 14px;
            color: #303133;
            margin-right: 8px;
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .tenant-tag {
            margin-left: auto;
          }
        }
        
        .tenant-desc {
          font-size: 12px;
          color: #909399;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      
      .tenant-check {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #409eff;
        font-size: 16px;
      }
    }
    
    .no-tenant {
      padding: 20px;
      text-align: center;
      color: #909399;
      font-size: 14px;
      
      i {
        margin-right: 5px;
      }
    }
  }
  
  .tenant-footer {
    .manage-item {
      color: #409eff !important;
      
      i {
        margin-right: 5px;
      }
    }
  }
}

// 滚动条样式
.tenant-list::-webkit-scrollbar {
  width: 6px;
}

.tenant-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tenant-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.tenant-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>