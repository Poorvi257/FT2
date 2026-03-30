const test = require("node:test");
const assert = require("node:assert/strict");
const telegramCommandService = require("../services/telegram/telegramCommand.service");
const onboardingService = require("../services/onboarding/onboarding.service");
const magicLinkService = require("../services/auth/magicLink.service");

test("telegram /start with a deep-link payload creates or reuses the registry user and returns a login link", async (context) => {
  const originalGetOrCreateTelegramUser = onboardingService.getOrCreateTelegramUser;
  const originalCreateLoginUrl = magicLinkService.createLoginUrl;

  context.after(() => {
    onboardingService.getOrCreateTelegramUser = originalGetOrCreateTelegramUser;
    magicLinkService.createLoginUrl = originalCreateLoginUrl;
  });

  let onboardingCall = null;

  onboardingService.getOrCreateTelegramUser = async (input) => {
    onboardingCall = input;
    return {
      app_user_id: "usr_test_1",
      user_sheet_id: "",
      timezone: "Asia/Kolkata"
    };
  };

  magicLinkService.createLoginUrl = (appUserId) => `https://ft2.test/login?token=${appUserId}`;

  const response = await telegramCommandService.handleUpdate({
    message: {
      text: "/start ft2_signup",
      chat: { id: 456 },
      from: {
        id: 123,
        username: "new_user",
        first_name: "New",
        last_name: "User"
      }
    }
  });

  assert.deepEqual(onboardingCall, {
    telegramUserId: 123,
    chatId: 456,
    username: "new_user",
    displayName: "New User"
  });
  assert.match(response, /Your Telegram account is linked to FT2/i);
  assert.match(response, /Start flow: ft2_signup/);
  assert.match(response, /Login: https:\/\/ft2\.test\/login\?token=usr_test_1/);
});
