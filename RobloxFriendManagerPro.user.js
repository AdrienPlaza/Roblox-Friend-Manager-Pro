// ==UserScript==
// @name         Roblox Friend Manager Pro
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Advanced GUI to mass-manage, filter, export and delete your Roblox friends
// @author       AdrienPlaza
// @match        https://www.roblox.com/*
// @match        https://web.roblox.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    console.log('[RFM] Script loaded! (v1)');

    // ================================================================
    // CONFIG
    // ================================================================
    const CONFIG = {
        API_BASE: 'https://friends.roblox.com',
        USERS_API: 'https://users.roblox.com',
        THUMBNAIL_API: 'https://thumbnails.roblox.com',
        PRESENCE_API: 'https://presence.roblox.com',
        AUTH_API: 'https://users.roblox.com',
        BATCH_SIZE: 50,
        UNFRIEND_DELAY: 800,
        UNFRIEND_DELAY_MAX: 4000,
        MAX_RETRIES: 3,
        MAX_PAGES: 50,
    };

    // ================================================================
    // DEFAULT SETTINGS
    // ================================================================
    const DEFAULT_SETTINGS = {
        lang: 'en',
        theme: 'dark',
        accent: '#ff6b81',
        unfriendDelay: 800,
        toastsEnabled: true,
        soundsEnabled: true,
        shortcuts: {
            selectAll: 'alt+a',
            deselectAll: 'alt+d',
            deleteSelected: 'alt+delete',
            closePanel: 'escape',
            openSettings: 'alt+s',
            openHelp: 'alt+h',
            toggleTheme: 'alt+t',
        },
    };

    // ================================================================
    // LOAD / SAVE SETTINGS
    // ================================================================
    function loadSettings() {
        const saved = GM_getValue('rfm_settings', null);
        if (!saved) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        return {
            ...DEFAULT_SETTINGS,
            ...saved,
            shortcuts: { ...DEFAULT_SETTINGS.shortcuts, ...(saved.shortcuts || {}) }
        };
    }

    function saveSettings(s) {
        GM_setValue('rfm_settings', s);
    }

    let settings = loadSettings();
    let whitelist = GM_getValue('rfm_whitelist', []);
    let history = GM_getValue('rfm_history', []);

    const ACCENTS = [
        { name: 'Pink', value: '#ff6b81' },
        { name: 'Red', value: '#e74c3c' },
        { name: 'Orange', value: '#f39c12' },
        { name: 'Green', value: '#2ecc71' },
        { name: 'Blue', value: '#3498db' },
        { name: 'Purple', value: '#9b59b6' },
    ];

    // ================================================================
    // I18N
    // ================================================================
    const I18N = {
        en: {
            title: 'Friend Manager',
            total: 'Total', selected: 'Selected', online: 'Online', ingame: 'In game',
            offline: 'Offline', whitelist: 'Whitelist',
            search: 'Search by name or ID...', all: 'All', none: 'None', invert: 'Invert',
            onlineOnly: 'Online only',
            deleteSelected: 'Delete selection', deleteAll: 'DELETE ALL',
            export: 'Export', settings: 'Settings', help: 'Help', close: 'Close',
            confirm: 'Confirm', cancel: 'Cancel',
            loading: 'Loading your friends...', noFriend: 'No friend', noResult: 'No friend found',
            selectFirst: 'No friend selected!',
            deleting: 'Deleting', deleteQ: 'Delete selection?', deleteAllQ: 'DELETE ALL FRIENDS?',
            irreversible: 'This action cannot be undone.', irreversibleBig: '⚠️ IRREVERSIBLE!',
            ready: 'Friend Manager Pro ready!', loaded: 'friends loaded!', deleted: 'friend(s) deleted!',
            failed: 'Failed', error: 'Error',
            pause: 'Pause', resume: 'Resume', paused: 'Paused', resumed: 'Resumed',
            exportCsv: 'Export as CSV', exportJson: 'Export as JSON',
            theme: 'Theme', dark: 'Dark', light: 'Light', lang: 'Language',
            openProfile: 'Open profile', addWhitelist: 'Add to whitelist',
            removeWhitelist: 'Remove from whitelist', whitelisted: 'Whitelisted',
            history: 'History', noHistory: 'No history yet',
            accent: 'Accent color', unfriendDelay: 'Delay between deletions',
            toasts: 'Show notifications', sounds: 'Enable sounds',
            shortcuts: 'Keyboard shortcuts', resetSettings: 'Reset settings',
            resetConfirm: 'Reset all settings to default?',
            settingsSaved: 'Settings saved!',
            pressKeys: 'Press keys...',
            helpTitle: 'Help & Shortcuts',
            helpIntro: 'This is your control center for managing Roblox friends. You can filter, select, export and delete friends in bulk.',
            helpShortcuts: 'Keyboard shortcuts',
            helpActions: 'How to use',
            helpTips: 'Tips',
            helpTip1: 'Right-click a friend to open the context menu (profile, whitelist, delete).',
            helpTip2: 'Whitelisted friends are protected and cannot be deleted. Use the ☆ button to add someone.',
            helpTip3: 'Always export your friend list before mass deletion, in case you want to re-add them.',
            helpTip4: 'Increase the delay in Settings if Roblox starts blocking your requests.',
            helpStep1: 'Search and filter friends using the toolbar.',
            helpStep2: 'Click on a friend (or their checkbox) to select them.',
            helpStep3: 'Use the red button to delete the selection, or "DELETE ALL" for a full wipe.',
            helpStep4: 'Use the ⚙️ gear icon to open settings, and ❓ for this help panel.',
            shortcutSelectAll: 'Select all friends',
            shortcutDeselectAll: 'Deselect all',
            shortcutDeleteSelected: 'Delete selected friends',
            shortcutClosePanel: 'Close panel or modal',
            shortcutOpenSettings: 'Open settings',
            shortcutOpenHelp: 'Open help',
            shortcutToggleTheme: 'Toggle theme (dark/light)',
            manageWhitelist: 'Manage whitelist',
            manageHistory: 'View history',
            clearHistory: 'Clear history',
            clearWhitelist: 'Clear whitelist',
            noWhitelist: 'No friend in whitelist',
            remove: 'Remove', at: 'at',
            soundOn: 'Sound enabled', soundOff: 'Sound disabled',
            toastsOn: 'Notifications enabled', toastsOff: 'Notifications disabled',
            sortBy: 'Sort by',
            sortName: 'Name (A-Z)',
            sortNameDesc: 'Name (Z-A)',
            sortId: 'User ID (asc)',
            sortIdDesc: 'User ID (desc)',
            sortOnline: 'Online first',
            sortOffline: 'Offline first',
            settingsAppearance: 'Appearance',
            settingsBehaviour: 'Behaviour',
            settingsShortcuts: 'Shortcuts',
            settingsData: 'Data',
            settingsShortcutsHint: 'Click a key to change it. Press Escape to cancel.',
            settingsDelayHint: 'Increase this if Roblox blocks you during mass deletion.',
            settingsResetHint: 'Restore all settings to default values.',
            settingsWhitelistHint: 'Friends you never want to delete.',
            settingsHistoryHint: 'Log of every deletion you made.',
        },
        fr: {
            title: 'Gestionnaire d\'amis',
            total: 'Total', selected: 'Sélectionnés', online: 'En ligne', ingame: 'En jeu',
            offline: 'Hors ligne', whitelist: 'Liste blanche',
            search: 'Rechercher par nom ou ID...', all: 'Tout', none: 'Aucun', invert: 'Inverser',
            onlineOnly: 'En ligne uniquement',
            deleteSelected: 'Supprimer sélection', deleteAll: 'TOUT supprimer',
            export: 'Exporter', settings: 'Paramètres', help: 'Aide', close: 'Fermer',
            confirm: 'Confirmer', cancel: 'Annuler',
            loading: 'Chargement de tes amis...', noFriend: 'Aucun ami', noResult: 'Aucun ami trouvé',
            selectFirst: 'Aucun ami sélectionné !',
            deleting: 'Suppression de', deleteQ: 'Supprimer la sélection ?', deleteAllQ: 'SUPPRIMER TOUS LES AMIS ?',
            irreversible: 'Cette action est irréversible.', irreversibleBig: '⚠️ IRRÉVERSIBLE !',
            ready: 'Friend Manager Pro prêt !', loaded: 'amis chargés !', deleted: 'ami(s) supprimé(s) !',
            failed: 'Échec', error: 'Erreur',
            pause: 'Pause', resume: 'Reprendre', paused: 'En pause', resumed: 'Repris',
            exportCsv: 'Exporter en CSV', exportJson: 'Exporter en JSON',
            theme: 'Thème', dark: 'Sombre', light: 'Clair', lang: 'Langue',
            openProfile: 'Ouvrir le profil', addWhitelist: 'Ajouter à la liste blanche',
            removeWhitelist: 'Retirer de la liste blanche', whitelisted: 'Protégé',
            history: 'Historique', noHistory: 'Aucun historique',
            accent: 'Couleur d\'accent', unfriendDelay: 'Délai entre les suppressions',
            toasts: 'Afficher les notifications', sounds: 'Activer les sons',
            shortcuts: 'Raccourcis clavier', resetSettings: 'Réinitialiser',
            resetConfirm: 'Réinitialiser tous les paramètres ?',
            settingsSaved: 'Paramètres sauvegardés !',
            pressKeys: 'Appuie sur les touches...',
            helpTitle: 'Aide & Raccourcis',
            helpIntro: 'Voici ton centre de contrôle pour gérer tes amis Roblox. Tu peux filtrer, sélectionner, exporter et supprimer en masse.',
            helpShortcuts: 'Raccourcis clavier',
            helpActions: 'Comment utiliser',
            helpTips: 'Astuces',
            helpTip1: 'Clic droit sur un ami pour ouvrir le menu contextuel (profil, liste blanche, supprimer).',
            helpTip2: 'Les amis en liste blanche sont protégés et ne peuvent pas être supprimés. Utilise le bouton ☆ pour en ajouter.',
            helpTip3: 'Exporte toujours ta liste d\'amis avant une grosse suppression, au cas où tu voudrais les re-ajouter.',
            helpTip4: 'Augmente le délai dans les paramètres si Roblox commence à bloquer tes requêtes.',
            helpStep1: 'Recherche et filtre tes amis avec la barre d\'outils.',
            helpStep2: 'Clique sur un ami (ou sa case) pour le sélectionner.',
            helpStep3: 'Utilise le bouton rouge pour supprimer la sélection, ou "TOUT supprimer" pour tout effacer.',
            helpStep4: 'Utilise l\'icône ⚙️ pour les paramètres et ❓ pour ce panneau d\'aide.',
            shortcutSelectAll: 'Sélectionner tous les amis',
            shortcutDeselectAll: 'Tout désélectionner',
            shortcutDeleteSelected: 'Supprimer les amis sélectionnés',
            shortcutClosePanel: 'Fermer le panneau ou modal',
            shortcutOpenSettings: 'Ouvrir les paramètres',
            shortcutOpenHelp: 'Ouvrir l\'aide',
            shortcutToggleTheme: 'Basculer le thème (sombre/clair)',
            manageWhitelist: 'Gérer la liste blanche',
            manageHistory: 'Voir l\'historique',
            clearHistory: 'Vider l\'historique',
            clearWhitelist: 'Vider la liste blanche',
            noWhitelist: 'Aucun ami dans la liste blanche',
            remove: 'Retirer', at: 'à',
            soundOn: 'Son activé', soundOff: 'Son désactivé',
            toastsOn: 'Notifications activées', toastsOff: 'Notifications désactivées',
            sortBy: 'Trier par',
            sortName: 'Nom (A-Z)',
            sortNameDesc: 'Nom (Z-A)',
            sortId: 'ID utilisateur (croissant)',
            sortIdDesc: 'ID utilisateur (décroissant)',
            sortOnline: 'En ligne d\'abord',
            sortOffline: 'Hors ligne d\'abord',
            settingsAppearance: 'Apparence',
            settingsBehaviour: 'Comportement',
            settingsShortcuts: 'Raccourcis',
            settingsData: 'Données',
            settingsShortcutsHint: 'Clique sur une touche pour la changer. Échap pour annuler.',
            settingsDelayHint: 'Augmente ce délai si Roblox te bloque pendant une suppression massive.',
            settingsResetHint: 'Restaure tous les paramètres par défaut.',
            settingsWhitelistHint: 'Amis que tu ne veux jamais supprimer.',
            settingsHistoryHint: 'Historique de toutes tes suppressions.',
        },
    };

    function t(key) { return I18N[settings.lang][key] || key; }

    // ================================================================
    // STATE
    // ================================================================
    const state = {
        friends: [],
        selected: new Set(),
        isLoading: false,
        isPaused: false,
        userId: null,
        csrfToken: null,
        searchQuery: '',
        filter: 'all',
        sortBy: 'name',
        uiBuilt: false,
        currentDelay: settings.unfriendDelay,
        listeningShortcut: null,
        shortcutBtn: null,
        shortcutHandler: null,
        shortcutClickOutside: null,
    };

    // ================================================================
    // STYLES
    // ================================================================
    function buildStyles() {
        return `
        :root {
            --rfm-accent: ${settings.accent};
            --rfm-accent2: ${adjustColor(settings.accent, -20)};
        }
        body.rfm-light {
            --rfm-bg1: #f5f5fa;
            --rfm-bg2: #ececf5;
            --rfm-bg3: #ffffff;
            --rfm-fg: #1a1a2e;
            --rfm-fg-dim: #666;
            --rfm-border: rgba(0,0,0,0.08);
        }
        body:not(.rfm-light) {
            --rfm-bg1: #0f0f23;
            --rfm-bg2: #1a1a3e;
            --rfm-bg3: #16213e;
            --rfm-fg: #e8e8e8;
            --rfm-fg-dim: #999;
            --rfm-border: rgba(255,255,255,0.08);
        }
        #rfm-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.75);
            backdrop-filter: blur(10px);
            z-index: 99999;
            display: none;
            align-items: center;
            justify-content: center;
            animation: rfmFadeIn 0.2s ease;
        }
        #rfm-overlay.active { display: flex; }

        #rfm-panel {
            width: 820px; max-width: 96vw;
            height: 86vh; max-height: 920px;
            background: linear-gradient(160deg, var(--rfm-bg1) 0%, var(--rfm-bg2) 50%, var(--rfm-bg3) 100%);
            border-radius: 24px;
            border: 1px solid var(--rfm-border);
            box-shadow: 0 30px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05);
            display: flex; flex-direction: column; overflow: hidden;
            animation: rfmSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: var(--rfm-fg);
            position: relative;
        }
        .rfm-header {
            padding: 18px 24px;
            background: linear-gradient(135deg, var(--rfm-accent2) 0%, var(--rfm-accent) 50%, ${adjustColor(settings.accent, 30)} 100%);
            display: flex; align-items: center; justify-content: space-between;
            flex-shrink: 0; position: relative; overflow: hidden;
        }
        .rfm-header::before {
            content: ""; position: absolute; top: -50%; left: -50%;
            width: 200%; height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
            animation: rfmShine 3s ease-in-out infinite;
        }
        @keyframes rfmShine {
            0%, 100% { transform: translate(-30%, -30%) rotate(0deg); }
            50% { transform: translate(30%, 30%) rotate(180deg); }
        }
        .rfm-header h2 {
            margin: 0; font-size: 22px; font-weight: 800; color: white;
            display: flex; align-items: center; gap: 12px;
            position: relative; z-index: 1;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .rfm-header-actions { display: flex; gap: 8px; position: relative; z-index: 1; }
        .rfm-icon-btn {
            background: rgba(255,255,255,0.2); border: none; color: white;
            width: 36px; height: 36px; border-radius: 50%;
            cursor: pointer; font-size: 16px;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.25s;
        }
        .rfm-icon-btn:hover { background: rgba(255,255,255,0.35); transform: scale(1.1); }
        .rfm-close-btn:hover { transform: rotate(90deg) scale(1.1); }

        .rfm-stats {
            display: flex; gap: 8px; padding: 12px 24px;
            background: rgba(0,0,0,0.25);
            border-bottom: 1px solid var(--rfm-border);
            font-size: 12px; flex-shrink: 0; flex-wrap: wrap;
        }
        .rfm-stat {
            display: flex; align-items: center; gap: 6px;
            padding: 5px 12px; background: rgba(255,255,255,0.04);
            border-radius: 10px;
        }
        .rfm-stat-value { font-weight: 800; color: var(--rfm-accent); font-size: 14px; }

        .rfm-toolbar {
            display: flex; gap: 8px; padding: 14px 24px;
            background: rgba(0,0,0,0.15);
            border-bottom: 1px solid var(--rfm-border);
            flex-wrap: wrap; align-items: center; flex-shrink: 0;
        }
        .rfm-search { flex: 1; min-width: 180px; position: relative; }
        .rfm-search input {
            width: 100%; padding: 11px 14px 11px 40px;
            border-radius: 12px; border: 1px solid var(--rfm-border);
            background: rgba(0,0,0,0.35); color: var(--rfm-fg);
            font-size: 14px; outline: none; transition: all 0.2s;
        }
        .rfm-search input:focus {
            border-color: var(--rfm-accent);
            box-shadow: 0 0 0 3px rgba(255,107,129,0.15);
        }
        .rfm-search::before {
            content: "🔍"; position: absolute; left: 14px; top: 50%;
            transform: translateY(-50%); font-size: 14px; opacity: 0.5;
        }
        .rfm-select {
            padding: 10px 14px;
            border-radius: 12px;
            border: 1px solid var(--rfm-border);
            background: rgba(0,0,0,0.35);
            color: var(--rfm-fg);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            outline: none;
            transition: all 0.2s;
            max-width: 220px;
        }
        .rfm-select:hover { border-color: var(--rfm-accent); }
        .rfm-select option { background: #1a1a3e; color: #e8e8e8; }
        body.rfm-light .rfm-select option { background: #ececf5; color: #1a1a2e; }
        .rfm-btn {
            padding: 10px 16px; border-radius: 12px; border: none;
            font-size: 13px; font-weight: 700; cursor: pointer;
            transition: all 0.2s; display: flex; align-items: center; gap: 6px;
            white-space: nowrap; letter-spacing: 0.3px;
        }
        .rfm-btn-danger {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white; box-shadow: 0 4px 15px rgba(231,76,60,0.3);
        }
        .rfm-btn-danger:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(231,76,60,0.45);
        }
        .rfm-btn-secondary {
            background: rgba(255,255,255,0.06); color: var(--rfm-fg-dim);
            border: 1px solid var(--rfm-border);
        }
        .rfm-btn-secondary:hover:not(:disabled) {
            background: rgba(255,255,255,0.12); color: var(--rfm-fg);
        }
        .rfm-btn.active {
            background: linear-gradient(135deg, var(--rfm-accent2), var(--rfm-accent));
            color: white; border-color: transparent;
        }
        .rfm-btn:disabled {
            opacity: 0.4; cursor: not-allowed; transform: none !important;
        }

        .rfm-list { flex: 1; overflow-y: auto; padding: 10px 18px; }
        .rfm-list::-webkit-scrollbar { width: 8px; }
        .rfm-list::-webkit-scrollbar-thumb {
            background: rgba(255,107,129,0.2); border-radius: 4px;
        }
        .rfm-list::-webkit-scrollbar-thumb:hover { background: rgba(255,107,129,0.35); }

        .rfm-friend {
            display: flex; align-items: center; gap: 14px;
            padding: 12px 16px; margin: 6px 0;
            border-radius: 14px;
            background: rgba(255,255,255,0.025);
            border: 1px solid var(--rfm-border);
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative; overflow: hidden;
        }
        .rfm-friend::after {
            content: ""; position: absolute;
            left: 0; top: 0; bottom: 0; width: 0;
            background: linear-gradient(180deg, var(--rfm-accent2), var(--rfm-accent));
            transition: width 0.3s ease;
            border-radius: 14px 0 0 14px;
        }
        .rfm-friend:hover {
            background: rgba(255,255,255,0.06);
            border-color: rgba(255,107,129,0.2);
            transform: translateX(4px);
        }
        .rfm-friend.selected {
            background: rgba(255,71,87,0.1);
            border-color: rgba(255,71,87,0.35);
        }
        .rfm-friend.selected::after { width: 4px; }
        .rfm-friend.whitelisted {
            border-color: rgba(46,204,113,0.4);
            background: rgba(46,204,113,0.05);
        }
        .rfm-friend-checkbox {
            width: 22px; height: 22px; border-radius: 7px;
            border: 2px solid rgba(255,255,255,0.15);
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; transition: all 0.2s;
            background: rgba(0,0,0,0.2);
        }
        .rfm-friend.selected .rfm-friend-checkbox {
            background: linear-gradient(135deg, var(--rfm-accent2), var(--rfm-accent));
            border-color: transparent;
        }
        .rfm-friend.selected .rfm-friend-checkbox::after {
            content: "✓"; color: white; font-weight: 900; font-size: 12px;
        }
        .rfm-friend-avatar {
            width: 44px; height: 44px; border-radius: 50%;
            object-fit: cover; border: 2px solid var(--rfm-border); flex-shrink: 0;
        }
        .rfm-friend-info { flex: 1; min-width: 0; }
        .rfm-friend-name {
            font-weight: 700; font-size: 14px; color: var(--rfm-fg);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rfm-friend-id {
            font-size: 11px; color: #777; margin-top: 2px;
            font-family: 'SF Mono', monospace;
        }
        .rfm-friend-status {
            display: flex; align-items: center; gap: 6px;
            font-size: 12px; color: var(--rfm-fg-dim);
            font-weight: 500; flex-shrink: 0;
        }
        .rfm-friend-actions {
            display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s;
        }
        .rfm-friend:hover .rfm-friend-actions { opacity: 1; }
        .rfm-mini-btn {
            background: rgba(255,255,255,0.05); border: none;
            color: var(--rfm-fg-dim);
            width: 30px; height: 30px; border-radius: 8px;
            cursor: pointer; font-size: 14px;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
        }
        .rfm-mini-btn:hover { background: rgba(255,255,255,0.15); color: var(--rfm-fg); }
        .rfm-status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .rfm-status-online {
            background: #2ecc71; box-shadow: 0 0 10px rgba(46,204,113,0.5);
            animation: rfmPulse 2s ease-in-out infinite;
        }
        .rfm-status-ingame {
            background: #f39c12; box-shadow: 0 0 10px rgba(243,156,18,0.5);
            animation: rfmPulse 2s ease-in-out infinite;
        }
        .rfm-status-offline { background: #5a5a6e; }
        @keyframes rfmPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

        .rfm-empty { text-align: center; padding: 80px 20px; color: #555; }
        .rfm-empty-icon { font-size: 56px; margin-bottom: 20px; opacity: 0.4; filter: grayscale(1); }
        .rfm-loading {
            display: flex; flex-direction: column; align-items: center;
            justify-content: center; padding: 80px; gap: 20px;
        }
        .rfm-spinner {
            width: 44px; height: 44px;
            border: 3px solid rgba(255,255,255,0.08);
            border-top-color: var(--rfm-accent);
            border-radius: 50%; animation: rfmSpin 0.9s linear infinite;
        }
        @keyframes rfmSpin { to { transform: rotate(360deg); } }

        .rfm-progress-container { padding: 0 24px 12px; flex-shrink: 0; }
        .rfm-progress-bar {
            height: 8px; background: rgba(0,0,0,0.35);
            border-radius: 4px; overflow: hidden; position: relative;
        }
        .rfm-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--rfm-accent2), var(--rfm-accent));
            border-radius: 4px;
            transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            width: 0%;
        }
        .rfm-progress-info {
            display: flex; justify-content: space-between; align-items: center;
            margin-top: 8px; font-size: 12px; color: var(--rfm-fg-dim);
        }

        .rfm-confirm-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.85);
            backdrop-filter: blur(5px); z-index: 100010;
            display: none;
            align-items: center; justify-content: center;
        }
        .rfm-confirm-overlay.active { display: flex; }
        .rfm-confirm-box {
            background: linear-gradient(160deg, var(--rfm-bg1), var(--rfm-bg2));
            border-radius: 24px; padding: 36px;
            max-width: 460px; width: 90%; text-align: center;
            border: 1px solid var(--rfm-border);
            box-shadow: 0 25px 80px rgba(0,0,0,0.6);
            animation: rfmPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rfm-confirm-icon { font-size: 60px; margin-bottom: 16px; }
        .rfm-confirm-title {
            font-size: 22px; font-weight: 800; color: var(--rfm-fg);
            margin-bottom: 12px;
        }
        .rfm-confirm-text {
            color: var(--rfm-fg-dim); font-size: 14px;
            line-height: 1.7; margin-bottom: 24px;
        }
        .rfm-confirm-count { color: var(--rfm-accent); font-weight: 800; font-size: 18px; }
        .rfm-confirm-btns { display: flex; gap: 14px; justify-content: center; }
        .rfm-confirm-btns .rfm-btn { padding: 13px 30px; font-size: 14px; }

        .rfm-toast-container {
            position: fixed; top: 24px; right: 24px;
            z-index: 100020; display: flex; flex-direction: column; gap: 12px;
            pointer-events: none;
        }
        .rfm-toast {
            background: linear-gradient(135deg, var(--rfm-bg2), var(--rfm-bg3));
            border-left: 4px solid var(--rfm-accent);
            border-radius: 14px; padding: 14px 20px;
            color: var(--rfm-fg); font-size: 13px; font-weight: 500;
            box-shadow: 0 12px 40px rgba(0,0,0,0.5);
            animation: rfmToastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1), rfmToastOut 0.3s ease 3.5s forwards;
            max-width: 340px;
            pointer-events: auto;
        }
        .rfm-toast.success { border-left-color: #2ecc71; }
        .rfm-toast.error { border-left-color: #e74c3c; }
        .rfm-toast.info { border-left-color: #3498db; }
        .rfm-toast.warning { border-left-color: #f39c12; }

        #rfm-trigger {
            position: fixed; bottom: 28px; right: 28px;
            width: 62px; height: 62px; border-radius: 50%;
            background: linear-gradient(135deg, var(--rfm-accent2), var(--rfm-accent));
            border: none; color: white; font-size: 26px;
            cursor: pointer;
            box-shadow: 0 8px 30px rgba(255,71,87,0.4), 0 0 0 4px rgba(255,71,87,0.1);
            z-index: 99998;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            animation: rfmTriggerIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #rfm-trigger:hover {
            transform: scale(1.12) rotate(8deg);
            box-shadow: 0 12px 40px rgba(255,71,87,0.55), 0 0 0 6px rgba(255,71,87,0.15);
        }
        #rfm-trigger:active { transform: scale(0.95); }
        #rfm-trigger::after {
            content: attr(data-count); position: absolute;
            top: -5px; right: -5px;
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white; font-size: 12px; font-weight: 800;
            min-width: 22px; height: 22px; border-radius: 11px;
            display: flex; align-items: center; justify-content: center;
            padding: 0 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid var(--rfm-bg1);
        }
        #rfm-trigger[data-count="0"]::after { display: none; }

        .rfm-ctx-menu {
            position: fixed;
            background: var(--rfm-bg2);
            border: 1px solid var(--rfm-border);
            border-radius: 12px; padding: 6px;
            z-index: 100030;
            box-shadow: 0 12px 40px rgba(0,0,0,0.6);
            min-width: 210px; display: none;
            animation: rfmPopIn 0.15s ease;
        }
        .rfm-ctx-menu.active { display: block; }
        .rfm-ctx-item {
            padding: 10px 14px; border-radius: 8px;
            cursor: pointer; font-size: 13px;
            color: var(--rfm-fg);
            display: flex; align-items: center; gap: 10px;
            transition: background 0.15s;
        }
        .rfm-ctx-item:hover { background: rgba(255,255,255,0.08); }
        .rfm-ctx-item.danger { color: #e74c3c; }
        .rfm-ctx-item.success { color: #2ecc71; }

        .rfm-modal {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(6px);
            z-index: 100003;
            display: none;
            align-items: center;
            justify-content: center;
        }
        .rfm-modal.active { display: flex; }
        .rfm-modal-box {
            background: linear-gradient(160deg, var(--rfm-bg1), var(--rfm-bg2));
            border-radius: 20px;
            padding: 28px;
            width: 90%;
            max-width: 580px;
            max-height: 85vh;
            overflow-y: auto;
            border: 1px solid var(--rfm-border);
            box-shadow: 0 25px 80px rgba(0,0,0,0.7);
            animation: rfmPopIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            color: var(--rfm-fg);
        }
        .rfm-modal-header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 20px;
            padding-bottom: 14px;
            border-bottom: 1px solid var(--rfm-border);
        }
        .rfm-modal-title {
            font-size: 20px; font-weight: 800;
            display: flex; align-items: center; gap: 10px;
        }
        .rfm-modal-body { font-size: 14px; line-height: 1.7; }
        .rfm-modal-close {
            background: rgba(255,255,255,0.08); border: none;
            color: var(--rfm-fg);
            width: 32px; height: 32px; border-radius: 50%;
            cursor: pointer; font-size: 18px;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s;
        }
        .rfm-modal-close:hover { background: rgba(255,255,255,0.15); transform: rotate(90deg); }

        .rfm-settings-section {
            margin-bottom: 24px;
            background: rgba(255,255,255,0.02);
            border-radius: 14px;
            padding: 16px 18px;
            border: 1px solid var(--rfm-border);
        }
        .rfm-settings-section:last-child { margin-bottom: 0; }
        .rfm-settings-section-title {
            font-size: 12px; font-weight: 800;
            color: var(--rfm-accent);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
            display: flex; align-items: center; gap: 8px;
        }
        .rfm-settings-section-desc {
            font-size: 11px;
            color: var(--rfm-fg-dim);
            margin-bottom: 12px;
            font-weight: 400;
            font-style: italic;
        }
        .rfm-settings-row {
            display: flex; justify-content: space-between; align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid var(--rfm-border);
            font-size: 13px;
            gap: 14px;
        }
        .rfm-settings-row:last-child { border-bottom: none; }
        .rfm-settings-label {
            color: var(--rfm-fg);
            font-weight: 500;
            display: flex; flex-direction: column; gap: 3px;
            flex: 1;
            min-width: 0;
        }
        .rfm-settings-label-main {
            display: flex; align-items: center; gap: 8px;
        }
        .rfm-settings-hint {
            font-size: 11px;
            color: var(--rfm-fg-dim);
            font-weight: 400;
            font-style: italic;
        }
        .rfm-switch {
            display: flex; gap: 4px;
            background: rgba(0,0,0,0.3);
            border-radius: 8px; padding: 3px;
            flex-shrink: 0;
        }
        .rfm-switch button {
            background: transparent; border: none;
            color: var(--rfm-fg-dim);
            padding: 6px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.2s;
        }
        .rfm-switch button.active {
            background: linear-gradient(135deg, var(--rfm-accent2), var(--rfm-accent));
            color: white;
        }
        .rfm-toggle {
            width: 44px; height: 24px;
            background: rgba(0,0,0,0.4);
            border-radius: 12px;
            position: relative;
            cursor: pointer;
            transition: background 0.3s;
            border: 1px solid var(--rfm-border);
            flex-shrink: 0;
        }
        .rfm-toggle::after {
            content: ""; position: absolute;
            top: 2px; left: 2px;
            width: 18px; height: 18px;
            background: #888;
            border-radius: 50%;
            transition: all 0.3s;
        }
        .rfm-toggle.active {
            background: linear-gradient(135deg, var(--rfm-accent2), var(--rfm-accent));
        }
        .rfm-toggle.active::after {
            left: 22px;
            background: white;
        }
        .rfm-slider {
            width: 160px;
            -webkit-appearance: none;
            height: 6px;
            border-radius: 3px;
            background: rgba(0,0,0,0.4);
            outline: none;
            flex-shrink: 0;
        }
        .rfm-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px; height: 18px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--rfm-accent2), var(--rfm-accent));
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .rfm-color-picker { display: flex; gap: 8px; flex-shrink: 0; }
        .rfm-color-dot {
            width: 26px; height: 26px;
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.2s;
        }
        .rfm-color-dot:hover { transform: scale(1.15); }
        .rfm-color-dot.active {
            border-color: white;
            box-shadow: 0 0 0 3px rgba(255,255,255,0.2);
        }
        .rfm-btn-block {
            width: 100%;
            justify-content: center;
            margin-top: 8px;
        }

        .rfm-shortcut-btn {
            background: rgba(0,0,0,0.4);
            border: 1px solid var(--rfm-border);
            color: var(--rfm-fg);
            padding: 6px 14px;
            border-radius: 8px;
            font-family: 'SF Mono', monospace;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 100px;
            text-align: center;
            flex-shrink: 0;
        }
        .rfm-shortcut-btn:hover {
            background: rgba(255,255,255,0.1);
            border-color: var(--rfm-accent);
        }
        .rfm-shortcut-btn.listening {
            background: linear-gradient(135deg, var(--rfm-accent2), var(--rfm-accent));
            color: white;
            animation: rfmPulse 1s ease-in-out infinite;
        }

        .rfm-help-section {
            margin-bottom: 20px;
            background: rgba(255,255,255,0.02);
            border-radius: 14px;
            padding: 16px 18px;
            border: 1px solid var(--rfm-border);
        }
        .rfm-help-section:last-child { margin-bottom: 0; }
        .rfm-help-section-title {
            font-size: 12px; font-weight: 800;
            color: var(--rfm-accent);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            display: flex; align-items: center; gap: 8px;
        }
        .rfm-help-intro {
            padding: 14px;
            background: linear-gradient(135deg, rgba(255,107,129,0.1), rgba(255,107,129,0.02));
            border-left: 3px solid var(--rfm-accent);
            border-radius: 10px;
            margin-bottom: 20px;
            color: var(--rfm-fg);
            font-size: 13px;
            line-height: 1.6;
        }
        .rfm-shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            border-radius: 8px;
            margin-bottom: 6px;
            background: rgba(255,255,255,0.03);
            gap: 12px;
        }
        .rfm-shortcut-item:hover { background: rgba(255,255,255,0.06); }
        .rfm-shortcut-desc { color: var(--rfm-fg); font-size: 13px; flex: 1; }
        .rfm-kbd {
            display: inline-block;
            background: rgba(0,0,0,0.5);
            border: 1px solid var(--rfm-border);
            border-bottom-width: 2px;
            border-radius: 6px;
            padding: 3px 9px;
            font-family: 'SF Mono', monospace;
            font-size: 11px;
            font-weight: 700;
            color: var(--rfm-fg);
            margin: 0 3px;
        }
        .rfm-help-step {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid var(--rfm-border);
        }
        .rfm-help-step:last-child { border-bottom: none; }
        .rfm-help-step-num {
            background: linear-gradient(135deg, var(--rfm-accent2), var(--rfm-accent));
            color: white;
            width: 26px; height: 26px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-weight: 800; font-size: 13px;
            flex-shrink: 0;
        }
        .rfm-help-step-text {
            color: var(--rfm-fg);
            font-size: 13px;
            line-height: 1.6;
            padding-top: 3px;
        }
        .rfm-tip {
            padding: 10px 14px;
            border-radius: 8px;
            background: rgba(52,152,219,0.1);
            border-left: 3px solid #3498db;
            margin-bottom: 8px;
            font-size: 13px;
            color: var(--rfm-fg);
            line-height: 1.5;
        }
        .rfm-tip::before { content: "💡 "; }

        .rfm-list-item {
            display: flex; align-items: center; gap: 12px;
            padding: 10px 12px;
            background: rgba(255,255,255,0.03);
            border-radius: 10px;
            margin-bottom: 6px;
        }
        .rfm-list-item img {
            width: 32px; height: 32px;
            border-radius: 50%;
            object-fit: cover;
        }
        .rfm-list-item-info { flex: 1; min-width: 0; }
        .rfm-list-item-name {
            font-weight: 600; font-size: 13px;
            color: var(--rfm-fg);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rfm-list-item-meta {
            font-size: 11px;
            color: var(--rfm-fg-dim);
            margin-top: 2px;
        }
        .rfm-list-item-action {
            background: rgba(231,76,60,0.15);
            color: #e74c3c;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
        }
        .rfm-list-item-action:hover { background: rgba(231,76,60,0.3); }

        .rfm-footer-bar {
            display: flex; gap: 10px;
            padding: 14px 24px;
            background: rgba(0,0,0,0.2);
            border-top: 1px solid var(--rfm-border);
            flex-shrink: 0; align-items: center;
        }
        .rfm-badge {
            background: linear-gradient(135deg, var(--rfm-accent2), var(--rfm-accent));
            color: white; font-size: 11px; font-weight: 800;
            padding: 3px 10px; border-radius: 12px; margin-left: 6px;
        }

        @keyframes rfmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rfmSlideUp { from { opacity: 0; transform: translateY(40px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes rfmPopIn { from { opacity: 0; transform: scale(0.88); } to { opacity: 1; transform: scale(1); } }
        @keyframes rfmToastIn { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes rfmToastOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(50px); } }
        @keyframes rfmTriggerIn { from { opacity: 0; transform: scale(0) rotate(-180deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
        `;
    }

    let styleEl = null;
    function refreshStyles() {
        if (styleEl) styleEl.remove();
        styleEl = document.createElement('style');
        styleEl.textContent = buildStyles();
        document.head.appendChild(styleEl);
    }

    function adjustColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    // ================================================================
    // AUDIO ENGINE (persistent context, unlocked on first user gesture)
    // ================================================================
    let audioCtx = null;
    let audioUnlocked = false;

    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            // Resume if suspended (autoplay policy)
            if (audioCtx.state === 'suspended') {
                audioCtx.resume().then(() => {
                    audioUnlocked = true;
                    console.log('[RFM] Audio unlocked');
                }).catch(() => {});
            } else {
                audioUnlocked = true;
            }
        } catch (e) {
            console.warn('[RFM] Audio init failed', e);
        }
    }

    function unlockAudio() {
        if (audioUnlocked) return;
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => {
                audioUnlocked = true;
            }).catch(() => {});
        } else if (audioCtx) {
            audioUnlocked = true;
        }
    }

    function playSound(type) {
        if (!settings.soundsEnabled) return;
        try {
            initAudio();
            if (!audioCtx) return;

            // Try to resume if needed (silently)
            if (audioCtx.state === 'suspended') {
                audioCtx.resume().catch(() => {});
            }

            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            const freqs = { success: 880, error: 280, info: 620, warning: 480 };
            osc.frequency.value = freqs[type] || 600;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {
            // Silent fail — audio is non-critical
        }
    }

    // Unlock audio on first user gesture anywhere on the page
    ['click', 'keydown', 'mousedown', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, unlockAudio, { once: true, capture: true });
    });

    // ================================================================
    // UTILITIES
    // ================================================================
    async function getCSRFToken() {
        if (state.csrfToken) return state.csrfToken;
        try {
            const res = await fetch(`${CONFIG.API_BASE}/v1/users/1/friends/count`, { credentials: 'include' });
            state.csrfToken = res.headers.get('x-csrf-token');
        } catch (e) {}
        return state.csrfToken;
    }

    async function getAuthenticatedUserId() {
        if (state.userId) return state.userId;
        try {
            const res = await fetch(`${CONFIG.AUTH_API}/v1/users/authenticated`, { credentials: 'include' });
            if (!res.ok) throw new Error('Not authenticated');
            const data = await res.json();
            state.userId = data.id;
            return data.id;
        } catch (e) {
            throw new Error('You are not logged in to Roblox');
        }
    }

    async function apiRequest(url, options = {}) {
        const csrf = await getCSRFToken();
        const headers = {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrf || '',
            ...options.headers
        };
        const res = await fetch(url, { credentials: 'include', headers, ...options });
        if (res.status === 403) {
            state.csrfToken = res.headers.get('x-csrf-token');
            if (state.csrfToken && (options._retry || 0) < CONFIG.MAX_RETRIES) {
                return apiRequest(url, { ...options, _retry: (options._retry || 0) + 1 });
            }
        }
        return res;
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    // ================================================================
    // SHORTCUTS ENGINE
    // ================================================================
    function normalizeKey(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        if (e.metaKey) parts.push('meta');
        const key = (e.key || '').toLowerCase();
        if (!['control', 'alt', 'shift', 'meta'].includes(key)) parts.push(key);
        return parts.join('+');
    }

    function matchShortcut(e, shortcutStr) {
        if (!shortcutStr) return false;
        return normalizeKey(e) === shortcutStr.toLowerCase();
    }

    function isTypingInInput(e) {
        const el = e.target;
        if (!el) return false;
        const tag = el.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
    }

    function handleShortcut(e) {
        if (state.listeningShortcut) return;
        if (isTypingInInput(e)) return;

        const s = settings.shortcuts;
        const isPanelOpen = document.getElementById('rfm-overlay')?.classList.contains('active');
        const openModal = document.querySelector('.rfm-modal.active');

        if (matchShortcut(e, s.closePanel)) {
            if (openModal) {
                closeModal(openModal.id);
                e.preventDefault();
                return;
            }
            if (isPanelOpen) {
                closePanel();
                e.preventDefault();
                return;
            }
            return;
        }

        if (!isPanelOpen) return;
        if (openModal) return;

        if (matchShortcut(e, s.selectAll)) {
            e.preventDefault();
            document.getElementById('rfm-btn-select-all').click();
        } else if (matchShortcut(e, s.deselectAll)) {
            e.preventDefault();
            document.getElementById('rfm-btn-select-none').click();
        } else if (matchShortcut(e, s.deleteSelected)) {
            e.preventDefault();
            document.getElementById('rfm-btn-delete-selected').click();
        } else if (matchShortcut(e, s.openSettings)) {
            e.preventDefault();
            openSettingsModal();
        } else if (matchShortcut(e, s.openHelp)) {
            e.preventDefault();
            openHelpModal();
        } else if (matchShortcut(e, s.toggleTheme)) {
            e.preventDefault();
            toggleTheme();
        }
    }

    function formatShortcutDisplay(combo) {
        if (!combo) return '—';
        return combo.split('+').map(k => {
            const u = k.toUpperCase();
            if (u === 'CTRL') return 'Ctrl';
            if (u === 'ALT') return 'Alt';
            if (u === 'SHIFT') return 'Shift';
            if (u === 'META') return 'Meta';
            if (u === 'DELETE') return 'Suppr';
            if (u === 'ESCAPE') return 'Échap';
            return u;
        }).join(' + ');
    }

    function startShortcutListening(btn) {
        if (state.listeningShortcut) cancelShortcutListening();

        const key = btn.dataset.shortcut;
        state.listeningShortcut = key;
        state.shortcutBtn = btn;
        btn.classList.add('listening');
        btn.textContent = t('pressKeys');

        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.key === 'Escape') {
                cancelShortcutListening();
                return;
            }
            if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

            const combo = normalizeKey(e);
            if (!combo) return;

            settings.shortcuts[key] = combo;
            saveSettings(settings);
            cancelShortcutListening();
            showToast(t('settingsSaved'), 'success');
        };

        const clickOutside = (e) => {
            if (!btn.contains(e.target)) cancelShortcutListening();
        };

        state.shortcutHandler = handler;
        state.shortcutClickOutside = clickOutside;

        setTimeout(() => {
            document.addEventListener('keydown', handler, true);
            document.addEventListener('mousedown', clickOutside, true);
        }, 50);
    }

    function cancelShortcutListening() {
        if (state.shortcutHandler) {
            document.removeEventListener('keydown', state.shortcutHandler, true);
            state.shortcutHandler = null;
        }
        if (state.shortcutClickOutside) {
            document.removeEventListener('mousedown', state.shortcutClickOutside, true);
            state.shortcutClickOutside = null;
        }
        if (state.shortcutBtn) {
            const key = state.shortcutBtn.dataset.shortcut;
            state.shortcutBtn.textContent = formatShortcutDisplay(settings.shortcuts[key]);
            state.shortcutBtn.classList.remove('listening');
        }
        state.listeningShortcut = null;
        state.shortcutBtn = null;
    }

    // ================================================================
    // FRIEND FETCHING
    // ================================================================
    async function fetchAllFriends() {
        const userId = await getAuthenticatedUserId();
        const allFriends = [];
        let cursor = null;
        let page = 0;

        while (page < CONFIG.MAX_PAGES) {
            page++;
            const url = `${CONFIG.API_BASE}/v1/users/${userId}/friends/find?userSort=FriendScore&limit=${CONFIG.BATCH_SIZE}${cursor ? '&cursor=' + encodeURIComponent(cursor) : ''}`;
            const res = await fetch(url, { credentials: 'include' });
            if (!res.ok) throw new Error(`API error: ${res.status}`);

            const data = await res.json();
            const ids = (data.PageItems || []).map(f => f.id);
            if (ids.length === 0) break;

            const details = await fetchUserDetails(ids);
            const presence = await fetchUserPresence(ids);

            ids.forEach(id => {
                allFriends.push({
                    id,
                    name: details[id]?.name || `User_${id}`,
                    displayName: details[id]?.displayName || details[id]?.name || `User_${id}`,
                    avatar: details[id]?.avatar || '',
                    isOnline: presence[id]?.isOnline || false,
                    presenceType: presence[id]?.presenceType || 0,
                    lastOnline: presence[id]?.lastOnline || null,
                });
            });

            cursor = data.NextCursor;
            if (!cursor || data.PageItems.length < CONFIG.BATCH_SIZE) break;
            await sleep(200);
        }

        return allFriends;
    }

    async function fetchUserDetails(userIds) {
        const details = {};
        for (let i = 0; i < userIds.length; i += 100) {
            const batch = userIds.slice(i, i + 100);
            try {
                const res = await fetch(`${CONFIG.USERS_API}/v1/users`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userIds: batch, excludeBannedUsers: false })
                });
                const data = await res.json();
                (data.data || []).forEach(u => {
                    details[u.id] = {
                        name: u.name,
                        displayName: u.displayName,
                    };
                });
            } catch (e) {}
        }
        if (userIds.length > 0) {
            try {
                const url = `${CONFIG.THUMBNAIL_API}/v1/users/avatar-headshot?userIds=${userIds.join(',')}&size=150x150&format=Png`;
                const res = await fetch(url, { credentials: 'include' });
                const data = await res.json();
                (data.data || []).forEach(t => {
                    if (details[t.targetId]) details[t.targetId].avatar = t.imageUrl;
                });
            } catch (e) {}
        }
        return details;
    }

    async function fetchUserPresence(userIds) {
        const presence = {};
        try {
            const res = await fetch(`${CONFIG.PRESENCE_API}/v1/presence/users`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds })
            });
            const data = await res.json();
            (data.userPresences || []).forEach(p => {
                presence[p.userId] = {
                    isOnline: p.userPresenceType !== 0,
                    presenceType: p.userPresenceType,
                    lastOnline: p.lastOnline,
                };
            });
        } catch (e) {}
        return presence;
    }

    async function unfriendUser(targetUserId) {
        const res = await apiRequest(`${CONFIG.API_BASE}/v1/users/${targetUserId}/unfriend`, { method: 'POST' });
        return res.ok;
    }

    // ================================================================
    // UI BUILD
    // ================================================================
    function createElement(tag, className, html) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (html) el.innerHTML = html;
        return el;
    }

    function applyTheme() {
        if (settings.theme === 'light') document.body.classList.add('rfm-light');
        else document.body.classList.remove('rfm-light');
    }

    function buildUI() {
        if (state.uiBuilt) return;
        state.uiBuilt = true;
        refreshStyles();
        applyTheme();

        const trigger = createElement('button', '', '🗑️');
        trigger.id = 'rfm-trigger';
        trigger.title = 'Friend Manager Pro';
        trigger.dataset.count = '0';
        trigger.onclick = openPanel;
        document.body.appendChild(trigger);

        const overlay = createElement('div', '', '');
        overlay.id = 'rfm-overlay';
        const panel = createElement('div', '', '');
        panel.id = 'rfm-panel';

        const header = createElement('div', 'rfm-header', `
            <h2>${t('title')}</h2>
            <div class="rfm-header-actions">
                <button class="rfm-icon-btn" id="rfm-btn-help" title="${t('help')}">❓</button>
                <button class="rfm-icon-btn" id="rfm-btn-settings" title="${t('settings')}">⚙️</button>
                <button class="rfm-icon-btn rfm-close-btn" title="${t('close')}">×</button>
            </div>
        `);
        header.querySelector('.rfm-close-btn').onclick = closePanel;

        const stats = createElement('div', 'rfm-stats', `
            <div class="rfm-stat">👥 ${t('total')}: <span class="rfm-stat-value" id="rfm-stat-total">0</span></div>
            <div class="rfm-stat">✅ ${t('selected')}: <span class="rfm-stat-value" id="rfm-stat-selected">0</span></div>
            <div class="rfm-stat">🟢 ${t('online')}: <span class="rfm-stat-value" id="rfm-stat-online">0</span></div>
            <div class="rfm-stat">🎮 ${t('ingame')}: <span class="rfm-stat-value" id="rfm-stat-ingame">0</span></div>
            <div class="rfm-stat">💤 ${t('offline')}: <span class="rfm-stat-value" id="rfm-stat-offline">0</span></div>
            <div class="rfm-stat">🛡️ ${t('whitelist')}: <span class="rfm-stat-value" id="rfm-stat-wl">0</span></div>
        `);

        const toolbar = createElement('div', 'rfm-toolbar', `
            <div class="rfm-search">
                <input type="text" id="rfm-search-input" placeholder="${t('search')}" autocomplete="off">
            </div>
            <select class="rfm-select" id="rfm-sort-select" title="${t('sortBy')}">
                <option value="name" ${state.sortBy === 'name' ? 'selected' : ''}>🔤 ${t('sortName')}</option>
                <option value="nameDesc" ${state.sortBy === 'nameDesc' ? 'selected' : ''}>🔤 ${t('sortNameDesc')}</option>
                <option value="id" ${state.sortBy === 'id' ? 'selected' : ''}>#️⃣ ${t('sortId')}</option>
                <option value="idDesc" ${state.sortBy === 'idDesc' ? 'selected' : ''}>#️⃣ ${t('sortIdDesc')}</option>
                <option value="online" ${state.sortBy === 'online' ? 'selected' : ''}>🟢 ${t('sortOnline')}</option>
                <option value="offline" ${state.sortBy === 'offline' ? 'selected' : ''}>💤 ${t('sortOffline')}</option>
            </select>
            <button class="rfm-btn rfm-btn-secondary" id="rfm-btn-select-all">☑️ ${t('all')}</button>
            <button class="rfm-btn rfm-btn-secondary" id="rfm-btn-select-none">⬜ ${t('none')}</button>
            <button class="rfm-btn rfm-btn-secondary" id="rfm-btn-invert">🔄 ${t('invert')}</button>
            <button class="rfm-btn rfm-btn-secondary" id="rfm-btn-online-only">🟢 ${t('onlineOnly')}</button>
        `);

        const progress = createElement('div', 'rfm-progress-container', `
            <div class="rfm-progress-bar"><div class="rfm-progress-fill" id="rfm-progress"></div></div>
            <div class="rfm-progress-info">
                <div id="rfm-progress-text"></div>
                <button class="rfm-btn rfm-btn-secondary" id="rfm-btn-pause" style="padding:5px 10px;font-size:11px;">⏸️ ${t('pause')}</button>
            </div>
        `);
        progress.style.display = 'none';

        const list = createElement('div', 'rfm-list', '');
        list.id = 'rfm-friends-list';

        const footer = createElement('div', 'rfm-footer-bar', `
            <button class="rfm-btn rfm-btn-danger" id="rfm-btn-delete-selected">🗑️ ${t('deleteSelected')} <span class="rfm-badge" id="rfm-badge-selected">0</span></button>
            <button class="rfm-btn rfm-btn-secondary" id="rfm-btn-export">📤 ${t('export')}</button>
            <div style="flex:1"></div>
            <button class="rfm-btn rfm-btn-danger" id="rfm-btn-delete-all" style="background:linear-gradient(135deg,#c0392b,#922b21);">💀 ${t('deleteAll')}</button>
        `);

        panel.append(header, stats, toolbar, progress, list, footer);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        document.body.appendChild(buildConfirmModal());
        document.body.appendChild(buildSettingsModal());
        document.body.appendChild(buildHelpModal());
        document.body.appendChild(buildWhitelistModal());
        document.body.appendChild(buildHistoryModal());

        const ctxMenu = createElement('div', 'rfm-ctx-menu', '');
        ctxMenu.id = 'rfm-ctx-menu';
        document.body.appendChild(ctxMenu);

        const toastContainer = createElement('div', 'rfm-toast-container', '');
        toastContainer.id = 'rfm-toast-container';
        document.body.appendChild(toastContainer);

        setupEventListeners();
        console.log('[RFM] UI built!');
    }

    function buildConfirmModal() {
        const overlay = createElement('div', 'rfm-confirm-overlay', '');
        overlay.id = 'rfm-confirm-overlay';
        overlay.innerHTML = `
            <div class="rfm-confirm-box">
                <div class="rfm-confirm-icon" id="rfm-confirm-icon">⚠️</div>
                <div class="rfm-confirm-title" id="rfm-confirm-title">${t('confirm')}</div>
                <div class="rfm-confirm-text" id="rfm-confirm-text"></div>
                <div class="rfm-confirm-btns">
                    <button class="rfm-btn rfm-btn-secondary" id="rfm-confirm-cancel">${t('cancel')}</button>
                    <button class="rfm-btn rfm-btn-danger" id="rfm-confirm-ok">${t('confirm')}</button>
                </div>
            </div>
        `;
        return overlay;
    }

    function buildSettingsModal() {
        const modal = createElement('div', 'rfm-modal', '');
        modal.id = 'rfm-settings-modal';
        modal.innerHTML = `
            <div class="rfm-modal-box">
                <div class="rfm-modal-header">
                    <div class="rfm-modal-title">⚙️ ${t('settings')}</div>
                    <button class="rfm-modal-close" data-close-settings>×</button>
                </div>
                <div class="rfm-modal-body">

                    <div class="rfm-settings-section">
                        <div class="rfm-settings-section-title">🎨 ${t('settingsAppearance')}</div>
                        <div class="rfm-settings-section-desc">${t('lang')}, ${t('theme')}, ${t('accent')}</div>
                        <div class="rfm-settings-row">
                            <span class="rfm-settings-label">
                                <div class="rfm-settings-label-main">🌐 ${t('lang')}</div>
                            </span>
                            <div class="rfm-switch" id="rfm-set-lang">
                                <button data-val="en" class="${settings.lang === 'en' ? 'active' : ''}">EN</button>
                                <button data-val="fr" class="${settings.lang === 'fr' ? 'active' : ''}">FR</button>
                            </div>
                        </div>
                        <div class="rfm-settings-row">
                            <span class="rfm-settings-label">
                                <div class="rfm-settings-label-main">🌗 ${t('theme')}</div>
                            </span>
                            <div class="rfm-switch" id="rfm-set-theme">
                                <button data-val="dark" class="${settings.theme === 'dark' ? 'active' : ''}">🌙 ${t('dark')}</button>
                                <button data-val="light" class="${settings.theme === 'light' ? 'active' : ''}">☀️ ${t('light')}</button>
                            </div>
                        </div>
                        <div class="rfm-settings-row">
                            <span class="rfm-settings-label">
                                <div class="rfm-settings-label-main">🎨 ${t('accent')}</div>
                            </span>
                            <div class="rfm-color-picker" id="rfm-set-accent">
                                ${ACCENTS.map(a => `
                                    <div class="rfm-color-dot ${settings.accent === a.value ? 'active' : ''}"
                                         style="background:${a.value}"
                                         data-color="${a.value}"
                                         title="${a.name}"></div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="rfm-settings-section">
                        <div class="rfm-settings-section-title">⚙️ ${t('settingsBehaviour')}</div>
                        <div class="rfm-settings-section-desc">${t('unfriendDelay')}, ${t('toasts')}, ${t('sounds')}</div>
                        <div class="rfm-settings-row">
                            <span class="rfm-settings-label">
                                <div class="rfm-settings-label-main">⏱️ ${t('unfriendDelay')}</div>
                                <div class="rfm-settings-hint" id="rfm-delay-hint">${settings.unfriendDelay} ms · ${t('settingsDelayHint')}</div>
                            </span>
                            <input type="range" min="200" max="4000" step="100" value="${settings.unfriendDelay}" class="rfm-slider" id="rfm-set-delay">
                        </div>
                        <div class="rfm-settings-row">
                            <span class="rfm-settings-label">
                                <div class="rfm-settings-label-main">🔔 ${t('toasts')}</div>
                            </span>
                            <div class="rfm-toggle ${settings.toastsEnabled ? 'active' : ''}" id="rfm-set-toasts"></div>
                        </div>
                        <div class="rfm-settings-row">
                            <span class="rfm-settings-label">
                                <div class="rfm-settings-label-main">🔊 ${t('sounds')}</div>
                            </span>
                            <div class="rfm-toggle ${settings.soundsEnabled ? 'active' : ''}" id="rfm-set-sounds"></div>
                        </div>
                    </div>

                    <div class="rfm-settings-section">
                        <div class="rfm-settings-section-title">⌨️ ${t('settingsShortcuts')}</div>
                        <div class="rfm-settings-section-desc">${t('settingsShortcutsHint')}</div>
                        ${renderShortcutRows()}
                    </div>

                    <div class="rfm-settings-section">
                        <div class="rfm-settings-section-title">🗂️ ${t('settingsData')}</div>
                        <div class="rfm-settings-section-desc">${t('settingsWhitelistHint')} · ${t('settingsHistoryHint')}</div>
                        <button class="rfm-btn rfm-btn-secondary rfm-btn-block" id="rfm-open-whitelist">🛡️ ${t('manageWhitelist')} (${whitelist.length})</button>
                        <button class="rfm-btn rfm-btn-secondary rfm-btn-block" id="rfm-open-history">📜 ${t('manageHistory')} (${history.length})</button>
                        <button class="rfm-btn rfm-btn-danger rfm-btn-block" id="rfm-reset-settings">🔄 ${t('resetSettings')}</button>
                        <div class="rfm-settings-hint" style="text-align:center; margin-top:8px;">${t('settingsResetHint')}</div>
                    </div>

                </div>
            </div>
        `;
        return modal;
    }

    function renderShortcutRows() {
        const actions = [
            { key: 'selectAll', label: t('shortcutSelectAll'), icon: '☑️' },
            { key: 'deselectAll', label: t('shortcutDeselectAll'), icon: '⬜' },
            { key: 'deleteSelected', label: t('shortcutDeleteSelected'), icon: '🗑️' },
            { key: 'closePanel', label: t('shortcutClosePanel'), icon: '❌' },
            { key: 'openSettings', label: t('shortcutOpenSettings'), icon: '⚙️' },
            { key: 'openHelp', label: t('shortcutOpenHelp'), icon: '❓' },
            { key: 'toggleTheme', label: t('shortcutToggleTheme'), icon: '🌗' },
        ];
        return actions.map(a => `
            <div class="rfm-settings-row">
                <span class="rfm-settings-label">
                    <div class="rfm-settings-label-main">${a.icon} ${a.label}</div>
                </span>
                <button class="rfm-shortcut-btn" data-shortcut="${a.key}">${formatShortcutDisplay(settings.shortcuts[a.key])}</button>
            </div>
        `).join('');
    }

    function buildHelpModal() {
        const modal = createElement('div', 'rfm-modal', '');
        modal.id = 'rfm-help-modal';
        modal.innerHTML = `
            <div class="rfm-modal-box">
                <div class="rfm-modal-header">
                    <div class="rfm-modal-title">❓ ${t('helpTitle')}</div>
                    <button class="rfm-modal-close" data-close-help>×</button>
                </div>
                <div class="rfm-modal-body">
                    <div class="rfm-help-intro">${t('helpIntro')}</div>

                    <div class="rfm-help-section">
                        <div class="rfm-help-section-title">📖 ${t('helpActions')}</div>
                        <div class="rfm-help-step">
                            <div class="rfm-help-step-num">1</div>
                            <div class="rfm-help-step-text">${t('helpStep1')}</div>
                        </div>
                        <div class="rfm-help-step">
                            <div class="rfm-help-step-num">2</div>
                            <div class="rfm-help-step-text">${t('helpStep2')}</div>
                        </div>
                        <div class="rfm-help-step">
                            <div class="rfm-help-step-num">3</div>
                            <div class="rfm-help-step-text">${t('helpStep3')}</div>
                        </div>
                        <div class="rfm-help-step">
                            <div class="rfm-help-step-num">4</div>
                            <div class="rfm-help-step-text">${t('helpStep4')}</div>
                        </div>
                    </div>

                    <div class="rfm-help-section">
                        <div class="rfm-help-section-title">⌨️ ${t('helpShortcuts')}</div>
                        ${renderHelpShortcuts()}
                    </div>

                    <div class="rfm-help-section">
                        <div class="rfm-help-section-title">💡 ${t('helpTips')}</div>
                        <div class="rfm-tip">${t('helpTip1')}</div>
                        <div class="rfm-tip">${t('helpTip2')}</div>
                        <div class="rfm-tip">${t('helpTip3')}</div>
                        <div class="rfm-tip">${t('helpTip4')}</div>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    function renderHelpShortcuts() {
        const actions = [
            { key: 'selectAll', label: t('shortcutSelectAll') },
            { key: 'deselectAll', label: t('shortcutDeselectAll') },
            { key: 'deleteSelected', label: t('shortcutDeleteSelected') },
            { key: 'closePanel', label: t('shortcutClosePanel') },
            { key: 'openSettings', label: t('shortcutOpenSettings') },
            { key: 'openHelp', label: t('shortcutOpenHelp') },
            { key: 'toggleTheme', label: t('shortcutToggleTheme') },
        ];
        return actions.map(a => `
            <div class="rfm-shortcut-item">
                <span class="rfm-shortcut-desc">${a.label}</span>
                <span>${formatShortcutHtml(settings.shortcuts[a.key])}</span>
            </div>
        `).join('');
    }

    function formatShortcutHtml(shortcut) {
        if (!shortcut) return '—';
        return shortcut.split('+').map(k => {
            let u = k.toUpperCase();
            if (u === 'CTRL') u = 'Ctrl';
            if (u === 'ALT') u = 'Alt';
            if (u === 'SHIFT') u = 'Shift';
            if (u === 'META') u = 'Meta';
            if (u === 'DELETE') u = 'Suppr';
            if (u === 'ESCAPE') u = 'Échap';
            return `<span class="rfm-kbd">${u}</span>`;
        }).join('+');
    }

    function buildWhitelistModal() {
        const modal = createElement('div', 'rfm-modal', '');
        modal.id = 'rfm-whitelist-modal';
        modal.innerHTML = `
            <div class="rfm-modal-box">
                <div class="rfm-modal-header">
                    <div class="rfm-modal-title">🛡️ ${t('manageWhitelist')}</div>
                    <button class="rfm-modal-close" data-close-whitelist>×</button>
                </div>
                <div class="rfm-modal-body" id="rfm-whitelist-body"></div>
            </div>
        `;
        return modal;
    }

    function buildHistoryModal() {
        const modal = createElement('div', 'rfm-modal', '');
        modal.id = 'rfm-history-modal';
        modal.innerHTML = `
            <div class="rfm-modal-box">
                <div class="rfm-modal-header">
                    <div class="rfm-modal-title">📜 ${t('manageHistory')}</div>
                    <button class="rfm-modal-close" data-close-history>×</button>
                </div>
                <div class="rfm-modal-body" id="rfm-history-body"></div>
            </div>
        `;
        return modal;
    }

    // ================================================================
    // EVENT LISTENERS
    // ================================================================
    function setupEventListeners() {
        document.getElementById('rfm-search-input').addEventListener('input', (e) => {
            state.searchQuery = e.target.value.toLowerCase();
            renderFriends();
        });

        document.getElementById('rfm-sort-select').onchange = (e) => {
            state.sortBy = e.target.value;
            renderFriends();
        };

        document.getElementById('rfm-btn-select-all').onclick = () => {
            getFilteredFriends().forEach(f => {
                if (!whitelist.includes(f.id)) state.selected.add(f.id);
            });
            updateSelectionUI();
            renderFriends();
        };
        document.getElementById('rfm-btn-select-none').onclick = () => {
            state.selected.clear();
            updateSelectionUI();
            renderFriends();
        };
        document.getElementById('rfm-btn-invert').onclick = () => {
            getFilteredFriends().forEach(f => {
                if (whitelist.includes(f.id)) return;
                if (state.selected.has(f.id)) state.selected.delete(f.id);
                else state.selected.add(f.id);
            });
            updateSelectionUI();
            renderFriends();
        };
        document.getElementById('rfm-btn-online-only').onclick = (e) => {
            const btn = e.currentTarget;
            if (state.filter === 'online') {
                state.filter = 'all';
                btn.classList.remove('active');
            } else {
                state.filter = 'online';
                btn.classList.add('active');
            }
            renderFriends();
        };
        document.getElementById('rfm-btn-delete-selected').onclick = () => {
            const ids = Array.from(state.selected).filter(id => !whitelist.includes(id));
            if (ids.length === 0) { showToast(t('selectFirst'), 'error'); return; }
            showConfirm('⚠️', t('deleteQ'),
                `You are about to delete <span class="rfm-confirm-count">${ids.length}</span> friend${ids.length > 1 ? 's' : ''}.<br>${t('irreversible')}`,
                () => deleteFriends(ids));
        };
        document.getElementById('rfm-btn-delete-all').onclick = () => {
            const ids = state.friends.map(f => f.id).filter(id => !whitelist.includes(id));
            if (ids.length === 0) { showToast('No friend to delete', 'error'); return; }
            showConfirm('💀', t('deleteAllQ'),
                `You are about to delete <span class="rfm-confirm-count">${ids.length}</span> friend${ids.length > 1 ? 's' : ''}.<br><br><strong style="color:#e74c3c;">${t('irreversibleBig')}</strong>`,
                () => deleteFriends(ids));
        };
        document.getElementById('rfm-btn-export').onclick = (e) => showExportMenu(e.currentTarget);
        document.getElementById('rfm-btn-help').onclick = openHelpModal;
        document.getElementById('rfm-btn-settings').onclick = openSettingsModal;

        document.getElementById('rfm-btn-pause').onclick = () => {
            state.isPaused = !state.isPaused;
            const btn = document.getElementById('rfm-btn-pause');
            btn.innerHTML = state.isPaused ? `▶️ ${t('resume')}` : `⏸️ ${t('pause')}`;
            showToast(state.isPaused ? t('paused') : t('resumed'), 'info');
        };

        document.getElementById('rfm-overlay').onclick = (e) => {
            if (e.target.id === 'rfm-overlay') closePanel();
        };

        document.addEventListener('keydown', (e) => {
            if (state.listeningShortcut) return;
            handleShortcut(e);
        });

        // Single delegated click handler for all dynamic UI (settings, modals, shortcuts)
        document.addEventListener('click', handleDelegatedClick);

        document.addEventListener('input', (e) => {
            if (e.target.id === 'rfm-set-delay') {
                settings.unfriendDelay = parseInt(e.target.value);
                const hint = document.getElementById('rfm-delay-hint');
                if (hint) hint.innerHTML = settings.unfriendDelay + ' ms · ' + t('settingsDelayHint');
                saveSettings(settings);
            }
        });
    }

    function handleDelegatedClick(e) {
        const target = e.target;

        // Close modals
        if (target.matches('[data-close-settings]')) {
            if (state.listeningShortcut) cancelShortcutListening();
            closeModal('rfm-settings-modal');
            return;
        }
        if (target.matches('[data-close-help]')) { closeModal('rfm-help-modal'); return; }
        if (target.matches('[data-close-whitelist]')) { closeModal('rfm-whitelist-modal'); return; }
        if (target.matches('[data-close-history]')) { closeModal('rfm-history-modal'); return; }

        // Language switch
        const langBtn = target.closest('#rfm-set-lang button');
        if (langBtn) {
            settings.lang = langBtn.dataset.val;
            saveSettings(settings);
            location.reload();
            return;
        }

        // Theme switch
        const themeBtn = target.closest('#rfm-set-theme button');
        if (themeBtn) {
            settings.theme = themeBtn.dataset.val;
            saveSettings(settings);
            applyTheme();
            document.querySelectorAll('#rfm-set-theme button').forEach(b => b.classList.remove('active'));
            themeBtn.classList.add('active');
            return;
        }

        // Accent color
        const accentDot = target.closest('#rfm-set-accent .rfm-color-dot');
        if (accentDot) {
            settings.accent = accentDot.dataset.color;
            saveSettings(settings);
            refreshStyles();
            document.querySelectorAll('#rfm-set-accent .rfm-color-dot').forEach(d => d.classList.remove('active'));
            accentDot.classList.add('active');
            return;
        }

        // Toggle: notifications (use closest to catch child clicks)
        const toastsToggle = target.closest('#rfm-set-toasts');
        if (toastsToggle) {
            settings.toastsEnabled = !settings.toastsEnabled;
            toastsToggle.classList.toggle('active', settings.toastsEnabled);
            saveSettings(settings);
            // Show feedback toast AFTER the change so user sees the result
            if (settings.toastsEnabled) {
                showToast(t('toastsOn'), 'success');
            }
            return;
        }

        // Toggle: sounds
        const soundsToggle = target.closest('#rfm-set-sounds');
        if (soundsToggle) {
            settings.soundsEnabled = !settings.soundsEnabled;
            soundsToggle.classList.toggle('active', settings.soundsEnabled);
            saveSettings(settings);
            if (settings.soundsEnabled) {
                // Unlock then play a test sound
                unlockAudio();
                showToast(t('soundOn'), 'success');
                // Play sound after settings updated
                setTimeout(() => playSound('success'), 50);
            } else {
                showToast(t('soundOff'), 'info');
            }
            return;
        }

        // Reset settings
        if (target.id === 'rfm-reset-settings') {
            showConfirm('🔄', t('resetSettings'), t('resetConfirm'), () => {
                settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
                saveSettings(settings);
                location.reload();
            });
            return;
        }

        // Open whitelist / history
        if (target.id === 'rfm-open-whitelist') { openWhitelistModal(); return; }
        if (target.id === 'rfm-open-history') { openHistoryModal(); return; }

        // Shortcut button listening
        const scBtn = target.closest('.rfm-shortcut-btn');
        if (scBtn) {
            startShortcutListening(scBtn);
            return;
        }
    }

    // ================================================================
    // MODALS
    // ================================================================
    function openSettingsModal() {
        refreshSettingsModal();
        document.getElementById('rfm-settings-modal').classList.add('active');
    }

    function refreshSettingsModal() {
        const modal = document.getElementById('rfm-settings-modal');
        if (!modal) return;
        const body = modal.querySelector('.rfm-modal-body');
        if (!body) return;
        const wlBtn = body.querySelector('#rfm-open-whitelist');
        const hBtn = body.querySelector('#rfm-open-history');
        if (wlBtn) wlBtn.textContent = `🛡️ ${t('manageWhitelist')} (${whitelist.length})`;
        if (hBtn) hBtn.textContent = `📜 ${t('manageHistory')} (${history.length})`;
    }

    function openHelpModal() {
        document.getElementById('rfm-help-modal').classList.add('active');
    }

    function openWhitelistModal() {
        const body = document.getElementById('rfm-whitelist-body');
        if (whitelist.length === 0) {
            body.innerHTML = `<div class="rfm-empty"><div class="rfm-empty-icon">🛡️</div><div>${t('noWhitelist')}</div></div>`;
        } else {
            body.innerHTML = whitelist.map(id => {
                const f = state.friends.find(x => x.id === id);
                return `
                    <div class="rfm-list-item">
                        <img src="${f?.avatar || 'https://tr.rbxcdn.com/53eb0b0a6a25e600b7e88d096282b3f7/150/150/AvatarHeadshot/Png'}">
                        <div class="rfm-list-item-info">
                            <div class="rfm-list-item-name">${f ? escapeHtml(f.displayName) : 'Unknown'}</div>
                            <div class="rfm-list-item-meta">ID: ${id}</div>
                        </div>
                        <button class="rfm-list-item-action" data-remove-wl="${id}">${t('remove')}</button>
                    </div>
                `;
            }).join('') + `
                <button class="rfm-btn rfm-btn-danger rfm-btn-block" id="rfm-clear-whitelist" style="margin-top:14px;">🗑️ ${t('clearWhitelist')}</button>
            `;
            body.querySelectorAll('[data-remove-wl]').forEach(btn => {
                btn.onclick = () => {
                    const id = parseInt(btn.dataset.removeWl);
                    whitelist = whitelist.filter(x => x !== id);
                    GM_setValue('rfm_whitelist', whitelist);
                    updateStats();
                    renderFriends();
                    openWhitelistModal();
                };
            });
            const clearBtn = body.querySelector('#rfm-clear-whitelist');
            if (clearBtn) clearBtn.onclick = () => {
                whitelist = [];
                GM_setValue('rfm_whitelist', whitelist);
                updateStats();
                renderFriends();
                openWhitelistModal();
            };
        }
        document.getElementById('rfm-whitelist-modal').classList.add('active');
    }

    function openHistoryModal() {
        const body = document.getElementById('rfm-history-body');
        if (history.length === 0) {
            body.innerHTML = `<div class="rfm-empty"><div class="rfm-empty-icon">📜</div><div>${t('noHistory')}</div></div>`;
        } else {
            const reversed = [...history].reverse();
            body.innerHTML = reversed.map(h => `
                <div class="rfm-list-item">
                    <div class="rfm-list-item-info">
                        <div class="rfm-list-item-name">${escapeHtml(h.name)}</div>
                        <div class="rfm-list-item-meta">ID: ${h.id} · ${t('at')} ${new Date(h.date).toLocaleString()}</div>
                    </div>
                </div>
            `).join('') + `
                <button class="rfm-btn rfm-btn-danger rfm-btn-block" id="rfm-clear-history" style="margin-top:14px;">🗑️ ${t('clearHistory')}</button>
            `;
            body.querySelector('#rfm-clear-history').onclick = () => {
                history = [];
                GM_setValue('rfm_history', history);
                openHistoryModal();
                showToast('History cleared', 'success');
            };
        }
        document.getElementById('rfm-history-modal').classList.add('active');
    }

    function closeModal(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
        if (id === 'rfm-settings-modal' && state.listeningShortcut) {
            cancelShortcutListening();
        }
    }

    function toggleTheme() {
        settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
        saveSettings(settings);
        applyTheme();
        document.querySelectorAll('#rfm-set-theme button').forEach(b => {
            b.classList.toggle('active', b.dataset.val === settings.theme);
        });
    }

    // ================================================================
    // RENDERING
    // ================================================================
    function getFilteredFriends() {
        let friends = [...state.friends];
        if (state.searchQuery) {
            friends = friends.filter(f =>
                f.name.toLowerCase().includes(state.searchQuery) ||
                f.displayName.toLowerCase().includes(state.searchQuery) ||
                String(f.id).includes(state.searchQuery)
            );
        }
        if (state.filter === 'online') friends = friends.filter(f => f.isOnline);

        return friends.sort((a, b) => {
            switch (state.sortBy) {
                case 'name': return a.name.localeCompare(b.name);
                case 'nameDesc': return b.name.localeCompare(a.name);
                case 'id': return a.id - b.id;
                case 'idDesc': return b.id - a.id;
                case 'online': return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
                case 'offline': return (a.isOnline ? 1 : 0) - (b.isOnline ? 1 : 0);
                default: return a.name.localeCompare(b.name);
            }
        });
    }

    function renderFriends() {
        const list = document.getElementById('rfm-friends-list');
        const friends = getFilteredFriends();

        if (state.isLoading && state.friends.length === 0) {
            list.innerHTML = `<div class="rfm-loading"><div class="rfm-spinner"></div><div>${t('loading')}</div></div>`;
            return;
        }
        if (friends.length === 0) {
            list.innerHTML = `<div class="rfm-empty"><div class="rfm-empty-icon">👻</div><div>${state.searchQuery || state.filter !== 'all' ? t('noResult') : t('noFriend')}</div></div>`;
            return;
        }

        list.innerHTML = friends.map(f => {
            const isSelected = state.selected.has(f.id);
            const isWL = whitelist.includes(f.id);
            const statusClass = f.isOnline ? 'rfm-status-online' : f.presenceType === 2 ? 'rfm-status-ingame' : 'rfm-status-offline';
            const statusText = f.isOnline ? t('online') : f.presenceType === 2 ? t('ingame') : t('offline');

            return `
                <div class="rfm-friend ${isSelected ? 'selected' : ''} ${isWL ? 'whitelisted' : ''}" data-id="${f.id}">
                    <div class="rfm-friend-checkbox"></div>
                    <img class="rfm-friend-avatar" src="${f.avatar || 'https://tr.rbxcdn.com/53eb0b0a6a25e600b7e88d096282b3f7/150/150/AvatarHeadshot/Png'}" loading="lazy">
                    <div class="rfm-friend-info">
                        <div class="rfm-friend-name">
                            ${escapeHtml(f.displayName)}
                            <span style="color:#777;font-weight:400;font-size:12px;">(@${escapeHtml(f.name)})</span>
                            ${isWL ? '🛡️' : ''}
                        </div>
                        <div class="rfm-friend-id">ID: ${f.id}</div>
                    </div>
                    <div class="rfm-friend-status">
                        <div class="rfm-status-dot ${statusClass}"></div>
                        ${statusText}
                    </div>
                    <div class="rfm-friend-actions">
                        <button class="rfm-mini-btn" data-action="profile" data-id="${f.id}" title="${t('openProfile')}">🔗</button>
                        <button class="rfm-mini-btn" data-action="whitelist" data-id="${f.id}" title="${isWL ? t('removeWhitelist') : t('addWhitelist')}">${isWL ? '🛡️' : '☆'}</button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('.rfm-friend').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.rfm-mini-btn')) return;
                const id = parseInt(el.dataset.id);
                if (whitelist.includes(id)) {
                    showToast('🛡️ ' + t('whitelisted'), 'warning');
                    return;
                }
                if (state.selected.has(id)) state.selected.delete(id);
                else state.selected.add(id);
                updateSelectionUI();
                renderFriends();
            });
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e.clientX, e.clientY, parseInt(el.dataset.id));
            });
        });

        list.querySelectorAll('.rfm-mini-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const action = btn.dataset.action;
                if (action === 'profile') {
                    window.open(`https://www.roblox.com/users/${id}/profile`, '_blank');
                } else if (action === 'whitelist') {
                    toggleWhitelist(id);
                }
            });
        });
    }

    function showContextMenu(x, y, id) {
        const menu = document.getElementById('rfm-ctx-menu');
        const f = state.friends.find(x => x.id === id);
        if (!f) return;
        const isWL = whitelist.includes(id);
        menu.innerHTML = `
            <div class="rfm-ctx-item" data-ctx="profile">🔗 ${t('openProfile')}</div>
            <div class="rfm-ctx-item ${isWL ? 'danger' : 'success'}" data-ctx="whitelist">${isWL ? '🛡️ ' + t('removeWhitelist') : '☆ ' + t('addWhitelist')}</div>
            <div class="rfm-ctx-item danger" data-ctx="delete">🗑️ ${t('deleteSelected')}</div>
        `;
        menu.style.left = Math.min(x, window.innerWidth - 230) + 'px';
        menu.style.top = Math.min(y, window.innerHeight - 150) + 'px';
        menu.classList.add('active');

        menu.querySelectorAll('.rfm-ctx-item').forEach(item => {
            item.onclick = () => {
                const action = item.dataset.ctx;
                if (action === 'profile') window.open(`https://www.roblox.com/users/${id}/profile`, '_blank');
                if (action === 'whitelist') toggleWhitelist(id);
                if (action === 'delete') {
                    if (isWL) { showToast('🛡️ ' + t('whitelisted'), 'warning'); return; }
                    showConfirm('⚠️', t('deleteQ'),
                        `You are about to delete <span class="rfm-confirm-count">1</span> friend.<br>${t('irreversible')}`,
                        () => deleteFriends([id]));
                }
                menu.classList.remove('active');
            };
        });
    }

    function toggleWhitelist(id) {
        if (whitelist.includes(id)) {
            whitelist = whitelist.filter(x => x !== id);
            state.selected.add(id);
        } else {
            whitelist.push(id);
            state.selected.delete(id);
        }
        GM_setValue('rfm_whitelist', whitelist);
        updateStats();
        renderFriends();
        refreshSettingsModal();
    }

    function updateSelectionUI() {
        document.getElementById('rfm-stat-selected').textContent = state.selected.size;
        document.getElementById('rfm-badge-selected').textContent = state.selected.size;
        document.getElementById('rfm-trigger').dataset.count = state.selected.size;
    }

    function updateStats() {
        document.getElementById('rfm-stat-total').textContent = state.friends.length;
        document.getElementById('rfm-stat-online').textContent = state.friends.filter(f => f.isOnline).length;
        document.getElementById('rfm-stat-ingame').textContent = state.friends.filter(f => f.presenceType === 2).length;
        document.getElementById('rfm-stat-offline').textContent = state.friends.filter(f => !f.isOnline && f.presenceType !== 2).length;
        document.getElementById('rfm-stat-wl').textContent = whitelist.length;
        updateSelectionUI();
    }

    function showConfirm(icon, title, text, onConfirm) {
        const overlay = document.getElementById('rfm-confirm-overlay');
        document.getElementById('rfm-confirm-icon').textContent = icon;
        document.getElementById('rfm-confirm-title').textContent = title;
        document.getElementById('rfm-confirm-text').innerHTML = text;

        const cancelBtn = document.getElementById('rfm-confirm-cancel');
        const okBtn = document.getElementById('rfm-confirm-ok');

        const cleanup = () => {
            overlay.classList.remove('active');
            cancelBtn.onclick = null;
            okBtn.onclick = null;
        };

        cancelBtn.onclick = cleanup;
        okBtn.onclick = () => { cleanup(); onConfirm(); };
        overlay.classList.add('active');
    }

    function showToast(message, type = 'info') {
        if (!settings.toastsEnabled) return;
        const container = document.getElementById('rfm-toast-container');
        if (!container) return;
        const toast = createElement('div', `rfm-toast ${type}`, message);
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3900);
        // Play sound (respects soundsEnabled internally)
        playSound(type);
    }

    function showExportMenu(anchor) {
        const menu = document.getElementById('rfm-ctx-menu');
        menu.innerHTML = `
            <div class="rfm-ctx-item" data-export="csv">📄 ${t('exportCsv')}</div>
            <div class="rfm-ctx-item" data-export="json">📋 ${t('exportJson')}</div>
        `;
        const rect = anchor.getBoundingClientRect();
        menu.style.left = rect.left + 'px';
        menu.style.top = (rect.top - 100) + 'px';
        menu.classList.add('active');

        menu.querySelectorAll('.rfm-ctx-item').forEach(item => {
            item.onclick = () => {
                exportFriends(item.dataset.export);
                menu.classList.remove('active');
            };
        });
    }

    function exportFriends(type) {
        const friends = getFilteredFriends();
        let content, filename, mime;

        if (type === 'csv') {
            const headers = ['id', 'username', 'displayName', 'isOnline', 'presenceType', 'lastOnline'];
            const rows = friends.map(f => [
                f.id, f.name, `"${f.displayName}"`, f.isOnline, f.presenceType, f.lastOnline || ''
            ].join(','));
            content = headers.join(',') + '\n' + rows.join('\n');
            filename = `roblox-friends-${Date.now()}.csv`;
            mime = 'text/csv';
        } else {
            content = JSON.stringify(friends, null, 2);
            filename = `roblox-friends-${Date.now()}.json`;
            mime = 'application/json';
        }

        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`📤 ${friends.length} friends exported (${type.toUpperCase()})`, 'success');
    }

    async function openPanel() {
        document.getElementById('rfm-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
        if (state.friends.length === 0) await loadFriends();
    }

    function closePanel() {
        document.getElementById('rfm-overlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    // ================================================================
    // MAIN LOGIC
    // ================================================================
    async function loadFriends() {
        state.isLoading = true;
        renderFriends();
        try {
            state.friends = await fetchAllFriends();
            updateStats();
            showToast(`✅ ${state.friends.length} ${t('loaded')}`, 'success');
        } catch (err) {
            showToast(`${t('error')}: ` + err.message, 'error');
            console.error('[RFM]', err);
        } finally {
            state.isLoading = false;
            renderFriends();
        }
    }

    async function deleteFriends(userIds) {
        if (state.isLoading) return;
        state.isLoading = true;
        state.isPaused = false;
        state.currentDelay = settings.unfriendDelay;
        let deletedCount = 0;

        const progressContainer = document.querySelector('.rfm-progress-container');
        const progressBar = document.getElementById('rfm-progress');
        const progressText = document.getElementById('rfm-progress-text');
        const pauseBtn = document.getElementById('rfm-btn-pause');
        progressContainer.style.display = 'block';
        pauseBtn.innerHTML = `⏸️ ${t('pause')}`;
        document.querySelectorAll('.rfm-btn').forEach(b => { if (b.id !== 'rfm-btn-pause') b.disabled = true; });

        const total = userIds.length;
        const startTime = Date.now();

        for (let i = 0; i < userIds.length; i++) {
            while (state.isPaused) await sleep(100);

            const userId = userIds[i];
            const friend = state.friends.find(f => f.id === userId);
            const name = friend ? friend.name : `User_${userId}`;

            progressBar.style.width = Math.round(((i + 1) / total) * 100) + '%';
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            progressText.textContent = `${t('deleting')} ${name}... (${i + 1}/${total}) · ${elapsed}s`;

            try {
                const success = await unfriendUser(userId);
                if (success) {
                    deletedCount++;
                    state.friends = state.friends.filter(f => f.id !== userId);
                    state.selected.delete(userId);
                    history.push({ id: userId, name, date: new Date().toISOString() });
                } else {
                    showToast(`${t('failed')}: ${name}`, 'error');
                    state.currentDelay = Math.min(state.currentDelay * 1.5, CONFIG.UNFRIEND_DELAY_MAX);
                }
            } catch (err) {
                showToast(`${t('error')} ${name}: ${err.message}`, 'error');
            }

            if (i < userIds.length - 1) {
                let remaining = state.currentDelay;
                while (remaining > 0) {
                    if (state.isPaused) {
                        await sleep(100);
                        continue;
                    }
                    const chunk = Math.min(100, remaining);
                    await sleep(chunk);
                    remaining -= chunk;
                }
            }
        }

        history = history.slice(-500);
        GM_setValue('rfm_history', history);

        progressContainer.style.display = 'none';
        document.querySelectorAll('.rfm-btn').forEach(b => b.disabled = false);
        state.isLoading = false;
        updateStats();
        renderFriends();

        showToast(deletedCount === total
            ? `✅ ${deletedCount} ${t('deleted')}`
            : `⚠️ ${deletedCount}/${total}`, deletedCount === total ? 'success' : 'warning');
    }

    // ================================================================
    // INIT
    // ================================================================
    function isRobloxLoggedIn() {
        return document.cookie.includes('.ROBLOSECURITY') ||
            !!document.querySelector('#navigation-avatar, .rbx-menu-item-avatar, [class*="avatar-headshot"]');
    }

    function tryInit() {
        if (!isRobloxLoggedIn()) {
            setTimeout(tryInit, 2000);
            return;
        }
        buildUI();
        showToast(`🗑️ ${t('ready')}`, 'success');
        console.log('[RFM] ✅ Initialized!');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(tryInit, 1500));
    } else {
        setTimeout(tryInit, 1500);
    }

    let attempts = 0;
    const backup = setInterval(() => {
        attempts++;
        if (state.uiBuilt) { clearInterval(backup); return; }
        if (attempts > 10) { clearInterval(backup); return; }
        tryInit();
    }, 3000);

})();
