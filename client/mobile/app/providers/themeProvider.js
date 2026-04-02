/**
 * ================================================================================
 * CRANEAPP — THEME PROVIDER (UI ENGINE)
 * ================================================================================
 * Файл: client/mobile/app/providers/themeProvider.js
 * Назначение: Управление визуальными темами, CSS-переменными и системными стилями.
 * ================================================================================
 */

export class ThemeProvider {
    constructor() {
        // Доступные темы приложения
        this.themes = {
            DARK: 'dark-theme',
            LIGHT: 'light-theme',
            TELEGRAM: 'telegram-theme',
            NEON: 'neon-purple-theme' // Наша фирменная тема
        };

        this.currentTheme = null;
        this.storageKey = 'craneapp_theme_preference';
        
        // Слушатель системных изменений темы (Dark Mode в iOS/Android/Windows)
        this.systemThemeMatcher = window.matchMedia('(prefers-color-scheme: dark)');
    }

    /**
     * Инициализация темы при запуске приложения
     */
    async init() {
        console.log('[ThemeProvider] Initializing UI styles...');
        
        // 1. Пытаемся достать выбор пользователя из LocalStorage
        const savedTheme = localStorage.getItem(this.storageKey);
        
        // 2. Если выбора нет — смотрим на системные настройки
        if (savedTheme && Object.values(this.themes).includes(savedTheme)) {
            this.currentTheme = savedTheme;
        } else {
            this.currentTheme = this.systemThemeMatcher.matches ? this.themes.NEON : this.themes.LIGHT;
        }

        // 3. Применяем тему к документу
        this.applyTheme(this.currentTheme);
        
        // 4. Подписываемся на изменения системы (если пользователь не выбрал тему вручную)
        this.listenToSystemChanges();
    }

    /**
     * Применение темы через манипуляцию классами на теге <html>
     * и обновление мета-тегов (для цвета статус-бара на мобильных)
     * @param {string} themeClass 
     */
    applyTheme(themeClass) {
        const root = document.documentElement;
        
        // Удаляем все старые классы тем
        Object.values(this.themes).forEach(t => root.classList.remove(t));
        
        // Добавляем новую
        root.classList.add(themeClass);
        this.currentTheme = themeClass;

        // Обновляем theme-color для мобильных браузеров (цвет статус-бара)
        this.updateMetaThemeColor();

        // Сохраняем выбор
        localStorage.setItem(this.storageKey, themeClass);

        // Уведомляем систему (например, для перерисовки графиков или специфических компонентов)
        window.dispatchEvent(new CustomEvent('theme:changed', { detail: { theme: themeClass } }));
        
        console.log(`[ThemeProvider] Applied: ${themeClass}`);
    }

    /**
     * Смена темы вручную пользователем
     */
    setTheme(themeKey) {
        if (this.themes[themeKey]) {
            this.applyTheme(this.themes[themeKey]);
        }
    }

    /**
     * Переключение "День/Ночь"
     */
    toggleDarkLight() {
        if (this.currentTheme === this.themes.LIGHT) {
            this.applyTheme(this.themes.NEON);
        } else {
            this.applyTheme(this.themes.LIGHT);
        }
    }

    /**
     * Обновление цвета браузерного интерфейса (Chrome Android / Safari iOS)
     */
    updateMetaThemeColor() {
        let color = '#0f0f18'; // Дефолт (Neon/Dark)
        
        if (this.currentTheme === this.themes.LIGHT) color = '#ffffff';
        if (this.currentTheme === this.themes.TELEGRAM) color = '#242f3d';

        let metaTag = document.querySelector('meta[name="theme-color"]');
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.name = "theme-color";
            document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', color);
    }

    /**
     * Автоматическое следование за системой
     */
    listenToSystemChanges() {
        this.systemThemeMatcher.addEventListener('change', e => {
            // Применяем системную тему только если пользователь не зафиксировал свой выбор вручную
            // (В данной реализации мы всегда даем приоритет системе, если не сохранен ключ)
            if (!localStorage.getItem(this.storageKey)) {
                const newTheme = e.matches ? this.themes.NEON : this.themes.LIGHT;
                this.applyTheme(newTheme);
            }
        });
    }

    /**
     * Геттер для получения текущего состояния (нужно для JS-логики компонентов)
     */
    isDark() {
        return this.currentTheme !== this.themes.LIGHT;
    }

    /**
     * Метод для динамического получения значения CSS-переменной
     * @param {string} varName - например '--accent-primary'
     */
    getVariable(varName) {
        return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    }
}
