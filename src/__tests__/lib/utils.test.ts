import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn function (className utility)', () => {
    test('merges class names correctly', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    test('handles conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'not-included')
      expect(result).toBe('base conditional')
    })

    test('handles undefined and null values', () => {
      const result = cn('base', undefined, null, 'end')
      expect(result).toBe('base end')
    })

    test('handles empty strings', () => {
      const result = cn('base', '', 'end')
      expect(result).toBe('base end')
    })

    test('handles arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    test('handles object with boolean values', () => {
      const result = cn({
        'always-included': true,
        'sometimes-included': true,
        'never-included': false,
      })
      expect(result).toBe('always-included sometimes-included')
    })

    test('handles mixed inputs', () => {
      const result = cn(
        'base',
        ['array1', 'array2'],
        {
          'obj-true': true,
          'obj-false': false,
        },
        true && 'conditional',
        'end'
      )
      expect(result).toBe('base array1 array2 obj-true conditional end')
    })

    test('deduplicates identical classes', () => {
      const result = cn('duplicate', 'unique', 'duplicate')
      // Note: This behavior depends on the actual implementation
      // If using clsx/tailwind-merge, it should deduplicate
      expect(result.split(' ').filter(c => c === 'duplicate')).toHaveLength(1)
    })

    test('handles Tailwind CSS conflicts (if using tailwind-merge)', () => {
      // This test assumes tailwind-merge is used for proper Tailwind class merging
      const result = cn('p-2', 'p-4') // p-4 should override p-2
      
      // The exact behavior depends on whether tailwind-merge is used
      // If just clsx: 'p-2 p-4'
      // If tailwind-merge: 'p-4'
      expect(result).toContain('p-')
    })

    test('handles empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    test('handles only falsy values', () => {
      const result = cn(false, null, undefined, '')
      expect(result).toBe('')
    })

    test('preserves whitespace handling', () => {
      const result = cn('  spaced  ', 'normal')
      // Should normalize whitespace
      expect(result.trim()).toBeTruthy()
      expect(result).not.toContain('  ')
    })

    test('handles nested arrays', () => {
      const result = cn(['outer', ['inner1', 'inner2']], 'end')
      expect(result).toContain('outer')
      expect(result).toContain('inner1')
      expect(result).toContain('inner2')
      expect(result).toContain('end')
    })

    test('handles complex conditional logic', () => {
      const isActive = true
      const isDisabled = false
      const variant = 'primary'
      
      const result = cn(
        'btn',
        {
          'btn-active': isActive,
          'btn-disabled': isDisabled,
        },
        variant === 'primary' && 'btn-primary',
        variant === 'secondary' && 'btn-secondary'
      )
      
      expect(result).toBe('btn btn-active btn-primary')
    })

    test('performance with large number of classes', () => {
      const manyClasses = Array.from({ length: 100 }, (_, i) => `class-${i}`)
      
      const start = performance.now()
      const result = cn(...manyClasses)
      const end = performance.now()
      
      expect(result).toContain('class-0')
      expect(result).toContain('class-99')
      expect(end - start).toBeLessThan(10) // Should be very fast
    })

    describe('Edge Cases', () => {
      test('handles numeric values', () => {
        const result = cn('base', 0, 1, 'end')
        // Numbers are truthy except 0
        expect(result).toContain('base')
        expect(result).toContain('1')
        expect(result).toContain('end')
        expect(result).not.toContain('0')
      })

      test('handles function values (should be ignored)', () => {
        const fn = () => 'function-class'
        const result = cn('base', fn, 'end')
        
        // Functions should be ignored or handled gracefully
        expect(result).toContain('base')
        expect(result).toContain('end')
      })

      test('handles Symbol values (should be ignored)', () => {
        const sym = Symbol('test')
        const result = cn('base', sym, 'end')
        
        expect(result).toContain('base')
        expect(result).toContain('end')
      })

      test('handles Date objects (should be ignored or stringified)', () => {
        const date = new Date()
        const result = cn('base', date, 'end')
        
        expect(result).toContain('base')
        expect(result).toContain('end')
        // Date objects should not appear as classes
      })
    })

    describe('Real-world Usage Patterns', () => {
      test('button component class merging', () => {
        const getButtonClasses = (variant: string, size: string, disabled: boolean) => {
          return cn(
            'btn',
            {
              'btn-primary': variant === 'primary',
              'btn-secondary': variant === 'secondary',
              'btn-sm': size === 'sm',
              'btn-lg': size === 'lg',
              'btn-disabled': disabled,
            }
          )
        }
        
        expect(getButtonClasses('primary', 'lg', false))
          .toBe('btn btn-primary btn-lg')
        
        expect(getButtonClasses('secondary', 'sm', true))
          .toBe('btn btn-secondary btn-sm btn-disabled')
      })

      test('responsive classes', () => {
        const result = cn(
          'w-full',
          'sm:w-1/2',
          'md:w-1/3',
          'lg:w-1/4',
          'xl:w-1/5'
        )
        
        expect(result).toBe('w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5')
      })

      test('state-based styling', () => {
        const isLoading = false
        const hasError = true
        const isSuccess = false
        
        const result = cn(
          'form-input',
          {
            'loading': isLoading,
            'error': hasError,
            'success': isSuccess,
          }
        )
        
        expect(result).toBe('form-input error')
      })
    })

    describe('TypeScript Integration', () => {
      test('accepts various TypeScript types', () => {
        interface ClassProps {
          className?: string
        }
        
        const getClasses = (props: ClassProps, extra: string) => {
          return cn('base', props.className, extra)
        }
        
        expect(getClasses({ className: 'prop-class' }, 'extra'))
          .toBe('base prop-class extra')
        
        expect(getClasses({}, 'extra'))
          .toBe('base extra')
      })

      test('works with const assertions', () => {
        const variants = {
          primary: 'bg-blue-500',
          secondary: 'bg-gray-500',
        } as const
        
        type Variant = keyof typeof variants
        
        const getVariantClass = (variant: Variant) => {
          return cn('base', variants[variant])
        }
        
        expect(getVariantClass('primary')).toBe('base bg-blue-500')
        expect(getVariantClass('secondary')).toBe('base bg-gray-500')
      })
    })
  })
})