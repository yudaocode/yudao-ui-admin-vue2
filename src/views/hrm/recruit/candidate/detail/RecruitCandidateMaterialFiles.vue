<template>
  <el-card shadow="never">
    <el-table
      :data="candidate.resumeUrls || []"
      :show-header="false"
      stripe
      empty-text="暂无材料附件"
    >
      <el-table-column min-width="500"><template slot-scope="scope">{{ getFileNameFromUrl(scope.row) }}</template></el-table-column>
      <el-table-column
        align="center"
        width="160"
      ><template slot-scope="scope"><el-button
        type="text"
        @click="openSafeUrl(scope.row)"
      >预览</el-button><el-button
        type="text"
        @click="handleDownload(scope.row)"
      >下载</el-button></template></el-table-column>
    </el-table>
  </el-card>
</template>
<script>
import { getFileNameFromUrl } from '@/utils/file'
import { downloadByUrl } from '@/utils/filt'
import { openSafeUrl } from '@/utils/url'
export default {
  name: 'HrmRecruitCandidateMaterialFiles',
  props: { candidate: { type: Object, required: true }},
  methods: { getFileNameFromUrl, openSafeUrl, handleDownload(url) { downloadByUrl({ url, fileName: getFileNameFromUrl(url) }) } }
}
</script>
