# Сторонние компоненты

Android включает следующие неизменённые зависимости, полученные из Maven Central:

| Компонент | Версия | Координаты Maven | Лицензия и исходники |
|---|---|---|---|
| OkHttp | 4.12.0 | com.squareup.okhttp3:okhttp | [Apache-2.0 / исходники](https://github.com/square/okhttp/tree/parent-4.12.0) |
| Okio JVM | 3.6.0 | com.squareup.okio:okio-jvm | [Apache-2.0 / исходники](https://github.com/square/okio/tree/3.6.0) |
| Kotlin stdlib | 1.9.25 | org.jetbrains.kotlin:kotlin-stdlib | [Apache-2.0 / исходники](https://github.com/JetBrains/kotlin/tree/v1.9.25) |

Оригинальные LICENSE/NOTICE из JAR сохраняются сборщиком в `META-INF/licenses/` APK. Двоичные JAR включены в `android-app/libs/`, чтобы сборка не зависела от сетевого разрешения зависимостей. Их SHA-256 приведены ниже.

```text
f9cdcdbff1f5de85380ae526977e683726c2aa42db1ed6e6e50ae89e496e95fd  android-app/libs/kotlin-stdlib-1.9.25.jar
b1050081b14bb7a3a7e55a4d3ef01b5dcfabc453b4573a4fc019767191d5f4e0  android-app/libs/okhttp-4.12.0.jar
67543f0736fc422ae927ed0e504b98bc5e269fda0d3500579337cb713da28412  android-app/libs/okio-jvm-3.6.0.jar
```

Исходное расширение и его ресурсы предоставлены владельцем проекта. Авторская атрибуция сохранена в интерфейсе. Размещённые исходники доступны для ознакомления и воспроизведения сборки; отдельная открытая лицензия на собственный код владельцем пока не выбрана. Публичный доступ к GitHub сам по себе не предоставляет дополнительных прав на распространение и использование за пределами применимых условий и закона. Сторонние компоненты продолжают распространяться на своих лицензиях.
