# Redux State Management

This directory contains the Redux store configuration and state management for the ALX Student Showcase application.

## Store Structure

```
store/
├── index.js              # Store configuration
├── slices/
│   ├── authSlice.js      # Authentication state
│   ├── projectsSlice.js  # Projects CRUD operations
│   ├── uiSlice.js        # UI state (modals, tabs, notifications)
│   ├── sharingSlice.js   # Social media sharing workflow
│   └── githubSlice.js    # GitHub integration
├── utils.js              # Utility functions and selectors
└── README.md            # This documentation
```

## State Shape

```javascript
{
  auth: {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null,
    isInitialized: boolean
  },
  projects: {
    projects: Project[],
    currentProject: Project | null,
    stats: { total: number, public: number, technologies: number },
    isLoading: boolean,
    isCreating: boolean,
    isUpdating: boolean,
    isDeleting: boolean,
    isImporting: boolean,
    error: string | null
  },
  ui: {
    modals: {
      projectForm: boolean,
      gitHubImport: boolean,
      shareProject: boolean,
      autoWorkLogShare: boolean,
      workLogGenerator: boolean,
      userProfile: boolean
    },
    activeTab: string,
    notifications: Notification[],
    loading: { [key]: boolean },
    theme: 'light' | 'dark',
    sidebarOpen: boolean
  },
  sharing: {
    currentWorkLog: WorkLog | null,
    repositoryInfo: RepoInfo | null,
    socialContent: { [platform]: PlatformContent },
    settings: { timeframe: string, selectedPlatforms: string[], autoGenerate: boolean },
    customMessage: string,
    templates: Template[],
    isGeneratingWorkLog: boolean,
    isGeneratingContent: boolean,
    isFetchingRepoInfo: boolean,
    error: string | null,
    workLogError: string | null,
    contentError: string | null
  },
  github: {
    currentUser: string,
    repositories: Repository[],
    alxProjects: ALXProject[],
    selectedProjects: string[],
    repositoryDetails: { [repoKey]: RepoDetails },
    importCandidates: ProjectData[],
    isLoadingRepositories: boolean,
    isDetectingALX: boolean,
    isImporting: boolean,
    isLoadingDetails: boolean,
    error: string | null,
    repositoryError: string | null,
    importError: string | null,
    wizardStep: 'username' | 'select' | 'import',
    wizardData: object
  }
}
```

## Usage Examples

### Basic Redux Hooks

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { fetchProjects } from '@/store/slices/projectsSlice.js';

function MyComponent() {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.projects.projects);
  const isLoading = useSelector(state => state.projects.isLoading);
  
  useEffect(() => {
    dispatch(fetchProjects(userId));
  }, [dispatch, userId]);
  
  return (
    <div>
      {isLoading ? 'Loading...' : projects.map(project => ...)}
    </div>
  );
}
```

### Custom Hooks

```javascript
import { useAuth, useProjects, useUI } from '@/hooks/redux-hooks.js';

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { projects, isLoading, dispatch } = useProjects();
  const { modals, activeTab } = useUI();
  
  // Component logic...
}
```

### Utility Selectors

```javascript
import { 
  selectProjectMetrics, 
  selectSharingStatus, 
  selectGitHubStatus 
} from '@/store/utils.js';

function StatsComponent() {
  const metrics = useSelector(selectProjectMetrics);
  const sharingStatus = useSelector(selectSharingStatus);
  const githubStatus = useSelector(selectGitHubStatus);
  
  return (
    <div>
      <p>Total Projects: {metrics.total}</p>
      <p>Top Technology: {metrics.topTechnologies[0]?.name}</p>
      <p>Sharing Ready: {sharingStatus.isReady ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Async Operations

All async operations use Redux Toolkit's `createAsyncThunk`:

```javascript
// Dispatching async actions
dispatch(fetchProjects(userId))
  .unwrap() // Get the fulfilled value directly
  .then(projects => {
    console.log('Projects loaded:', projects);
  })
  .catch(error => {
    console.error('Failed to load projects:', error);
  });

// Using in components
const handleCreateProject = async (projectData) => {
  try {
    const newProject = await dispatch(createProject(projectData)).unwrap();
    toast.success('Project created successfully!');
    dispatch(closeModal('projectForm'));
  } catch (error) {
    toast.error(`Failed to create project: ${error}`);
  }
};
```

## Modal Management

The UI slice provides centralized modal state management:

```javascript
import { openModal, closeModal } from '@/store/slices/uiSlice.js';

// Open modal
dispatch(openModal({ modalName: 'projectForm', data: { projectId: '123' } }));

// Close modal
dispatch(closeModal('projectForm'));

// Check modal state
const isOpen = useSelector(state => state.ui.modals.projectForm);
```

## Error Handling

Each slice maintains its own error state, with utilities for global error handling:

```javascript
import { selectAllErrors } from '@/store/utils.js';

function ErrorBoundary() {
  const errors = useSelector(selectAllErrors);
  
  const hasErrors = Object.values(errors).some(error => !!error);
  
  if (hasErrors) {
    return <ErrorDisplay errors={errors} />;
  }
  
  return <App />;
}
```

## Performance Optimization

### Memoized Selectors

```javascript
import { createSelector } from '@reduxjs/toolkit';

const selectFilteredProjects = createSelector(
  [state => state.projects.projects, (state, filter) => filter],
  (projects, filter) => {
    // Expensive filtering logic here
    return projects.filter(project => /* filtering logic */);
  }
);
```

### Normalized State

For large datasets, consider normalizing the state:

```javascript
// Instead of arrays, use objects with IDs as keys
{
  projects: {
    byId: {
      '1': { id: '1', title: 'Project 1', ... },
      '2': { id: '2', title: 'Project 2', ... }
    },
    allIds: ['1', '2']
  }
}
```

## Best Practices

### 1. Action Naming
- Use past tense: `userLoggedIn`, `projectCreated`
- Be descriptive: `github/fetchRepositoriesSuccess`

### 2. State Structure
- Keep state flat when possible
- Normalize related data
- Separate loading states for different operations

### 3. Async Actions
- Handle all three states: pending, fulfilled, rejected
- Provide meaningful error messages
- Use `unwrap()` when you need the resolved value

### 4. Selectors
- Use memoized selectors for derived data
- Create reusable selector functions
- Keep selectors simple and focused

### 5. Component Integration
- Use custom hooks for common patterns
- Dispatch actions from event handlers
- Keep components focused on presentation

## Migration Guide

If updating from local state to Redux:

### Before (Local State)
```javascript
function Component() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return /* JSX */;
}
```

### After (Redux)
```javascript
function Component() {
  const dispatch = useDispatch();
  const { projects, isLoading } = useSelector(state => state.projects);
  
  const fetchData = () => {
    dispatch(fetchProjects(userId));
  };
  
  return /* JSX */;
}
```

## Debugging

### Redux DevTools
- Install Redux DevTools Extension
- Time-travel debugging
- Action replay
- State inspection

### Console Debugging
```javascript
// Log store state
console.log('Current state:', store.getState());

// Subscribe to state changes
store.subscribe(() => {
  console.log('State updated:', store.getState());
});
```

## Testing

### Testing Reducers
```javascript
import { authSlice } from '@/store/slices/authSlice.js';

test('should handle login', () => {
  const previousState = { user: null, isAuthenticated: false };
  const action = { type: 'auth/signInWithEmail/fulfilled', payload: mockUser };
  const newState = authSlice.reducer(previousState, action);
  
  expect(newState.user).toEqual(mockUser);
  expect(newState.isAuthenticated).toBe(true);
});
```

### Testing Async Thunks
```javascript
import { configureStore } from '@reduxjs/toolkit';
import { fetchProjects } from '@/store/slices/projectsSlice.js';

test('should fetch projects', async () => {
  const store = configureStore({ reducer: { projects: projectsSlice.reducer } });
  
  await store.dispatch(fetchProjects('user-id'));
  
  const state = store.getState();
  expect(state.projects.isLoading).toBe(false);
  expect(state.projects.projects.length).toBeGreaterThan(0);
});
```

## Common Patterns

### Loading States
```javascript
// In slice
builder.addCase(asyncAction.pending, (state) => {
  state.isLoading = true;
  state.error = null;
});

// In component
const isLoading = useSelector(state => state.slice.isLoading);
if (isLoading) return <LoadingSpinner />;
```

### Optimistic Updates
```javascript
// Immediately update UI, revert on error
const handleLike = (projectId) => {
  dispatch(toggleLikeOptimistic(projectId));
  dispatch(toggleLikeAsync(projectId))
    .unwrap()
    .catch(() => {
      dispatch(toggleLikeOptimistic(projectId)); // Revert
    });
};
```

### Batch Operations
```javascript
// Multiple related actions
dispatch(batchActions([
  clearProjects(),
  setLoading(true),
  fetchProjects(userId)
]));
```

This Redux implementation provides a robust, scalable foundation for state management across the entire application.