# Private SpeedDial Android 6.10.2

[Скачать официальный APK](https://github.com/rukazax/Private_SpeedDial/releases/latest/download/Private-SpeedDial-Android.apk) · [Расширение в Chrome Web Store](https://chromewebstore.google.com/detail/private-speeddial/eakakaeklcgnlanmpbndhjdljppehdof) · [Основная страница проекта](README.md)

- Android 8.0+, пакет `su.econa.speeddial`, versionCode 6100002.
- Постоянная подпись для обновления поверх прежних официальных APK с сохранением данных.
- [Установка и использование](docs/USER-GUIDE.md), [синхронизация](docs/SYNC.md), [сборка](docs/BUILD.md), [проверки и ограничения](docs/VERIFICATION.md).
- Готовая локальная сборка: `dist/Private-SpeedDial-Android.apk`.

На основном экране два столбца и одна строка горизонтально прокручиваемых папок. Меню ☰ содержит поиск, заметки и команды; настройки раскрываются по разделам. На большом экране добавляются столбцы при сохранении размера плиток. В настройках доступны GitHub и «Поделиться приложением». Проверка обновлений — при открытии, не чаще раза в 7 дней, с предложением скачать или пропустить релиз.

Скриншоты и UI-тесты выполняются на отдельной сборке для эмулятора. Публичный APK собирается без отладки WebView с FLAG_SECURE; ключ подписи и личные данные не входят в исходники.

Пункт **☰ → Установить расширение для браузера** и ссылки на расширение в настройках открывают [страницу Private SpeedDial в Chrome Web Store](https://chromewebstore.google.com/detail/private-speeddial/eakakaeklcgnlanmpbndhjdljppehdof). Устанавливайте расширение в совместимом браузере на компьютере.
