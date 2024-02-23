import {
  Alert,
  Button,
  Card,
  Collapse,
  Icon,
  IconName,
  Intent,
  Menu,
  MenuItem,
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

import clsx from 'clsx'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { CardDeleteOption } from 'components/editor/CardOptions'

import { Group, Operator } from '../../EditorSheet'
import { GroupListModifyProp } from '../SheetGroup'
import { OperatorNoData } from '../SheetNoneData'
import { OperatorItem } from '../SheetOperatorItem'
import {
  CollapseButton,
  SheetGroupOperatorSelectProp,
  SheetGroupOperatorSelectTrigger,
} from './SheetGroupOperatorSelect'

export interface GroupItemProps
  extends SheetGroupOperatorSelectProp,
    GroupListModifyProp {
  exist: boolean
  pinned: boolean
}

export const GroupItem = ({
  groupInfo,
  exist,
  pinned,
  groupAddHandle,
  groupRemoveHandle,
  groupPinHandle,
  groupUpdateHandle,
  ...rest
}: GroupItemProps) => {
  const editable = typeof groupRemoveHandle === 'function'
  const [showOperators, setShowOperators] = useState(editable)

  const renameEventHandle = (name: string) =>
    groupUpdateHandle?.({ ...groupInfo, name })

  const changeGroupedOperatorSkillHandle = (value: Operator) => {
    // deep copy
    const groupInfoCopy = JSON.parse(JSON.stringify(groupInfo))
    groupInfoCopy.opers![
      groupInfoCopy.opers!.findIndex(({ name }) => name === value.name)
    ] = value
    groupUpdateHandle?.(groupInfoCopy)
  }

  const OperatorsPart = (
    <Collapse isOpen={showOperators}>
      <div className="w-full pt-1">
        {groupInfo.opers?.length
          ? groupInfo.opers?.map((item) => (
              <OperatorItem
                key={item.name}
                operator={item}
                name={item.name}
                selected
                scaleDisable
                interactive={false}
                horizontal
                readOnly={!exist}
                onSkillChange={changeGroupedOperatorSkillHandle}
              />
            ))
          : !editable && OperatorNoData}
        {editable && (
          <SheetGroupOperatorSelectTrigger
            groupInfo={groupInfo}
            groupUpdateHandle={groupUpdateHandle}
            {...rest}
          />
        )}
      </div>
    </Collapse>
  )

  const pinText = pinned ? `从收藏分组中移除` : `添加至收藏分组`
  const pinIcon: IconName = pinned ? 'star' : 'star-empty'

  return (
    <Card interactive={!exist} className="mt-1 mx-0.5">
      <div className="flex items-center">
        <GroupTitle
          groupTitle={groupInfo.name}
          editable={editable}
          renameSubmit={renameEventHandle}
        />
        <div className="ml-auto flex items-center">
          <CollapseButton
            isCollapse={showOperators}
            onClick={() => setShowOperators(!showOperators)}
          />
          {editable ? (
            <CardDeleteOption
              className="cursor-pointer"
              onClick={() => groupRemoveHandle?.(groupInfo._id || '')}
            />
          ) : (
            <Button
              minimal
              icon={exist ? 'tick' : 'arrow-left'}
              title={exist ? '已选择' : '使用该推荐分组'}
              onClick={() => groupAddHandle?.(groupInfo)}
            />
          )}
          {(editable || pinned) && (
            <Popover2
              disabled={!pinned}
              content={
                <Menu className="p-0">
                  <MenuItem
                    text={pinText}
                    icon={pinIcon}
                    onClick={() => groupPinHandle?.(groupInfo)}
                  />
                </Menu>
              }
            >
              <Button
                minimal
                icon={pinIcon}
                title={pinText}
                onClick={pinned ? undefined : () => groupPinHandle?.(groupInfo)}
              />
            </Popover2>
          )}
        </div>
      </div>
      {OperatorsPart}
    </Card>
  )
}

const GroupTitle = ({
  groupTitle,
  editable,
  renameSubmit,
}: {
  editable: boolean
  renameSubmit: (newName: string) => void
  groupTitle: string
}) => {
  const [editName, setEditName] = useState('')
  const [nameEditState, setNameEditState] = useState(false)
  const [alertState, setAlertState] = useState(false)
  const { register, handleSubmit, reset } = useForm<Group>()
  // handle differ priority of capture events
  const ignoreBlur = useRef(false)
  const blurHandle = () => {
    if (!ignoreBlur.current) {
      if (groupTitle !== editName && editName) setAlertState(true)
      setNameEditState(false)
    } else ignoreBlur.current = false
  }
  const editCancel = () => {
    setNameEditState(false)
    setEditName(groupTitle)
    reset()
    setAlertState(false)
  }
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { ref, ...registerRest } = register('name', {
    onBlur: blurHandle,
    value: editName,
    onChange: (e) => setEditName(e.target.value),
  })
  const editContinue = () => {
    setNameEditState(true)
    setAlertState(false)
    inputRef.current?.focus()
  }

  return (
    <>
      <Alert
        onConfirm={editContinue}
        intent={Intent.DANGER}
        onCancel={editCancel}
        confirmButtonText="取消"
        cancelButtonText="确认"
        isOpen={alertState}
      >
        <p>当前干员组名修改未保存，是否放弃修改？</p>
      </Alert>
      <form
        className="flex items-center"
        onSubmit={handleSubmit(() => {
          ignoreBlur.current = true
          renameSubmit(editName || groupTitle)
          setNameEditState(false)
          inputRef.current?.blur()
        })}
      >
        <div className="flex items-center w-full">
          <Icon icon="people" />
          <input
            title="修改干员组名称"
            className={clsx(
              'ml-1 w-full bg-transparent text-xs',
              !editable && 'placeholder:text-current',
            )}
            autoComplete="off"
            disabled={!editable}
            onFocus={() => setNameEditState(true)}
            placeholder={groupTitle}
            type="text"
            ref={(e) => {
              ref(e)
              inputRef.current = e
            }}
            onKeyDown={(e) => {
              if (e.key.toLowerCase() === 'enter') e.preventDefault()
            }}
            {...registerRest}
          />
          {nameEditState && (
            <Button
              minimal
              icon="tick"
              type="submit"
              onMouseDown={(e) => e.preventDefault()}
            />
          )}
        </div>
      </form>
    </>
  )
}
