import request from '@/utils/request'

export function socialBind(type, code, state) {
  return request({
    url: '/system/social-user/bind',
    method: 'post',
    data: { type, code, state }
  })
}

export function socialUnbind(type, openid) {
  return request({
    url: '/system/social-user/unbind',
    method: 'delete',
    data: { type, openid }
  })
}

export function socialAuthRedirect(type, redirectUri) {
  return request({ url: '/system/auth/social-auth-redirect?type=' + type + '&redirectUri=' + redirectUri, method: 'get' })
}
