<template>
  <el-dialog
    title="添加虚拟评论"
    :visible.sync="dialogVisible"
    width="620px"
    append-to-body
  >
    <el-form
      ref="form"
      v-loading="loading"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item
        label="商品"
        prop="spuId"
      >
        <el-select
          v-model="form.spuId"
          :loading="spuLoading"
          clearable
          filterable
          placeholder="请选择商品"
          style="width: 100%"
          @change="handleSpuChange"
        >
          <el-option
            v-for="item in spuOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="form.spuId"
        label="商品规格"
        prop="skuId"
      >
        <el-select
          v-model="form.skuId"
          :loading="skuLoading"
          clearable
          filterable
          placeholder="请选择商品规格"
          style="width: 100%"
        >
          <el-option
            v-for="item in skuOptions"
            :key="item.id"
            :label="formatSkuLabel(item)"
            :value="item.id"
          >
            <span>{{ formatSkuLabel(item) }}</span>
          </el-option>
        </el-select>
        <el-image
          v-if="selectedSku && selectedSku.picUrl"
          :src="selectedSku.picUrl"
          :preview-src-list="[selectedSku.picUrl]"
          fit="cover"
          class="sku-image"
        />
      </el-form-item>
      <el-form-item
        label="用户头像"
        prop="userAvatar"
      >
        <ImageUpload
          v-model="form.userAvatar"
          :limit="1"
          :is-show-tip="false"
        />
      </el-form-item>
      <el-form-item
        label="用户名称"
        prop="userNickname"
      >
        <el-input
          v-model="form.userNickname"
          placeholder="请输入用户名称"
        />
      </el-form-item>
      <el-form-item
        label="评论内容"
        prop="content"
      >
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="3"
          placeholder="请输入评论内容"
        />
      </el-form-item>
      <el-form-item
        label="描述星级"
        prop="descriptionScores"
      >
        <el-rate v-model="form.descriptionScores" />
      </el-form-item>
      <el-form-item
        label="服务星级"
        prop="benefitScores"
      >
        <el-rate v-model="form.benefitScores" />
      </el-form-item>
      <el-form-item
        label="评论图片"
        prop="picUrls"
      >
        <ImageUpload
          v-model="form.picUrls"
          :limit="9"
          :is-show-tip="false"
        />
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        :loading="loading"
        @click="submitForm"
      >确 定</el-button>
      <el-button @click="cancel">取 消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import ImageUpload from '@/components/ImageUpload'
import { createComment } from '@/api/mall/product/comment'
import { getSpu, getSpuSimpleList } from '@/api/mall/product/spu'

export default {
  name: 'ProductCommentForm',
  components: { ImageUpload },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      spuLoading: false,
      skuLoading: false,
      spuOptions: [],
      skuOptions: [],
      form: this.createDefaultFormData(),
      rules: {
        spuId: [{ required: true, message: '商品不能为空', trigger: 'change' }],
        skuId: [{ required: true, message: '规格不能为空', trigger: 'change' }],
        userAvatar: [{ required: true, message: '用户头像不能为空', trigger: 'change' }],
        userNickname: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
        content: [{ required: true, message: '评论内容不能为空', trigger: 'blur' }],
        descriptionScores: [{ required: true, message: '描述星级不能为空', trigger: 'change' }],
        benefitScores: [{ required: true, message: '服务星级不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    selectedSku() {
      return this.skuOptions.find(item => item.id === this.form.skuId)
    }
  },
  methods: {
    createDefaultFormData() {
      return {
        id: undefined,
        userId: undefined,
        userNickname: undefined,
        userAvatar: undefined,
        spuId: undefined,
        skuId: undefined,
        descriptionScores: 5,
        benefitScores: 5,
        content: undefined,
        picUrls: []
      }
    },
    /** 打开弹窗 */
    open() {
      this.reset()
      this.dialogVisible = true
      if (this.spuOptions.length === 0) {
        this.loadSpuOptions()
      }
    },
    loadSpuOptions() {
      this.spuLoading = true
      getSpuSimpleList().then(response => {
        this.spuOptions = response.data
      }).finally(() => {
        this.spuLoading = false
      })
    },
    handleSpuChange(spuId) {
      this.form.skuId = undefined
      this.skuOptions = []
      if (!spuId) {
        return
      }
      this.skuLoading = true
      getSpu(spuId).then(response => {
        this.skuOptions = response.data.skus
      }).finally(() => {
        this.skuLoading = false
      })
    },
    formatSkuLabel(sku) {
      const properties = (sku.properties || [])
        .map(item => item.valueName || item.name || item.valueId)
        .filter(value => value !== undefined && value !== null && value !== '')
      return properties.length > 0 ? properties.join(' / ') : '默认规格 #' + sku.id
    },
    normalizePicUrls(value) {
      if (!value) {
        return []
      }
      if (Array.isArray(value)) {
        return value.map(item => typeof item === 'string' ? item : item.url).filter(Boolean)
      }
      return value.split(',').filter(Boolean)
    },
    /** 提交表单 */
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const data = Object.assign({}, this.form, {
          picUrls: this.normalizePicUrls(this.form.picUrls)
        })
        this.loading = true
        createComment(data).then(() => {
          this.$modal.msgSuccess('新增成功')
          this.dialogVisible = false
          this.$emit('success')
        }).finally(() => {
          this.loading = false
        })
      })
    },
    cancel() {
      this.dialogVisible = false
      this.reset()
    },
    reset() {
      this.form = this.createDefaultFormData()
      this.skuOptions = []
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    }
  }
}
</script>

<style scoped>
.sku-image {
  display: block;
  width: 60px;
  height: 60px;
  margin-top: 8px;
}
</style>
