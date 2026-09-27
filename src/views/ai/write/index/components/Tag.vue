<template>
  <div class="write-tags">
    <span
      v-for="tag in tags"
      :key="tag.value"
      class="write-tag"
      :class="{ 'is-active': value === tag.value }"
      @click="$emit('input', tag.value)"
    >{{ tag.label }}</span>
  </div>
</template>

<script>
export default {
  name: 'AiWriteTag',
  props: {
    tags: {
      type: Array,
      default: () => []
    },
    value: {
      type: [String, Number],
      default: undefined
    }
  }
}
</script>

<style scoped>
.write-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.write-tag {
  box-sizing: border-box;
  margin-bottom: 8px;
  padding: 0 8px;
  border: 2px solid #dddfe3;
  border-radius: 4px;
  color: #5c6370;
  background: #dddfe3;
  font-size: 12px;
  line-height: 24px;
  cursor: pointer;
}

.write-tag.is-active {
  border-color: #846af7;
  color: #846af7;
}
</style>
