import {
  Divider,
  H3,
  H4,
  Icon,
  IconName,
  MaybeElement,
} from '@blueprintjs/core'

import clsx from 'clsx'
import { ReactNode, useMemo } from 'react'

interface SheetContainerSkeletonProps {
  title: string
  icon: IconName | MaybeElement
  mini?: boolean
  className?: string
  rightOptions?: ReactNode
  children: ReactNode
}

export const SheetContainerSkeleton = ({
  title,
  icon,
  children,
  mini,
  rightOptions,
  className,
}: SheetContainerSkeletonProps) => {
  const StaticTitle = useMemo(
    () => (
      <>
        <Icon icon={icon} size={mini ? 16 : 20} />
        {mini ? (
          <H4 className="p-0 m-0 ml-3">{title}</H4>
        ) : (
          <H3 className="p-0 m-0 ml-3">{title}</H3>
        )}
      </>
    ),
    [mini],
  )
  return (
    <div className={className}>
      <div className={clsx('flex items-center pl-3', mini ? 'my-1' : 'my-5')}>
        <div className="flex items-center">
          {StaticTitle}
          {rightOptions}
        </div>
      </div>
      {!mini && <Divider />}
      {children}
    </div>
  )
}
