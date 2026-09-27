<template>
  <div class="app-container oa-contact">
    <el-row :gutter="20">
      <!-- 左侧联系人分类及共享入口 -->
      <el-col :span="4" :xs="24">
        <div class="contact-side">
          <div class="contact-side__header">
            <span>分类</span>
            <el-button type="text" @click="$refs.categoryDialog.open()">管理分类</el-button>
          </div>
          <el-menu class="contact-side__menu" :default-active="activeCategory" @select="handleCategorySelect">
            <el-menu-item index="all">
              <span slot="title">全部联系人</span>
            </el-menu-item>
            <el-menu-item
              v-for="category in categoryList"
              :key="category.id"
              :index="'category-' + category.id"
            >
              <span slot="title" :title="category.name">{{ category.name }}</span>
            </el-menu-item>
          </el-menu>
          <!-- 类型导航，与分类组合筛选 -->
          <el-divider />
          <div class="contact-side__section">类型</div>
          <el-menu class="contact-side__menu" :default-active="String(activeScene)" @select="handleTypeSelect">
            <el-menu-item :index="String(OA_CONTACT_SCENE_TYPE.MINE)">
              <span slot="title">我的联系人</span>
            </el-menu-item>
            <el-menu-item :index="String(OA_CONTACT_SCENE_TYPE.SENT)">
              <span slot="title">我共享的</span>
            </el-menu-item>
            <el-menu-item :index="String(OA_CONTACT_SCENE_TYPE.RECEIVED)">
              <span slot="title">共享与我</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-col>
      <el-col :span="20" :xs="24">
        <!-- 搜索 -->
        <el-form ref="queryForm" :inline="true" :model="queryParams" class="query-form" @submit.native.prevent>
          <el-form-item label="关键字" prop="keyword">
            <el-input
              v-model="queryParams.keyword"
              clearable
              placeholder="请输入姓名、拼音、手机或公司"
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="首字母" prop="alphabet">
            <el-select
              v-model="queryParams.alphabet"
              clearable
              placeholder="请选择姓名首字母"
              style="width: 240px"
            >
              <el-option
                v-for="item in alphabetOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="activeScene === OA_CONTACT_SCENE_TYPE.RECEIVED"
            label="处理状态"
            prop="handleStatus"
          >
            <el-select
              v-model="queryParams.handleStatus"
              clearable
              placeholder="请选择处理状态"
              style="width: 240px"
            >
              <el-option label="待处理" :value="false" />
              <el-option label="已处理" :value="true" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
            <el-button
              v-if="activeScene === OA_CONTACT_SCENE_TYPE.MINE"
              v-hasPermi="['oa:contact:create']"
              type="primary"
              plain
              icon="el-icon-plus"
              @click="openForm('create')"
            >
              新增
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 联系人及共享记录列表 -->
        <el-table v-loading="loading" :data="list" border stripe>
          <el-table-column label="姓名" prop="name" min-width="130">
            <template slot-scope="scope">
              <el-button type="text" class="primary-text" @click="$refs.detail.open(scope.row.id)">
                {{ scope.row.name }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="头像" width="75" align="center">
            <template slot-scope="scope">
              <el-avatar :src="scope.row.avatar" :size="32" />
            </template>
          </el-table-column>
          <el-table-column label="性别" width="80" align="center">
            <template slot-scope="scope">
              <dict-tag :type="DICT_TYPE.SYSTEM_USER_SEX" :value="scope.row.sex" />
            </template>
          </el-table-column>
          <el-table-column label="分类" width="120">
            <template slot-scope="scope">
              {{ scope.row.sharedCategoryName || '未分类' }}
            </template>
          </el-table-column>
          <el-table-column label="手机号码" prop="mobile" width="140" />
          <el-table-column label="邮箱" prop="email" min-width="180" show-overflow-tooltip />
          <el-table-column label="公司名称" prop="companyName" min-width="160" show-overflow-tooltip />
          <el-table-column label="创建人" prop="ownerUserName" width="120" />
          <el-table-column
            v-if="activeScene === OA_CONTACT_SCENE_TYPE.RECEIVED"
            label="分享人"
            prop="sharerName"
            width="120"
          />
          <el-table-column
            v-if="activeScene === OA_CONTACT_SCENE_TYPE.SENT"
            label="接收人"
            prop="share.userName"
            width="120"
          />
          <el-table-column
            v-if="activeScene === OA_CONTACT_SCENE_TYPE.SENT"
            label="共享时间"
            prop="share.createTime"
            :formatter="dateFormatter"
            width="180"
          />
          <el-table-column
            v-if="activeScene === OA_CONTACT_SCENE_TYPE.SENT"
            label="处理状态"
            width="100"
          >
            <template slot-scope="scope">
              <el-tag :type="scope.row.share && scope.row.share.handleStatus ? 'success' : 'warning'">
                {{ scope.row.share && scope.row.share.handleStatus ? '已处理' : '待处理' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="activeScene === OA_CONTACT_SCENE_TYPE.RECEIVED"
            label="处理状态"
            width="100"
          >
            <template slot-scope="scope">
              <el-tag :type="scope.row.handleStatus ? 'success' : 'warning'">
                {{ scope.row.handleStatus ? '已处理' : '待处理' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" class="primary-text" @click="openShareForm(scope.row)">共享</el-button>
              <template v-if="activeScene === OA_CONTACT_SCENE_TYPE.MINE">
                <template v-if="isContactOwner(scope.row)">
                  <el-button
                    v-hasPermi="['oa:contact:update']"
                    type="text"
                    class="primary-text"
                    @click="openForm('update', scope.row.id)"
                  >
                    修改
                  </el-button>
                  <el-button
                    v-hasPermi="['oa:contact:delete']"
                    type="text"
                    class="danger-text"
                    @click="handleDelete(scope.row.id, false)"
                  >
                    删除
                  </el-button>
                </template>
                <template v-else>
                  <el-button type="text" class="primary-text" @click="openHandleForm(scope.row)">
                    移动
                  </el-button>
                  <el-button type="text" class="danger-text" @click="handleDelete(scope.row.id, true)">
                    删除
                  </el-button>
                </template>
              </template>
              <template v-else-if="activeScene === OA_CONTACT_SCENE_TYPE.RECEIVED">
                <el-button
                  v-if="!scope.row.handleStatus"
                  type="text"
                  class="primary-text"
                  @click="openHandleForm(scope.row)"
                >
                  处理
                </el-button>
                <el-button type="text" class="danger-text" @click="handleDelete(scope.row.id, true)">
                  删除
                </el-button>
              </template>
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
      </el-col>
    </el-row>

    <!-- 联系人表单 -->
    <oa-contact-form ref="form" @success="handleCategoryChange" />
    <!-- 联系人详情 -->
    <oa-contact-detail ref="detail" />
    <!-- 共享接收人明细 -->
    <oa-contact-share-detail ref="shareDetail" />
    <!-- 共享联系人 -->
    <Dialog v-model="shareDialogVisible" title="共享联系人" width="560px">
      <el-form v-loading="shareLoading" label-width="100px">
        <el-form-item label="共享接收人">
          <user-select-v2
            v-model="shareUserIds"
            :disabled="shareLoading"
            :clearable="false"
            multiple
            placeholder="请选择共享接收人"
            style="width: 100%"
          />
          <div class="share-tip">此处仅追加共享接收人，取消勾选不会撤销已有共享。</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          :disabled="shareLoading || !shareUserIds.some(id => !sharedUserIds.includes(id))"
          :loading="shareLoading"
          type="primary"
          @click="submitShare"
        >
          确 定
        </el-button>
        <el-button @click="shareDialogVisible = false">取 消</el-button>
      </div>
    </Dialog>
    <!-- 处理共享 -->
    <Dialog v-model="handleDialogVisible" :title="handleDialogTitle" width="480px">
      <el-form label-width="90px">
        <el-form-item label="归入分类">
          <oa-contact-category-select
            v-model="handleCategoryId"
            :categories="categoryList"
            placeholder="不选择时暂不分类"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :loading="handleLoading" type="primary" @click="submitHandle">确 定</el-button>
        <el-button @click="handleDialogVisible = false">取 消</el-button>
      </div>
    </Dialog>
    <!-- 联系人分类管理 -->
    <oa-contact-category-list ref="categoryDialog" @success="handleCategoryChange" />
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import * as ContactApi from '@/api/oa/contact'
import * as ContactCategoryApi from '@/api/oa/contact/category'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import store from '@/store'
import { OA_CONTACT_SCENE_TYPE } from '@/views/oa/utils/constants'
import OaContactForm from './OaContactForm.vue'
import OaContactDetail from './components/OaContactDetail.vue'
import OaContactShareDetail from './OaContactShareDetail.vue'
import OaContactCategoryList from './components/OaContactCategoryList.vue'
import OaContactCategorySelect from './components/OaContactCategorySelect.vue'

export default {
  name: 'OaContact',
  components: {
    Dialog,
    UserSelectV2,
    OaContactForm,
    OaContactDetail,
    OaContactShareDetail,
    OaContactCategoryList,
    OaContactCategorySelect
  },
  data() {
    return {
      DICT_TYPE,
      OA_CONTACT_SCENE_TYPE,
      // 姓名拼音首字母选项
      alphabetOptions: [
        { label: '全部', value: '' },
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(value => ({ label: value, value }))
      ],
      currentUserId: store.getters.userId, // 当前用户编号
      loading: true, // 列表加载中
      list: [], // 外部联系人列表
      total: 0, // 列表总数
      activeCategory: 'all', // 左侧当前选中的分类
      categoryList: [], // 联系人分类列表
      activeScene: OA_CONTACT_SCENE_TYPE.MINE, // 当前列表场景，不作为查询参数传递
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        keyword: undefined,
        categoryId: undefined,
        handleStatus: undefined,
        alphabet: ''
      },
      shareDialogVisible: false, // 共享弹窗是否显示
      shareLoading: false, // 共享请求提交中
      shareContactId: undefined, // 共享联系人编号
      shareUserIds: [], // 共享接收人编号列表
      sharedUserIds: [], // 已共享的接收人编号列表
      handleDialogVisible: false, // 处理共享弹窗是否显示
      handleLoading: false, // 共享处理请求提交中
      handleDialogTitle: '处理共享联系人', // 处理共享弹窗标题
      handleContactId: undefined, // 处理联系人编号
      handleCategoryId: undefined // 接收人的分类编号
    }
  },
  created() {
    this.getList()
    this.getCategoryList()
  },
  methods: {
    dateFormatter,
    /** 查询联系人列表 */
    getList() {
      this.loading = true
      this.list = []
      this.total = 0
      const getPage =
        this.activeScene === OA_CONTACT_SCENE_TYPE.MINE
          ? ContactApi.getMyContactPage
          : this.activeScene === OA_CONTACT_SCENE_TYPE.RECEIVED
            ? ContactApi.getReceivedContactPage
            : ContactApi.getSharedContactPage
      return getPage(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    /** 查询联系人分类列表 */
    getCategoryList() {
      return ContactCategoryApi.getContactCategoryList().then(response => {
        this.categoryList = response.data
      })
    },
    /** 联系人分类变更操作 */
    handleCategoryChange() {
      return this.getCategoryList().then(() => {
        // 分类编号保持稳定；已删除的分类回到全部联系人
        if (this.activeCategory.startsWith('category-')) {
          const category = this.categoryList.find(item => 'category-' + item.id === this.activeCategory)
          if (!category) this.activeCategory = 'all'
          this.queryParams.categoryId = category && category.id
        }
        this.handleQuery()
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNo = 1
      return this.getList()
    },
    /** 切换联系人分类 */
    handleCategorySelect(index) {
      this.activeCategory = index
      const category = this.categoryList.find(item => 'category-' + item.id === index)
      this.queryParams.categoryId = category ? category.id : undefined
      this.handleQuery()
    },
    /** 切换联系人类型 */
    handleTypeSelect(index) {
      this.activeScene = Number(index)
      this.queryParams.handleStatus = undefined
      this.handleQuery()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.$refs.queryForm.resetFields()
      this.queryParams.alphabet = ''
      return this.handleQuery()
    },
    /** 判断是否为联系人创建人 */
    isContactOwner(contact) {
      return contact.ownerUserId === this.currentUserId
    },
    /** 打开联系人表单 */
    openForm(type, id) {
      this.$refs.form.open(type, id)
    },
    /** 删除联系人 */
    handleDelete(id, received) {
      return this.$modal.confirm('确认移除本人持有的联系人？其他持有人不受影响，最后一人移除时才删除正文。').then(() => {
        if (received) {
          return ContactApi.deleteReceivedContact(id)
        }
        return ContactApi.deleteContact(id)
      }).then(() => {
        this.$modal.msgSuccess('删除成功')
        return this.getList()
      }).catch(() => {})
    },
    /** 打开共享表单 */
    openShareForm(contact) {
      this.shareContactId = contact.id
      this.shareUserIds = []
      this.sharedUserIds = []
      this.shareDialogVisible = true
      this.shareLoading = true
      // 查询最新共享关系，回显已有接收人，避免使用列表中的旧数据
      return ContactApi.getContact(contact.id).then(response => {
        this.sharedUserIds = (response.data.shares || []).map(share => share.userId)
        this.shareUserIds = [...this.sharedUserIds]
      }).catch(() => {
        this.shareDialogVisible = false
      }).finally(() => {
        this.shareLoading = false
      })
    },
    /** 提交联系人共享 */
    submitShare() {
      if (!this.shareContactId || this.shareLoading) return
      this.shareLoading = true
      return ContactApi.shareContact(this.shareContactId, this.shareUserIds).then(() => {
        this.$modal.msgSuccess('共享成功')
        this.shareDialogVisible = false
        return this.getList()
      }).finally(() => {
        this.shareLoading = false
      })
    },
    /** 打开共享处理表单 */
    openHandleForm(contact) {
      this.handleContactId = contact.id
      this.handleCategoryId = contact.sharedCategoryId
      this.handleDialogTitle = contact.handleStatus ? '移动联系人分类' : '处理共享联系人'
      this.handleDialogVisible = true
    },
    /** 提交共享处理 */
    submitHandle() {
      if (!this.handleContactId) return
      this.handleLoading = true
      return ContactApi.handleContactShare(this.handleContactId, this.handleCategoryId).then(() => {
        this.$modal.msgSuccess('处理成功')
        this.handleDialogVisible = false
        return this.getCategoryList().then(() => this.getList())
      }).finally(() => {
        this.handleLoading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.oa-contact {
  .contact-side {
    padding: 12px;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      margin-bottom: 4px;
      border-bottom: 1px solid #ebeef5;
      font-weight: 600;
    }

    &__section {
      margin-bottom: 12px;
      font-weight: 600;
    }

    &__menu {
      border-right: none;

      .el-menu-item {
        height: 40px;
        line-height: 40px;
        padding-left: 12px !important;
        margin: 4px 0;
        border-radius: 4px;

        &.is-active {
          background-color: #ecf5ff;
          font-weight: 600;
        }
      }
    }
  }

  .share-tip {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
  }

  .primary-text {
    color: #409eff;
  }

  .danger-text {
    color: #f56c6c;
  }
}
</style>
