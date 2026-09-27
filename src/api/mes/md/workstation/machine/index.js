import request from '@/utils/request'

export const MdWorkstationMachineApi = {
  getWorkstationMachineList: workstationId => request({
    url: '/mes/md-workstation-machine/list-by-workstation?workstationId=' + workstationId,
    method: 'get'
  }),
  createWorkstationMachine: data => request({ url: '/mes/md-workstation-machine/create', method: 'post', data }),
  deleteWorkstationMachine: id => request({ url: '/mes/md-workstation-machine/delete?id=' + id, method: 'delete' })
}
