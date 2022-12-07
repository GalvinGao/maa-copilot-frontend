import { Button } from '@blueprintjs/core'

import { requestLogin } from 'apis/auth'
import { useAtom } from 'jotai'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'

import { AppToaster } from 'components/Toaster'
import { authAtom, fromCredentials } from 'store/auth'
import { NetworkError } from 'utils/fetcher'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'

import { AuthFormEmailField, AuthFormPasswordField } from './AuthFormShared'
import { ResetPasswordDialog } from './ResetPasswordDialog'

export interface LoginFormValues {
  email: string
  password: string
}

export const LoginPanel: FC<{
  onNavigateRegisterPanel: () => void
  onComplete: () => void
}> = ({ onNavigateRegisterPanel, onComplete }) => {
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm<LoginFormValues>()
  const [, setAuthState] = useAtom(authAtom)

  const onSubmit = async (val: LoginFormValues) => {
    const res = await wrapErrorMessage(
      (e: NetworkError) => `登录失败：${e.message}`,
      requestLogin(val.email, val.password),
    )
    setAuthState(fromCredentials(res.data))
    AppToaster.show({
      intent: 'success',
      message: `登录成功。欢迎回来，${res.data.userInfo.userName}`,
    })
    onComplete()
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <AuthFormEmailField
          control={control}
          error={errors.email}
          field="email"
        />

        <AuthFormPasswordField<LoginFormValues>
          control={control}
          error={errors.password}
          field="password"
          inputGroupProps={() => ({
            rightElement: (
              <Button
                minimal
                small
                icon="key"
                onClick={() => setResetPasswordDialogOpen(true)}
              >
                忘记密码...
              </Button>
            ),
          })}
        />

        <div className="mt-6 flex items-center">
          <span className="text-zinc-500">还没有账号？</span>
          <Button minimal onClick={onNavigateRegisterPanel}>
            前往注册
          </Button>

          <div className="flex-1" />

          <Button
            disabled={(!isValid && !isDirty) || isSubmitting}
            intent="primary"
            loading={isSubmitting}
            type="submit"
            icon="log-in"
            className="self-stretch"
          >
            登录
          </Button>
        </div>
      </form>

      <ResetPasswordDialog
        isOpen={resetPasswordDialogOpen}
        onClose={() => setResetPasswordDialogOpen(false)}
      />
    </>
  )
}
