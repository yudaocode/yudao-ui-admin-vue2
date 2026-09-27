<template>
  <el-table
    :data="contacts"
    stripe
    border
    height="180"
    :show-overflow-tooltip="true"
  >
    <el-table-column
      label="姓名"
      fixed="left"
      align="center"
      prop="name"
      min-width="120"
    >
      <template slot-scope="scope">
        <el-link
          type="primary"
          :underline="false"
          @click="openDetail(scope.row.id)"
        >
          {{ scope.row.name }}
        </el-link>
      </template>
    </el-table-column>
    <el-table-column
      label="手机号"
      align="center"
      prop="mobile"
      min-width="120"
    />
    <el-table-column
      label="职位"
      align="center"
      prop="post"
      min-width="100"
    />
    <el-table-column
      label="直属上级"
      align="center"
      prop="parentName"
      min-width="120"
    />
    <el-table-column
      label="关键决策人"
      align="center"
      prop="master"
      width="110"
    >
      <template slot-scope="scope">
        <dict-tag
          :type="DICT_TYPE.INFRA_BOOLEAN_STRING"
          :value="scope.row.master"
        />
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      fixed="right"
      label="操作"
      width="80"
    >
      <template slot-scope="scope">
        <el-button
          type="text"
          size="mini"
          class="danger-text"
          @click="$emit('remove', scope.$index)"
        >
          移除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { DICT_TYPE } from '@/utils/dict'

export default {
  name: 'FollowUpRecordContactForm',
  props: {
    contacts: { type: Array, default: () => [] }
  },
  data() {
    return { DICT_TYPE }
  },
  methods: {
    openDetail(id) {
      this.$router.push({ name: 'CrmContactDetail', params: { id }}).catch(() => {})
    }
  }
}
</script>

<style scoped>
.danger-text { color: #f56c6c; }
</style>
