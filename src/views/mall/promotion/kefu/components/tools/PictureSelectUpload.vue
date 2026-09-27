<template>
  <div>
    <img
      :src="Picture"
      class="picture-select"
      @click="selectAndUpload"
    />
  </div>
</template>

<script>
import Picture from '@/views/mall/promotion/kefu/components/asserts/picture.svg'
import * as FileApi from '@/api/infra/file'

export default {
  name: 'PictureSelectUpload',
  data() {
    return { Picture }
  },
  methods: {
    async selectAndUpload() {
      const files = await this.getFiles()
      this.$modal.msgSuccess('图片发送中请稍等。。。')
      const response = await FileApi.updateFile({ file: files[0].file })
      this.$emit('send-picture', response.data)
    },
    async getFiles(options = {}) {
      const config = Object.assign({
        multiple: true,
        accept: 'image/jpeg, image/png, image/gif',
        limit: 1,
        fileSize: 500
      }, options)
      const input = document.createElement('input')
      input.type = 'file'
      input.style.display = 'none'
      if (config.multiple) input.multiple = true
      if (config.accept) input.accept = config.accept
      document.body.appendChild(input)
      input.click()
      try {
        return await new Promise((resolve, reject) => {
          input.addEventListener('change', event => {
            const filesArray = Array.from(event.target.files || [])
            document.body.removeChild(input)
            if (filesArray.length > config.limit) {
              reject({ errorType: 'limit', files: filesArray })
              return
            }
            const overSizedFiles = filesArray.filter(
              file => file.size / 1024 ** 2 > config.fileSize
            )
            if (overSizedFiles.length > 0) {
              reject({ errorType: 'fileSize', files: overSizedFiles })
              return
            }
            resolve(filesArray.map((file, index) => ({ file, uid: Date.now() + index })))
          })
        })
      } catch (error) {
        console.error('选择文件出错:', error)
        throw error
      }
    }
  }
}
</script>

<style scoped>
.picture-select {
  width: 35px;
  height: 35px;
  cursor: pointer;
}
</style>
