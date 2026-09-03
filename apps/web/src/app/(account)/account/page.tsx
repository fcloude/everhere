'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function AccountOverviewPage() {
  const { user } = useAuth();
  if (!user) return null;

  const profile = user.profile;
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card">
        <h2 className="text-lg font-semibold text-neutral-900 mb-1">
          Welcome back, {user.displayName}
        </h2>
        <p className="text-sm text-neutral-500">
          Member since {memberSince}
        </p>
      </div>

      {/* Account details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">Account</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-600">Email</dt>
              <dd className="text-sm text-neutral-900">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-600">Role</dt>
              <dd>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
                  {user.role}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-600">Email verified</dt>
              <dd className="text-sm">
                {user.emailVerified ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span className="text-amber-600">Pending</span>
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-neutral-600">MFA</dt>
              <dd className="text-sm">
                {user.mfaEnabled ? (
                  <span className="text-green-600">Enabled</span>
                ) : (
                  <span className="text-neutral-400">Not enabled</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-neutral-500 mb-2">Profile</h3>
          {profile ? (
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-neutral-600">Skills</dt>
                <dd className="text-sm text-neutral-900">{profile.skills.length} selected</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-neutral-600">Role</dt>
                <dd className="text-sm text-neutral-900 capitalize">{profile.preferredRole}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-neutral-600">Links</dt>
                <dd className="text-sm text-neutral-900">{profile.portfolioLinks.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-neutral-600">Bio</dt>
                <dd className="text-sm text-neutral-900">{profile.bio ? 'Set' : 'Not set'}</dd>
              </div>
            </dl>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-neutral-500 mb-3">No profile yet</p>
              <Link href="/account/profile" className="btn-primary text-sm">
                Create Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3 className="text-sm font-medium text-neutral-500 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/account/profile" className="btn-secondary text-sm">
            Edit Profile
          </Link>
          <Link href="/account/contributions" className="btn-secondary text-sm">
            View Contributions
          </Link>
          <Link href="/account/security" className="btn-secondary text-sm">
            Security Settings
          </Link>
        </div>
      </div>

      {/* Visibility preview */}
      {profile && (
        <div className="card">
          <h3 className="text-sm font-medium text-neutral-500 mb-3">Public Visibility</h3>
          <p className="text-sm text-neutral-600 mb-4">
            Control what the public can see on your profile:
          </p>
          <div className="space-y-3">
            {[
              { label: 'Bio', visible: profile.visibility.showBio, value: profile.bio || 'Not set' },
              { label: 'Skills', visible: profile.visibility.showSkills, value: profile.skills.length ? profile.skills.join(', ') : 'None' },
              { label: 'Portfolio Links', visible: profile.visibility.showLinks, value: profile.portfolioLinks.length ? `${profile.portfolioLinks.length} link(s)` : 'None' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div>
                  <span className="text-sm font-medium text-neutral-900">{item.label}</span>
                  <span className="text-sm text-neutral-500 ml-2">
                    {item.visible ? `— ${item.value}` : '(hidden)'}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${item.visible ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  {item.visible ? 'Public' : 'Private'}
                </span>
              </div>
            ))}
          </div>
          <Link href="/account/profile" className="mt-4 inline-flex text-sm text-primary-600 hover:text-primary-700 font-medium">
            Manage visibility →
          </Link>
        </div>
      )}
    </div>
  );
}
