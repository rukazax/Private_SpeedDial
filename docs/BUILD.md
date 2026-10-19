# Сборка и проверки

## Среда

Для исходников интерфейса достаточно текстового редактора и Chrome/Chromium. Для APK нужны Linux, Python 3, Node.js (проверено Node 24), JDK 17 и Android SDK:

- SDK Platform 35 (`platforms/android-35/android.jar`);
- Build Tools 36.0.0: `aapt2`, `d8`, `zipalign`, `apksigner`;
- Platform Tools / adb для установки и тестов;
- эмулятор Android API 35 и аппаратное ускорение — для повторения эмуляторных проверок.

Gradle, Android Studio и сетевое скачивание Maven во время этой сборки не требуются. Три JAR находятся в `android-app/libs/`; их происхождение и лицензии — в [THIRD_PARTY.md](../THIRD_PARTY.md).

```bash
git clone https://github.com/rukazax/Private_SpeedDial.git
cd Private_SpeedDial
export ANDROID_HOME="$HOME/Android/Sdk"
export JAVA_HOME="/path/to/jdk-17"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:/path/to/node/bin:$PATH"
python3 tools/sync-shared.py
python3 tests/check-source.py
node --test tests/updates.test.cjs tests/sync-privacy.test.cjs
python3 android-app/build.py
```

Скрипт по умолчанию ищет JDK в `~/.local/opt/jdk-17`, SDK в `~/Android/Sdk`. Переопределите JAVA_HOME/ANDROID_HOME для своей системы. Node берётся из переменной NODE или PATH; оставлен совместимый резервный путь прежней рабочей станции. Версии SDK зафиксированы в начале скрипта; установите их через SDK Manager.

Результат: `dist/Private-SpeedDial-Android.apk`. Сборка проверяет синтаксис JavaScript, компилирует Java через `javac --release 8`, запускает D8/aapt2/zipalign и проверяет подпись APK. Генерируемые `android-app/assets/`, `android-app/build/` и `dist/` исключены из Git.

## Ключ подписи

В текущем сценарии личная локальная сборка использует `~/.config/private-speeddial-android/signing/app.p12` и `password.txt`. При первом запуске на новой машине скрипт создаёт **ваш собственный ключ**. Такая APK не может обновить официальный APK с другим ключом. Для официального выпуска используется существующий закрытый ключ проекта, который в репозиторий не включён.

Каталог ключа имеет права 0700, файлы — 0600. Сделайте отдельную защищённую резервную копию ключа и пароля. Нельзя включать их в Git, ZIP исходников, Release, Issues или логи. Пароль передаётся apksigner/keytool через файл, не печатается в командной строке.

SHA-256 сертификата официального Android-релиза:

```text
c49e8f257a896ed66fa4b874a2c7cb1b6df4263beafaf65c49f271a5ea87f596
```

Проверить APK:

```bash
"$ANDROID_HOME/build-tools/36.0.0/apksigner" verify --verbose --print-certs dist/Private-SpeedDial-Android.apk
"$ANDROID_HOME/build-tools/36.0.0/aapt2" dump badging dist/Private-SpeedDial-Android.apk
adb install -r dist/Private-SpeedDial-Android.apk
```

## ZIP расширения и исходников

```bash
python3 tools/package-release.py
git archive --format=zip --prefix=Private_SpeedDial/ -o dist/Private-SpeedDial-Source.zip HEAD
python3 tools/package-release.py --checksums-only
```

Архив расширения содержит содержимое `extension/`, включая manifest.json в корне. Он не подписан Chrome Web Store; пользователь устанавливает распакованную папку. Архив исходников собирается **из Git-коммита**, а не из всего рабочего каталога, чтобы не захватить ключи, экспорт данных и результаты тестов.

## Автоматические проверки

```bash
python3 tools/sync-shared.py --check
python3 tests/check-source.py
node --test tests/updates.test.cjs tests/sync-privacy.test.cjs
node verification/audit-i18n-v6.mjs
```

Для изолированной проверки настоящего расширения установите Playwright в доступном для Node окружении (`npm install --no-save playwright`, при необходимости вне рабочего дерева), укажите путь к Chromium и запустите:

```bash
CHROMIUM=/path/to/chromium node --test tests/browser.test.cjs
```

По умолчанию сценарий использует `/snap/bin/chromium`; профиль создаётся временно и удаляется. Проверяются загрузка unpacked extension, настройки, копирование ссылки, диалог обновления, пропуск и правильный файл загрузки. Будущие релизы имитируются внутри тестового worker, без публикации фиктивных релизов.

## Android: расширенные проверки

Для эмуляторных UI-тестов нужна отдельная сборка с WebView debugging:

```bash
python3 android-app/build.py --debug-webview
adb install -r dist/Private-SpeedDial-Android.apk
python3 verification/launch.py
python3 verification/cloud-server-v3.py
```

Последняя команда запускает локальные тестовые облачные API на портах 18766/18767; в другом терминале запускаются проверки. Используйте только на изолированном эмуляторе и завершите сервер после тестов. Сценарии `verification/` используют adb и CDP `127.0.0.1:9223`, тестовые пароли и адрес `10.0.2.2`; они не подключаются к вашим облачным аккаунтам.

```bash
SPEEDDIAL_TEST_TAG=v6 node verification/regression-v3.mjs home
SPEEDDIAL_TEST_TAG=v6 node verification/regression-v3.mjs extended-home
SPEEDDIAL_TEST_TAG=v6 node verification/regression-v3.mjs settings
SPEEDDIAL_TEST_TAG=v6 node verification/regression-v3.mjs extra
SPEEDDIAL_TEST_TAG=v6 node verification/run-sync-v3.mjs
SPEEDDIAL_TEST_TAG=v6 node verification/run-advanced-sync-v3.mjs
SPEEDDIAL_TEST_TAG=v6 node verification/menu-v4.mjs
node verification/ui-v6.mjs
node verification/project-v6.mjs
```

**Не публикуйте debug-webview APK**: этот режим разрешает отладку WebView и отключает FLAG_SECURE для тестовых скриншотов. После UI-тестов обязательно заново соберите `python3 android-app/build.py`, установите release APK и проверьте его нативной Instrumentation; итоговый опубликованный файл должен иметь DEBUG_WEBVIEW=false и FLAG_SECURE.

Сценарии прошлых выпусков сохранены как история; актуальные команды и ограничения приведены здесь и в [отчёте](VERIFICATION.md).

Для проверки перехода из Android-меню в GitHub Releases в выпуске 6.10.1 используется `SPEEDDIAL_TEST_TAG=v7 python3 verification/build-instrumentation.py`, затем установка `verification/test-build/test.apk` и запуск `python3 verification/native-release-v7.py`. Это проверяет настоящий исходящий Android Intent итоговой release APK.
