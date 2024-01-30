import { Card, CardProps } from '@blueprintjs/core'

import clsx from 'clsx'
import { useMemo } from 'react'

import { OperatorAvatar } from '../EditorOperator'
import { SkillAboutProps, SkillAboutTrigger } from './SheetOperatorSkillAbout'

export interface OperatorItemPorps extends CardProps, SkillAboutProps {
  id: string
  name: string
  selected: boolean
  horizontal?: boolean
}

export const OperatorItem = ({
  id,
  selected,
  name,
  operator,
  submitOperator,
  horizontal,
  ...cardProps
}: OperatorItemPorps) => {
  const readOnly = useMemo(
    () => typeof submitOperator !== 'function',
    [submitOperator],
  )

  const Avatar = useMemo(() => <OperatorAvatar id={id} size="large" />, [id])
  const OperatorName = useMemo(
    () => (
      <p
        className={clsx(
          'font-bold leading-none text-center mt-3 truncate',
          horizontal && 'mt-0 ml-1 mr-auto',
        )}
      >
        {name}
      </p>
    ),
    [name],
  )
  const OperatorSkill = useMemo(
    () => (
      <>
        {!readOnly && <SkillAboutTrigger {...{ operator, submitOperator }} />}
      </>
    ),
    [readOnly, operator],
  )

  return (
    <Card
      className={clsx(
        'flex items-center w-full h-full relative cursor-pointer',
        selected && 'scale-90 bg-gray-200',
        !horizontal && 'flex-col justify-center',
      )}
      interactive={!selected}
      onClick={
        readOnly
          ? undefined
          : () => submitOperator!('box', operator || { name })
      }
      {...cardProps}
    >
      <>
        {Avatar}
        {OperatorName}
      </>
      {OperatorSkill}
    </Card>
  )
}
