import { useState } from 'react'

/**
 *
 * @param modalProps
 * @returns [isOpen : Modal 의 오픈상태 , open : 모달 여는 함수 , close : 모달 닫는 함수 ,modalProps : 모달의 추가 Props]
 */
export default function useModalProps<T>(
  modalProps?: T,
): [boolean, (modalProps?: T) => unknown, () => unknown, T | undefined] {
  const [props, setProps] = useState<T | undefined>(modalProps)
  const [isOpen, setOpen] = useState(false)

  function open(modalProps?: T) {
    setOpen(true)
    setProps(modalProps)
  }

  function close() {
    setOpen(false)
  }

  return [isOpen, open, close, props]
}
