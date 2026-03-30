const registrySheetService = require("../sheets/registrySheet.service");
const { AppError } = require("../../utils/errors");

class UserRegistryService {
  findByTelegramUserId(telegramUserId) {
    return registrySheetService.findByTelegramUserId(telegramUserId);
  }

  findByAppUserId(appUserId) {
    return registrySheetService.findByAppUserId(appUserId);
  }

  findByWebLoginEmail(email) {
    return registrySheetService.findByWebLoginEmail(email);
  }

  appendUser(user) {
    return registrySheetService.appendUser(user);
  }

  async updateUser(appUserId, patch) {
    const users = await registrySheetService.getAllUsers();
    const index = users.findIndex((user) => user.app_user_id === appUserId);

    if (index === -1) {
      throw new AppError(404, "User not found in registry");
    }

    users[index] = {
      ...users[index],
      ...patch
    };

    await registrySheetService.replaceAllUsers(users);
    return users[index];
  }

  async getRequiredByAppUserId(appUserId) {
    const user = await this.findByAppUserId(appUserId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  }

  async getRequiredConnectedUser(appUserId) {
    const user = await this.getRequiredByAppUserId(appUserId);
    if (!user.user_sheet_id) {
      throw new AppError(409, "Google Sheet not connected yet");
    }

    return user;
  }
}

module.exports = new UserRegistryService();
