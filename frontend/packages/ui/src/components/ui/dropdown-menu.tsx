import { type ReactNode, type ReactElement, cloneElement, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

type ReactMouseEvent<T = Element> = import('react').MouseEvent<T>

type DropdownMenuContextValue = {
  open: boolean
  toggleOpen: () => void
  close: () => void
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenu() {
  const context = useContext(DropdownMenuContext)
  if (!context) {
    throw new Error('DropdownMenu components must be used inside DropdownMenu')
  }
  return context
}

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onClickOutside = (event: Event) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const value = useMemo(
    () => ({
      open,
      toggleOpen: () => setOpen((prev) => !prev),
      close: () => setOpen(false),
    }),
    [open],
  )

  return (
    <DropdownMenuContext.Provider value={value}>
      <div ref={ref} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ children, asChild }: { children: ReactNode; asChild?: boolean }) {
  const { toggleOpen } = useDropdownMenu()

  if (asChild && typeof children !== 'string' && isReactElement(children)) {
    const child = children as ReactElement<{ onClick?: (event: ReactMouseEvent<HTMLElement>) => void }>

    return cloneElement(child, {
      onClick: (event: ReactMouseEvent<HTMLElement>) => {
        child.props.onClick?.(event)
        toggleOpen()
      },
    })
  }

  return (
    <button type="button" onClick={toggleOpen} className="inline-flex items-center">
      {children}
    </button>
  )
}

export function DropdownMenuContent({ children, align = 'end' }: { children: ReactNode; align?: 'end' | 'start' }) {
  const { open } = useDropdownMenu()
  if (!open) return null

  return (
    <div
      className={`absolute z-20 mt-2 w-56 rounded-2xl border bg-white p-2 shadow-lg ${
        align === 'end' ? 'right-0' : 'left-0'
      }`}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({ children, className, onSelect }: { children: ReactNode; className?: string; onSelect?: () => void }) {
  const { close } = useDropdownMenu()

  const handleSelect = () => {
    onSelect?.()
    close()
  }

  return (
    <button
      type="button"
      className={`w-full text-left rounded-xl px-3 py-2 text-sm transition hover:bg-slate-100 ${className ?? ''}`}
      onClick={handleSelect}
    >
      {children}
    </button>
  )
}

function isReactElement(value: unknown): value is ReactElement {
  return typeof value === 'object' && value !== null && 'type' in value && 'props' in value
}
