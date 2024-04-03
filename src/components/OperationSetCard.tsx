import { Button, Card, Elevation, H4, Icon, Tag } from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'

import { handleCopyShortCode } from 'services/operation'

import { ReLink } from 'components/ReLink'
import { RelativeTime } from 'components/RelativeTime'
import { OperationSetListItem } from 'models/operation-set'

import { Paragraphs } from './Paragraphs'

export const NeoOperationSetCard = ({
  operationSet,
}: {
  operationSet: OperationSetListItem
}) => {
  return (
    <ReLink search={{ opset: operationSet.id }} className="no-underline">
      <Card
        interactive={true}
        elevation={Elevation.TWO}
        className="flex flex-col gap-2"
      >
        {/* title */}
        <div className="flex gap-1">
          <Tooltip2
            content={operationSet.name}
            className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
          >
            <H4 className="p-0 m-0 whitespace-nowrap overflow-hidden text-ellipsis">
              {operationSet.status === 'PRIVATE' && (
                <Tag className="mr-1">私有</Tag>
              )}
              {operationSet.name}
            </H4>
          </Tooltip2>
          <Tooltip2
            placement="bottom"
            content={
              <div className="max-w-sm dark:text-slate-900">复制神秘代码</div>
            }
          >
            <Button
              small
              icon="clipboard"
              onClick={(e) => {
                e.stopPropagation()
                handleCopyShortCode(operationSet)
              }}
            />
          </Tooltip2>
        </div>
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <div className="text-gray-700 leading-normal">
            <Paragraphs
              content={operationSet.description}
              limitHeight={21 * 13.5} // 13 lines, 21px per line; the extra 0.5 line is intentional so the `mask` effect is obvious
            />
          </div>
        </div>

        <div className="flex">
          <div className="flex items-center text-zinc-500">
            <Icon icon="document" className="mr-1" />
            <span>{operationSet.copilotIds.length}份作业</span>

            <Icon icon="time" className="ml-4 mr-1" />
            <RelativeTime
              Tooltip2Props={{ placement: 'top' }}
              moment={operationSet.createTime}
            />
          </div>
          <div className="flex-1" />
          <div className="text-zinc-500">
            <Tooltip2 placement="top" content={`作者：${operationSet.creator}`}>
              <div>
                <Icon icon="user" className="mr-1.5" />
                <span>{operationSet.creator}</span>
              </div>
            </Tooltip2>
          </div>
        </div>
      </Card>
    </ReLink>
  )
}

export const OperationSetCard = ({
  operationSet,
}: {
  operationSet: OperationSetListItem
}) => {
  return (
    <ReLink
      search={{ opset: operationSet.id }}
      className="block mb-4 sm:mb-2 last:mb-0 no-underline"
    >
      <Card interactive={true} elevation={Elevation.TWO}>
        <div className="flex flex-wrap mb-4 sm:mb-2">
          {/* title */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <H4 className="inline-block pb-1 border-b-2 border-zinc-200 border-solid mb-2">
                {operationSet.name}
              </H4>
              <Tooltip2
                placement="bottom"
                content={
                  <div className="max-w-sm dark:text-slate-900">
                    复制神秘代码
                  </div>
                }
              >
                <Button
                  small
                  icon="clipboard"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopyShortCode(operationSet)
                  }}
                />
              </Tooltip2>
            </div>
          </div>

          <div className="lg:flex-1 hidden" />

          {/* meta */}
          <div className="flex flex-col flex-1 gap-y-1.5 gap-x-4">
            <div className="flex flex-wrap sm:justify-end items-center gap-x-4 gap-y-1 text-zinc-500">
              <div className="flex items-center text-zinc-500">
                <Icon icon="document" className="mr-1" />
                <span>{operationSet.copilotIds.length}份作业</span>

                <Icon icon="time" className="ml-4 mr-1" />
                <RelativeTime
                  Tooltip2Props={{ placement: 'top' }}
                  moment={operationSet.createTime}
                />
              </div>
            </div>
            <div className="text-zinc-500 self-end">
              <Tooltip2
                placement="top"
                content={`作者：${operationSet.creator}`}
              >
                <div>
                  <Icon icon="user" className="mr-1.5" />
                  <span>{operationSet.creator}</span>
                </div>
              </Tooltip2>
            </div>
          </div>
        </div>
        <div className="flex md:flex-row flex-col gap-4">
          <div className="text-gray-700 leading-normal md:w-1/2">
            {/* <div className="text-sm text-zinc-600 mb-2 font-bold">作业描述</div> */}
            <Paragraphs
              content={operationSet.description}
              limitHeight={21 * 13.5} // 13 lines, 21px per line; the extra 0.5 line is intentional so the `mask` effect is obvious
            />
          </div>
        </div>
      </Card>
    </ReLink>
  )
}
