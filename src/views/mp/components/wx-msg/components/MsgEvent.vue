<template>
  <div>
    <div v-if="item.event === 'subscribe'">
      <el-tag
        type="success"
        size="mini"
      >关注</el-tag>
    </div>
    <div v-else-if="item.event === 'unsubscribe'">
      <el-tag
        type="danger"
        size="mini"
      >取消关注</el-tag>
    </div>
    <div v-else-if="item.event === 'CLICK'">
      <el-tag size="mini">点击菜单</el-tag>【{{ item.eventKey }}】
    </div>
    <div v-else-if="item.event === 'VIEW'">
      <el-tag size="mini">点击菜单链接</el-tag>【{{ item.eventKey }}】
    </div>
    <div v-else-if="item.event === 'scancode_waitmsg' || item.event === 'scancode_push'">
      <el-tag size="mini">扫码结果</el-tag>【{{ item.eventKey }}】
    </div>
    <div v-else-if="item.event === 'pic_sysphoto'">
      <el-tag size="mini">系统拍照发图</el-tag>
    </div>
    <div v-else-if="item.event === 'pic_photo_or_album'">
      <el-tag size="mini">拍照或者相册</el-tag>
    </div>
    <div v-else-if="item.event === 'pic_weixin'">
      <el-tag size="mini">微信相册</el-tag>
    </div>
    <div v-else-if="item.event === 'location_select'">
      <el-tag size="mini">选择地理位置</el-tag>
    </div>
    <div v-else-if="item.event === 'SCAN'">
      <el-tag
        type="success"
        size="mini"
      >扫码</el-tag>
    </div>
    <div v-else>
      <el-tag
        type="danger"
        size="mini"
      >未知事件类型</el-tag>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MsgEvent',
  props: {
    item: {
      type: Object,
      required: true
    }
  }
}
</script>
