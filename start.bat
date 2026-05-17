@echo off
title Ruby Panel - Auto Setup & Start
color 0A

echo.
echo  ====================================
echo   Ruby Panel - Auto Setup
echo  ====================================
echo.

cd /d "%~dp0"

REM ─── Check Node.js ───────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js nicht gefunden!
    echo Bitte installiere Node.js von: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo [OK] Node.js %%v gefunden

REM ─── Docker prüfen & starten ─────────────────────────────
echo [INFO] Prüfe Docker...
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker läuft bereits
    goto :docker_ok
)

REM Docker ist installiert aber läuft nicht? Versuche zu starten
where docker >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Docker gefunden aber nicht gestartet - starte Docker Desktop...
    goto :start_docker_desktop
)

REM Docker nicht installiert - mit winget installieren
echo [INFO] Docker Desktop nicht gefunden - wird installiert...
where winget >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Installiere Docker Desktop via winget...
    winget install --id Docker.DockerDesktop --silent --accept-source-agreements --accept-package-agreements
    if %errorlevel% neq 0 (
        echo [WARN] winget Installation fehlgeschlagen - manuell installieren: https://www.docker.com/products/docker-desktop
        goto :docker_warn
    )
    echo [OK] Docker Desktop installiert
) else (
    echo [INFO] Lade Docker Desktop Installer herunter...
    powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe' -OutFile '%TEMP%\DockerInstaller.exe'"
    if exist "%TEMP%\DockerInstaller.exe" (
        echo [INFO] Installiere Docker Desktop (bitte warten)...
        "%TEMP%\DockerInstaller.exe" install --quiet --accept-license
        del "%TEMP%\DockerInstaller.exe" >nul 2>&1
        echo [OK] Docker Desktop installiert
    ) else (
        echo [WARN] Docker Installer konnte nicht heruntergeladen werden.
        echo        Installiere Docker manuell: https://www.docker.com/products/docker-desktop
        goto :docker_warn
    )
)

:start_docker_desktop
REM Docker Desktop starten
echo [INFO] Starte Docker Desktop...

REM Versuche verschiedene Pfade für Docker Desktop
set "DOCKER_PATHS=C:\Program Files\Docker\Docker\Docker Desktop.exe"
set "DOCKER_PATH2=%LOCALAPPDATA%\Programs\Docker\Docker\Docker Desktop.exe"

if exist "%DOCKER_PATHS%" (
    start "" "%DOCKER_PATHS%"
) else if exist "%DOCKER_PATH2%" (
    start "" "%DOCKER_PATH2%"
) else (
    REM Suche im Registry
    for /f "tokens=2*" %%a in ('reg query "HKLM\SOFTWARE\Docker Inc.\Docker Desktop" /v InstallPath 2^>nul') do (
        if exist "%%b\Docker Desktop.exe" start "" "%%b\Docker Desktop.exe"
    )
)

echo [INFO] Warte auf Docker (bis zu 60 Sekunden)...
set DOCKER_WAIT=0
:wait_docker
timeout /t 3 /nobreak >nul
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker läuft
    goto :docker_ok
)
set /a DOCKER_WAIT+=3
if %DOCKER_WAIT% lss 60 goto :wait_docker

echo [WARN] Docker ist noch nicht bereit. Starte Ruby Panel trotzdem...
echo        Server-Start/Stop funktioniert erst wenn Docker läuft.
goto :docker_warn

:docker_warn
echo [WARN] Docker nicht verfuegbar - Serveroperationen werden nicht funktionieren.

:docker_ok

REM ─── Check PostgreSQL ────────────────────────────────────
sc query postgresql-x64-16 >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=4" %%s in ('sc query postgresql-x64-16 ^| findstr STATE') do (
        if "%%s" == "RUNNING" (
            echo [OK] PostgreSQL 16 läuft bereits
            goto :postgres_ok
        )
    )
    echo [INFO] PostgreSQL 16 Service starten...
    net start postgresql-x64-16 >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] PostgreSQL 16 gestartet
    ) else (
        echo [WARN] Konnte PostgreSQL nicht starten (kein Admin-Recht?)
    )
    goto :postgres_ok
)

sc query postgresql-x64-17 >nul 2>&1
if %errorlevel% equ 0 (
    net start postgresql-x64-17 >nul 2>&1
    echo [OK] PostgreSQL 17 gestartet
    goto :postgres_ok
)

sc query postgresql-x64-15 >nul 2>&1
if %errorlevel% equ 0 (
    net start postgresql-x64-15 >nul 2>&1
    echo [OK] PostgreSQL 15 gestartet
    goto :postgres_ok
)

REM Suche nach beliebigem PostgreSQL Service
for /f "tokens=*" %%s in ('sc query type= all ^| findstr /i "postgresql"') do (
    net start %%s >nul 2>&1
)

echo [WARN] PostgreSQL Service nicht gefunden oder konnte nicht gestartet werden.

:postgres_ok

REM ─── .env Datei ──────────────────────────────────────────
if not exist ".env" (
    if exist ".env.local" (
        echo DATABASE_URL=postgresql://ruby:ruby_secret@127.0.0.1:5432/rubypanel?connect_timeout=5^&pool_timeout=5 > .env
        echo DIRECT_URL=postgresql://ruby:ruby_secret@127.0.0.1:5432/rubypanel?connect_timeout=5^&pool_timeout=5 >> .env
        echo [OK] .env Datei erstellt
    ) else if exist ".env.example" (
        copy .env.example .env.local >nul
        echo DATABASE_URL=postgresql://ruby:ruby_secret@127.0.0.1:5432/rubypanel?connect_timeout=5^&pool_timeout=5 > .env
        echo DIRECT_URL=postgresql://ruby:ruby_secret@127.0.0.1:5432/rubypanel?connect_timeout=5^&pool_timeout=5 >> .env
        echo [OK] .env aus .env.example erstellt
    )
) else (
    echo [OK] .env Datei vorhanden
)

REM ─── node_modules ────────────────────────────────────────
if not exist "node_modules" (
    echo [INFO] node_modules fehlt - npm install läuft...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install fehlgeschlagen!
        pause
        exit /b 1
    )
    echo [OK] Abhängigkeiten installiert
) else (
    echo [OK] node_modules vorhanden
)

REM ─── Prisma DB Push ──────────────────────────────────────
echo [INFO] Prisma Schema synchronisieren...
npx prisma db push --skip-generate >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Datenbank Schema aktuell
) else (
    echo [WARN] Prisma db push fehlgeschlagen (DB nicht erreichbar?)
)

REM ─── Prisma Seed ─────────────────────────────────────────
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.user.count().then(n=>{if(n===0){process.exit(1)}else{process.exit(0)}}).catch(()=>process.exit(0))" >nul 2>&1
if %errorlevel% equ 1 (
    echo [INFO] Kein Admin gefunden - Seed wird ausgeführt...
    npm run prisma:seed
    echo [OK] Admin-User erstellt
) else (
    echo [OK] Admin-User existiert bereits
)

REM ─── Panel starten ───────────────────────────────────────
echo.
echo  ====================================
echo   Panel startet auf http://localhost:3000
echo   Login: cattech3d@gmail.com / @a240924
echo  ====================================
echo.

npm run dev:all
