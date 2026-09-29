'use client'

import Button from '@/components/atoms/Button'
import Modal from '@/components/Modal'
import { useUIStore } from '@/store/uiSlice'

export default function ConfirmDialog() {
  const request = useUIStore((state) => state.confirmRequest)
  const resolveConfirm = useUIStore((state) => state.resolveConfirm)

  return (
    <Modal isOpen={Boolean(request)} title={request?.title ?? ''} onClose={() => resolveConfirm(false)}>
      {request?.message ? <p className="whitespace-pre-line text-sm text-gray-300">{request.message}</p> : null}
      <div className="flex justify-end gap-3 pt-6">
        <Button variant="secondary" onClick={() => resolveConfirm(false)}>
          {request?.cancelLabel ?? 'Cancelar'}
        </Button>
        <Button variant={request?.tone === 'primary' ? 'primary' : 'danger'} onClick={() => resolveConfirm(true)}>
          {request?.confirmLabel ?? 'Confirmar'}
        </Button>
      </div>
    </Modal>
  )
}
