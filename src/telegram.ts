export function initTelegram() {
  const app = window.Telegram?.WebApp;
  app?.ready();
  app?.expand();
}

export function telegramUserName(): string {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  return user?.first_name || user?.username || "PLAYER";
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready(): void;
        expand(): void;
        close(): void;
        initData?: string;
        initDataUnsafe?: { user?: { first_name?: string; username?: string } };
      };
    };
  }
}
