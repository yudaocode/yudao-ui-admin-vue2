<template>
  <el-table :data="socialUsers" :show-header="false">
    <el-table-column label="社交平台" align="left" width="120">
      <template v-slot="scope">
        <img style="height:20px;vertical-align: middle;" :src="scope.row.img" /> {{ scope.row.title }}
      </template>
    </el-table-column>
    <el-table-column label="操作" align="left" >
      <template v-slot="scope">
        <div v-if="scope.row.openid">
          已绑定
          <el-button size="large" type="text" @click="unbind(scope.row)">(解绑)</el-button>
        </div>
        <div v-else>
          未绑定
          <el-button size="large" type="text" @click="bind(scope.row)">(绑定)</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>

import {SystemUserSocialTypeEnum} from "@/utils/constants";
import {socialAuthRedirect} from "@/api/login";
import {socialBind, socialUnbind, getBindSocialUserList} from "@/api/system/socialUser";

export default {
  props: {
    user: {
      type: Object
    },
    getUser: { // 刷新用户
      type: Function
    },
    setActiveTab: { // 设置激活的
      type: Function
    }
  },
  data() {
    return {
      socialUsers: []
    };
  },
  computed: {
  },
  async created() {
    // 初始化社交用户列表
    await this.initSocial();
    
    // 社交绑定
    const type = this.$route.query.type;
    const code = this.$route.query.code;
    const state = this.$route.query.state;
    if (!code) {
      return;
    }
    socialBind(type, code, state).then(resp => {
      this.$modal.msgSuccess("绑定成功");
      this.$router.replace('/user/profile');
      // 调用父组件, 刷新
      this.setActiveTab('userSocial');
      // 重新初始化社交用户列表
      this.initSocial();
    });
  },
  methods: {
    async initSocial() {
      this.socialUsers = []; // 重置避免无限增长
      // 获取已绑定的社交用户列表
      const bindSocialUserList = await getBindSocialUserList();
      // 检查该社交平台是否已绑定
      for (const i in SystemUserSocialTypeEnum) {
        const socialUser = { ...SystemUserSocialTypeEnum[i] };
        this.socialUsers.push(socialUser);
        if (bindSocialUserList && bindSocialUserList.data && bindSocialUserList.data.length > 0) {
          for (const bindUser of bindSocialUserList.data) {
            if (socialUser.type === bindUser.type) {
              socialUser.openid = bindUser.openid;
              break;
            }
          }
        }
      }
    },
    bind(socialUser) {
      // 计算 redirectUri
      const redirectUri = location.origin + '/user/profile?type=' + socialUser.type;
      // 进行跳转
      socialAuthRedirect(socialUser.type, encodeURIComponent(redirectUri)).then((res) => {
        window.location.href = res.data;
      });
    },
    unbind(socialUser) {
      socialUnbind(socialUser.type, socialUser.openid).then(resp => {
        this.$modal.msgSuccess("解绑成功");
        socialUser.openid = undefined;
      });
    },
    close() {
      this.$tab.closePage();
    }
  }
};
</script>
