@echo off
cd /d "%~dp0apk-build"
set "ANDROID_HOME=%~dp0android-sdk"
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.12.8-hotspot"
set "GRADLE_OPTS=-Dorg.gradle.jvmargs=-Xmx2g"

echo [1/3] Copying web assets to Android project...
if not exist "android\app\src\main\assets\public" mkdir "android\app\src\main\assets\public"
xcopy /E /Y /I "www\*" "android\app\src\main\assets\public\" >nul
if errorlevel 1 ( echo COPY_ASSETS_FAILED & exit /b 1 )

echo [2/3] Building APK (first time may take 10-40 min)...
cd android
call "C:\Users\16608\.gradle\wrapper\dists\gradle-8.2.1-all\d8pvvlun5bx6sdtwqhf8y9z4b\gradle-8.2.1\bin\gradle.bat" assembleDebug --no-daemon
if errorlevel 1 ( echo BUILD_FAILED & exit /b 1 )
cd ..

echo [3/3] Copying APK...
if not exist "release" mkdir "release"
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "release\surprise.apk" >nul
if errorlevel 1 ( echo COPY_FAILED & exit /b 1 )

echo DONE
exit /b 0
