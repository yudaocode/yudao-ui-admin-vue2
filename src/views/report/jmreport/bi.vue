<template>
  <div>
    <doc-alert title="大屏设计器" url="https://doc.iocoder.cn/screen/" />
    <i-frame :src="url" />
  </div>
</template>
<script>
import iFrame from "@/components/iFrame/index";
import {getAccessToken} from "@/utils/auth";
export default {
  name: "JimuBI",
  components: { iFrame },
  data() {
    return {
      url: process.env.VUE_APP_BASE_API + "/drag/list?token=" + getAccessToken(),
    };
  },
};
</script>
