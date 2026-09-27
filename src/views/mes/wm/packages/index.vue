<template>
  <div class="app-container wm-migrated">
    <doc-alert
      title="【仓库】调拨单、装箱管理"
      url="https://doc.iocoder.cn/mes/wm/transfer/"
    />

    <el-card
      shadow="never"
      class="wm-content-wrap"
    >
      <el-form
        ref="queryFormRef"
        class="-mb-15px"
        :model="queryParams"
        :inline="true"
        label-width="100px"
      >
        <el-form-item
          label="装箱单编号"
          prop="code"
        >
          <el-input
            v-model="queryParams.code"
            placeholder="请输入装箱单编号"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="销售订单编号"
          prop="salesOrderCode"
        >
          <el-input
            v-model="queryParams.salesOrderCode"
            placeholder="请输入销售订单编号"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="客户"
          prop="clientId"
        >
          <MdClientSelect
            v-model="queryParams.clientId"
            class="wm-w-240"
          />
        </el-form-item>
        <el-form-item
          label="检查员"
          prop="inspectorUserId"
        >
          <UserSelectV2
            v-model="queryParams.inspectorUserId"
            class="wm-w-240"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh mr-5px" /> 重置</el-button>
          <el-button
            v-hasPermi="['mes:wm-package:create']"
            type="primary"
            plain
            @click="openForm('create')"
          >
            <i class="el-icon-plus mr-5px" /> 新增
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card
      shadow="never"
      class="wm-content-wrap"
    >
      <el-table
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
      >
        <el-table-column
          label="装箱单编号"
          align="center"
          prop="code"
          min-width="250"
          fixed="left"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              @click="openForm('detail', scope.row.id)"
            >
              {{ scope.row.code }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          label="装箱日期"
          align="center"
          prop="packageDate"
          :formatter="dateFormatter2"
          width="120"
        />
        <el-table-column
          label="销售订单编号"
          align="center"
          prop="salesOrderCode"
          min-width="140"
        />
        <el-table-column
          label="发票编号"
          align="center"
          prop="invoiceCode"
          min-width="120"
        />
        <el-table-column
          label="客户编码"
          align="center"
          prop="clientCode"
          min-width="100"
        />
        <el-table-column
          label="客户名称"
          align="center"
          prop="clientName"
          min-width="120"
        />
        <el-table-column
          label="箱长度"
          align="center"
          prop="length"
          width="80"
        />
        <el-table-column
          label="箱宽度"
          align="center"
          prop="width"
          width="80"
        />
        <el-table-column
          label="箱高度"
          align="center"
          prop="height"
          width="80"
        />
        <el-table-column
          label="尺寸单位"
          align="center"
          prop="sizeUnitName"
          width="90"
        />
        <el-table-column
          label="净重"
          align="center"
          prop="netWeight"
          width="80"
        />
        <el-table-column
          label="毛重"
          align="center"
          prop="grossWeight"
          width="80"
        />
        <el-table-column
          label="重量单位"
          align="center"
          prop="weightUnitName"
          width="90"
        />
        <el-table-column
          label="检查员"
          align="center"
          prop="inspectorName"
          min-width="100"
        />
        <el-table-column
          label="单据状态"
          align="center"
          prop="status"
          min-width="100"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_WM_PACKAGE_STATUS"
              :value="scope.row.status"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          align="center"
          width="200"
          fixed="right"
        >
          <template slot-scope="scope">
            <!-- 草稿：编辑、删除 -->
            <el-button

              v-if="scope.row.status === MesWmPackageStatusEnum.PREPARE"
              v-hasPermi="['mes:wm-package:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button

              v-if="scope.row.status === MesWmPackageStatusEnum.PREPARE"
              v-hasPermi="['mes:wm-package:delete']"
              type="text"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        :total="total"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <PackageForm
      ref="formRef"
      @success="getList"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { dateFormatter2 } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'
import { handleTree } from '@/utils/tree'
import { WmPackageApi } from '@/api/mes/wm/packages'
import MdClientSelect from '@/views/mes/md/client/components/MdClientSelect.vue'
import UserSelectV2 from '@/views/system/user/components/UserSelectV2.vue'
import PackageForm from './PackageForm.vue'
import { MesWmPackageStatusEnum } from '@/views/mes/utils/constants'
export default {
  name: 'MesWmPackages',
  components: { MdClientSelect, UserSelectV2, PackageForm },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const message = {
      success: (content) => vm.$modal.msgSuccess(content),
      error: (content) => vm.$modal.msgError(content),
      warning: (content) => vm.$modal.msgWarning(content),
      confirm: (content) => vm.$modal.confirm(content),
      delConfirm: (content) => vm.$modal.confirm(content || '是否确认删除选中的数据项？'),
      exportConfirm: (content) => vm.$modal.confirm(content || '是否确认导出所有数据项？')
    } // 消息弹窗
    const t = (...args) => vm.$t(...args) // 国际化
    const loading = ref(true) // 列表的加载中
    const list = ref([]) // 列表的数据
    const total = ref(0) // 列表的总页数
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      code: undefined,
      salesOrderCode: undefined,
      clientId: undefined,
      inspectorUserId: undefined
    })
    const queryFormRef = ref() // 搜索的表单
    const formRef = ref() // 表单弹窗
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await WmPackageApi.getPackagePage(queryParams)).data
        list.value = handleTree(data.list)
        total.value = data.total
      } finally {
        loading.value = false
      }
    }
    /** 搜索按钮操作 */
    const handleQuery = () => {
      queryParams.pageNo = 1
      getList()
    }
    /** 重置按钮操作 */
    const resetQuery = () => {
      queryFormRef.value.resetFields()
      handleQuery()
    }
    /** 添加/修改操作 */
    const openForm = (type, id) => {
      formRef.value.open(type, id)
    }
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      try {
        await message.delConfirm();
        (await WmPackageApi.deletePackage(id)).data
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    /** 初始化 */
    onMounted(() => {
      getList()
    })
    return { DICT_TYPE, MdClientSelect, MesWmPackageStatusEnum, PackageForm, UserSelectV2, dateFormatter2, formRef, getList, handleDelete, handleQuery, list, loading, message, openForm, queryFormRef, queryParams, resetQuery, t, total }
  }
}
</script>

<style scoped>
.wm-content-wrap { margin-bottom: 20px; }
.wm-w-full { width: 100%; }
.wm-w-240 { width: 240px; }
.wm-w-220 { width: 220px; }
.wm-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
</style>
