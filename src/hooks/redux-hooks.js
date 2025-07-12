import { useDispatch, useSelector } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom hooks for specific slices
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);
  
  return {
    ...auth,
    dispatch,
  };
};

export const useProjects = () => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(state => state.projects);
  
  return {
    ...projects,
    dispatch,
  };
};

export const useUI = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector(state => state.ui);
  
  return {
    ...ui,
    dispatch,
  };
};

export const useSharing = () => {
  const dispatch = useAppDispatch();
  const sharing = useAppSelector(state => state.sharing);
  
  return {
    ...sharing,
    dispatch,
  };
};

export const useGitHub = () => {
  const dispatch = useAppDispatch();
  const github = useAppSelector(state => state.github);
  
  return {
    ...github,
    dispatch,
  };
};