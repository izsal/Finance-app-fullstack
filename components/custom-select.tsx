'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import Select, { type Props as SelectProps, type GroupBase, type StylesConfig } from 'react-select'
import CreatableSelect, { type CreatableProps } from 'react-select/creatable'
import { Search, X, Plus, Check, ChevronDown, Loader2 } from '@/components/animated-icons'

export interface OptionType<T = any> {
  value: T
  label: string
  icon?: React.ReactNode
  badge?: string
  color?: string
}

function useCustomStyles<
  Option = OptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(isDark: boolean): StylesConfig<Option, IsMulti, Group> {
  return {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderColor: state.isFocused ? '#10b981' : isDark ? '#334155' : '#e2e8f0',
      borderRadius: '0.75rem',
      padding: '2px 4px',
      fontSize: '0.8125rem',
      fontWeight: 600,
      color: isDark ? '#f8fafc' : '#0f172a',
      minHeight: '42px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      '&:hover': {
        borderColor: state.isFocused ? '#10b981' : isDark ? '#475569' : '#cbd5e1',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '2px 8px',
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? '#64748b' : '#94a3b8',
      fontWeight: 500,
    }),
    input: (base) => ({
      ...base,
      color: isDark ? '#f8fafc' : '#0f172a',
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? '#f8fafc' : '#0f172a',
      fontWeight: 600,
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: '0.875rem',
      boxShadow: isDark
        ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
        : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      border: isDark ? '1px solid #334155' : '1px solid #f1f5f9',
      padding: '6px',
      zIndex: 9999,
      overflow: 'hidden',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 99999,
    }),
    menuList: (base) => ({
      ...base,
      padding: 0,
      maxHeight: '220px',
    }),
    option: (base, state) => ({
      ...base,
      borderRadius: '0.5rem',
      margin: '2px 0',
      padding: '8px 12px',
      fontSize: '0.8125rem',
      fontWeight: state.isSelected ? 700 : 500,
      backgroundColor: state.isSelected
        ? '#10b981'
        : state.isFocused
        ? isDark
          ? '#334155'
          : '#f0fdf4'
        : 'transparent',
      color: state.isSelected
        ? '#ffffff'
        : state.isFocused
        ? isDark
          ? '#f8fafc'
          : '#047857'
        : isDark
        ? '#cbd5e1'
        : '#334155',
      cursor: 'pointer',
      transition: 'all 0.1s ease',
      '&:active': {
        backgroundColor: '#059669',
        color: '#ffffff',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? '#10b981' : isDark ? '#64748b' : '#94a3b8',
      padding: '6px 8px',
      transition: 'all 0.2s ease',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      '&:hover': {
        color: '#10b981',
      },
    }),
  }
}

/**
 * Mobile Bottom Sheet Selector with Built-in Quick Search & Instant Creation
 */
export function MobileBottomSheetSelect<T = any>({
  label,
  required,
  options = [],
  value,
  onChange,
  onCreateOption,
  placeholder = 'Pilih...',
  isLoading = false,
  isDisabled = false,
  formatCreateLabel,
}: {
  label?: string
  required?: boolean
  options?: readonly OptionType<T>[] | OptionType<T>[]
  value?: any
  onChange?: (option: OptionType<T> | null) => void
  onCreateOption?: (inputValue: string) => Promise<void> | void
  placeholder?: string
  isLoading?: boolean
  isDisabled?: boolean
  formatCreateLabel?: (inputValue: string) => React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [creatingLocal, setCreatingLocal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when Bottom Sheet is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus input when inline creation opens
  useEffect(() => {
    if (isAddingNew && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAddingNew])

  // Resolve current selected option
  const resolvedOption = useMemo(() => {
    if (!value) return null
    if (typeof value === 'object' && value !== null && 'label' in value) {
      return value as OptionType<T>
    }
    return options?.find((o) => o.value === value) || null
  }, [value, options])

  const displayLabel = resolvedOption?.label || (typeof value === 'string' ? value : '')

  const isOptionSelected = (opt: OptionType<T>) => {
    if (resolvedOption) return resolvedOption.value === opt.value
    if (!value) return false
    if (typeof value === 'object' && value !== null && 'value' in value) {
      return (value as any).value === opt.value
    }
    return value === opt.value
  }

  // Filtered list
  const filteredOptions = useMemo(() => {
    if (!options || !Array.isArray(options)) return []
    if (!searchQuery.trim()) return options
    const q = searchQuery.toLowerCase().trim()
    return options.filter((opt) => opt.label.toLowerCase().includes(q))
  }, [options, searchQuery])

  // Check if searchQuery matches an existing option
  const exactMatchExists = useMemo(() => {
    if (!searchQuery.trim() || !options || !Array.isArray(options)) return false
    const q = searchQuery.toLowerCase().trim()
    return options.some((opt) => opt.label.toLowerCase().trim() === q)
  }, [options, searchQuery])

  const handleSelect = (opt: OptionType<T>) => {
    onChange?.(opt)
    setIsOpen(false)
  }

  const handleCreate = async (name: string) => {
    if (!name || !name.trim() || !onCreateOption) return
    setCreatingLocal(true)
    try {
      await onCreateOption(name.trim())
      setIsOpen(false)
      setIsAddingNew(false)
      setNewItemName('')
      setSearchQuery('')
    } catch (err) {
      console.error(err)
    } finally {
      setCreatingLocal(false)
    }
  }

  // Render option label with badges (e.g. "BCA (Bank)" -> "BCA" + badge "Bank")
  const renderOptionContent = (labelStr: string) => {
    const match = labelStr.match(/^(.*?)\s*\((.*?)\)$/)
    if (match) {
      return (
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate">{match[1]}</span>
          <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
            {match[2]}
          </span>
        </div>
      )
    }
    return <span className="truncate">{labelStr}</span>
  }

  // Dynamic label for Add button
  const cleanLabel = (label || '').replace('*', '').trim()
  const createButtonLabel = cleanLabel ? `+ Tambah ${cleanLabel} Baru` : '+ Tambah Baru'

  const inputPlaceholder = cleanLabel.toLowerCase().includes('dompet') || cleanLabel.toLowerCase().includes('wallet')
    ? 'Nama dompet baru (cth: BCA, Kas Tunai)...'
    : cleanLabel.toLowerCase().includes('kategori') || cleanLabel.toLowerCase().includes('category')
    ? 'Nama kategori baru (cth: Makanan, Bensin)...'
    : 'Ketik nama baru di sini...'

  return (
    <>
      {/* Mobile Input Trigger */}
      <button
        type="button"
        disabled={isDisabled || isLoading}
        onClick={() => {
          setSearchQuery('')
          setIsAddingNew(false)
          setIsOpen(true)
        }}
        className="group flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-xs transition-all hover:border-emerald-500 hover:bg-emerald-50/10 focus:outline-none focus:ring-3 focus:ring-emerald-500/20 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer min-h-[42px]"
      >
        <div className="flex items-center gap-2 min-w-0">
          {displayLabel ? (
            <span className="truncate text-slate-900 dark:text-slate-100 font-bold">{displayLabel}</span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 font-normal truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          )}
        </div>
      </button>

      {/* Bottom Sheet Drawer Modal (Portaled to document.body) */}
      {mounted &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[70] flex flex-col justify-end">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
              onClick={() => setIsOpen(false)}
            />

            {/* Sheet Container */}
            <div
              className="relative z-[71] flex max-h-[85dvh] flex-col rounded-t-[28px] bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-200"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
            >
              {/* Top Drag Indicator */}
              <div
                className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 shrink-0 cursor-pointer"
                onClick={() => setIsOpen(false)}
              />

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {cleanLabel || 'Pilih Opsi'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {options.length} opsi tersedia
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Cari ${cleanLabel ? cleanLabel.toLowerCase() : 'opsi'}...`}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-9 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Options List */}
              <div className="overflow-y-auto flex-1 px-4 py-2 space-y-1.5 overscroll-contain max-h-[46vh]">
                {/* One-Tap Quick Create Card (if query has no match) */}
                {onCreateOption && searchQuery.trim() && !exactMatchExists && (
                  <button
                    type="button"
                    disabled={creatingLocal || isLoading}
                    onClick={() => handleCreate(searchQuery.trim())}
                    className="w-full flex items-center justify-between gap-2 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 text-left transition hover:bg-emerald-100/60 dark:hover:bg-emerald-950/50 active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <Plus className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 truncate">
                          {formatCreateLabel
                            ? formatCreateLabel(searchQuery.trim())
                            : `+ Buat baru: "${searchQuery.trim()}"`}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          Ketuk untuk langsung membuat & memilih
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
                      {creatingLocal || isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Buat'}
                    </span>
                  </button>
                )}

                {/* Options */}
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => {
                    const selected = isOptionSelected(opt)
                    return (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => handleSelect(opt)}
                        className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left transition active:scale-[0.99] cursor-pointer ${
                          selected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent text-slate-700 dark:text-slate-200 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition ${
                              selected
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}
                          >
                            {selected ? (
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                            )}
                          </div>
                          <div className="min-w-0 text-xs">
                            {renderOptionContent(opt.label)}
                          </div>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Tidak ada pilihan yang cocok
                  </div>
                )}
              </div>

              {/* Bottom Sticky Action: Tambah Baru */}
              {onCreateOption && (
                <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                  {!isAddingNew ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(true)
                        setNewItemName(searchQuery || '')
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-emerald-600 py-3 px-4 text-xs font-bold text-white shadow-md active:scale-[0.98] transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{createButtonLabel}</span>
                    </button>
                  ) : (
                    <div className="space-y-2.5 bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {`Tambah ${cleanLabel || 'Baru'}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAddingNew(false)}
                          className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          ref={inputRef}
                          type="text"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder={inputPlaceholder}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleCreate(newItemName)
                            }
                          }}
                          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <button
                          type="button"
                          disabled={!newItemName.trim() || creatingLocal || isLoading}
                          onClick={() => handleCreate(newItemName)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition cursor-pointer shrink-0"
                        >
                          {creatingLocal || isLoading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                              <span>Simpan</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export function CustomSelect<
  Option = OptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: SelectProps<Option, IsMulti, Group> & { label?: string; required?: boolean }) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const customStyles = useCustomStyles<Option, IsMulti, Group>(isDark)
  const { label, required, options, value, onChange, placeholder, isLoading, isDisabled, ...rest } = props

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Mobile Screen: Native-like Bottom Sheet (< 640px) */}
      <div className="block sm:hidden">
        <MobileBottomSheetSelect
          label={label}
          required={required}
          options={options as any}
          value={value as any}
          onChange={onChange as any}
          placeholder={placeholder as string}
          isLoading={isLoading}
          isDisabled={isDisabled}
        />
      </div>

      {/* Desktop Screen: Standard Desktop Dropdown (>= 640px) */}
      <div className="hidden sm:block">
        <Select
          menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
          menuPosition="fixed"
          styles={customStyles}
          options={options}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          isLoading={isLoading}
          isDisabled={isDisabled}
          {...rest}
        />
      </div>
    </div>
  )
}

export function CustomCreatableSelect<
  Option = OptionType,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: CreatableProps<Option, IsMulti, Group> & {
    label?: string
    required?: boolean
  }
) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const customStyles = useCustomStyles<Option, IsMulti, Group>(isDark)
  const {
    label,
    required,
    options,
    value,
    onChange,
    onCreateOption,
    formatCreateLabel,
    placeholder,
    isLoading,
    isDisabled,
    ...rest
  } = props

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Mobile Screen: Native-like Bottom Sheet with Create Action (< 640px) */}
      <div className="block sm:hidden">
        <MobileBottomSheetSelect
          label={label}
          required={required}
          options={options as any}
          value={value as any}
          onChange={onChange as any}
          onCreateOption={onCreateOption}
          formatCreateLabel={formatCreateLabel}
          placeholder={placeholder as string}
          isLoading={isLoading}
          isDisabled={isDisabled}
        />
      </div>

      {/* Desktop Screen: Standard Creatable Select (>= 640px) */}
      <div className="hidden sm:block">
        <CreatableSelect
          menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
          menuPosition="fixed"
          styles={customStyles}
          formatCreateLabel={formatCreateLabel || ((inputValue) => `+ Buat baru: "${inputValue}"`)}
          options={options}
          value={value}
          onChange={onChange}
          onCreateOption={onCreateOption}
          placeholder={placeholder}
          isLoading={isLoading}
          isDisabled={isDisabled}
          {...rest}
        />
      </div>
    </div>
  )
}
