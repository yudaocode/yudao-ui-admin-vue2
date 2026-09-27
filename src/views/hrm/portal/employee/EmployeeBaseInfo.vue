<template>
  <div v-loading="loading">
    <el-alert
      :title="employeeReminder"
      type="info"
      show-icon
      :closable="false"
      class="employee-alert"
    />
    <el-card
      shadow="never"
      class="info-card"
    >
      <div
        slot="header"
        class="card-header"
      >
        <span>基本信息</span>
        <el-button
          v-if="hasEditableFields"
          v-hasPermi="['hrm:portal:employee:update']"
          type="text"
          @click="$emit('edit')"
        >编辑</el-button>
      </div>
      <el-descriptions
        :column="4"
        border
      >
        <el-descriptions-item
          v-if="isVisible('name')"
          label="姓名"
        >{{ employee.name || '-' }}</el-descriptions-item>
        <el-descriptions-item
          v-if="isVisible('sex')"
          label="性别"
        >
          <dict-tag
            v-if="employee.sex != null"
            :type="DICT_TYPE.SYSTEM_USER_SEX"
            :value="employee.sex"
          /><span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item
          v-if="isVisible('birthday')"
          label="出生时间"
        >{{ formatHrmDateTime(employee.birthday) }}</el-descriptions-item>
        <el-descriptions-item
          v-if="isVisible('age')"
          label="年龄"
        >{{ employee.age == null ? '-' : employee.age }}</el-descriptions-item>
        <el-descriptions-item
          v-if="isVisible('country')"
          label="国家或地区"
        >{{ employee.country || '-' }}</el-descriptions-item>
        <el-descriptions-item
          v-if="isVisible('nation')"
          label="民族"
        >{{ employee.nation || '-' }}</el-descriptions-item>
        <el-descriptions-item
          v-if="isVisible('nativePlace')"
          label="籍贯"
        >{{ employee.nativePlace || '-' }}</el-descriptions-item>
        <el-descriptions-item
          v-if="isVisible('highestEducation')"
          label="最高学历"
        >
          <dict-tag
            v-if="employee.highestEducation != null"
            :type="DICT_TYPE.HRM_EMPLOYEE_EDUCATION"
            :value="employee.highestEducation"
          /><span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item
          v-if="isVisible('idType')"
          label="证件类型"
        >{{ formatEmployeeIdType(employee.idType) }}</el-descriptions-item>
        <el-descriptions-item
          v-if="isVisible('idNumber')"
          label="证件号码"
        >{{ employee.idNumber || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card
      v-if="hasVisibleContactFields"
      shadow="never"
      class="info-card"
    >
      <div slot="header">通讯信息</div>
      <el-descriptions
        :column="4"
        border
      >
        <el-descriptions-item
          v-if="isVisible('mobile')"
          label="手机号"
        >{{ employee.mobile || '-' }}</el-descriptions-item>
        <el-descriptions-item
          v-if="isVisible('email')"
          label="邮箱"
        >{{ employee.email || '-' }}</el-descriptions-item>
        <el-descriptions-item
          v-if="isVisible('address')"
          label="户籍地址"
          :span="4"
        >{{ employee.address || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
    <el-card
      shadow="never"
      class="info-card"
    >
      <div slot="header">教育经历</div>
      <el-table
        v-if="educationExperienceList.length"
        :data="educationExperienceList"
        border
      >
        <el-table-column
          label="学历"
          width="110"
        ><template slot-scope="scope"><dict-tag
          :type="DICT_TYPE.HRM_EMPLOYEE_EDUCATION"
          :value="scope.row.education"
        /></template></el-table-column>
        <el-table-column
          label="毕业院校"
          prop="graduateSchool"
          min-width="160"
        />
        <el-table-column
          label="专业"
          prop="major"
          min-width="130"
        />
        <el-table-column
          label="入学日期"
          width="120"
        ><template slot-scope="scope">{{ formatHrmDate(scope.row.admissionTime) }}</template></el-table-column>
        <el-table-column
          label="毕业日期"
          width="120"
        ><template slot-scope="scope">{{ formatHrmDate(scope.row.graduationTime) }}</template></el-table-column>
      </el-table><el-empty
        v-else
        :image-size="70"
        description="暂无数据"
      />
    </el-card>
    <el-card
      shadow="never"
      class="info-card"
    >
      <div slot="header">工作经历</div>
      <el-table
        v-if="workExperienceList.length"
        :data="workExperienceList"
        border
      >
        <el-table-column
          label="工作单位"
          prop="workUnit"
          min-width="170"
        /><el-table-column
          label="职务"
          prop="postName"
          min-width="130"
        />
        <el-table-column
          label="开始日期"
          width="120"
        ><template slot-scope="scope">{{ formatHrmDate(scope.row.startTime) }}</template></el-table-column>
        <el-table-column
          label="结束日期"
          width="120"
        ><template slot-scope="scope">{{ formatHrmDate(scope.row.endTime) }}</template></el-table-column>
        <el-table-column
          label="离职原因"
          prop="reason"
          min-width="180"
        />
      </el-table><el-empty
        v-else
        :image-size="70"
        description="暂无数据"
      />
    </el-card>
    <el-card
      shadow="never"
      class="info-card"
    >
      <div slot="header">证书/证件</div>
      <el-table
        v-if="certificateList.length"
        :data="certificateList"
        border
      >
        <el-table-column
          label="证书名称"
          prop="name"
          min-width="160"
        /><el-table-column
          label="级别"
          prop="level"
          width="110"
        /><el-table-column
          label="证书编号"
          prop="no"
          min-width="150"
        /><el-table-column
          label="发证机构"
          prop="issuingAuthority"
          min-width="150"
        />
        <el-table-column
          label="发证日期"
          width="120"
        ><template slot-scope="scope">{{ formatHrmDate(scope.row.issuingTime) }}</template></el-table-column>
      </el-table><el-empty
        v-else
        :image-size="70"
        description="暂无数据"
      />
    </el-card>
    <el-card
      shadow="never"
      class="info-card"
    >
      <div slot="header">培训经历</div>
      <el-table
        v-if="trainingExperienceList.length"
        :data="trainingExperienceList"
        border
      >
        <el-table-column
          label="培训课程"
          prop="course"
          min-width="150"
        /><el-table-column
          label="培训机构"
          prop="organizationName"
          min-width="150"
        />
        <el-table-column
          label="培训时间"
          min-width="230"
        ><template slot-scope="scope">{{ formatHrmDate(scope.row.startTime) }} 至 {{ formatHrmDate(scope.row.endTime) }}</template></el-table-column>
        <el-table-column
          label="培训成绩"
          prop="result"
          width="110"
        /><el-table-column
          label="培训证书"
          prop="certificateName"
          min-width="150"
        />
      </el-table><el-empty
        v-else
        :image-size="70"
        description="暂无数据"
      />
    </el-card>
    <el-card
      shadow="never"
      class="info-card"
    >
      <div slot="header">联系人</div>
      <el-table
        v-if="contactList.length"
        :data="contactList"
        border
      >
        <el-table-column
          label="联系人"
          prop="name"
          width="120"
        /><el-table-column
          label="关系"
          prop="relation"
          width="100"
        /><el-table-column
          label="联系电话"
          prop="phone"
          width="140"
        /><el-table-column
          label="工作单位"
          prop="workUnit"
          min-width="150"
        /><el-table-column
          label="联系地址"
          prop="address"
          min-width="180"
        />
      </el-table><el-empty
        v-else
        :image-size="70"
        description="暂无数据"
      />
    </el-card>
  </div>
</template>

<script>
import { getEmployeeCertificateList } from '@/api/hrm/portal/employee/certificate'
import { getEmployeeContactList } from '@/api/hrm/portal/employee/contact'
import { getEmployeeEducationExperienceList } from '@/api/hrm/portal/employee/education-experience'
import { getEmployeeTrainingExperienceList } from '@/api/hrm/portal/employee/training-experience'
import { getEmployeeWorkExperienceList } from '@/api/hrm/portal/employee/work-experience'
import { DICT_TYPE } from '@/utils/dict'
import { formatEmployeeIdType, formatHrmDate, formatHrmDateTime } from '@/views/hrm/utils/format'

export default {
  name: 'HrmPortalEmployeeBaseInfo',
  props: {
    employee: { type: Object, required: true },
    fieldConfigList: { type: Array, required: true }
  },
  data() {
    return { DICT_TYPE, loading: false, educationExperienceList: [], workExperienceList: [], certificateList: [], trainingExperienceList: [], contactList: [] }
  },
  computed: {
    hasEditableFields() { return this.fieldConfigList.some(field => field.editable) },
    visibleFieldNames() { return new Set(this.fieldConfigList.filter(field => field.visible).map(field => field.name)) },
    hasVisibleContactFields() { return this.isVisible('mobile') || this.isVisible('email') || this.isVisible('address') },
    employeeReminder() {
      return this.hasEditableFields
        ? '可编辑的信息由公司管理员设置，如有问题，请联系公司管理员。'
        : '您的编辑权限已被管理员关闭，如有问题，请联系公司管理员。'
    }
  },
  mounted() { this.getList() },
  methods: {
    formatEmployeeIdType,
    formatHrmDate,
    formatHrmDateTime,
    isVisible(name) { return this.visibleFieldNames.has(name) },
    async getList() {
      this.loading = true
      try {
        const responses = await Promise.all([
          getEmployeeEducationExperienceList(),
          getEmployeeWorkExperienceList(),
          getEmployeeCertificateList(),
          getEmployeeTrainingExperienceList(),
          getEmployeeContactList()
        ])
        this.educationExperienceList = responses[0].data
        this.workExperienceList = responses[1].data
        this.certificateList = responses[2].data
        this.trainingExperienceList = responses[3].data
        this.contactList = responses[4].data
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.employee-alert { margin-bottom: 15px; }
.info-card { margin-bottom: 15px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
</style>
