import type { Market } from '@/types'

export const MARKETS: Market[] = [
  { sym: 'BTCUSDT',  display: 'BTC/USDT',  ico: '₿', color: '#f7931a', base: 'BTC'  },
  { sym: 'ETHUSDT',  display: 'ETH/USDT',  ico: 'Ξ', color: '#627eea', base: 'ETH'  },
  { sym: 'SOLUSDT',  display: 'SOL/USDT',  ico: '◎', color: '#9945ff', base: 'SOL'  },
  { sym: 'BNBUSDT',  display: 'BNB/USDT',  ico: 'B', color: '#f3ba2f', base: 'BNB'  },
  { sym: 'XRPUSDT',  display: 'XRP/USDT',  ico: '✕', color: '#346aa9', base: 'XRP'  },
  { sym: 'ADAUSDT',  display: 'ADA/USDT',  ico: '₳', color: '#0033ad', base: 'ADA'  },
  { sym: 'DOGEUSDT', display: 'DOGE/USDT', ico: 'Ð', color: '#c2a633', base: 'DOGE' },
  { sym: 'AVAXUSDT', display: 'AVAX/USDT', ico: 'A', color: '#e84142', base: 'AVAX' },
]

export const C = {
  bg0: '#06080f', bg1: '#0c1120', bg2: '#111827', bg3: '#172033',
  border: 'rgba(255,255,255,0.06)', borderH: 'rgba(255,255,255,0.12)',
  t1: '#e8eeff', t2: '#6b7fa3', t3: '#3a4d70',
  gold: '#f0b429', goldD: '#b8831a',
  goldBg: 'rgba(240,180,41,0.08)', goldB: 'rgba(240,180,41,0.22)',
  green: '#0ecf97', greenDim: 'rgba(14,207,151,0.1)', greenB: 'rgba(14,207,151,0.22)',
  red: '#f43f5e', redDim: 'rgba(244,63,94,0.1)', redB: 'rgba(244,63,94,0.22)',
  purple: '#7c3aed', purpleDim: 'rgba(124,58,237,0.1)', purpleB: 'rgba(124,58,237,0.3)',
  blue: '#3b82f6', blueDim: 'rgba(59,130,246,0.1)', blueB: 'rgba(59,130,246,0.25)',
} as const

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Outfit', system-ui, sans-serif; background: #06080f; color: #e8eeff; overflow: hidden; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e2d4a; border-radius: 2px; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px #0c1120 inset !important; -webkit-text-fill-color: #e8eeff !important; }
  input:focus, textarea:focus { outline: none; }
  button { font-family: inherit; cursor: pointer; }
  @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(14,207,151,0.4) } 50% { box-shadow: 0 0 0 5px rgba(14,207,151,0) } }
  @keyframes flashUp   { 0% { color: #0ecf97 } 100% { color: #e8eeff } }
  @keyframes flashDown { 0% { color: #f43f5e } 100% { color: #e8eeff } }
  .pu { animation: pulse 2s infinite; }
  .fu { animation: flashUp   0.6s ease-out forwards; }
  .fd { animation: flashDown 0.6s ease-out forwards; }
  @keyframes spin { to { transform: rotate(360deg) } }
  .spin { animation: spin 1s linear infinite; }
  @keyframes slideIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
  .si { animation: slideIn 0.22s ease-out forwards; }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  .fi { animation: fadeIn 0.3s ease-out forwards; }
  /* Mobile safe area */
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
`

// ─── Translations ─────────────────────────────────────────────────────────────
export interface Translations {
  welcome: string; createAccount: string; signIn: string; signUp: string
  email: string; password: string; noAccount: string; haveAccount: string
  tagline: string; dashboard: string; exchanges: string; portfolio: string
  orders: string; settings: string; logout: string; markets: string; search: string
  chart: string; orderBook: string; aiAssistant: string; placeOrder: string
  buy: string; sell: string; market: string; limit: string; stopLoss: string
  takeProfit: string; trailingStop: string; size: string; limitPrice: string
  stopPrice: string; trailingDelta: string; available: string
  totalBalance: string; totalPnl: string; holdings: string
  asset: string; amount: string; value: string; pnl: string
  apiKey: string; secretKey: string; connectExchange: string
  connected: string; disconnect: string; saveKeys: string; keysWarning: string
  language: string; profile: string; save: string
  liveTrading: string; paperTrading: string
  askAnything: string; confirmOrder: string; cancel: string
  timeInForce: string; orderHistory: string; noOrders: string; startTrading: string
  indicators: string; interval: string; drawLevel: string
  rsi: string; macd: string; none: string
}

export const T: Record<string, Translations> = {
  EN: {
    welcome: 'Welcome Back', createAccount: 'Create Account',
    signIn: 'Sign In', signUp: 'Sign Up',
    email: 'Email', password: 'Password',
    noAccount: "Don't have an account?", haveAccount: 'Already have an account?',
    tagline: 'Professional crypto trading platform',
    dashboard: 'Dashboard', exchanges: 'Exchanges', portfolio: 'Portfolio',
    orders: 'Orders', settings: 'Settings', logout: 'Logout',
    markets: 'Markets', search: 'Search markets...',
    chart: 'Chart', orderBook: 'Order Book', aiAssistant: 'AI Assistant',
    placeOrder: 'Place Order', buy: 'Buy', sell: 'Sell',
    market: 'Market', limit: 'Limit', stopLoss: 'Stop Loss',
    takeProfit: 'Take Profit', trailingStop: 'Trailing Stop',
    size: 'Size (USDT)', limitPrice: 'Limit Price', stopPrice: 'Stop Price',
    trailingDelta: 'Trailing Delta (%)', available: 'Available',
    totalBalance: 'Total Balance', totalPnl: 'Total P&L', holdings: 'Holdings',
    asset: 'Asset', amount: 'Amount', value: 'Value', pnl: 'P&L',
    apiKey: 'API Key', secretKey: 'Secret Key',
    connectExchange: 'Connect Exchange', connected: 'Connected', disconnect: 'Disconnect',
    saveKeys: 'Save Keys Securely', keysWarning: 'Keys are encrypted AES-256 on the server. Never stored in browser.',
    language: 'Language', profile: 'Profile', save: 'Save',
    liveTrading: 'Live Trading', paperTrading: 'Paper Trading',
    askAnything: 'Ask about markets or say "Buy BTC for $100 if price drops to 60000"…',
    confirmOrder: 'Confirm Order', cancel: 'Cancel',
    timeInForce: 'Time In Force', orderHistory: 'Order History',
    noOrders: 'No orders yet', startTrading: 'Start Trading',
    indicators: 'Indicators', interval: 'Interval', drawLevel: 'Draw Level',
    rsi: 'RSI', macd: 'MACD', none: 'None',
  },
  RU: {
    welcome: 'С возвращением', createAccount: 'Создать аккаунт',
    signIn: 'Войти', signUp: 'Регистрация',
    email: 'Email', password: 'Пароль',
    noAccount: 'Нет аккаунта?', haveAccount: 'Уже есть аккаунт?',
    tagline: 'Профессиональная крипто-торговая платформа',
    dashboard: 'Дашборд', exchanges: 'Биржи', portfolio: 'Портфель',
    orders: 'Ордера', settings: 'Настройки', logout: 'Выйти',
    markets: 'Рынки', search: 'Поиск...',
    chart: 'График', orderBook: 'Стакан', aiAssistant: 'ИИ Ассистент',
    placeOrder: 'Разместить ордер', buy: 'Купить', sell: 'Продать',
    market: 'Рыночный', limit: 'Лимит', stopLoss: 'Стоп-лосс',
    takeProfit: 'Тейк-профит', trailingStop: 'Трейлинг-стоп',
    size: 'Размер (USDT)', limitPrice: 'Лимитная цена', stopPrice: 'Стоп цена',
    trailingDelta: 'Трейлинг дельта (%)', available: 'Доступно',
    totalBalance: 'Общий баланс', totalPnl: 'Общий P&L', holdings: 'Активы',
    asset: 'Актив', amount: 'Количество', value: 'Стоимость', pnl: 'P&L',
    apiKey: 'API Ключ', secretKey: 'Секретный ключ',
    connectExchange: 'Подключить биржу', connected: 'Подключено', disconnect: 'Отключить',
    saveKeys: 'Сохранить ключи', keysWarning: 'Ключи шифруются AES-256 на сервере. В браузере не хранятся.',
    language: 'Язык', profile: 'Профиль', save: 'Сохранить',
    liveTrading: 'Реальная торговля', paperTrading: 'Демо-торговля',
    askAnything: 'Спросите о рынке или "Купи BTC на $100 если цена упадёт до 60000"…',
    confirmOrder: 'Подтвердить ордер', cancel: 'Отмена',
    timeInForce: 'Срок действия', orderHistory: 'История ордеров',
    noOrders: 'Ордеров нет', startTrading: 'Начать торговлю',
    indicators: 'Индикаторы', interval: 'Интервал', drawLevel: 'Нарисовать уровень',
    rsi: 'RSI', macd: 'MACD', none: 'Нет',
  },
  UA: {
    welcome: 'З поверненням', createAccount: 'Створити акаунт',
    signIn: 'Увійти', signUp: 'Реєстрація',
    email: 'Email', password: 'Пароль',
    noAccount: 'Немає акаунту?', haveAccount: 'Вже є акаунт?',
    tagline: 'Професійна крипто-торгова платформа',
    dashboard: 'Дашборд', exchanges: 'Біржі', portfolio: 'Портфель',
    orders: 'Ордери', settings: 'Налаштування', logout: 'Вийти',
    markets: 'Ринки', search: 'Пошук...',
    chart: 'Графік', orderBook: 'Стакан', aiAssistant: 'ІІ Асистент',
    placeOrder: 'Розмістити ордер', buy: 'Купити', sell: 'Продати',
    market: 'Ринковий', limit: 'Ліміт', stopLoss: 'Стоп-лосс',
    takeProfit: 'Тейк-профіт', trailingStop: 'Трейлінг-стоп',
    size: 'Розмір (USDT)', limitPrice: 'Лімітна ціна', stopPrice: 'Стоп ціна',
    trailingDelta: 'Трейлінг дельта (%)', available: 'Доступно',
    totalBalance: 'Загальний баланс', totalPnl: 'Загальний P&L', holdings: 'Активи',
    asset: 'Актив', amount: 'Кількість', value: 'Вартість', pnl: 'P&L',
    apiKey: 'API Ключ', secretKey: 'Секретний ключ',
    connectExchange: 'Підключити біржу', connected: 'Підключено', disconnect: 'Відключити',
    saveKeys: 'Зберегти ключі', keysWarning: 'Ключі шифруються AES-256 на сервері. У браузері не зберігаються.',
    language: 'Мова', profile: 'Профіль', save: 'Зберегти',
    liveTrading: 'Реальна торгівля', paperTrading: 'Демо-торгівля',
    askAnything: 'Запитайте про ринок або "Купи BTC на $100 якщо ціна впаде до 60000"…',
    confirmOrder: 'Підтвердити ордер', cancel: 'Скасувати',
    timeInForce: 'Строк дії', orderHistory: 'Історія ордерів',
    noOrders: 'Ордерів немає', startTrading: 'Почати торгівлю',
    indicators: 'Індикатори', interval: 'Інтервал', drawLevel: 'Намалювати рівень',
    rsi: 'RSI', macd: 'MACD', none: 'Немає',
  },
}

export type IndicatorType = 'RSI' | 'MACD' | 'NONE'
