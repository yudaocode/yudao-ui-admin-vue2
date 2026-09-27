<template>
  <div
    v-loading="loading"
    class="waterfall"
  >
    <div
      v-for="item in list"
      :key="item.id || item.mediaId"
      class="waterfall-item"
    >
      <a
        target="_blank"
        :href="item.url"
      >
        <img
          class="material-img"
          :src="item.url"
          :alt="item.name || ''"
        />
        <div class="item-name">{{ item.name }}</div>
      </a>
      <el-row class="operation-row">
        <el-button
          v-hasPermi="['mp:material:delete']"
          type="danger"
          icon="el-icon-delete"
          circle
          title="删除"
          @click="$emit('delete', item.id)"
        />
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageTable',
  props: {
    list: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.waterfall {
  width: 100%;
  margin-top: 10px;
  column-gap: 10px;
  column-count: 5;
}

.waterfall-item {
  padding: 10px;
  margin-bottom: 10px;
  break-inside: avoid;
  border: 1px solid #eaeaea;
}

.material-img {
  width: 100%;
}

.item-name {
  overflow: hidden;
  font-size: 12px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operation-row {
  text-align: center;
}

@media (min-width: 992px) and (max-width: 1300px) {
  .waterfall {
    column-count: 3;
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .waterfall {
    column-count: 2;
  }
}

@media (max-width: 767px) {
  .waterfall {
    column-count: 1;
  }
}
</style>
