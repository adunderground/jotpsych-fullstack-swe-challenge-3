/**
 * Simple service to manage user ID
 */
class UserIDService {
  private static STORAGE_KEY = 'user_id';

  // Get user ID from storage
  static getUserIDFromStorage(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  // Store user ID in storage
  static setUserID(userId: string): void {
    localStorage.setItem(this.STORAGE_KEY, userId);
  }

  // Generate new user ID from backend
  static async generateUserID(): Promise<string> {
    const response = await fetch('http://localhost:8000/generate-user-id');
    const data = await response.json();
    const userId = data.user_id;
    this.setUserID(userId);
    return userId;
  }

  // Get existing user ID or generate new one
  static async getUserID(): Promise<string> {
    let userId = this.getUserIDFromStorage();
    if (!userId) {
      userId = await this.generateUserID();
    }
    return userId;
  }
}

export default UserIDService;
