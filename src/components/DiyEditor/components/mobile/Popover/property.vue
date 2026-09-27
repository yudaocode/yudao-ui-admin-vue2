<template>
  <el-form label-width="80px" :model="formData">
    <Draggable v-model="formData.list" :empty-item="{ showType: 'once' }">
      <template slot-scope="{ element, index }">
        <el-form-item label="图片" :prop="`list[${index}].imgUrl`">
          <UploadImg v-model="element.imgUrl" height="56px" width="56px" />
        </el-form-item>
        <el-form-item label="跳转链接" :prop="`list[${index}].url`">
          <AppLinkInput v-model="element.url" />
        </el-form-item>
        <el-form-item label="显示次数" :prop="`list[${index}].showType`">
          <el-radio-group v-model="element.showType">
            <el-tooltip content="只显示一次，下次打开时不显示" placement="bottom">
              <el-radio label="once">一次</el-radio>
            </el-tooltip>
            <el-tooltip content="每次打开时都会显示" placement="bottom">
              <el-radio label="always">不限</el-radio>
            </el-tooltip>
          </el-radio-group>
        </el-form-item>
      </template>
    </Draggable>
  </el-form>
</template>

<script>
import AppLinkInput from '@/components/AppLinkInput/index.vue'
import Draggable from '@/components/Draggable/index.vue'
import UploadImg from '@/components/UploadImg/index.vue'

export default {
  name: 'PopoverProperty',
  components: { AppLinkInput, Draggable, UploadImg },
  props: {
    value: { type: Object, required: true }
  },
  computed: {
    formData() {
      return this.value
    }
  }
}
</script>
