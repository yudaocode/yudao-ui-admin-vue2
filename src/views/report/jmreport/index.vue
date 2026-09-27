<template>
  <div>
    <doc-alert title="报表设计器" url="https://doc.iocoder.cn/report/" />
    <i-frame :src="url" />
  </div>
</template>
<script>
import iFrame from '@/components/iFrame/index'
import { getRefreshToken } from '@/utils/auth'
import { getBackendBaseUrl } from '@/utils/backendUrl'

export default {
  name: 'JimuReport',
  components: { iFrame },
  data() {
    return {
      url: getBackendBaseUrl() + '/jmreport/list?token=' + getRefreshToken()
    }
  }
}
</script>
