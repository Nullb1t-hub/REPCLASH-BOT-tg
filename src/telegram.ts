export function initTelegram(){window.Telegram?.WebApp?.ready();window.Telegram?.WebApp?.expand()}
export function telegramUserName(){const u=window.Telegram?.WebApp?.initDataUnsafe?.user;return u?.first_name||u?.username||"PLAYER"}
export function openTelegramLink(url:string){if(window.Telegram?.WebApp?.openTelegramLink)window.Telegram.WebApp.openTelegramLink(url);else window.open(url,"_blank")}
declare global{interface Window{Telegram?:{WebApp?:{ready():void;expand():void;openTelegramLink?(url:string):void;initData?:string;initDataUnsafe?:{user?:{first_name?:string;username?:string;photo_url?:string}}}}}}
