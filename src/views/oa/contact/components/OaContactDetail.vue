<template>
  <!-- 联系人详情 -->
  <Dialog v-model="dialogVisible" title="联系人详情" width="720px">
    <el-descriptions v-loading="loading" :column="1" border>
      <el-descriptions-item label="姓名">
        <div class="contact-detail__name">
          <el-avatar :src="detailData.avatar" :size="32" />
          <span>{{ detailData.name }}</span>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="性别">
        <dict-tag
          v-if="detailData.sex != null"
          :type="DICT_TYPE.SYSTEM_USER_SEX"
          :value="detailData.sex"
        />
      </el-descriptions-item>
      <el-descriptions-item label="手机号码">{{ detailData.mobile }}</el-descriptions-item>
      <el-descriptions-item label="邮箱">{{ detailData.email }}</el-descriptions-item>
      <el-descriptions-item label="分类">
        {{ detailData.handleStatus != null ? detailData.sharedCategoryName : detailData.categoryName }}
      </el-descriptions-item>
      <el-descriptions-item label="创建人">{{ detailData.ownerUserName }}</el-descriptions-item>
      <el-descriptions-item label="公司名称">{{ detailData.companyName }}</el-descriptions-item>
      <el-descriptions-item label="公司电话">{{ detailData.companyPhone }}</el-descriptions-item>
      <el-descriptions-item label="联系地址">{{ detailData.address }}</el-descriptions-item>
      <el-descriptions-item label="备注">{{ detailData.remark }}</el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import * as ContactApi from '@/api/oa/contact'
import { DICT_TYPE } from '@/utils/dict'

function createEmptyDetail() {
  return { name: '' }
}

export default {
  name: 'OaContactDetail',
  components: { Dialog },
  data() {
    return {
      dialogVisible: false, // 弹窗是否展示
      loading: false, // 详情加载中
      detailData: createEmptyDetail(), // 联系人详情
      DICT_TYPE
    }
  },
  methods: {
    /** 打开详情 */
    open(id) {
      this.dialogVisible = true
      this.detailData = createEmptyDetail()
      this.loading = true
      return ContactApi.getContact(id).then(response => {
        this.detailData = response.data
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>
.contact-detail__name {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
