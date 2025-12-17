export async function apiUpdateProfile(token, { companyName, companyLogoFile }) {
  const form = new FormData();
  if (companyName != null) form.append('companyName', companyName);
  if (companyLogoFile) form.append('companyLogo', companyLogoFile);

  const res = await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      (typeof data === 'string' && data) ||
      'Failed to update profile';
    throw new Error(message);
  }

  return data;
}
