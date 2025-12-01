export interface UserAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  company: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  createdAt: string;
  role: 'user' | 'admin';
}

export function registerUser(userData: Omit<UserAccount, 'id' | 'createdAt' | 'role'>): { success: boolean; message: string; userId?: string } {
  const users = JSON.parse(localStorage.getItem('pcr_users') || '[]');

  // Check if email already exists
  if (users.find((u: UserAccount) => u.email === userData.email)) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const newUser: UserAccount = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    role: 'user'
  };

  users.push(newUser);
  localStorage.setItem('pcr_users', JSON.stringify(users));

  return { success: true, message: 'Account created successfully!', userId: newUser.id };
}

export function getUserByEmail(email: string): UserAccount | null {
  const users = JSON.parse(localStorage.getItem('pcr_users') || '[]');
  return users.find((u: UserAccount) => u.email === email) || null;
}

export function updateUserAccount(userId: string, updates: Partial<UserAccount>): { success: boolean; message: string } {
  const users = JSON.parse(localStorage.getItem('pcr_users') || '[]');
  const index = users.findIndex((u: UserAccount) => u.id === userId);

  if (index === -1) {
    return { success: false, message: 'User not found.' };
  }

  users[index] = { ...users[index], ...updates };
  localStorage.setItem('pcr_users', JSON.stringify(users));

  return { success: true, message: 'Account updated successfully!' };
}

export function getAllUsers(): UserAccount[] {
  return JSON.parse(localStorage.getItem('pcr_users') || '[]');
}
