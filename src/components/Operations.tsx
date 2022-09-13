import {
  Button,
  ButtonGroup,
  Card,
  FormGroup,
  InputGroup,
} from '@blueprintjs/core'
import { OrderBy } from 'apis/query'
import { CardTitle } from 'components/CardTitle'
import { OperationList } from 'components/OperationList'
import { ComponentType, useMemo, useState } from 'react'
import { withSuspensable } from './Suspensable'

import { debounce } from 'lodash-es'

export const Operations: ComponentType = withSuspensable(() => {
  const [query, setQuery] = useState('')
  const [orderBy, setOrderBy] = useState<OrderBy>('hot')
  const debouncedSetQuery = useMemo(() => debounce(setQuery, 250), [])

  return (
    <>
      <Card className="flex flex-col mb-4">
        <CardTitle className="mb-4" icon="properties">
          查找作业
        </CardTitle>
        <FormGroup
          label="搜索"
          helperText="键入关卡名、关卡类型、关卡编号以搜索"
          className="mt-2"
        >
          <InputGroup
            className="w-1/3"
            placeholder="搜索..."
            leftIcon="search"
            size={64}
            large
            enterKeyHint="search"
            onChange={(e) => debouncedSetQuery(e.target.value.trim())}
          />
        </FormGroup>
        <FormGroup label="排序">
          <ButtonGroup>
            <Button
              icon="flame"
              active={orderBy === 'hot'}
              onClick={() => {
                setOrderBy('hot')
              }}
            >
              热度
            </Button>
            <Button
              icon="time"
              active={orderBy === 'id'}
              onClick={() => setOrderBy('id')}
            >
              最新
            </Button>
            <Button
              icon="eye-open"
              active={orderBy === 'views'}
              onClick={() => {
                setOrderBy('views')
              }}
            >
              访问量
            </Button>
          </ButtonGroup>
        </FormGroup>
      </Card>

      <div className="tabular-nums">
        <OperationList orderBy={orderBy} query={query} />
      </div>
    </>
  )
})
