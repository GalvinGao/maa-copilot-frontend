import { Card, NonIdealState, Spinner } from '@blueprintjs/core'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Rnd, RndResizeCallback } from 'react-rnd'

import { sendMessage, useMessage } from '../../../utils/messenger'
import { useLazyStorage } from '../../../utils/useLazyStorage'
import { useFloatingMap } from './FloatingMapContext'
import {
  CheckMapMessage,
  ErrorMessage,
  MAP_ORIGIN,
  MapReadyMessage,
  SetMapStateMessage,
  getMapUrl,
} from './connection'

interface FloatingMapConfig {
  x: number
  y: number
  width: number
  height: number
}

const UID = 'floating-map'
const STORAGE_KEY = `copilot-${UID}`

const HEADER_HEIGHT = 16
const ASPECT_RATIO = 16 / 9
const MIN_HEIGHT = 150 + HEADER_HEIGHT
const MIN_WIDTH = 150 * ASPECT_RATIO
const DEFAULT_HEIGHT = 300 + HEADER_HEIGHT
const DEFAULT_WIDTH = 300 * ASPECT_RATIO

const enum MapStatus {
  Loading,
  Ready,
  Error,
}

export function FloatingMap() {
  const [config, setConfig] = useLazyStorage<FloatingMapConfig>(
    STORAGE_KEY,
    {
      x: 0,
      y: window.innerHeight - DEFAULT_HEIGHT,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    },
    // merge two values in case the saved value is missing some properties
    (savedValue, defaultValue) => ({ ...defaultValue, ...savedValue }),
  )

  const [iframeWindow, setIframeWindow] = useState<Window | null | undefined>()
  const [mapStatus, setMapStatus] = useState(MapStatus.Loading)

  const { level, activeTiles } = useFloatingMap()

  useEffect(() => {
    // when level changes, the iframe should reload
    setMapStatus(MapStatus.Loading)
  }, [level])

  const setMapState = useCallback(() => {
    if (iframeWindow) {
      sendMessage<SetMapStateMessage>(iframeWindow, MAP_ORIGIN, {
        type: 'setMapState',
        data: { activeTiles },
      })
    }
  }, [iframeWindow, activeTiles])

  useEffect(setMapState, [setMapState])

  useMessage<MapReadyMessage>(MAP_ORIGIN, 'mapReady', () => {
    setMapStatus(MapStatus.Ready)

    // sync state when the map is ready
    setMapState()
  })

  useMessage<ErrorMessage>(MAP_ORIGIN, 'error', ({ message }) => {
    setMapStatus(MapStatus.Error)

    // no need to display the error, the map site will show it reasonably
    console.warn(`Map error: ${message}`)
  })

  // check the connection when the component is re-mounted, useful during development
  useEffect(() => {
    if (iframeWindow) {
      sendMessage<CheckMapMessage>(iframeWindow, MAP_ORIGIN, {
        type: 'checkMap',
      })
    }
  }, [iframeWindow])

  // this function and the following resize/drag handlers are used to
  // disable pointer events on every iframe while resizing/dragging,
  // see: https://github.com/bokuweb/react-rnd/issues/609
  const toggleIframePointerEvents = useCallback((disable = false) => {
    Array.from(document.getElementsByTagName('iframe')).forEach((iframe) => {
      // eslint-disable-next-line no-param-reassign
      iframe.style.pointerEvents = disable ? 'none' : 'auto'
    })
  }, [])

  const onDragStartHandler = useCallback(() => {
    toggleIframePointerEvents(true)
  }, [toggleIframePointerEvents])

  const onDragStopHandler = useCallback(
    (e, { x, y }) => {
      toggleIframePointerEvents(false)
      setConfig((cfg) => ({ ...cfg, x, y }))
    },
    [toggleIframePointerEvents],
  )

  const onResizeStartHandler = useCallback(() => {
    toggleIframePointerEvents(true)
  }, [toggleIframePointerEvents])

  const onResizeStopHandler: RndResizeCallback = useCallback(
    (e, direction, ref, delta, pos) => {
      toggleIframePointerEvents(false)
      setConfig((cfg) => ({
        ...cfg,
        ...pos,
        width: parseFloat(ref.style.width),
        height: parseFloat(ref.style.height),
      }))
    },
    [toggleIframePointerEvents],
  )

  return createPortal(
    <div className="fixed z-30 inset-0 pointer-events-none">
      <Rnd
        className="pointer-events-auto"
        dragHandleClassName="drag-handle"
        bounds="window"
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        lockAspectRatio={ASPECT_RATIO}
        lockAspectRatioExtraHeight={HEADER_HEIGHT}
        default={config}
        onDragStart={onDragStartHandler}
        onDragStop={onDragStopHandler}
        onResizeStart={onResizeStartHandler}
        onResizeStop={onResizeStopHandler}
      >
        <Card
          className="h-full !p-0 flex flex-col overflow-hidden"
          elevation={3}
        >
          <div
            className="drag-handle cursor-move bg-gray-200"
            style={{ height: HEADER_HEIGHT }}
          />
          {level ? (
            <div className="relative flex-grow">
              <iframe
                title={UID}
                className="w-full h-full"
                src={getMapUrl(level)}
                onLoad={(e) => {
                  setIframeWindow((e.target as HTMLIFrameElement).contentWindow)
                }}
              />
              {mapStatus === MapStatus.Loading && (
                <NonIdealState
                  className="absolute inset-0 bg-gray-900/50 [&_*]:!text-white"
                  icon={
                    <Spinner className="[&_.bp4-spinner-head]:stroke-current" />
                  }
                  description={iframeWindow ? undefined : '等待地图连接...'}
                />
              )}
            </div>
          ) : (
            <NonIdealState icon="area-of-interest" title="未选择关卡" />
          )}
        </Card>
      </Rnd>
    </div>,

    document.body,
  )
}
