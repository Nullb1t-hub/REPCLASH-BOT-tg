export function initTelegram(){window.Telegram?.WebApp?.ready();window.Telegram?.WebApp?.expand()}
export function telegramUserName(){const u=window.Telegram?.WebApp?.initDataUnsafe?.user;return u?.first_name||u?.username||"PLAYER"}
export function openTelegramLink(url:string){if(window.Telegram?.WebApp?.openTelegramLink)window.Telegram.WebApp.openTelegramLink(url);else window.open(url,"_blank")}
declare global{interface ImportMetaEnv{readonly VITE_TELEGRAM_MINI_APP_URL?:string}interface ImportMeta{readonly env:ImportMetaEnv}interface Window{Telegram?:{WebApp?:{ready():void;expand():void;openTelegramLink?(url:string):void;initData?:string;initDataUnsafe?:{start_param?:string;user?:{first_name?:string;username?:string;photo_url?:string}}}}}}
