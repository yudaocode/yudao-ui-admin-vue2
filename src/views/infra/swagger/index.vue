<template>
  <div>
    <doc-alert title="接口文档" url="https://doc.iocoder.cn/api-doc/" />
    <i-frame v-if="!loading" :src="url" />
  </div>
</template>
<script>
import iFrame from "@/components/iFrame/index";
import { getConfigKey } from "@/api/infra/config";
import { getBackendBaseUrl } from "@/utils/backendUrl";
export default {
  name: "InfraSwagger",
  components: { iFrame },
  data() {
    return {
      url: getBackendBaseUrl() + "/doc.html", // Knife4j UI
      // url: getBackendBaseUrl() + "/swagger-ui", // Swagger UI
      loading: true
    };
  },
  created() {
    getConfigKey("url.swagger").then(response => {
      if (!response.data || response.data.length === 0) {
        return
      }
      this.url = response.data;
    }).finally(() => {
      this.loading = false;
    })
  }
};
</script>
