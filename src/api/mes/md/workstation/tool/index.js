import request from '@/utils/request'

export const MdWorkstationToolApi = {
  getWorkstationToolList: workstationId => request({
    url: '/mes/md-workstation-tool/list-by-workstation?workstationId=' + workstationId,
    method: 'get'
  }),
  createWorkstationTool: data => request({ url: '/mes/md-workstation-tool/create', method: 'post', data }),
  updateWorkstationTool: data => request({ url: '/mes/md-workstation-tool/update', method: 'put', data }),
  deleteWorkstationTool: id => request({ url: '/mes/md-workstation-tool/delete?id=' + id, method: 'delete' })
}
