<template>
  <div class="app-container">
    <doc-alert
      title="【商品】商品评价"
      url="https://doc.iocoder.cn/mall/product-comment/"
    />

    <!-- 搜索工作栏 -->
    <el-form
      v-show="showSearch"
      ref="queryForm"
      :model="queryParams"
      size="small"
      :inline="true"
      label-width="68px"
    >
      <el-form-item
        label="回复状态"
        prop="replyStatus"
      >
        <el-select
          v-model="queryParams.replyStatus"
          clearable
          placeholder="请选择回复状态"
        >
          <el-option
            label="已回复"
            :value="true"
          />
          <el-option
            label="未回复"
            :value="false"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="商品名称"
        prop="spuName"
      >
        <el-input
          v-model="queryParams.spuName"
          clearable
          placeholder="请输入商品名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="用户名称"
        prop="userNickname"
      >
        <el-input
          v-model="queryParams.userNickname"
          clearable
          placeholder="请输入用户名称"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="订单编号"
        prop="orderId"
      >
        <el-input
          v-model="queryParams.orderId"
          clearable
          placeholder="请输入订单编号"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item
        label="评论时间"
        prop="createTime"
      >
        <el-date-picker
          v-model="queryParams.createTime"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00', '23:59:59']"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="handleQuery"
        >搜索</el-button>
        <el-button
          icon="el-icon-refresh"
          @click="resetQuery"
        >重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row
      :gutter="10"
      class="mb8"
    >
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['product:comment:create']"
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >添加虚拟评论</el-button>
      </el-col>
      <right-toolbar
        :show-search.sync="showSearch"
        @queryTable="getList"
      />
    </el-row>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      stripe
    >
      <el-table-column
        label="评论编号"
        align="center"
        prop="id"
        min-width="80"
      />
      <el-table-column
        label="商品信息"
        align="center"
        min-width="320"
      >
        <template v-slot="scope">
          <div class="product-info">
            <el-image
              v-if="scope.row.skuPicUrl"
              :src="scope.row.skuPicUrl"
              :preview-src-list="[scope.row.skuPicUrl]"
              fit="cover"
              class="product-image"
            />
            <span>{{ scope.row.spuName }}</span>
            <el-tag
              v-for="property in scope.row.skuProperties || []"
              :key="property.propertyId + '-' + property.valueId"
              size="mini"
            >{{ property.propertyName }}: {{ property.valueName }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="用户名称"
        align="center"
        prop="userNickname"
        width="110"
      />
      <el-table-column
        label="商品评分"
        align="center"
        prop="descriptionScores"
        width="90"
      />
      <el-table-column
        label="服务评分"
        align="center"
        prop="benefitScores"
        width="90"
      />
      <el-table-column
        label="评论内容"
        align="center"
        prop="content"
        min-width="210"
      >
        <template v-slot="scope">
          <p>{{ scope.row.content }}</p>
          <div class="comment-images">
            <el-image
              v-for="(picUrl, index) in normalizePicUrls(scope.row.picUrls)"
              :key="index"
              :src="picUrl"
              :preview-src-list="normalizePicUrls(scope.row.picUrls)"
              fit="cover"
              class="comment-image"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="回复内容"
        align="center"
        prop="replyContent"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        label="评论时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template v-slot="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="是否展示"
        align="center"
        width="90"
      >
        <template v-slot="scope">
          <el-switch
            v-model="scope.row.visible"
            v-hasPermi="['product:comment:update']"
            :active-value="true"
            :inactive-value="false"
            @change="handleVisibleChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
        fixed="right"
      >
        <template v-slot="scope">
          <el-button
            v-hasPermi="['product:comment:update']"
            size="mini"
            type="text"
            icon="el-icon-chat-line-square"
            @click="handleReply(scope.row.id)"
          >回复</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNo"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <CommentForm
      ref="commentForm"
      @success="getList"
    />
    <ReplyForm
      ref="replyForm"
      @success="getList"
    />
  </div>
</template>

<script>
import {
  getCommentPage,
  updateCommentVisible
} from '@/api/mall/product/comment'
import CommentForm from './CommentForm.vue'
import ReplyForm from './ReplyForm.vue'

export default {
  name: 'ProductComment',
  components: { CommentForm, ReplyForm },
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      list: [],
      queryParams: {
        pageNo: 1,
        pageSize: 10,
        replyStatus: undefined,
        spuName: undefined,
        userNickname: undefined,
        orderId: undefined,
        createTime: []
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询列表 */
    getList() {
      this.loading = true
      return getCommentPage(this.queryParams).then(response => {
        const data = response.data
        this.list = data.list.map(item => Object.assign({}, item, {
          visible: item.visible === true || item.visible === 1
        }))
        this.total = data.total
      }).finally(() => {
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNo = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleAdd() {
      this.$refs.commentForm.open()
    },
    handleReply(id) {
      this.$refs.replyForm.open(id)
    },
    /** 显示 / 隐藏评论；取消或请求失败时恢复原值 */
    handleVisibleChange(row) {
      if (this.loading) {
        return
      }
      const visible = row.visible
      this.$modal.confirm(visible ? '是否显示评论？' : '是否隐藏评论？').then(() => {
        return updateCommentVisible({ id: row.id, visible: visible })
      }).then(() => {
        this.$modal.msgSuccess(visible ? '显示成功' : '隐藏成功')
        this.getList()
      }).catch(() => {
        row.visible = !visible
      })
    },
    normalizePicUrls(value) {
      if (!value) {
        return []
      }
      if (Array.isArray(value)) {
        return value.map(item => typeof item === 'string' ? item : item.url).filter(Boolean)
      }
      return value.split(',').filter(Boolean)
    }
  }
}
</script>

<style scoped>
.product-info,
.comment-images {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
}

.product-image,
.comment-image {
  width: 40px;
  height: 40px;
}
</style>
