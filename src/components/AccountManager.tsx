import {
  Alert,
  Button,
  Dialog,
  H4,
  Icon,
  InputGroup,
  Menu,
  MenuDivider,
  MenuItem,
  Position,
  Tab,
  TabId,
  Tabs,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import { requestActivation, requestActivationCode } from 'apis/auth'
import { useAtom } from 'jotai'
import { ComponentType, FC, useMemo, useRef, useState } from 'react'
import { FieldValues, useController, useForm } from 'react-hook-form'

import { LoginPanel } from 'components/account/LoginPanel'
import { EditorFieldProps } from 'components/editor/EditorFieldProps'
import { authAtom } from 'store/auth'
import { NetworkError } from 'utils/fetcher'
import { useCurrentSize } from 'utils/useCurrenSize'
import { useNetworkState } from 'utils/useNetworkState'
import { wrapErrorMessage } from 'utils/wrapErrorMessage'

import { FormField2 } from './FormField'
import {
  GlobalErrorBoundary,
  withGlobalErrorBoundary,
} from './GlobalErrorBoundary'
import { AppToaster } from './Toaster'
import { EditDialog } from './account/EditDialog'
import { RegisterPanel } from './account/RegisterPanel'

interface ActivationFormValues {
  code: string
}

const ActivationDialog: FC<{
  isOpen?: boolean
  onClose: () => void
}> = ({ isOpen, onClose }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
  } = useForm<ActivationFormValues>()

  const [authState, setAuthState] = useAtom(authAtom)
  const latestAuthState = useRef(authState)
  latestAuthState.current = authState

  const onSubmit = async ({ code }) => {
    await wrapErrorMessage(
      (e: NetworkError) => `激活失败：${e.message}`,
      requestActivation(code),
    )

    setAuthState({
      ...latestAuthState.current,
      activated: true,
    })

    AppToaster.show({
      message: '激活成功',
      intent: 'success',
    })

    onClose()
  }

  return (
    <Dialog
      className="w-full max-w-xl"
      isOpen={isOpen}
      title="激活 MAA Copilot 账户"
      icon="key"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col px-4 pt-4">
          <FormField2
            field="code"
            label="激活码"
            description="激活码可在您注册时使用的邮箱中找到"
            error={errors.code}
          >
            <ActivationInputGroup name="code" control={control} />
          </FormField2>

          <Button
            disabled={(!isValid && !isDirty) || isSubmitting}
            intent="primary"
            loading={isSubmitting}
            type="submit"
            icon="envelope"
            large
          >
            激活
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

const ActivationInputGroup = <T extends FieldValues>({
  name,
  control,
}: EditorFieldProps<T>) => {
  const {
    field: { onChange, onBlur, ref },
  } = useController({
    name,
    control,
    rules: { required: '请输入激活码' },
  })

  return (
    <div className="flex">
      <InputGroup
        large
        leftIcon="lock"
        onChange={onChange}
        onBlur={onBlur}
        placeholder="请输入您的激活码"
        ref={ref}
        className="flex-grow font-mono"
        autoComplete="off"
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
      />
      <ActivationCodeRequestButton />
    </div>
  )
}

const ActivationCodeRequestButton: FC = () => {
  const { networkState, start, finish } = useNetworkState()

  const handleClick = () => {
    start()
    wrapErrorMessage(
      (e: NetworkError) => `获取激活码失败：${e.message}`,
      requestActivationCode(),
    )
      .then(() => {
        finish(null)
        AppToaster.show({
          message: '激活码已发送至您的邮箱',
          intent: 'success',
        })
      })
      .catch((e) => finish(e))
  }

  return (
    <Button icon="reset" onClick={handleClick} loading={networkState.loading}>
      重新发送
    </Button>
  )
}

const AccountMenu: FC = () => {
  const [authState, setAuthState] = useAtom(authAtom)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [activationDialogOpen, setActivationDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const handleLogout = () => {
    setAuthState({})
    AppToaster.show({
      intent: 'success',
      message: '已退出登录',
    })
  }

  const menuItems = useMemo(() => {
    const items: JSX.Element[] = []
    if (!authState.activated) {
      items.push(
        <MenuItem
          shouldDismissPopover={false}
          icon="key"
          text="激活账户..."
          onClick={() => setActivationDialogOpen(true)}
        />,
      )
    }
    return items
  }, [authState])

  return (
    <>
      <Alert
        isOpen={logoutDialogOpen}
        cancelButtonText="取消"
        confirmButtonText="退出登录"
        icon="log-out"
        intent="danger"
        canOutsideClickCancel
        onCancel={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogout}
      >
        <H4>退出登录</H4>
        <p>确定要退出登录吗？</p>
      </Alert>

      <ActivationDialog
        isOpen={activationDialogOpen}
        onClose={() => setActivationDialogOpen(false)}
      />

      <EditDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
      />

      <Menu>
        <MenuItem
          shouldDismissPopover={false}
          icon="edit"
          text="修改信息..."
          onClick={() => setEditDialogOpen(true)}
        />
        <MenuDivider />
        {menuItems}

        {menuItems.length > 0 && <MenuDivider />}

        <MenuItem
          shouldDismissPopover={false}
          intent="danger"
          icon="log-out"
          text="退出登录"
          onClick={() => setLogoutDialogOpen(true)}
        />
      </Menu>
    </>
  )
}

export const AccountAuthDialog: ComponentType<{
  open?: boolean
  onClose?: () => void
}> = withGlobalErrorBoundary(({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('login')

  return (
    <Dialog
      title="MAA Copilot 账户"
      icon="user"
      isOpen={open}
      onClose={onClose}
    >
      <div className="flex flex-col p-4 pt-2">
        <GlobalErrorBoundary>
          <Tabs
            // renderActiveTabPanelOnly: avoid autocomplete on inactive panel
            renderActiveTabPanelOnly={true}
            id="account-auto-tabs"
            onChange={(tab) => {
              setActiveTab(tab)
            }}
            selectedTabId={activeTab}
          >
            <Tab
              id="login"
              title={
                <div>
                  <Icon icon="person" />
                  <span className="ml-1">登录</span>
                </div>
              }
              panel={
                <LoginPanel
                  onNavigateRegisterPanel={() => setActiveTab('register')}
                  onComplete={() => onClose?.()}
                />
              }
            />
            <Tab
              id="register"
              title={
                <div>
                  <Icon icon="new-person" />
                  <span className="ml-1">注册</span>
                </div>
              }
              panel={<RegisterPanel onComplete={() => setActiveTab('login')} />}
            />
          </Tabs>
        </GlobalErrorBoundary>
      </div>
    </Dialog>
  )
})

export const AccountManager: ComponentType = withGlobalErrorBoundary(() => {
  const [open, setOpen] = useState(false)
  const [authState] = useAtom(authAtom)
  const { isSM } = useCurrentSize()

  return (
    <>
      <AccountAuthDialog open={open} onClose={() => setOpen(false)} />
      {authState.token ? (
        // BUTTOM_RIGHT设置防止弹出框撑大body超过100vw
        <Popover2 content={<AccountMenu />} position={Position.BOTTOM_RIGHT}>
          <Button
            icon="user"
            text={authState.username}
            rightIcon="caret-down"
          />
        </Popover2>
      ) : (
        <Button className="ml-auto" icon="user" onClick={() => setOpen(true)}>
          {!isSM && '登录 / 注册'}
        </Button>
      )}
    </>
  )
})
