<template>
  <div class="app-container">
    <el-form label-width="120px">
      <el-row type="flex" :gutter="0">
        <el-col :sm="12">
          <el-form-item label="WebSocket地址" size="small">
            <el-input v-model="url" type="text"/>
          </el-form-item>
        </el-col>
        <el-col :offset="1">
          <el-form-item label="" label-width="0px" size="small">
            <el-button @click="connect" type="primary" :disabled="ws&&ws.readyState===1">
              {{ ws && ws.readyState === 1 ? "已连接" : "连接" }}
            </el-button>
            <el-button @click="exit" type="danger">断开</el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="发给谁" size="small">
        <el-select v-model="sendUserId" placeholder="请选择">
          <el-option label="所有人" :value="null"/>
          <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.nickname"
              :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="发送内容" size="small">
        <el-input type="textarea" v-model="sendText" :rows="5"/>
      </el-form-item>
      <el-form-item label="" size="small">
        <el-button type="success" @click="send">发送消息</el-button>
      </el-form-item>
      <el-form-item label="接收内容" size="small">
        <el-input type="textarea" v-model="content" :rows="12" disabled/>
      </el-form-item>
      <el-form-item label="" size="small">
        <el-button type="info" @click="content=''">清空消息</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {getNowDateTime} from "@/utils/ruoyi";
import {getAccessToken} from "@/utils/auth";
import {listSimpleUsers} from "@/api/system/user";

export default {
  data() {
    return {
      url: "",
      sendText: "",
      content: "",
      ws: null,
      userList: [], // 用户列表
      sendUserId: null // 发给谁，默认所有人
    };
  },
  created() {
    const wsUrl = process.env.VUE_APP_BASE_API + "/infra/ws" + '?token=' + getAccessToken();
    this.url = wsUrl.replace("http", "ws");
    // 获取用户精简信息列表
    listSimpleUsers().then(res => {
      this.userList = res.data;
    });
  },
  methods: {
    /** 发起连接 */
    connect() {
      if (!'WebSocket' in window) {
        this.$modal.msgError("您的浏览器不支持WebSocket");
        return;
      }
      // 建立连接
      this.ws = new WebSocket(this.url);
      // 监听 open 事件
      this.ws.onopen = (event) => {
        this.content = this.content + "\n**********************连接开始**********************\n";
      };
      // 监听 message 事件
      this.ws.onmessage = (event) => {
        try {
          const data = event.data;
          // 1. 收到心跳
          if (data === 'pong') {
            return;
          }
          // 2.1 解析 type 消息类型
          const jsonMessage = JSON.parse(data)
          const type = jsonMessage.type;
          const content = JSON.parse(jsonMessage.content);
          if (!type) {
            this.$modal.msgError('未知的消息类型：' + data);
            return;
          }
          // 2.2 消息类型：demo-message-receive
          if (type === 'demo-message-receive') {
            const single = content.single;
            this.content = this.content + "接收时间：" + getNowDateTime() + "\n" +
                `【${single ? '单发' : '群发'}】用户编号(${content.fromUserId})：${content.text}` + "\n";
            return;
          }
          // 2.3 消息类型：notice-push
          if (type === 'notice-push') {
            this.content = this.content + "接收时间：" + getNowDateTime() + "\n" + `【系统通知】：${content.title}` + "\n";
            return;
          }
          this.$modal.msgError('未处理消息：' + data);
        } catch (error) {
          this.$modal.msgError('处理消息发生异常：' + event.data);
          console.error(error);
        }
      };
      // 监听 close 事件
      this.ws.onclose = (event) => {
        this.content = this.content + "**********************连接关闭**********************\n";
      };
      // 监听 error 事件
      this.ws.error = (event) => {
        this.content = this.content + "**********************连接异常**********************\n";
      };
    },
    /** 关闭连接 */
    exit() {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    },
    /** 发送消息 */
    send() {
      if (!this.ws || this.ws.readyState !== 1) {
        this.$modal.msgError("未连接到服务器");
        return;
      }
      if (!this.sendText) {
        this.$modal.msgError("请输入发送内容");
        return;
      }

      // 1.1 先 JSON 化 message 消息内容
      const messageContent = JSON.stringify({
        text: this.sendText,
        toUserId: this.sendUserId
      });
      // 1.2 再 JSON 化整个消息
      const jsonMessage = JSON.stringify({
        type: 'demo-message-send',
        content: messageContent
      });
      // 2. 最后发送消息
      this.ws.send(jsonMessage);
      this.sendText = '';
    }
  },
};
</script>
