<template>
  <div class="app-container wm-migrated">
    <doc-alert
      title="【仓库】仓库与库区库位、条码赋码、SN码"
      url="https://doc.iocoder.cn/mes/wm/warehouse-setup/"
    />

    <el-card
      shadow="never"
      class="wm-content-wrap"
    >
      <el-alert
        v-if="currentLocation.id"
        :title="`当前仓库/库区：${currentLocation.warehouseName || `#${currentLocation.warehouseId || '-'}`} / ${currentLocation.name || `#${currentLocation.id}`}`"
        type="info"
        show-icon
        :closable="false"
        class="!mb-12px"
      />
      <el-form
        ref="queryFormRef"
        class="-mb-15px"
        :model="queryParams"
        :inline="true"
        label-width="68px"
      >
        <el-form-item
          label="库位编码"
          prop="code"
        >
          <el-input
            v-model="queryParams.code"
            placeholder="请输入库位编码"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="库位名称"
          prop="name"
        >
          <el-input
            v-model="queryParams.name"
            placeholder="请输入库位名称"
            clearable
            class="wm-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="位置 X"
          prop="positionX"
        >
          <el-input-number
            v-model="queryParams.positionX"
            :min="0"
            controls-position="right"
            class="wm-w-240"
          />
        </el-form-item>
        <el-form-item
          label="位置 Y"
          prop="positionY"
        >
          <el-input-number
            v-model="queryParams.positionY"
            :min="0"
            controls-position="right"
            class="wm-w-240"
          />
        </el-form-item>
        <el-form-item
          label="位置 Z"
          prop="positionZ"
        >
          <el-input-number
            v-model="queryParams.positionZ"
            :min="0"
            controls-position="right"
            class="wm-w-240"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh mr-5px" /> 重置</el-button>
          <el-button
            v-hasPermi="['mes:wm-warehouse:create']"
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
      >
        <el-table-column
          label="库位编码"
          align="center"
          prop="code"
          min-width="120"
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
          label="库位名称"
          align="center"
          prop="name"
          min-width="140"
        />
        <el-table-column
          label="面积（㎡）"
          align="center"
          prop="area"
          min-width="90"
        />
        <el-table-column
          label="最大载重"
          align="center"
          prop="maxLoad"
          min-width="100"
        />
        <el-table-column
          label="位置 X"
          align="center"
          prop="positionX"
          min-width="80"
        />
        <el-table-column
          label="位置 Y"
          align="center"
          prop="positionY"
          min-width="80"
        />
        <el-table-column
          label="位置 Z"
          align="center"
          prop="positionZ"
          min-width="80"
        />
        <el-table-column
          label="状态"
          align="center"
          prop="status"
          min-width="70"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.COMMON_STATUS"
              :value="scope.row.status"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="冻结"
          align="center"
          prop="frozen"
          min-width="80"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
              :value="scope.row.frozen"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="备注"
          align="center"
          prop="remark"
          min-width="180"
        />
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          :formatter="dateFormatter"
          width="180px"
        />
        <el-table-column
          label="操作"
          align="center"
          width="190"
        >
          <template slot-scope="scope">
            <el-button

              v-hasPermi="['mes:wm-warehouse:update']"
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button

              v-hasPermi="['mes:wm-warehouse:delete']"
              type="text"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
            <el-button

              v-hasPermi="['mes:wm-warehouse:query']"
              type="text"
              @click="handleBarcode(scope.row)"
            >
              条码
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

    <AreaForm
      ref="formRef"
      @success="getList"
    />
    <!-- 条码详情弹窗 -->
    <BarcodeDetail ref="barcodeDetailRef" />
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { dateFormatter } from '@/utils/formatTime'
import { DICT_TYPE } from '@/utils/dict'
import { WmWarehouseLocationApi } from '@/api/mes/wm/warehouse/location'
import { WmWarehouseAreaApi } from '@/api/mes/wm/warehouse/area'
import AreaForm from './AreaForm.vue'
import { BarcodeDetail } from '@/views/mes/wm/barcode/components'
import { BarcodeBizTypeEnum } from '@/views/mes/utils/constants'
export default {
  name: 'MesWmArea',
  components: { AreaForm, BarcodeDetail },
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
    const route = vm.$route
    const loading = ref(true) // 列表的加载中
    const list = ref([]) // 列表的数据
    const total = ref(0) // 列表的总页数
    const currentLocation = ref({
      id: 0,
      name: '',
      warehouseId: 0,
      warehouseName: ''
    }) // 当前库区上下文
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      code: undefined,
      name: undefined,
      locationId: undefined,
      positionX: undefined,
      positionY: undefined,
      positionZ: undefined
    }) // 查询参数
    const queryFormRef = ref() // 查询表单 Ref
    /** 加载库区上下文（从 URL query 参数获取 locationId，并加载库区和仓库名称） */
    const loadLocationContext = async() => {
      const locationId = Number(route.query.locationId)
      if (!Number.isInteger(locationId) || locationId <= 0) {
        return
      }
      currentLocation.value.id = locationId
      queryParams.locationId = locationId
      try {
        const location = (await WmWarehouseLocationApi.getWarehouseLocation(locationId)).data
        currentLocation.value.name = location.name
        currentLocation.value.warehouseId = location.warehouseId
        currentLocation.value.warehouseName = location.warehouseName
      } catch {
        // 忽略上级名称加载异常，不影响列表查询
      }
    }
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await WmWarehouseAreaApi.getWarehouseAreaPage(queryParams)).data
        list.value = data.list
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
      queryParams.locationId = currentLocation.value.id || undefined
      handleQuery()
    }
    /** 添加/修改操作 */
    const formRef = ref() // 表单 Ref
    const openForm = (type, id) => {
      formRef.value.open(type, id, currentLocation.value.id || undefined, currentLocation.value.warehouseId || undefined)
    }
    /** 删除按钮操作 */
    const handleDelete = async(id) => {
      try {
        await message.delConfirm();
        (await WmWarehouseAreaApi.deleteWarehouseArea(id)).data
        message.success(t('common.delSuccess'))
        await getList()
      } catch {
        // Keep the current state when the user cancels or the request fails.
      }
    }
    /** 查看库位条码 */
    const barcodeDetailRef = ref()
    const handleBarcode = async(row) => {
      await barcodeDetailRef.value.openByBusiness(row.id, BarcodeBizTypeEnum.AREA, row.code, row.name)
    }
    /** 初始化 */
    onMounted(async() => {
      await loadLocationContext()
      await getList()
    })
    return { AreaForm, BarcodeDetail, DICT_TYPE, barcodeDetailRef, currentLocation, dateFormatter, formRef, getList, handleBarcode, handleDelete, handleQuery, list, loadLocationContext, loading, message, openForm, queryFormRef, queryParams, resetQuery, route, t, total }
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
