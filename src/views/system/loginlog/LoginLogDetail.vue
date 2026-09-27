<template>
  <el-dialog title="详情" :visible.sync="dialogVisible" width="800px" append-to-body>
    <el-descriptions :column="1" border>
      <el-descriptions-item label="日志编号">{{ detailData.id }}</el-descriptions-item>
      <el-descriptions-item label="登录类型">
        <dict-tag :type="DICT_TYPE.SYSTEM_LOGIN_TYPE" :value="detailData.logType" />
      </el-descriptions-item>
      <el-descriptions-item label="用户名称">{{ detailData.username }}</el-descriptions-item>
      <el-descriptions-item label="登录地址">{{ detailData.userIp }}</el-descriptions-item>
      <el-descriptions-item label="浏览器">{{ detailData.userAgent }}</el-descriptions-item>
      <el-descriptions-item label="登录结果">
        <dict-tag :type="DICT_TYPE.SYSTEM_LOGIN_RESULT" :value="detailData.result" />
      </el-descriptions-item>
      <el-descriptions-item label="登录日期">{{ parseTime(detailData.createTime) }}</el-descriptions-item>
    </el-descriptions>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'SystemLoginLogDetail',
  data() {
    return {
      dialogVisible: false,
      detailData: {},
      DICT_TYPE
    }
  },
  methods: {
    open(data) {
      this.detailData = data || {}
      this.dialogVisible = true
    }
  }
}
</script>
