<template>
  <div class="app-container qc-migrated">
    <doc-alert
      title="【质量】待检任务、检验结果、缺陷记录"
      url="https://doc.iocoder.cn/mes/qc/pending-inspect/"
    />

    <el-card
      shadow="never"
      class="qc-content-wrap"
    >
      <!-- 搜索工作栏 -->
      <el-form
        ref="queryFormRef"
        class="-mb-15px"
        :model="queryParams"
        :inline="true"
        label-width="100px"
      >
        <el-form-item
          label="来源单据编号"
          prop="sourceDocCode"
        >
          <el-input
            v-model="queryParams.sourceDocCode"
            placeholder="请输入来源单据编号"
            clearable
            class="qc-w-240"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item
          label="产品物料"
          prop="itemId"
        >
          <MdItemSelect
            v-model="queryParams.itemId"
            placeholder="请选择产品物料"
            clearable
            class="qc-w-240"
          />
        </el-form-item>
        <el-form-item
          label="检验类型"
          prop="qcType"
        >
          <el-select
            v-model="queryParams.qcType"
            placeholder="请选择检验类型"
            clearable
            class="qc-w-240"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.MES_QC_TYPE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleQuery"><i class="el-icon-search mr-5px" /> 搜索</el-button>
          <el-button @click="resetQuery"><i class="el-icon-refresh mr-5px" /> 重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表 -->
    <el-card
      shadow="never"
      class="qc-content-wrap"
    >
      <el-table
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
      >
        <el-table-column
          label="来源单据类型"
          align="center"
          prop="sourceDocType"
          width="130"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_QC_SOURCE_DOC_TYPE"
              :value="scope.row.sourceDocType"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="来源单据编号"
          align="center"
          prop="sourceDocCode"
          width="160"
        />
        <el-table-column
          label="检验类型"
          align="center"
          prop="qcType"
          min-width="150"
        >
          <template slot-scope="scope">
            <dict-tag
              :type="DICT_TYPE.MES_QC_TYPE"
              :value="scope.row.qcType"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="物料编码"
          align="center"
          prop="itemCode"
          min-width="130"
        />
        <el-table-column
          label="物料名称"
          align="center"
          prop="itemName"
          min-width="150"
        />
        <el-table-column
          label="规格型号"
          align="center"
          prop="specification"
          width="130"
        />
        <el-table-column
          label="待检数量"
          align="center"
          prop="quantity"
          width="100"
        />
        <el-table-column
          label="单位"
          align="center"
          prop="unitName"
          width="80"
        />
        <el-table-column
          label="操作"
          align="center"
          fixed="right"
          width="130"
        >
          <template slot-scope="scope">
            <el-button

              v-if="scope.row.qcType === MesQcTypeEnum.IQC"
              v-hasPermi="['mes:qc-iqc:create']"
              type="text"
              @click="handleCreateIqc(scope.row)"
            >
              来料检验
            </el-button>
            <el-button

              v-if="scope.row.qcType === MesQcTypeEnum.IPQC"
              v-hasPermi="['mes:qc-ipqc:create']"
              type="text"
              @click="handleCreateIpqc(scope.row)"
            >
              过程检验
            </el-button>
            <el-button

              v-if="scope.row.qcType === MesQcTypeEnum.RQC"
              v-hasPermi="['mes:qc-rqc:create']"
              type="text"
              @click="handleCreateRqc(scope.row)"
            >
              退料检验
            </el-button>
            <el-button

              v-if="scope.row.qcType === MesQcTypeEnum.OQC"
              v-hasPermi="['mes:qc-oqc:create']"
              type="text"
              @click="handleCreateOqc(scope.row)"
            >
              出货检验
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

    <!-- 表单弹窗 -->
    <IqcForm
      ref="iqcFormRef"
      @success="getList"
    />
    <IpqcForm
      ref="ipqcFormRef"
      @success="getList"
    />
    <RqcForm
      ref="rqcFormRef"
      @success="getList"
    />
    <OqcForm
      ref="oqcFormRef"
      @success="getList"
    />
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { QcPendingInspectApi } from '@/api/mes/qc/pendinginspect'
import { MesQcTypeEnum } from '@/views/mes/utils/constants'
import MdItemSelect from '@/views/mes/md/item/components/MdItemSelect.vue'
import IqcForm from '@/views/mes/qc/iqc/IqcForm.vue'
import IpqcForm from '@/views/mes/qc/ipqc/IpqcForm.vue'
import RqcForm from '@/views/mes/qc/rqc/RqcForm.vue'
import OqcForm from '@/views/mes/qc/oqc/OqcForm.vue'
export default {
  name: 'MesQcPendingInspect',
  components: { MdItemSelect, IqcForm, IpqcForm, RqcForm, OqcForm },
  setup(props, { emit }) {
    const loading = ref(true) // 列表的加载中
    const total = ref(0) // 列表的总页数
    const list = ref([]) // 列表的数据
    const queryParams = reactive({
      pageNo: 1,
      pageSize: 10,
      sourceDocCode: undefined,
      qcType: undefined,
      itemId: undefined
    })
    const queryFormRef = ref() // 搜索的表单
    /** 查询列表 */
    const getList = async() => {
      loading.value = true
      try {
        const data = (await QcPendingInspectApi.getPendingInspectPage(queryParams)).data
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
      handleQuery()
    }
    /** 创建 IQC 来料检验单 */
    const iqcFormRef = ref()
    const handleCreateIqc = (row) => {
      iqcFormRef.value.open('create', undefined, {
        sourceDocType: row.sourceDocType,
        sourceDocId: row.sourceDocId,
        sourceLineId: row.sourceLineId,
        sourceDocCode: row.sourceDocCode,
        vendorId: row.vendorId,
        itemId: row.itemId,
        receivedQuantity: row.quantity,
        receiveDate: row.recordTime,
        name: row.sourceDocCode + ' 来料检验单'
      })
    }
    /** 创建 IPQC 过程检验单 */
    const ipqcFormRef = ref()
    const handleCreateIpqc = (row) => {
      ipqcFormRef.value.open('create', undefined, {
        sourceDocType: row.sourceDocType,
        sourceDocId: row.sourceDocId,
        sourceLineId: row.sourceLineId,
        sourceDocCode: row.sourceDocCode,
        itemId: row.itemId,
        workOrderId: row.workOrderId,
        workstationId: row.workstationId,
        taskId: row.taskId,
        checkQuantity: row.quantity,
        inspectDate: row.recordTime,
        name: row.sourceDocCode + ' 过程检验单'
      })
    }
    /** 创建 RQC 退货检验单 */
    const rqcFormRef = ref()
    const handleCreateRqc = (row) => {
      rqcFormRef.value.open('create', undefined, {
        sourceDocType: row.sourceDocType,
        sourceDocId: row.sourceDocId,
        sourceLineId: row.sourceLineId,
        sourceDocCode: row.sourceDocCode,
        clientId: row.clientId,
        workOrderId: row.workOrderId,
        workstationId: row.workstationId,
        itemId: row.itemId,
        checkQuantity: row.quantity,
        inspectDate: row.recordTime,
        name: row.sourceDocCode + ' 退料检验单'
      })
    }
    /** 创建 OQC 出货检验单 */
    const oqcFormRef = ref()
    const handleCreateOqc = (row) => {
      oqcFormRef.value.open('create', undefined, {
        sourceDocType: row.sourceDocType,
        sourceDocId: row.sourceDocId,
        sourceLineId: row.sourceLineId,
        sourceDocCode: row.sourceDocCode,
        clientId: row.clientId,
        itemId: row.itemId,
        outQuantity: row.quantity,
        outDate: row.recordTime,
        name: row.sourceDocCode + ' 出货检验单'
      })
    }
    /** 初始化 **/
    onMounted(() => {
      getList()
    })
    return { DICT_TYPE, IpqcForm, IqcForm, MdItemSelect, MesQcTypeEnum, OqcForm, RqcForm, getIntDictOptions, getList, handleCreateIpqc, handleCreateIqc, handleCreateOqc, handleCreateRqc, handleQuery, ipqcFormRef, iqcFormRef, list, loading, oqcFormRef, queryFormRef, queryParams, resetQuery, rqcFormRef, total }
  }
}
</script>

<style scoped>
.qc-content-wrap { margin-bottom: 20px; }
.qc-w-full { width: 100%; }
.qc-w-240 { width: 240px; }
.qc-w-220 { width: 220px; }
.qc-w-200 { width: 200px; }
.mr-5px { margin-right: 5px; }
.mb-10px { margin-bottom: 10px; }
.mt-10px { margin-top: 10px; }
.-mb-15px { margin-bottom: -15px; }
.overflow-hidden { overflow: hidden; }
</style>

