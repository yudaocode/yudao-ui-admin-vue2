<template>
  <el-card class="image-list-card" shadow="never" :body-style="bodyStyle">
    <div slot="header" class="image-list-card__header">
      <span>绘画任务</span>
      <el-button size="mini" @click="handleViewPublic">绘画作品</el-button>
    </div>

    <div ref="imageListRef" v-loading="loading" class="image-list-card__body">
      <ImageCard
        v-for="image in imageList"
        :key="image.id"
        :detail="image"
        @onBtnClick="handleImageButtonClick"
        @onMjBtnClick="handleImageMidjourneyButtonClick"
      />
    </div>

    <div class="image-list-card__pagination">
      <pagination
        v-show="pageTotal > 0"
        :total="pageTotal"
        :page.sync="queryParams.pageNo"
        :limit.sync="queryParams.pageSize"
        @pagination="getImageList"
      />
    </div>

    <ImageDetail
      :show="isShowImageDetail"
      :id="showImageDetailId"
      @handleDrawerClose="handleDetailClose"
    />
  </el-card>
</template>

<script>
import ImageCard from './ImageCard.vue'
import ImageDetail from './ImageDetail.vue'
import { ImageApi } from '@/api/ai/image'
import { AiImageStatusEnum } from '@/views/ai/utils/constants'
import download from '@/plugins/download'

export default {
  name: 'ImageList',
  components: {
    ImageCard,
    ImageDetail
  },
  data() {
    return {
      bodyStyle: {
        margin: 0,
        padding: 0,
        height: '100%',
        position: 'relative'
      },
      loading: false,
      pageTotal: 0,
      imageList: [],
      inProgressImageMap: {},
      inProgressTimer: null,
      queryParams: {
        pageNo: 1,
        pageSize: 10
      },
      isShowImageDetail: false,
      showImageDetailId: 0
    }
  },
  mounted() {
    this.getImageList()
    this.inProgressTimer = setInterval(() => {
      this.refreshWatchImages()
    }, 3000)
  },
  beforeDestroy() {
    if (this.inProgressTimer) {
      clearInterval(this.inProgressTimer)
      this.inProgressTimer = null
    }
  },
  methods: {
    handleViewPublic() {
      this.$router.push({ name: 'AiImageSquare' })
    },
    handleDetailOpen() {
      this.isShowImageDetail = true
    },
    handleDetailClose() {
      this.isShowImageDetail = false
    },
    getImageList() {
      this.loading = true
      return ImageApi.getImagePageMy(this.queryParams)
        .then(response => {
          const { list, total } = response.data
          this.imageList = list
          this.pageTotal = total
          const newWatImages = {}
          this.imageList.forEach(item => {
            if (item.status === AiImageStatusEnum.IN_PROGRESS) {
              newWatImages[item.id] = item
            }
          })
          this.inProgressImageMap = newWatImages
        })
        .finally(() => {
          this.loading = false
        })
    },
    refreshWatchImages() {
      const imageIds = Object.keys(this.inProgressImageMap).map(Number)
      if (imageIds.length === 0) {
        return Promise.resolve()
      }
      return ImageApi.getImageListMyByIds(imageIds).then(response => {
        const list = response.data
        const newWatchImages = {}
        list.forEach(image => {
          if (image.status === AiImageStatusEnum.IN_PROGRESS) {
            newWatchImages[image.id] = image
          } else {
            const index = this.imageList.findIndex(oldImage => image.id === oldImage.id)
            if (index >= 0) {
              this.$set(this.imageList, index, image)
            }
          }
        })
        this.inProgressImageMap = newWatchImages
      })
    },
    handleImageButtonClick(type, imageDetail) {
      if (type === 'more') {
        this.showImageDetailId = imageDetail.id
        this.handleDetailOpen()
        return
      }
      if (type === 'delete') {
        this.$modal.confirm('是否删除照片?').then(() => ImageApi.deleteImageMy(imageDetail.id)).then(() => this.getImageList()).then(() => {
          this.$modal.msgSuccess('删除成功!')
        })
        return
      }
      if (type === 'download') {
        download.image({ url: imageDetail.picUrl })
        return
      }
      if (type === 'regeneration') {
        this.$emit('onRegeneration', imageDetail)
      }
    },
    handleImageMidjourneyButtonClick(button, imageDetail) {
      const data = {
        id: imageDetail.id,
        customId: button.customId
      }
      return ImageApi.midjourneyAction(data).then(() => {
        return this.getImageList()
      })
    }
  }
}
</script>

<style scoped>
.image-list-card {
  height: 100%;
}

.image-list-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.image-list-card__body {
  position: relative;
  display: flex;
  flex-flow: row wrap;
  align-content: flex-start;
  height: 100%;
  min-height: 540px;
  padding: 20px 20px 140px;
  overflow: auto;
  box-sizing: border-box;
}

.image-list-card__body > * {
  margin-right: 20px;
  margin-bottom: 20px;
}

.image-list-card__pagination {
  position: absolute;
  right: 0;
  bottom: 60px;
  left: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background: #fff;
}
</style>
