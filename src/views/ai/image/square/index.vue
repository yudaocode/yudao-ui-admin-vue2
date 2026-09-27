<template>
  <div class="ai-image-square">
    <el-input
      v-model="queryParams.prompt"
      class="ai-image-square__search"
      size="medium"
      placeholder="请输入要搜索的内容"
      suffix-icon="el-icon-search"
      @keyup.enter.native="handleQuery"
    />
    <div class="ai-image-square__grid">
      <div v-for="item in list" :key="item.id" class="ai-image-square__item">
        <img :src="item.picUrl" alt="" />
      </div>
    </div>
    <pagination :total="total" :page.sync="queryParams.pageNo" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { ImageApi } from '@/api/ai/image'

export default {
  name: 'AiImageSquare',
  data() {
    return {
      loading: true,
      list: [],
      total: 0,
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        publicStatus: true,
        prompt: undefined
      }
    }
  },
  async created() {
    await this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      return ImageApi.getImagePageMy(this.queryParams).then(response => {
        this.list = response.data.list
        this.total = response.data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    }
  }
}
</script>

<style scoped>
.ai-image-square {
  padding: 20px;
  background: #fff;
}

.ai-image-square__search {
  width: 100%;
  margin-bottom: 20px;
}

.ai-image-square__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.ai-image-square__item {
  position: relative;
  overflow: hidden;
  background: #f5f7fa;
  cursor: pointer;
  transition: transform 0.3s;
}

.ai-image-square__item:hover {
  transform: scale(1.05);
}

.ai-image-square__item img {
  display: block;
  width: 100%;
  height: auto;
  transition: transform 0.3s;
}

.ai-image-square__item:hover img {
  transform: scale(1.1);
}
</style>
