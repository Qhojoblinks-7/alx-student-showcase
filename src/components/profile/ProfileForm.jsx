import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserProfile,
  updateUserProfile,
  selectUserProfile,
  selectUserProjects,
  selectUserBadges,
} from '../../store/slices/profileSlice'; // Adjust the import path as needed

const UserProfile = ({ isOwnProfile = true, usernameParam }) => {
  const dispatch = useDispatch();
  const profile = useSelector(selectUserProfile);
  const projects = useSelector(selectUserProjects);
  const badges = useSelector(selectUserBadges);

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
  });

  const [errors, setErrors] = useState({});

  // Validation function
  const validate = () => {
    const errs = {};
    if (!formData.full_name?.trim()) {
      errs.full_name = 'Full name is required';
    }
    if (formData.bio && formData.bio.length > 280) {
      errs.bio = 'Bio cannot exceed 280 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // On mount - fetch user profile & projects
  useEffect(() => {
    console.log('[UserProfile] fetchProfileAndProjects start', { isOwnProfile, usernameParam });
    const username = isOwnProfile ? undefined : usernameParam;
    dispatch(fetchUserProfile(username)).then(() => {
      console.log('[UserProfile] fetched profile, now loading projects');
    });
  }, [dispatch, isOwnProfile, usernameParam]);

  useEffect(() => {
    if (profile) {
      console.log('[UserProfile] setting initial form data');
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      console.log('[UserProfile] submitting update', formData);
      await dispatch(updateUserProfile(formData)).unwrap();
      alert('Profile updated successfully');
    } catch (err) {
      console.error('[UserProfile] update failed', err);
      alert('Update failed');
    }
  };

  return (
    <div className="user-profile">
      <h2>User Profile</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Full Name:
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
          {errors.full_name && <p className="error">{errors.full_name}</p>}
        </label>

        <label>
          Bio:
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            maxLength={280}
          />
          {errors.bio && <p className="error">{errors.bio}</p>}
        </label>

        <button type="submit">Update Profile</button>
      </form>

      <section className="badges">
  <h3>Badges</h3>
  {/* Use nullish coalescing (??) to ensure badges is an array */}
  {(badges ?? []).length > 0 ? (
    <ul>
      {/* Also ensure .map is called on an array */}
      {(badges ?? []).map((badge) => (
        <li key={badge.id}>{badge.name}</li>
      ))}
    </ul>
  ) : (
    <p>No badges yet.</p>
  )}
</section>

      <section className="projects">
        <h3>Projects</h3>
        {projects.length > 0 ? (
          <ul>
            {projects.map((project) => (
              <li key={project.id}>{project.title}</li>
            ))}
          </ul>
        ) : (
          <p>No projects found.</p>
        )}
      </section>
    </div>
  );
};

export default UserProfile;
