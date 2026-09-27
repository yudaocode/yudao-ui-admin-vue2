<template>
  <dialog-component title="印章详情" v-model="dialogVisible" width="900px">
    <!-- 印章信息 -->
    <el-descriptions v-loading="detailLoading" :column="2" border>
      <el-descriptions-item label="所属部门" :span="2">
        {{ detailData.deptName }}
      </el-descriptions-item>
      <el-descriptions-item label="印章编号">{{ detailData.no }}</el-descriptions-item>
      <el-descriptions-item label="印章名称">{{ detailData.name }}</el-descriptions-item>
      <el-descriptions-item label="保管人">{{ detailData.keeperName }}</el-descriptions-item>
      <el-descriptions-item label="保管部门">{{ detailData.keeperDeptName }}</el-descriptions-item>
      <el-descriptions-item label="购买时间">
        {{ detailData.purchaseTime ? formatDate(detailData.purchaseTime) : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="启用时间">
        {{ detailData.enableTime ? formatDate(detailData.enableTime) : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="停用时间">
        {{ detailData.disableTime ? formatDate(detailData.disableTime) : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="备注">{{ detailData.remark }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <dict-tag :type="DICT_TYPE.OA_SEAL_STATUS" :value="detailData.status === undefined || detailData.status === null ? '' : detailData.status" />
      </el-descriptions-item>
      <el-descriptions-item label="类型">
        <dict-tag :type="DICT_TYPE.OA_SEAL_TYPE" :value="detailData.type === undefined || detailData.type === null ? '' : detailData.type" />
      </el-descriptions-item>
      <el-descriptions-item label="分类">
        <dict-tag :type="DICT_TYPE.OA_SEAL_CATEGORY" :value="detailData.category === undefined || detailData.category === null ? '' : detailData.category" />
      </el-descriptions-item>
      <el-descriptions-item label="照片">
        <el-image
          v-if="detailData.picUrl"
          :src="detailData.picUrl"
          :preview-src-list="[detailData.picUrl]"
          class="seal-pic-large"
          fit="contain"
        />
      </el-descriptions-item>
    </el-descriptions>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </dialog-component>
</template>

<script>
import * as SealApi from '@/api/oa/seal'
import DialogComponent from '@/components/Dialog'
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'

export default {
  name: 'OaSealDetail',
  components: { DialogComponent },
  data() {
    return {
      DICT_TYPE,
      dialogVisible: false,
      detailLoading: false,
      detailData: {}
    }
  },
  methods: {
    formatDate,
    open(id) {
      this.dialogVisible = true
      this.detailLoading = true
      this.detailData = {}
      return SealApi.getSeal(id).then(response => {
        this.detailData = response.data
      }).finally(() => {
        this.detailLoading = false
      })
    }
  }
}
</script>

<style scoped>
.seal-pic-large {
  width: 100px;
  height: 100px;
}
</style>
