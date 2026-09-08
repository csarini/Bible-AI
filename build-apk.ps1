# Script de construccion de APK para Biblia Inteligente

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Compilador de APK - Biblia Inteligente " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Comprobar Java JDK
$javaPath = $null
if (Get-Command java -ErrorAction SilentlyContinue) {
    $javaPath = (Get-Command java).Source
    Write-Host "[OK] Java detectado en el PATH: $javaPath" -ForegroundColor Green
} else {
    # Buscar en directorios comunes
    $commonJavaPaths = @(
        "C:\Program Files\Eclipse Adoptium\jdk-21*",
        "C:\Program Files\Eclipse Adoptium\jdk-17*",
        "C:\Program Files\Java\jdk*",
        "C:\Program Files\Eclipse Adoptium\jdk*"
    )
    foreach ($pattern in $commonJavaPaths) {
        $found = Resolve-Path $pattern -ErrorAction SilentlyContinue
        if ($found) {
            $javaDir = $found[0].Path
            $env:JAVA_HOME = $javaDir
            $env:PATH += ";$javaDir\bin"
            Write-Host "[OK] Java encontrado y configurado en: $javaDir" -ForegroundColor Green
            $javaPath = "$javaDir\bin\java.exe"
            break
        }
    }
}

if (-not $javaPath) {
    Write-Host "[!] Java JDK no fue detectado en su sistema." -ForegroundColor Yellow
    $response = Read-Host "Desea instalar Java JDK 17 automaticamente usando winget? (S/N)"
    if ($response -match "[sSyY]") {
        Write-Host "Instalando Eclipse Adoptium Temurin JDK 17... Por favor espere." -ForegroundColor Cyan
        Start-Process winget -ArgumentList "install -e --id EclipseAdoptium.Temurin.17.JDK --silent --accept-package-agreements --accept-source-agreements" -NoNewWindow -Wait
        
        # Recargar PATH e intentar buscar de nuevo
        $commonJavaPaths = @(
            "C:\Program Files\Eclipse Adoptium\jdk-17*"
        )
        foreach ($pattern in $commonJavaPaths) {
            $found = Resolve-Path $pattern -ErrorAction SilentlyContinue
            if ($found) {
                $javaDir = $found[0].Path
                $env:JAVA_HOME = $javaDir
                $env:PATH += ";$javaDir\bin"
                Write-Host "[OK] Java instalado y configurado correctamente en: $javaDir" -ForegroundColor Green
                $javaPath = "$javaDir\bin\java.exe"
                break
            }
        }
        if (-not $javaPath) {
            Write-Host "[!] JDK instalado pero requiere reiniciar la terminal. Por favor configure JAVA_HOME manualmente." -ForegroundColor Red
            Exit 1
        }
    } else {
        Write-Host "[!] Se necesita Java JDK para continuar. Descarguelo en: https://adoptium.net/" -ForegroundColor Red
        Exit 1
    }
}

# 2. Comprobar Android SDK
$sdkPath = $null
if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
    $sdkPath = $env:ANDROID_HOME
    Write-Host "[OK] ANDROID_HOME ya esta configurado en: $sdkPath" -ForegroundColor Green
} else {
    # Rutas por defecto en Windows
    $userProfile = $env:USERPROFILE
    $defaultSdk = "$userProfile\AppData\Local\Android\Sdk"
    if (Test-Path $defaultSdk) {
        $sdkPath = $defaultSdk
        $env:ANDROID_HOME = $sdkPath
        Write-Host "[OK] Android SDK encontrado en la ruta por defecto: $sdkPath" -ForegroundColor Green
    }
}

if (-not $sdkPath) {
    Write-Host "[!] El SDK de Android no fue detectado." -ForegroundColor Yellow
    Write-Host "Para compilar el APK directamente, se requiere el SDK de Android." -ForegroundColor Yellow
    $response = Read-Host "Desea instalar Android Studio (que incluye el SDK de Android) usando winget? (S/N)"
    if ($response -match "[sSyY]") {
        Write-Host "Iniciando la instalacion de Android Studio... Siga el asistente." -ForegroundColor Cyan
        Start-Process winget -ArgumentList "install -e --id Google.AndroidStudio" -NoNewWindow -Wait
        Write-Host "[i] Una vez completada la instalacion, abra Android Studio por primera vez para descargar el SDK de Android." -ForegroundColor Cyan
        Write-Host "Luego, ejecute este script nuevamente." -ForegroundColor Cyan
        Exit 0
    } else {
        Write-Host "[i] El proyecto de Capacitor se configurara de todas formas para que pueda compilarlo en otra maquina o abrirlo en Android Studio manualmente." -ForegroundColor Cyan
    }
}

# 3. Instalacion de dependencias npm
Write-Host ""
Write-Host "==> Instalando dependencias de Node..." -ForegroundColor Cyan
npm install

# 4. Construir frontend web
Write-Host ""
Write-Host "==> Compilando la aplicacion web (Vite)..." -ForegroundColor Cyan
npm run build

# 5. Configurar proyecto de Capacitor
Write-Host ""
Write-Host "==> Sincronizando recursos con Android..." -ForegroundColor Cyan
if (-not (Test-Path "android")) {
    Write-Host "Inicializando la carpeta de Android..." -ForegroundColor Cyan
    npx cap add android
} else {
    npx cap sync
}

# 6. Compilar el APK
if ($sdkPath -and $javaPath) {
    Write-Host ""
    Write-Host "==> Compilando APK con Gradle..." -ForegroundColor Cyan
    Set-Location android
    # Ejecutar gradle wrapper assembleDebug
    cmd.exe /c "gradlew.bat assembleDebug"
    Set-Location ..

    $apkSource = "android\app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkSource) {
        $destination = ".\app-debug.apk"
        Copy-Item -Path $apkSource -Destination $destination -Force
        Write-Host ""
        Write-Host "=========================================" -ForegroundColor Green
        Write-Host " [OK] APK COMPILADO CON EXITO!" -ForegroundColor Green
        Write-Host " El archivo APK se encuentra en la raiz:" -ForegroundColor Green
        Write-Host " -> $((Resolve-Path $destination).Path)" -ForegroundColor Green
        Write-Host "=========================================" -ForegroundColor Green
    } else {
        Write-Host "[!] El proceso de Gradle finalizo pero no se encontro el APK." -ForegroundColor Red
        Exit 1
    }
} else {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Yellow
    Write-Host " [i] PROYECTO LISTO PARA COMPILAR" -ForegroundColor Yellow
    Write-Host " El proyecto web se ha compilado y los recursos" -ForegroundColor Yellow
    Write-Host " se sincronizaron en la carpeta 'android'." -ForegroundColor Yellow
    Write-Host ""
    Write-Host " Para generar el APK:" -ForegroundColor Yellow
    Write-Host " 1. Instale Android Studio y abra la carpeta 'android'." -ForegroundColor Yellow
    Write-Host " 2. Deje que Android Studio configure Gradle." -ForegroundColor Yellow
    Write-Host " 3. Vaya a Build > Build Bundle(s) / APK(s) > Build APK(s)." -ForegroundColor Yellow
    Write-Host "=========================================" -ForegroundColor Yellow
}
