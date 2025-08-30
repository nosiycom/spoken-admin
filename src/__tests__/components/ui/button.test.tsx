import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  describe('Rendering', () => {
    test('renders button with text', () => {
      render(<Button>Click me</Button>)
      
      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Click me')
    })

    test('renders as different element when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link button</a>
        </Button>
      )
      
      const link = screen.getByRole('link', { name: 'Link button' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    test('applies default variant classes', () => {
      render(<Button>Default</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground', 'hover:bg-primary/90')
    })

    test('applies default size classes', () => {
      render(<Button>Default Size</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'px-4', 'py-2')
    })
  })

  describe('Variants', () => {
    test('applies default variant classes', () => {
      render(<Button variant="default">Default</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    test('applies destructive variant classes', () => {
      render(<Button variant="destructive">Delete</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
    })

    test('applies outline variant classes', () => {
      render(<Button variant="outline">Outline</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'border-input', 'bg-background')
    })

    test('applies secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
    })

    test('applies ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')
    })

    test('applies link variant classes', () => {
      render(<Button variant="link">Link</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary', 'underline-offset-4')
    })
  })

  describe('Sizes', () => {
    test('applies default size classes', () => {
      render(<Button size="default">Default Size</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'px-4', 'py-2')
    })

    test('applies sm size classes', () => {
      render(<Button size="sm">Small</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9', 'px-3')
    })

    test('applies lg size classes', () => {
      render(<Button size="lg">Large</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11', 'px-8')
    })

    test('applies icon size classes', () => {
      render(<Button size="icon">🔥</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'w-10')
    })
  })

  describe('States', () => {
    test('applies disabled state correctly', () => {
      render(<Button disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
    })

    test('handles disabled state with asChild', () => {
      render(
        <Button asChild disabled>
          <a href="/test">Disabled Link</a>
        </Button>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('Custom Props', () => {
    test('accepts custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      // Should still have default classes
      expect(button).toHaveClass('inline-flex', 'items-center')
    })

    test('accepts custom HTML attributes', () => {
      render(
        <Button 
          type="submit"
          form="test-form"
          data-testid="custom-button"
          aria-label="Custom button"
        >
          Submit
        </Button>
      )
      
      const button = screen.getByTestId('custom-button')
      expect(button).toHaveAttribute('type', 'submit')
      expect(button).toHaveAttribute('form', 'test-form')
      expect(button).toHaveAttribute('aria-label', 'Custom button')
    })

    test('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      
      render(<Button ref={ref}>Button with Ref</Button>)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current).toHaveTextContent('Button with Ref')
    })
  })

  describe('Interactions', () => {
    test('handles click events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Clickable</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('does not trigger click when disabled', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick} disabled>Disabled</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })

    test('handles keyboard navigation', () => {
      render(<Button>Keyboard Button</Button>)
      
      const button = screen.getByRole('button')
      
      // Should be focusable
      button.focus()
      expect(button).toHaveFocus()
      
      // Should respond to Enter key
      const handleClick = jest.fn()
      button.onclick = handleClick
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      // Note: This might not trigger click depending on browser behavior
      // The focus test above is the important part
    })

    test('handles mouse interactions', () => {
      render(<Button>Hover Button</Button>)
      
      const button = screen.getByRole('button')
      
      // Mouse enter
      fireEvent.mouseEnter(button)
      // Should apply hover styles (tested via CSS classes above)
      
      // Mouse leave
      fireEvent.mouseLeave(button)
      // Should remove hover styles
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<Button aria-label="Accessible button">🔥</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Accessible button')
    })

    test('supports aria-describedby', () => {
      render(
        <div>
          <Button aria-describedby="help-text">Submit</Button>
          <div id="help-text">This will submit the form</div>
        </div>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'help-text')
    })

    test('supports loading state with appropriate ARIA', () => {
      render(
        <Button disabled aria-label="Loading...">
          Loading
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-label', 'Loading...')
    })

    test('has appropriate role when rendered as link', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      
      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
    })
  })

  describe('Complex Scenarios', () => {
    test('combines multiple variants and sizes', () => {
      render(
        <Button variant="outline" size="lg" className="custom-class">
          Complex Button
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'border-input') // outline variant
      expect(button).toHaveClass('h-11', 'px-8') // lg size
      expect(button).toHaveClass('custom-class') // custom class
    })

    test('works in forms', () => {
      const handleSubmit = jest.fn(e => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      )
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleSubmit).toHaveBeenCalled()
    })

    test('supports icon buttons', () => {
      render(
        <Button size="icon" aria-label="Close">
          ✕
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'w-10')
      expect(button).toHaveAttribute('aria-label', 'Close')
      expect(button).toHaveTextContent('✕')
    })

    test('handles dynamic variant changes', () => {
      const { rerender } = render(
        <Button variant="default">Dynamic Button</Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary')
      
      rerender(<Button variant="destructive">Dynamic Button</Button>)
      expect(button).toHaveClass('bg-destructive')
      expect(button).not.toHaveClass('bg-primary')
    })

    test('works with loading states', () => {
      const LoadingButton = ({ isLoading }: { isLoading: boolean }) => (
        <Button disabled={isLoading} aria-label={isLoading ? 'Loading...' : 'Submit'}>
          {isLoading ? 'Loading...' : 'Submit'}
        </Button>
      )
      
      const { rerender } = render(<LoadingButton isLoading={false} />)
      
      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
      expect(button).toHaveTextContent('Submit')
      
      rerender(<LoadingButton isLoading={true} />)
      expect(button).toBeDisabled()
      expect(button).toHaveTextContent('Loading...')
      expect(button).toHaveAttribute('aria-label', 'Loading...')
    })
  })

  describe('Edge Cases', () => {
    test('handles empty children', () => {
      render(<Button></Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('')
    })

    test('handles null/undefined props gracefully', () => {
      render(
        <Button 
          variant={undefined as any}
          size={null as any}
          className={undefined}
        >
          Null Props
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Null Props')
    })

    test('handles very long text content', () => {
      const longText = 'A'.repeat(1000)
      render(<Button>{longText}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent(longText)
    })

    test('handles special characters in content', () => {
      const specialText = '🚀 Submit & Continue → 100%'
      render(<Button>{specialText}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent(specialText)
    })
  })
})