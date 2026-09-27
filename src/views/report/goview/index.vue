<template>
  <div>
    <doc-alert title="大屏设计器" url="https://doc.iocoder.cn/report/screen/" />
    <i-frame :src="url" />
  </div>
</template>
<script>
import iFrame from '@/components/iFrame/index'
import { getAccessToken, getRefreshToken } from '@/utils/auth'

export default {
  name: 'GoView',
  components: { iFrame },
  data() {
    return {
      url: `${process.env.VUE_APP_GOVIEW_URL}?accessToken=${getAccessToken()}&refreshToken=${getRefreshToken()}`
    }
  }
}
</script>
