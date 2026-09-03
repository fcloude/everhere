'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';

const SKILL_OPTIONS = [
  'TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'Python',
  'PostgreSQL', 'Prisma', 'Tailwind CSS', 'UI/UX Design', 'Figma',
  'Accessibility', 'Security', 'Technical Writing', 'DevOps', 'Testing',
  'Community Management', 'Research',
];

const ROLE_OPTIONS = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'security', label: 'Security' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'tester', label: 'Tester' },
  { value: 'docs', label: 'Documentation' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
];

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const profile = user?.profile;

  // Form state
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [preferredRole, setPreferredRole] = useState('developer');
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(['']);

  // Visibility state
  const [showBio, setShowBio] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [visMessage, setVisMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load existing profile data
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setSkills(profile.skills);
      setPreferredRole(profile.preferredRole || 'developer');
      setPortfolioLinks(profile.portfolioLinks.length > 0 ? profile.portfolioLinks : ['']);
      setShowBio(profile.visibility.showBio);
      setShowSkills(profile.visibility.showSkills);
      setShowLinks(profile.visibility.showLinks);
    }
  }, [profile]);

  // ── Skills toggle ──────────────────────────────────────
  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  // ── Portfolio links management ─────────────────────────
  const addLink = () => {
    if (portfolioLinks.length < 5) {
      setPortfolioLinks([...portfolioLinks, '']);
    }
  };

  const removeLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, value: string) => {
    const next = [...portfolioLinks];
    next[index] = value;
    setPortfolioLinks(next);
  };

  // ── Save profile ───────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const allSkills = [...skills];
      if (customSkill.trim()) {
        allSkills.push(customSkill.trim());
      }

      await api.updateProfile({
        bio: bio || undefined,
        skills: allSkills.length > 0 ? allSkills : undefined,
        portfolioLinks: portfolioLinks.filter(Boolean),
        preferredRole,
      });

      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      await refresh();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Save visibility ────────────────────────────────────
  const handleSaveVisibility = async (field: 'showBio' | 'showSkills' | 'showLinks', value: boolean) => {
    setSavingVisibility(true);
    setVisMessage(null);

    try {
      await api.updateVisibility({ [field]: value });
      if (field === 'showBio') setShowBio(value);
      if (field === 'showSkills') setShowSkills(value);
      if (field === 'showLinks') setShowLinks(value);

      setVisMessage({ type: 'success', text: 'Visibility updated.' });
      await refresh();
    } catch (err) {
      setVisMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update visibility.',
      });
    } finally {
      setSavingVisibility(false);
    }
  };

  if (!user) return null;

  const isContributor = ['contributor', 'moderator', 'admin'].includes(user.role);

  return (
    <div className="space-y-8">
      {/* ── Profile Form ────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Edit Profile</h2>
            <p className="text-sm text-neutral-500">Update your public contributor profile</p>
          </div>
          {!isContributor && (
            <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Contributor role required to edit profile
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              className="input min-h-[100px]"
              placeholder="Tell the community about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={1000}
              disabled={!isContributor}
            />
            <p className="mt-1 text-xs text-neutral-400 text-right">{bio.length}/1000</p>
          </div>

          {/* Skills */}
          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-neutral-700 mb-2">
                Skills
              </legend>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    disabled={!isContributor}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      skills.includes(skill)
                        ? 'bg-primary-100 border-primary-300 text-primary-700'
                        : 'bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-pressed={skills.includes(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {skills.length > 0 && (
                <p className="mt-2 text-xs text-neutral-400">{skills.length} skill(s) selected</p>
              )}
            </fieldset>
          </div>

          {/* Custom Skill */}
          <div>
            <label htmlFor="customSkill" className="block text-sm font-medium text-neutral-700 mb-1">
              Other Skill <span className="text-neutral-400">(optional)</span>
            </label>
            <input
              id="customSkill"
              type="text"
              className="input"
              placeholder="Skill not listed above"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              disabled={!isContributor}
            />
          </div>

          {/* Preferred Role */}
          <div>
            <label htmlFor="preferredRole" className="block text-sm font-medium text-neutral-700 mb-1">
              Preferred Role
            </label>
            <select
              id="preferredRole"
              className="input"
              value={preferredRole}
              onChange={(e) => setPreferredRole(e.target.value)}
              disabled={!isContributor}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Portfolio Links */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Portfolio / GitHub Links <span className="text-neutral-400">(optional, max 5)</span>
            </label>
            <div className="space-y-2">
              {portfolioLinks.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="url"
                    className="input flex-1"
                    placeholder="https://github.com/yourname"
                    value={link}
                    onChange={(e) => updateLink(i, e.target.value)}
                    disabled={!isContributor}
                  />
                  {portfolioLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(i)}
                      disabled={!isContributor}
                      className="px-3 py-2 rounded-lg text-neutral-400 hover:text-danger hover:bg-red-50 transition-colors disabled:opacity-50"
                      aria-label={`Remove link ${i + 1}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {portfolioLinks.length < 5 && (
              <button
                type="button"
                onClick={addLink}
                disabled={!isContributor}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
              >
                + Add another link
              </button>
            )}
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
              role="status"
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !isContributor}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* ── Visibility Controls ─────────────────────────── */}
      <div className="card">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900">Public Visibility</h2>
          <p className="text-sm text-neutral-500">
            Control which parts of your profile are visible to the public.
            All fields are private by default.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              label: 'Bio',
              description: 'Show your bio on your public profile',
              value: showBio,
              field: 'showBio' as const,
            },
            {
              label: 'Skills',
              description: 'Show your selected skills on your public profile',
              value: showSkills,
              field: 'showSkills' as const,
            },
            {
              label: 'Portfolio Links',
              description: 'Show your portfolio/GitHub links on your public profile',
              value: showLinks,
              field: 'showLinks' as const,
            },
          ].map((item) => (
            <div key={item.field} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-neutral-900">{item.label}</p>
                <p className="text-xs text-neutral-500">{item.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={item.value}
                aria-label={`Make ${item.label} ${item.value ? 'private' : 'public'}`}
                onClick={() => handleSaveVisibility(item.field, !item.value)}
                disabled={savingVisibility || !isContributor}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50 ${
                  item.value ? 'bg-primary-600' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    item.value ? 'translate-x-5' : 'translate-x-0'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>
          ))}
        </div>

        {visMessage && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              visMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
            role="status"
          >
            {visMessage.text}
          </div>
        )}
      </div>
    </div>
  );
}
