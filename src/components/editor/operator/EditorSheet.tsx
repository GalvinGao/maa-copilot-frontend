import { Button, Drawer, DrawerSize } from '@blueprintjs/core'

import { useMemo, useState } from 'react'

import { CopilotDocV1 } from 'models/copilot.schema'

import { SheetGroupContainer, SheetGroupProps } from './sheet/SheetGroup'
import {
  SheetOperatorContainer,
  SheetOperatorProps,
} from './sheet/SheetOperator'

type EditorSheetProps = SheetOperatorProps & SheetGroupProps
export type Group = CopilotDocV1.Group
export type Operator = CopilotDocV1.Operator

const EditorOperatorSheet = (sheetProps: EditorSheetProps) => {
  return (
    <div className="overflow-y-auto">
      <SheetOperatorContainer {...sheetProps} />
      <SheetGroupContainer {...sheetProps} />
    </div>
  )
}

export const EditorSheetTrigger = (sheetProps: EditorSheetProps) => {
  const [open, setOpen] = useState(false)
  const miniMedia = useMemo(() => window.innerWidth < 600, [])
  return (
    <>
      <Drawer
        isOpen={open}
        onClose={() => setOpen(false)}
        size={miniMedia ? DrawerSize.LARGE : '55%'}
      >
        <EditorOperatorSheet {...sheetProps} miniMedia={miniMedia} />
      </Drawer>
      <Button onClick={() => setOpen(true)} text="快捷编辑" fill />
    </>
  )
}
