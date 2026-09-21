export function homeForRole(role: string) {
  return role === 'admin' ? '/admin' : '/portal'
}
