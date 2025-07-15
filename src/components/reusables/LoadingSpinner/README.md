# Global Loading Spinner

A reusable loading spinner component that provides a full-screen backdrop with a centered spinner. This component is integrated at the root level and can be controlled from anywhere in the application using the `useLoading` hook.

## Features

- ✨ **Full-screen backdrop** with blur effect
- 🎯 **Perfectly centered** spinner
- 💬 **Customizable loading message**
- 📱 **Responsive design** for mobile devices
- 🎬 **Smooth animations** for appearance/disappearance
- 🌍 **Global state management** via React Context
- 🔧 **High z-index** (9999) to appear over all content

## Usage

### Basic Usage

```tsx
import { useLoading } from "../../../contexts/LoadingContext";

const MyComponent = () => {
  const { showLoading, hideLoading } = useLoading();

  const handleSomething = async () => {
    // Show loading spinner
    showLoading();

    try {
      // Perform async operation
      await someAsyncOperation();
    } finally {
      // Hide loading spinner
      hideLoading();
    }
  };

  return <button onClick={handleSomething}>Do Something</button>;
};
```

### With Custom Message

```tsx
const handleFormSubmit = async () => {
  showLoading("Saving data...");

  try {
    await saveFormData();
  } finally {
    hideLoading();
  }
};
```

### With Timeout

```tsx
const handleSearch = () => {
  showLoading("Searching...");

  setTimeout(() => {
    // Simulate API call
    setSearchResults(results);
    hideLoading();
  }, 2000);
};
```

## API Reference

### `useLoading()` Hook

Returns an object with the following properties:

| Property         | Type                         | Description              |
| ---------------- | ---------------------------- | ------------------------ |
| `isLoading`      | `boolean`                    | Current loading state    |
| `loadingMessage` | `string`                     | Current loading message  |
| `showLoading`    | `(message?: string) => void` | Show the loading spinner |
| `hideLoading`    | `() => void`                 | Hide the loading spinner |

### `showLoading(message?)`

- **message** (optional): Custom loading message. Defaults to "Loading..."

### `hideLoading()`

- No parameters. Simply hides the loading spinner.

## Styling

The component uses the following CSS classes:

- `.loading-spinner-backdrop` - Full-screen overlay
- `.loading-spinner-container` - White card container
- `.loading-spinner` - SVG spinner wrapper
- `.loading-spinner-message` - Loading message text

## Examples

### Form Submission

```tsx
const MyForm = () => {
  const { showLoading, hideLoading } = useLoading();

  const handleSubmit = async (formData) => {
    showLoading("Submitting form...");

    try {
      await submitForm(formData);
      // Success handling
    } catch (error) {
      // Error handling
    } finally {
      hideLoading();
    }
  };
};
```

### Data Fetching

```tsx
const UsersList = () => {
  const { showLoading, hideLoading } = useLoading();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      showLoading("Fetching users...");

      try {
        const userData = await api.getUsers();
        setUsers(userData);
      } finally {
        hideLoading();
      }
    };

    fetchUsers();
  }, []);
};
```

### File Upload

```tsx
const FileUpload = () => {
  const { showLoading, hideLoading } = useLoading();

  const handleFileUpload = async (file) => {
    showLoading("Uploading file...");

    try {
      await uploadFile(file);
      // Success notification
    } finally {
      hideLoading();
    }
  };
};
```

## Migration from Local Spinners

If you have existing local loading spinners, you can easily replace them:

### Before (Local spinner)

```tsx
const [loading, setLoading] = useState(false);

// Show local spinner
setLoading(true);
// Hide local spinner
setLoading(false);
```

### After (Global spinner)

```tsx
const { showLoading, hideLoading } = useLoading();

// Show global spinner
showLoading();
// Hide global spinner
hideLoading();
```

## Best Practices

1. **Always use try/finally**: Ensure `hideLoading()` is called even if an error occurs
2. **Descriptive messages**: Use clear, user-friendly loading messages
3. **Short operations**: For very quick operations (< 500ms), consider not showing the spinner
4. **Error handling**: Don't forget to hide the spinner in error scenarios

## Notes

- The spinner automatically centers itself on the screen
- The backdrop prevents user interaction with the underlying content
- The component is already integrated at the root level in `App.tsx`
- High z-index ensures it appears over all other content
