// src/services/userProfileService.js
import { supabase } from '../lib/supabaseClient'; // Assuming your Supabase client is initialized here

/**
 * Service for interacting with the 'user_profiles' table in Supabase.
 */
export const userProfileService = {
  /**
   * Fetches a single user profile from Supabase by user ID.
   * @param {string} userId - The ID of the user whose profile to fetch.
   * @returns {Promise<object | null>} The user profile object if found, otherwise null.
   * @throws {Error} If a Supabase error occurs other than 'no rows found'.
   */
  fetchUserProfile: async (userId) => {
    if (!userId) {
      throw new Error('User ID is required to fetch profile.');
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single(); // Use .single() to expect one or zero rows

      if (error && error.code === 'PGRST116') {
        // PGRST116 means "No rows found", which is a valid scenario for new users
        return null;
      } else if (error) {
        console.error("Supabase error fetching user profile:", error);
        throw new Error(error.message || 'Failed to fetch user profile from database.');
      }

      return data;
    } catch (error) {
      console.error("Error in userProfileService.fetchUserProfile:", error.message);
      throw error;
    }
  },

  /**
   * Updates an existing user profile or inserts a new one if it doesn't exist.
   * The 'id' in profileData must match the user's Supabase ID.
   * @param {object} profileData - The profile data to update or insert. Must include 'id'.
   * @returns {Promise<object>} The updated or newly inserted user profile object.
   * @throws {Error} If the Supabase operation fails.
   */
  updateProfile: async (profileData) => {
    if (!profileData || !profileData.id) {
      throw new Error('Profile data and user ID are required to update profile.');
    }

    try {
      // First, try to update the existing profile
      const { data: updatedData, error: updateError } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', profileData.id)
        .select() // Select the updated row
        .single();

      if (updateError && updateError.code === 'PGRST116') {
        // If no rows were updated (PGRST116), it means the profile doesn't exist, so insert it
        const { data: insertedData, error: insertError } = await supabase
          .from('user_profiles')
          .insert(profileData)
          .select() // Select the inserted row
          .single();

        if (insertError) {
          console.error("Supabase error inserting user profile:", insertError);
          throw new Error(insertError.message || 'Failed to create user profile in database.');
        }
        return insertedData;
      } else if (updateError) {
        // Handle other update errors
        console.error("Supabase error updating user profile:", updateError);
        throw new Error(updateError.message || 'Failed to update user profile in database.');
      }

      return updatedData; // Return the successfully updated data
    } catch (error) {
      console.error("Error in userProfileService.updateProfile:", error.message);
      throw error;
    }
  },
};
