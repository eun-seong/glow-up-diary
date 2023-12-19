import { useState } from 'react'

import { AxiosError } from 'axios'

export type IHttpRequestReturn<P = void, T = unknown> = [
  T | undefined,
  (payload: P, callbacks?: CallbackFunctions<T>) => Promise<T>,
  boolean,
  boolean,
  boolean,
  AxiosError | undefined,
  number,
]
type CallbackFunctions<T> = {
  onError?: (e: AxiosError) => unknown
  onSuccess?: (res: T) => unknown
  onFinished?: () => unknown
}
/**
 *
 * @param dataFetchCallback
 * @param initialValue
 * @returns [Data, onFetch, isLoading, isInit, isError, ErrorData, fetchCount]
 */
export const useHttpRequest = <P = void, T = unknown>(
  dataFetchCallback: (payload: P) => Promise<T>,
  initialValue?: T,
): IHttpRequestReturn<P, T> => {
  const [loading, setLoading] = useState(false)
  const [isError, setError] = useState(false)
  const [isSuccess, setSuccess] = useState(false)
  const [fetchCount, setFetchCount] = useState(0)
  const [data, setData] = useState<T | undefined>(initialValue)
  const [errorData, setErrorData] = useState<AxiosError>()

  const request = async (
    payload: P,
    callbacks?: CallbackFunctions<T>,
    isDataRefresh = false,
  ) => {
    setLoading(true)
    if (isDataRefresh) setData(initialValue)

    setError(false)
    setErrorData(undefined)

    return dataFetchCallback?.(payload)
      .then((data) => {
        setData(data)
        setSuccess(true)
        setError(false)
        callbacks?.onSuccess?.(data)
        return data
      })
      .catch((e: AxiosError) => {
        setSuccess(false)
        setError(true)
        setErrorData(e)
        callbacks?.onError?.(e) || console.error(e)
        throw e
      })
      .finally(() => {
        setLoading(false)
        setFetchCount((current) => current + 1)
        callbacks?.onFinished?.()
      })
  }

  return [data, request, loading, isSuccess, isError, errorData, fetchCount]
}
