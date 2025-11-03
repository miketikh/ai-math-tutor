# MathDisplay Component

A reusable React component for rendering LaTeX equations using KaTeX.

## Features

- **Inline and Block Modes**: Automatically detects `$` (inline) and `$$` (block) delimiters
- **Manual Mode Control**: Override auto-detection with `displayMode` prop
- **Error Handling**: Displays invalid LaTeX as raw text with error indicator
- **Performance**: Memoized with `React.memo` to prevent unnecessary re-renders
- **Accessibility**: All equations include `aria-label` for screen readers
- **Security**: KaTeX configured with `trust: false` to prevent XSS attacks
- **Dark Mode**: Fully styled with Tailwind CSS for light and dark themes

## Usage

### Basic Inline Equation
```tsx
import MathDisplay from '@/components/MathDisplay';

<MathDisplay latex="$x^2 + 5x + 6$" />
```

### Block Equation (Centered)
```tsx
<MathDisplay latex="$$\int x^2 dx = \frac{x^3}{3} + C$$" />
```

### Without Delimiters (Explicit Mode)
```tsx
// Force block mode
<MathDisplay latex="E = mc^2" displayMode={true} />

// Force inline mode
<MathDisplay latex="\frac{1}{2}" displayMode={false} />
```

### With Custom Accessibility Label
```tsx
<MathDisplay
  latex="$$a^2 + b^2 = c^2$$"
  ariaLabel="Pythagorean theorem: a squared plus b squared equals c squared"
/>
```

### In Text Flow
```tsx
<p>
  The quadratic formula is{' '}
  <MathDisplay latex="$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$" />{' '}
  which solves any quadratic equation.
</p>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `latex` | `string` | Yes | - | LaTeX string to render. Can include delimiters ($, $$) |
| `displayMode` | `boolean` | No | Auto-detected | Force inline (false) or block (true) mode |
| `ariaLabel` | `string` | No | Auto-generated | Custom accessibility description |
| `className` | `string` | No | `''` | Additional CSS classes |

## Delimiter Detection

The component automatically detects delimiters if `displayMode` is not provided:

- `$...$` → Inline mode (renders within text flow)
- `$$...$$` → Block mode (centered, larger)

Example:
```tsx
<MathDisplay latex="$x^2$" />          // Inline
<MathDisplay latex="$$x^2$$" />        // Block
<MathDisplay latex="x^2" />            // No delimiters, defaults to inline
<MathDisplay latex="x^2" displayMode={true} />  // Force block
```

## Error Handling

Invalid LaTeX is gracefully handled:

```tsx
// Invalid syntax - missing closing brace
<MathDisplay latex="$\frac{1{2}$" />
// Renders: [Error icon] \frac{1{2}
```

The error state displays:
- Red/orange background
- Error icon (X in circle)
- Raw LaTeX text (truncated if too long)
- Accessible alert role

## Accessibility

Every equation includes:
- `role="img"` - Identifies as an image for screen readers
- `aria-label` - Text description of the equation
  - Custom: Use the `ariaLabel` prop
  - Auto-generated: Falls back to "Math equation: [latex]"

Example:
```tsx
<MathDisplay
  latex="$$E = mc^2$$"
  ariaLabel="Einstein's mass-energy equivalence: E equals m c squared"
/>
```

## Performance

The component uses `React.memo` to prevent re-renders when:
- Parent component updates
- Sibling components change
- Props remain the same

The LaTeX rendering is also memoized internally using `useMemo`.

## Styling

The component uses Tailwind CSS classes:

**Inline Mode:**
- `inline` - Renders within text flow

**Block Mode:**
- `block text-center my-4` - Centered with vertical margin

**Error State:**
- `bg-red-50 dark:bg-red-900/20` - Red background
- `text-red-700 dark:text-red-300` - Red text
- Full dark mode support

Add custom styles via `className` prop:
```tsx
<MathDisplay latex="$x^2$" className="text-lg" />
```

## Examples

### Complex Equations

```tsx
// Calculus - Chain rule
<MathDisplay latex="$$\frac{d}{dx}[f(g(x))] = f'(g(x)) \cdot g'(x)$$" />

// Summation
<MathDisplay latex="$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$" />

// Matrix
<MathDisplay latex="$$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$$" />

// Taylor series
<MathDisplay latex="$$e^x = \sum_{n=0}^{\infty} \frac{x^n}{n!}$$" />
```

### Chat Message Integration

```tsx
function ChatMessage({ content }: { content: string }) {
  // Parse content for LaTeX delimiters and split
  const parts = content.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);

  return (
    <div>
      {parts.map((part, i) =>
        part.startsWith('$') ? (
          <MathDisplay key={i} latex={part} />
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </div>
  );
}
```

## Technical Details

### KaTeX Configuration
```typescript
katex.renderToString(latex, {
  displayMode: boolean,    // Block vs inline
  throwOnError: true,      // Catch errors early
  strict: 'warn',         // Warn on deprecated syntax
  trust: false            // Security: don't trust user input
});
```

### Security
- `trust: false` prevents execution of malicious commands
- No `\href`, `\url`, or other potentially dangerous LaTeX commands
- Safe for user-generated content

### Browser Compatibility
Works on all modern browsers that support:
- ES6+
- CSS Grid/Flexbox
- Web fonts (for KaTeX)

## Dependencies

- `katex` (^0.16.25) - LaTeX rendering engine
- `katex/dist/katex.min.css` - KaTeX styles
- React 19+

## File Location

`/src/components/MathDisplay.tsx`

## Related Components

This component is designed to work with:
- Chat message components (Epic 6)
- Problem input components (Epic 2)
- AI response rendering

## Future Enhancements

Potential improvements for later:
- Copy LaTeX to clipboard button
- LaTeX editor/input helper
- Equation numbering for references
- Export to image/PDF
