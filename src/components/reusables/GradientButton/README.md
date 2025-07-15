# GradientButton Component

A reusable button component with smooth gradient transitions and multiple variants.

## Features

- ✨ **Smooth Gradient Transitions** - Beautiful hover effects that work with gradients
- 🎨 **Multiple Variants** - Primary (green) and secondary (gray) styles
- 📏 **Different Sizes** - Small, medium, and large options
- 🔧 **Flexible** - Full width, disabled states, and custom classes
- ♿ **Accessible** - Proper focus states and keyboard navigation

## Usage

```tsx
import GradientButton from "../../reusables/GradientButton/GradientButton";

// Basic usage
<GradientButton onClick={() => console.log('Clicked!')}>
  Click Me
</GradientButton>

// Form submission
<GradientButton type="submit" fullWidth>
  SAVE
</GradientButton>

// Different variants and sizes
<GradientButton variant="secondary" size="small">
  Cancel
</GradientButton>

<GradientButton variant="primary" size="large" disabled>
  Loading...
</GradientButton>
```

## Props

| Prop        | Type                              | Default     | Description            |
| ----------- | --------------------------------- | ----------- | ---------------------- |
| `children`  | `React.ReactNode`                 | -           | Button content         |
| `onClick`   | `() => void`                      | -           | Click handler          |
| `type`      | `"button" \| "submit" \| "reset"` | `"button"`  | Button type            |
| `disabled`  | `boolean`                         | `false`     | Disabled state         |
| `className` | `string`                          | `""`        | Additional CSS classes |
| `variant`   | `"primary" \| "secondary"`        | `"primary"` | Button style variant   |
| `size`      | `"small" \| "medium" \| "large"`  | `"medium"`  | Button size            |
| `fullWidth` | `boolean`                         | `false`     | Full width button      |

## Examples

### Save Button (Full Width)

```tsx
<GradientButton type="submit" fullWidth>
  SAVE
</GradientButton>
```

### Action Buttons

```tsx
<div style={{ display: "flex", gap: "12px" }}>
  <GradientButton variant="primary">Confirm</GradientButton>
  <GradientButton variant="secondary">Cancel</GradientButton>
</div>
```

### Different Sizes

```tsx
<GradientButton size="small">Small</GradientButton>
<GradientButton size="medium">Medium</GradientButton>
<GradientButton size="large">Large</GradientButton>
```
