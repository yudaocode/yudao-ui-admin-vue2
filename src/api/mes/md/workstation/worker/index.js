import request from '@/utils/request'

export const MdWorkstationWorkerApi = {
  getWorkstationWorkerList: workstationId => request({
    url: '/mes/md-workstation-worker/list-by-workstation?workstationId=' + workstationId,
    method: 'get'
  }),
  createWorkstationWorker: data => request({ url: '/mes/md-workstation-worker/create', method: 'post', data }),
  updateWorkstationWorker: data => request({ url: '/mes/md-workstation-worker/update', method: 'put', data }),
  deleteWorkstationWorker: id => request({ url: '/mes/md-workstation-worker/delete?id=' + id, method: 'delete' })
}
