<template>
  <div>
    <doc-alert title="大屏设计器" url="https://doc.iocoder.cn/report/screen/" />
    <i-frame :src="url" />
  </div>
</template>
<script>
import iFrame from "@/components/iFrame/index";
import { getAccessToken, getRefreshToken } from "@/utils/auth";
export default {
  name: "GoView",
  components: { iFrame },
  data() {
    return {
      url: `http://127.0.0.1:3000?accessToken=${getAccessToken()}&refreshToken=${getRefreshToken()}`,
    };
  },
};
</script>
