<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="500px"
    class="lock-dialog"
    title="锁定屏幕"
    append-to-body
    @closed="handleClosed"
  >
    <div class="lock-dialog-user flex flex-col items-center">
      <img :src="avatar" alt="" class="lock-dialog-avatar" />
      <span class="lock-dialog-name">{{ userName }}</span>
    </div>
    <el-form ref="form" :model="formData" :rules="formRules" label-width="80px">
      <el-form-item label="锁屏密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入锁屏密码"
          clearable
          show-password
          @keyup.enter.native="handleLock"
        />
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button type="primary" @click="handleLock">锁定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'LockDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {
        password: undefined
      },
      formRules: {
        password: [{ required: true, message: '锁屏密码不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['avatar', 'nickname']),
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    userName() {
      return this.nickname || 'Admin'
    }
  },
  methods: {
    handleLock() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        this.dialogVisible = false
        this.$store.dispatch('lock/setLockInfo', {
          password: this.formData.password,
          isLock: true
        })
      })
    },
    handleClosed() {
      this.formData.password = undefined
      this.$refs.form.clearValidate()
    }
  }
}
</script>

<style lang="scss" scoped>
.lock-dialog-user {
  display: flex;
  flex-direction: column;
  align-items: center;

  .lock-dialog-avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
  }

  .lock-dialog-name {
    margin: 10px 0;
    font-size: 14px;
  }
}

@media screen and (max-width: 767px) {
  ::v-deep .lock-dialog {
    max-width: calc(100vw - 16px);
  }
}
</style>
