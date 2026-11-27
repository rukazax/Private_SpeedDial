# Private Speed Dial 6.12.4 — переименование

## Что изменилось

Название приложения: **Private Speed Dial** — с пробелом между словами.

| Где | Было | Стало |
|---|---|---|
| `manifest.json` → `name` | Private SpeedDial | **Private Speed Dial** |
| Заголовки страниц (`newtab`, `options`) | Private SpeedDial | Private Speed Dial |
| Стартовые плитки и экспорт HTML | Private SpeedDial | Private Speed Dial |
| Интерфейс и 13 языков | Private SpeedDial | Private Speed Dial |
| README и описание проекта | Private SpeedDial | Private Speed Dial |

Название в Chrome Web Store берётся из манифеста, поэтому магазин покажет новое имя после
загрузки этой версии и прохождения проверки.

## Что НЕ менялось

Идентификаторы оставлены прежними, чтобы обновление встало поверх без потери данных:

- ID расширения `eakakaeklcgnlanmpbndhjdljppehdof` и пакет публикации;
- репозиторий `rukazax/Private_SpeedDial`;
- имена файлов релиза: `Private-SpeedDial-Extension.zip`, `Private-SpeedDial-Android.apk`;
- Android-пакет `su.econa.speeddial` и ключ подписи.

## Что входит в выпуск

| Артефакт | Версия | Примечание |
|---|---|---|
| `Private-SpeedDial-Extension.zip` | 6.12.4 | распакованное расширение MV3 |
| `Private-SpeedDial-Android.apk` | 6.10.3 | действующая сборка Android, метка файла = версия |
| `SHA256SUMS.txt` | — | контрольные суммы |
| скриншоты | — | состояние интерфейса 6.12.x |

Для Chrome Web Store используется отдельный архив `Private-SpeedDial-WebStore-6.12.4.zip`: без
`README.md` и `struktura.txt`, `manifest.json` в корне.

## Установка

1. Распаковать ZIP.
2. Открыть `chrome://extensions`, включить режим разработчика.
3. «Загрузить распакованное расширение» → выбрать папку с `manifest.json`.

## Ограничения

- Новые строки интерфейса на русском; перевод на 13 языков остаётся задачей следующего выпуска.
- APK не пересобирался: ключ подписи проекта в среде сборки недоступен.
