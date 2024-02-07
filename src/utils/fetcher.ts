import camelcaseKeys from 'camelcase-keys'
import { merge } from 'lodash-es'
import unfetch from 'unfetch'

import { Response } from 'models/network'

const fetch = window.fetch || unfetch

export class NetworkError extends Error {}

if (!import.meta.env.VITE_API) {
  throw new Error('env var VITE_API is not set')
}

const baseURL = import.meta.env.VITE_API as string

export const FETCHER_CONFIG: {
  apiToken?: () => Promise<string | undefined>
} = {}

interface ExtendedRequestInit extends RequestInit {
  noToken?: boolean
}

export const request = <T extends Response<unknown>>(
  input: string,
  init?: ExtendedRequestInit,
): Promise<T> =>
  Promise.resolve(
    init?.noToken ? undefined : FETCHER_CONFIG.apiToken?.().catch(console.warn),
  ).then((apiToken) =>
    fetch(
      baseURL + input,
      merge(
        init,
        apiToken && {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        },
      ),
    )
      .then(async (res) => {
        return {
          response: res,
          data: camelcaseKeys(await res.json(), { deep: true }) as T,
        }
      })

      .catch((err) => {
        console.error('Fetcher: got error', err)
        return Promise.reject(new Error('请求失败：服务器返回错误，请稍后再试'))
      })
      .then((res) => {
        if (
          (res.data.statusCode &&
            (res.data.statusCode < 200 || res.data.statusCode >= 300)) ||
          res.response.status < 200 ||
          res.response.status >= 300
        ) {
          console.error('Fetcher: got error response', res)

          let message: string

          if (
            res.response.status === 401 ||
            res.data.message.includes('Full authentication is required')
          ) {
            if (apiToken) {
              message = '登录已失效，请重新登录'
            } else {
              message = '未登录，请先登录'
            }
          } else {
            message =
              res.data?.message ||
              JSON.stringify(res.data) ||
              `Unknown error (${
                res.data.statusCode || res.response.status || 'unknown'
              })`
          }

          throw new Error(message)
        }
        return res.data
      }),
  )

export type JsonRequestInit = ExtendedRequestInit & {
  json?: any
}

export const jsonRequest = <T extends Response<unknown>>(
  input: string,
  init?: JsonRequestInit,
): Promise<T> =>
  request<T>(
    input,
    merge(init, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(init?.json),
    }),
  )
