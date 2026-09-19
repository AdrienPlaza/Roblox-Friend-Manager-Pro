# 🗑️ Roblox Friend Manager Pro

> A powerful Tampermonkey userscript that adds an advanced GUI to **mass-manage, filter, export and delete your Roblox friends**, with bulk selection, keyboard shortcuts and a sleek modern interface.

![Version](https://img.shields.io/badge/version-1-blue)
![Platform](https://img.shields.io/badge/platform-Roblox-red)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📥 Download

**[→ Install the script](https://raw.githubusercontent.com/AdrienPlaza/Roblox-Friend-Manager-Pro/main/RobloxFriendManagerPro.user.js)**

*(Tampermonkey will automatically detect the userscript and offer to install it)*

---

## 📖 About

**Roblox Friend Manager Pro** is a userscript that injects a custom control panel into the Roblox website. It gives you a full friend management dashboard right inside your browser.

### What you can do

- 👥 View **all your friends** in one clean, searchable list
- 🟢 See **who's online, in-game, or offline** in real time
- 🔍 **Search** friends by username, display name, or user ID
- ☑️ **Select multiple friends at once** (select all, invert, online-only)
- 🗑️ **Delete friends in bulk** with one click
- 💀 **Wipe your entire friends list** (with confirmation)
- 🛡️ **Whitelist** friends you never want to delete by accident
- 📤 **Export** your friend list to CSV or JSON
- 📜 **Track every deletion** in a local history log
- ⚙️ Fully customizable **settings** (theme, accent color, delay, notifications, sounds)
- ⌨️ **Keyboard shortcuts** for power users (all rebindable)
- 🌐 **Multi-language**: English & French

---

## ⚙️ Installation

1. Install the **Tampermonkey** extension for your browser:
   - [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)
   - [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
2. Click **"Create a new script"** in the Tampermonkey dashboard.
3. Paste the entire script content.
4. Save with **Ctrl + S**.
5. Go to [roblox.com](https://www.roblox.com) and make sure you're **logged in**.
6. A red **🗑️ button** will appear at the bottom-right of the screen. Click it to open the manager.

---

## 🚀 Usage

| Action | How |
|---|---|
| Open the panel | Click the floating 🗑️ button |
| Search a friend | Type in the search bar (name or ID) |
| Select a friend | Click on their row |
| Select all | Click **☑️ All** |
| Deselect all | Click **⬜ None** |
| Invert selection | Click **🔄 Invert** |
| Filter online only | Click **🟢 Online only** |
| Delete selection | Click **🗑️ Delete selection** |
| Delete everything | Click **💀 DELETE ALL** |
| Export your list | Click **📤 Export** → CSV or JSON |
| Add to whitelist | Click the **☆** next to a friend |
| Open a profile | Click the **🔗** next to a friend |
| Right-click a friend | Opens the context menu (profile, whitelist, delete) |
| Open settings | Click the **⚙️** icon in the header |
| Open help | Click the **❓** icon in the header |
| Close panel | Click the **×** or press **Esc** |

> ℹ️ **Export scope**: exports only the friends currently visible after filtering. Clear filters and search first if you want a full backup.

---

## ✨ Features

### Friend management
- 🎯 **Full friends list** with avatars, display names, usernames and IDs
- 🟢 **Live presence** status (online / in-game / offline)
- 🔍 **Real-time search** by name, display name or user ID
- ☑️ **Bulk selection** with select-all, invert and online-only filters
- 🛡️ **Whitelist** to protect specific friends from deletion (stored by user ID, so it survives username changes)
- 📊 **Live statistics** in the header (total, selected, online, in-game, offline, whitelisted)

### Deleting
- 🗑️ **Bulk unfriend** with automatic retry on CSRF failures
- ⏱️ **Configurable delay** between each unfriend to avoid rate limits
- 📈 **Auto-adjusted delay** if Roblox starts rate-limiting (up to 4s between requests)
- ⏸️ **Pause / resume** during a deletion batch
- 📊 **Progress bar** with live counter
- ⚠️ **Confirmation dialogs** before any destructive action
- 📜 **Deletion history** stored locally (last 500 entries)

### Customization
- 🌐 **Language switcher** (English / French)
- 🌗 **Dark / light theme**
- 🎨 **6 accent colors** to customize the UI
- 🔔 **Toast notifications** (can be toggled on/off)
- 🔊 **Sound feedback** with unique tones for success, error, info and warning (can be toggled on/off)
- ⌨️ **Fully rebindable keyboard shortcuts**

### Export
- 📤 **CSV export** for spreadsheets
- 📤 **JSON export** for scripts or backups

> ⚠️ **Note**: Exports are **read-only backups**. They do **not** allow you to re-add friends automatically — you would need to send friend requests manually.

---

## ⌨️ Default shortcuts

| Action | Default key |
|---|---|
| Select all friends | `Alt + A` |
| Deselect all | `Alt + D` |
| Delete selection | `Alt + Suppr` |
| Close panel / modal | `Escape` |
| Open settings | `Alt + S` |
| Open help | `Alt + H` |
| Toggle theme | `Alt + T` |

> 💡 All shortcuts can be **changed** from **Settings → Shortcuts**. Just click a key and press your combination.

---

## 🛠️ Configuration

You can tweak the low-level behavior at the top of the script:

```js
const CONFIG = {
    API_BASE: 'https://friends.roblox.com',
    USERS_API: 'https://users.roblox.com',
    THUMBNAIL_API: 'https://thumbnails.roblox.com',
    PRESENCE_API: 'https://presence.roblox.com',
    BATCH_SIZE: 50,          // Friends per page
    UNFRIEND_DELAY: 800,     // ms between each unfriend (avoid rate-limit)
    UNFRIEND_DELAY_MAX: 4000,// Max delay when auto-adjusting
    MAX_RETRIES: 3,          // CSRF retry attempts
    MAX_PAGES: 50,           // Safety limit for pagination
};
```

> 💡 If Roblox starts rate-limiting you, you can also increase the delay directly from **Settings → Behaviour → Delay between deletions**.

---

## 🔐 Data stored locally

The script saves the following data **only on your machine** (via Tampermonkey storage):

| Key | What it stores |
|---|---|
| `rfm_settings` | Your preferences (theme, language, shortcuts, delay, sounds, notifications…) |
| `rfm_whitelist` | List of protected friend IDs |
| `rfm_history` | Log of the last 500 deletions (id, name, date) |

You can clear any of these from **Settings → Data** or directly from Tampermonkey's storage tab.

Nothing is ever sent to an external server.

---

## ❓ FAQ

**Is this against Roblox ToS?**
The script only interacts with **your own** account and **your own** friend list. It doesn't exploit, doesn't affect other users, and doesn't modify game behavior. Still, use it at your own discretion.

**Will I get banned?**
No reports so far. The delay between deletions is configurable to stay under Roblox's rate limits. Use it responsibly.

**Can I restore deleted friends?**
No. Roblox has no public API to send bulk friend requests. **Always export your list first** if you might want to re-add people manually later.

**Does it work on mobile?**
No. Tampermonkey on mobile doesn't reliably support userscripts.

**Can I change the language?**
Yes, English and French are supported. Go to **Settings → Appearance → Language**.

**Where is my data stored?**
Locally in your browser via Tampermonkey's storage. Nothing is sent to any server.

**Is the whitelist persistent?**
Yes. Whitelisted friends are stored by user ID, so they stay protected even if they change their username.

**Why don't I hear any sounds?**
Browsers block audio until you interact with the page. Click anywhere once on Roblox, then sounds will work. This is a browser security feature, not a bug.

**I disabled notifications but I still got one — why?**
When you **re-enable** notifications, the script shows a small confirmation toast so you know it worked. That's the only exception.

---

## ⚠️ Disclaimer

This script is provided **for educational and personal purposes only**.

- It uses your **own authenticated session** and only affects **your own friends list**.
- **Unfriending is irreversible**, there is no undo.
- The author is **not responsible** for any account actions taken by Roblox.
- Use at your own risk.

---

## 🧩 Compatibility

| Browser | Status |
|---|---|
| Chrome | ✅ Tested by author |
| Edge | ✅ Tested by author |
| Brave | ✅ Tested by author |
| Firefox | ⚠️ Not tested |
| Opera / Vivaldi | ⚠️ Should work (Chromium-based) |
| Mobile | ❌ Not supported |

> If you test on another browser, feel free to open an issue and share the result.

---

## 🤝 Contributing

Pull requests, ideas and bug reports are welcome!

Ideas for future improvements:
- Import a list of IDs for targeted re-add
- Sort by friend-since date (if the Roblox API allows it)
- Backup / restore whitelist and history
- More theme customization
- Better mobile-friendly UI

Feel free to open an **issue** or submit a **PR**.

---

## 📜 License

MIT License, free to use, modify, and share.
See the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**AdrienPlaza**

- 🎮 Passionate about programming, 3D, and VR
- 💻 Unity · Blender · Java · Python · JavaScript · HTML · C++ · Lua

---

⭐ If this script helped you, don't forget to **star the repo**!
