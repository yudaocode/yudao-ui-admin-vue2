<template>
  <el-card shadow="never">
    <div slot="header">面试记录</div>
    <el-table
      :data="interviewList"
      stripe
    >
      <el-table-column
        align="center"
        label="面试轮次"
        prop="stageNumber"
        width="100"
      />
      <el-table-column
        align="center"
        label="面试方式"
        prop="type"
        width="110"
      ><template slot-scope="scope"><dict-tag
        :type="DICT_TYPE.HRM_RECRUIT_INTERVIEW_TYPE"
        :value="scope.row.type"
      /></template></el-table-column>
      <el-table-column
        align="center"
        label="主面试官"
        min-width="120"
        prop="interviewEmployeeName"
        show-overflow-tooltip
      />
      <el-table-column
        align="center"
        label="其他面试官"
        min-width="160"
      ><template slot-scope="scope">{{ formatNames(scope.row.otherInterviewEmployeeNames) }}</template></el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="面试时间"
        prop="interviewTime"
        width="180"
      />
      <el-table-column
        align="center"
        label="面试地址"
        min-width="160"
        prop="address"
        show-overflow-tooltip
      />
      <el-table-column
        align="center"
        label="面试结果"
        prop="result"
        width="110"
      ><template slot-scope="scope"><dict-tag
        :type="DICT_TYPE.HRM_RECRUIT_INTERVIEW_RESULT"
        :value="scope.row.result"
      /></template></el-table-column>
      <el-table-column
        align="center"
        label="面试评价"
        min-width="180"
        prop="evaluate"
        show-overflow-tooltip
      />
      <el-table-column
        align="center"
        label="取消原因"
        min-width="160"
        prop="cancelReason"
        show-overflow-tooltip
      />
      <el-table-column
        align="center"
        label="备注"
        min-width="160"
        prop="remark"
        show-overflow-tooltip
      />
    </el-table>
  </el-card>
</template>
<script>
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils'
export default {
  name: 'HrmRecruitCandidateInterviewList',
  props: { interviewList: { type: Array, required: true }},
  data() { return { DICT_TYPE } },
  methods: { dateFormatter, formatNames(names) { return (names || []).join('、') || '-' } }
}
</script>
