<template>
  <div>
    <doc-alert title="大屏设计器" url="https://doc.iocoder.cn/screen/" />
    <i-frame :src="url" />
  </div>
</template>
<script>
import iFrame from '@/components/iFrame/index'
import { getRefreshToken } from '@/utils/auth'
import { getBackendBaseUrl } from '@/utils/backendUrl'

export default {
  name: 'JimuBI',
  components: { iFrame },
  data() {
    return {
      url: getBackendBaseUrl() + '/drag/list?token=' + getRefreshToken()
    }
  }
}
</script>
