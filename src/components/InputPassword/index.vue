<template>
  <div class="input-password">
    <el-input
      :value="value"
      :type="textType"
      v-bind="$attrs"
      @input="handleInput"
    >
      <template slot="suffix">
        <i
          class="el-input__icon cursor-pointer"
          :class="textType === 'password' ? 'el-icon-view' : 'el-icon-hide'"
          @click="changeTextType"
        />
      </template>
    </el-input>
    <div v-if="strength" class="input-password__bar">
      <div class="input-password__bar--fill" :data-score="passwordStrength" />
    </div>
  </div>
</template>

<script>
/**
 * InputPassword 密码强度输入框（Vue3 版基于 zxcvbn-ts 的移植）
 * Vue2 无 zxcvbn-ts 依赖，强度评分使用内置启发式算法（0-4 分，与 zxcvbn score 同域）
 */
export default {
  name: 'InputPassword',
  inheritAttrs: false,
  props: {
    // 是否显示密码强度
    strength: {
      type: Boolean,
      default: false
    },
    // 输入框值（v-model）
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 设置 input 的 type 属性
      textType: 'password'
    }
  },
  computed: {
    passwordStrength() {
      return this.getPasswordStrength(this.value)
    }
  },
  methods: {
    changeTextType() {
      this.textType = this.textType === 'text' ? 'password' : 'text'
    },
    handleInput(val) {
      this.$emit('input', val)
    },
    // 内置密码强度评分：返回 -1（空）或 0-4
    getPasswordStrength(value) {
      if (!value) {
        return -1
      }
      let score = 0
      const len = value.length
      if (len >= 8) score++
      if (len >= 12) score++
      const variety = [
        /[a-z]/.test(value),
        /[A-Z]/.test(value),
        /\d/.test(value),
        /[^a-zA-Z0-9]/.test(value)
      ].filter(Boolean).length
      score += variety >= 3 ? 2 : variety === 2 ? 1 : 0
      // 常见弱口令直接压低到最低档
      if (/^(\d+|password|123456|qwerty|abc123)$/i.test(value)) {
        score = Math.min(score, 1)
      }
      return Math.min(score, 4)
    }
  }
}
</script>

<style lang="scss" scoped>
.cursor-pointer {
  cursor: pointer;
}

.input-password {
  &__bar {
    position: relative;
    height: 6px;
    margin: 10px auto 6px;
    background-color: #e4e7ed;
    border-radius: 4px;

    &::before,
    &::after {
      position: absolute;
      z-index: 10;
      display: block;
      width: 20%;
      height: inherit;
      background-color: transparent;
      border-color: #fff;
      border-style: solid;
      border-width: 0 5px;
      content: '';
    }

    &::before {
      left: 20%;
    }

    &::after {
      right: 20%;
    }
  }

  &__bar--fill {
    position: absolute;
    width: 0;
    height: inherit;
    background-color: transparent;
    border-radius: inherit;
    transition:
      width 0.5s ease-in-out,
      background 0.25s;

    &[data-score='0'] {
      width: 20%;
      background-color: #f56c6c;
    }

    &[data-score='1'] {
      width: 40%;
      background-color: #f56c6c;
    }

    &[data-score='2'] {
      width: 60%;
      background-color: #e6a23c;
    }

    &[data-score='3'] {
      width: 80%;
      background-color: #67c23a;
    }

    &[data-score='4'] {
      width: 100%;
      background-color: #67c23a;
    }
  }
}
</style>
