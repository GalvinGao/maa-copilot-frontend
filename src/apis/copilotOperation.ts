import { Response } from 'models/network'
import { jsonRequest } from 'utils/fetcher'

export interface OperationUploadResponse {
  id: string
}

export const requestOperationUpload = (content: string) => {
  return jsonRequest<Response<OperationUploadResponse>>('/copilot/upload', {
    method: 'POST',
    json: {
      content,
    },
  })
}

export const requestOperationUpdate = (id: string, content: string) => {
  return jsonRequest<Response<OperationUploadResponse>>('/copilot/update', {
    method: 'POST',
    json: {
      id,
      content,
    },
  })
}

export const requestDeleteOperation = (id: string) => {
  return jsonRequest<Response<OperationUploadResponse>>(`/copilot/delete`, {
    method: 'POST',
    json: {
      id,
    },
  })
}
