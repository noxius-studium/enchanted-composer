import { jsx, jsxs, Fragment } from 'react/jsx-runtime'
import { useEffect, useRef, useState } from 'react'
import { COMPOSER_AREAS, ROUTES_AREA, SIDEBAR_NAV_AREA, Codicon, Button, Popover, PopoverContent, PopoverTrigger, RowButton, Tabs, TabsList, TabsTrigger, host, icons } from '@hermes/plugin-sdk'

const PLUGIN_ID = 'composer-enhancements'
const ACTION_CLASS = 'inline-flex size-(--composer-control-size) shrink-0 items-center justify-center rounded-md border-0 bg-transparent text-(--ui-text-tertiary) hover:bg-(--chrome-action-hover) hover:text-foreground'
const now = () => Date.now()
const bounded = (value, limit = 8192) => typeof value === 'string' ? value.trim().slice(0, limit) : ''
function publicError(error, fallback = 'Enchanted Composer could not complete that action.') { return bounded(error && error.message, 240) || fallback }
