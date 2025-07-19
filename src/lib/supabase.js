import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const subscribeToProjectChanges = (onUpdate) => {
  const channel = supabase
    .channel('projects-changes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'projects' },
      (payload) => {
        console.log('Project updated:', payload);
        onUpdate(payload.new);
      }
    )
    .subscribe();

  return channel;
};

export const backupProjectData = async (projectData) => {
  const { data, error } = await supabase
    .from('project_backups')
    .insert(projectData);

  if (error) {
    console.error('Error backing up project data:', error);
    throw error;
  }

  return data;
};

export const fetchUserBadges = async (userId) => {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching badges:', error);
    throw error;
  }

  return data;
};

export const awardBadge = async (userId, badge) => {
  const { data, error } = await supabase
    .from('badges')
    .insert({ user_id: userId, ...badge });

  if (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }

  return data;
};