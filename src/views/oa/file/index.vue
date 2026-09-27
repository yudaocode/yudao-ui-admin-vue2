<template>
  <div class="app-container oa-file">
    <!-- 云盘概览，独立于列表筛选 -->
    <oa-file-storage ref="storage" />
    <div class="oa-file__main">
      <!-- 左侧文件导航与分类 -->
      <div class="oa-file__side">
        <div class="oa-file__side-title">企业云盘</div>
        <div class="oa-file__side-group">
          <el-button
            v-for="item in OA_FILE_SCOPE_OPTIONS"
            :key="item.value"
            class="oa-file__side-item"
            :class="{ 'is-active': scope === item.value }"
            type="text"
            @click="handleScope(item.value)"
          >
            <i :class="item.icon" class="oa-file__side-icon" />{{ item.label }}
          </el-button>
        </div>
        <el-divider />
        <div class="oa-file__side-subtitle">文件分类</div>
        <div class="oa-file__side-group">
          <el-button
            v-for="item in categoryOptions"
            :key="item.value"
            class="oa-file__side-item"
            :class="{ 'is-active': (queryParams.category || OA_FILE_CATEGORY.ALL) === item.value }"
            type="text"
            @click="handleCategory(item.value)"
          >
            <i :class="fileCategoryIcons[item.value]" class="oa-file__side-icon" />{{ item.label }}
          </el-button>
        </div>
      </div>

      <div class="oa-file__content">
        <!-- 查询与操作 -->
        <el-form ref="queryForm" :model="queryParams" :inline="true" label-width="68px" class="query-form" @submit.native.prevent>
          <el-form-item label="名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入名称"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="类型" prop="category">
            <el-select v-model="queryParams.category" placeholder="请选择类型" clearable style="width: 240px">
              <el-option
                v-for="item in categoryOptions.filter(item => item.value !== OA_FILE_CATEGORY.ALL)"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" prop="createTime">
            <el-date-picker
              v-model="queryParams.createTime"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="datetimerange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
            <el-button
              v-if="canCreate"
              v-hasPermi="['oa:file:create']"
              type="primary"
              plain
              icon="el-icon-folder-add"
              @click="openForm('create')"
            >
              新建文件夹
            </el-button>
            <oa-file-upload
              v-if="canCreate"
              v-hasPermi="['oa:file:create']"
              :parent-id="currentParentId"
              @success="handleSuccess"
            />
          </el-form-item>
        </el-form>

        <!-- 文件列表与目录面包屑 -->
        <div class="oa-file__list">
          <el-breadcrumb separator="/" class="oa-file__breadcrumb">
            <el-breadcrumb-item v-for="(item, index) in paths" :key="item.id">
              <el-link :underline="false" type="primary" @click="handlePath(index)">{{ item.name }}</el-link>
            </el-breadcrumb-item>
          </el-breadcrumb>
          <el-table v-loading="loading" :data="list" row-key="id">
            <el-table-column label="名称" min-width="240" show-overflow-tooltip>
              <template slot-scope="nameScope">
                <div class="oa-file__name">
                  <i
                    :class="nameScope.row.type === OA_FILE_NODE_TYPE.FOLDER ? 'el-icon-folder' : getFileIcon(nameScope.row.name)"
                    class="oa-file__icon"
                  />
                  <el-link
                    v-if="scope !== OA_FILE_SCOPE.RECYCLE"
                    type="primary"
                    :underline="false"
                    @click="handleOpen(nameScope.row)"
                  >
                    {{ nameScope.row.name }}
                  </el-link>
                  <span v-else>{{ nameScope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="大小" width="110">
              <template slot-scope="sizeScope">
                {{ sizeScope.row.type === OA_FILE_NODE_TYPE.FILE ? formatFileSize(sizeScope.row.size || 0) : '' }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" prop="createTime" :formatter="dateFormatter" width="180" />
            <el-table-column label="操作" align="center" width="180">
              <template slot-scope="opScope">
                <div class="oa-file__actions">
                  <template v-if="scope === OA_FILE_SCOPE.RECYCLE">
                    <el-button
                      v-hasPermi="['oa:file:delete']"
                      type="text"
                      size="mini"
                      @click="handleRestore(opScope.row)"
                    >
                      恢复
                    </el-button>
                    <el-button
                      v-hasPermi="['oa:file:delete']"
                      type="text"
                      size="mini"
                      class="danger-text"
                      @click="handleDelete(opScope.row)"
                    >
                      彻底删除
                    </el-button>
                  </template>
                  <template v-else>
                    <el-button
                      v-if="opScope.row.type === OA_FILE_NODE_TYPE.FILE && opScope.row.level >= OA_FILE_PERMISSION_LEVEL.DOWNLOAD"
                      type="text"
                      size="mini"
                      @click="handleDownload(opScope.row)"
                    >
                      下载
                    </el-button>
                    <el-button
                      v-if="opScope.row.level >= OA_FILE_PERMISSION_LEVEL.MANAGE && checkPermi(['oa:file:share'])"
                      type="text"
                      size="mini"
                      @click="openPermissionForm(opScope.row.id)"
                    >
                      共享
                    </el-button>
                    <el-dropdown trigger="click" @command="command => handleCommand(command, opScope.row)">
                      <el-button type="text" size="mini">更多<i class="el-icon-arrow-down el-icon--right" /></el-button>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="favorite">
                          {{ opScope.row.favorite ? '取消收藏' : '收藏' }}
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="opScope.row.level >= OA_FILE_PERMISSION_LEVEL.EDIT && checkPermi(['oa:file:update'])"
                          command="rename"
                        >
                          重命名
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="opScope.row.level >= OA_FILE_PERMISSION_LEVEL.DOWNLOAD && checkPermi(['oa:file:create'])"
                          command="copy"
                        >
                          复制
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="isOwner(opScope.row) && checkPermi(['oa:file:update'])"
                          command="move"
                        >
                          移动
                        </el-dropdown-item>
                        <el-dropdown-item
                          v-if="isOwner(opScope.row) && checkPermi(['oa:file:delete'])"
                          command="recycle"
                          divided
                          class="danger-item"
                        >
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </template>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <pagination
            v-show="total > 0"
            :total="total"
            :page.sync="queryParams.pageNo"
            :limit.sync="queryParams.pageSize"
            @pagination="getList"
          />
        </div>
      </div>
    </div>

    <!-- 文件预览、新增、重命名、移动及共享弹窗 -->
    <oa-file-preview ref="preview" />
    <oa-file-node-form ref="form" @success="handleSuccess" />
    <oa-file-permission-list ref="permission" @success="handleSuccess" />
  </div>
</template>

<script>
import * as NodeApi from '@/api/oa/file/node'
import * as FavoriteApi from '@/api/oa/file/favorite'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { formatFileSize } from '@/utils/file'
import { downloadByData } from '@/utils/filt'
import { dateFormatter } from '@/utils/formatTime'
import store from '@/store'
import {
  OA_FILE_NODE_TYPE,
  OA_FILE_PARENT_ID_ROOT,
  OA_FILE_PERMISSION_LEVEL,
  OA_FILE_SCOPE,
  OA_FILE_SCOPE_OPTIONS,
  OA_FILE_CATEGORY
} from '@/views/oa/utils/constants'
import OaFileStorage from './OaFileStorage.vue'
import OaFileNodeForm from './OaFileNodeForm.vue'
import OaFilePreview from './OaFilePreview.vue'
import OaFilePermissionList from './OaFilePermissionList.vue'
import OaFileUpload from './OaFileUpload.vue'

// 分类图标只负责展示，分类名称与取值由字典维护。
const fileCategoryIcons = {
  [OA_FILE_CATEGORY.ALL]: 'el-icon-files',
  [OA_FILE_CATEGORY.IMAGE]: 'el-icon-picture',
  [OA_FILE_CATEGORY.DOCUMENT]: 'el-icon-document',
  [OA_FILE_CATEGORY.VIDEO]: 'el-icon-video-camera',
  [OA_FILE_CATEGORY.AUDIO]: 'el-icon-headset',
  [OA_FILE_CATEGORY.ARCHIVE]: 'el-icon-box',
  [OA_FILE_CATEGORY.OTHER]: 'el-icon-more'
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']

export default {
  name: 'OaFile',
  components: { OaFileStorage, OaFileNodeForm, OaFilePreview, OaFilePermissionList, OaFileUpload },
  data() {
    return {
      DICT_TYPE,
      OA_FILE_NODE_TYPE,
      OA_FILE_PERMISSION_LEVEL,
      OA_FILE_SCOPE,
      OA_FILE_SCOPE_OPTIONS,
      OA_FILE_CATEGORY,
      fileCategoryIcons,
      loading: false, // 列表加载中
      list: [], // 文件列表
      total: 0, // 总数
      scope: OA_FILE_SCOPE.MY, // 当前文件范围
      currentParentId: OA_FILE_PARENT_ID_ROOT, // 当前目录
      currentLevel: OA_FILE_PERMISSION_LEVEL.MANAGE, // 当前目录权限
      paths: [{ id: OA_FILE_PARENT_ID_ROOT, name: '我的文件', level: OA_FILE_PERMISSION_LEVEL.MANAGE }], // 面包屑
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        name: undefined,
        category: undefined,
        createTime: []
      }
    }
  },
  computed: {
    categoryOptions() {
      return getIntDictOptions(DICT_TYPE.OA_FILE_CATEGORY)
    },
    canCreate() {
      return (
        this.scope !== OA_FILE_SCOPE.RECYCLE &&
        !this.queryParams.category &&
        (this.currentParentId !== OA_FILE_PARENT_ID_ROOT
          ? this.currentLevel >= OA_FILE_PERMISSION_LEVEL.EDIT
          : this.scope === OA_FILE_SCOPE.MY)
      )
    }
  },
  created() {
    this.getList()
  },
  methods: {
    dateFormatter,
    formatFileSize,
    checkPermi,
    /** 获取文件图标 */
    getFileIcon(filename) {
      const ext = String(filename || '')
        .split('.')
        .pop()
        .toLowerCase()
      return IMAGE_EXTENSIONS.includes(ext) ? 'el-icon-picture' : 'el-icon-document'
    },
    /** 打开节点表单 */
    openForm(type, row) {
      this.$refs.form.open(type, (row && row.parentId) || this.currentParentId, row)
    },
    /** 打开共享设置 */
    openPermissionForm(id) {
      this.$refs.permission.open(id)
    },
    /** 操作成功后刷新列表与概览 */
    handleSuccess() {
      return Promise.all([this.getList(), this.$refs.storage.getStorage()])
    },
    /** 查询文件列表 */
    getList() {
      this.loading = true
      // 搜索或根目录收藏查询跨目录展示，否则只查询当前目录
      const parentId =
        this.queryParams.name ||
        this.queryParams.category ||
        (this.queryParams.createTime && this.queryParams.createTime.length) ||
        (this.scope === OA_FILE_SCOPE.FAVORITE && this.currentParentId === OA_FILE_PARENT_ID_ROOT)
          ? undefined
          : this.currentParentId
      return NodeApi.getFileNodePage({ ...this.queryParams, scope: this.scope, parentId }).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    /** 切换文件范围 */
    handleScope(value) {
      this.scope = value
      this.currentParentId = OA_FILE_PARENT_ID_ROOT
      this.currentLevel = value === OA_FILE_SCOPE.MY ? OA_FILE_PERMISSION_LEVEL.MANAGE : OA_FILE_PERMISSION_LEVEL.READ
      const option = OA_FILE_SCOPE_OPTIONS.find(item => item.value === value)
      this.paths = [{ id: OA_FILE_PARENT_ID_ROOT, name: option ? option.label : '', level: this.currentLevel }]
      this.queryParams.category = undefined
      this.resetQuery()
    },
    /** 切换分类 */
    handleCategory(value) {
      this.queryParams.category = value || undefined
      this.handleQuery()
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.queryParams.category = undefined
      return this.handleQuery()
    },
    /** 打开文件或目录 */
    handleOpen(row) {
      if (row.type === OA_FILE_NODE_TYPE.FILE) {
        this.$refs.preview.open(row)
        return
      }
      this.currentParentId = row.id
      this.currentLevel = row.level || OA_FILE_PERMISSION_LEVEL.READ
      this.paths.push({ id: row.id, name: row.name, level: this.currentLevel })
      this.queryParams.name = undefined
      this.queryParams.category = undefined
      this.queryParams.createTime = []
      this.handleQuery()
    },
    /** 返回上级目录 */
    handlePath(index) {
      // 还原目标目录的路径及权限
      this.paths = this.paths.slice(0, index + 1)
      this.currentParentId = this.paths[index].id
      this.currentLevel = this.paths[index].level
      this.resetQuery()
    },
    /** 判断本人节点 */
    isOwner(row) {
      return row.creator === String(store.getters.userId)
    },
    /** 执行更多操作 */
    handleCommand(command, row) {
      switch (command) {
        case 'favorite':
          this.handleFavorite(row)
          break
        case 'rename':
        case 'move':
        case 'copy':
          this.openForm(command, row)
          break
        case 'recycle':
          this.handleRecycle(row)
          break
      }
    },
    /** 获得授权地址后按云盘当前名称下载文件 */
    async handleDownload(row) {
      if ((row.level || 0) < OA_FILE_PERMISSION_LEVEL.DOWNLOAD) {
        this.$modal.msgWarning('当前仅具有查看文件信息的权限')
        return
      }
      const response = await NodeApi.getFileNode(row.id)
      const data = response.data
      if (!data.url) {
        this.$modal.msgWarning('当前文件不可下载')
        return
      }
      try {
        const result = await fetch(data.url)
        if (!result.ok) {
          this.$modal.msgError('文件下载失败，请重试')
          return
        }
        downloadByData(await result.blob(), data.name)
      } catch (e) {
        this.$modal.msgError('文件下载失败，请重试')
      }
    },
    /** 收藏或取消收藏 */
    handleFavorite(row) {
      const request = row.favorite
        ? FavoriteApi.deleteFileFavorite(row.id)
        : FavoriteApi.createFileFavorite(row.id)
      return request.then(() => this.handleSuccess())
    },
    /** 移入回收站 */
    handleRecycle(row) {
      return this.$modal.confirm('是否将“' + row.name + '”移入回收站？').then(() => {
        return NodeApi.recycleFileNode(row.id)
      }).then(() => {
        this.$modal.msgSuccess('已移入回收站')
        return this.handleSuccess()
      }).catch(() => {})
    },
    /** 恢复节点 */
    handleRestore(row) {
      return NodeApi.restoreFileNode(row.id).then(() => {
        this.$modal.msgSuccess('恢复成功')
        return this.handleSuccess()
      })
    },
    /** 彻底删除业务记录 */
    handleDelete(row) {
      return this.$modal.confirm('彻底删除“' + row.name + '”及其全部子文件后将无法恢复，是否继续？').then(() => {
        return NodeApi.deleteFileNode(row.id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.handleSuccess()
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.oa-file {
  &__main {
    display: flex;
    align-items: flex-start;
    gap: 20px;
  }

  &__side {
    flex-shrink: 0;
    width: 210px;
    padding: 12px 16px;
    background: #fff;
    border-radius: 4px;

    &-title {
      margin-bottom: 12px;
      font-weight: 700;
    }

    &-subtitle {
      margin-bottom: 8px;
      font-size: 13px;
      color: #606266;
    }

    &-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &-item {
      margin-left: 0 !important;
      justify-content: flex-start;
      color: #606266;

      &.is-active {
        color: #409eff;
        font-weight: 600;
      }
    }

    &-icon {
      margin-right: 8px;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__list {
    padding: 16px;
    background: #fff;
    border-radius: 4px;
  }

  &__breadcrumb {
    margin-bottom: 20px;
  }

  &__name {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__icon {
    color: #909399;
  }

  &__actions {
    .el-button + .el-button,
    .el-dropdown {
      margin-left: 12px;
    }

    .danger-item {
      color: #f56c6c;
    }
  }

  .danger-text {
    color: #f56c6c;
  }
}
</style>
