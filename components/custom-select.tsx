'use client'

import React, { useEffect, useState } from 'react'
import Select, { type Props as SelectProps, type GroupBase, type StylesConfig } from 'react-select'

export interface OptionType<T = any> {
  value: T
  label: string
  icon?: React.ReactNode
  badge?: string
  color?: string
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

  const customStyles: StylesConfig<Option, IsMulti, Group> = {
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

  const { label, required, ...rest } = props

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <Select
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        menuPosition="fixed"
        styles={customStyles}
        {...rest}
      />
    </div>
  )
}
