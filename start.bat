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

REM ─── Check PostgreSQL ────────────────────────────────────
sc query postgresql-x64-16 >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=4" %%s in ('sc query postgresql-x64-16 ^| findstr STATE') do (
        if "%%s" == "RUNNING" (
            echo [OK] PostgreSQL laeuft bereits
            goto :postgres_ok
        )
    )
    echo [INFO] PostgreSQL Service starten...
    net start postgresql-x64-16 >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARN] Konnte PostgreSQL nicht starten (kein Admin-Recht?)
        echo        Bitte PostgreSQL manuell starten: net start postgresql-x64-16
    ) else (
        echo [OK] PostgreSQL gestartet
    )
) else (
    sc query postgresql-x64-15 >nul 2>&1
    if %errorlevel% equ 0 (
        net start postgresql-x64-15 >nul 2>&1
        echo [OK] PostgreSQL 15 gestartet
    ) else (
        echo [WARN] PostgreSQL Service nicht gefunden.
        echo        Stelle sicher dass PostgreSQL laeuft bevor du fortfaehrst.
    )
)
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
        echo [OK] .env aus .env.example erstellt - bitte .env.local anpassen!
    )
) else (
    echo [OK] .env Datei vorhanden
)

REM ─── node_modules ────────────────────────────────────────
if not exist "node_modules" (
    echo [INFO] node_modules fehlt - npm install laeuft...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install fehlgeschlagen!
        pause
        exit /b 1
    )
    echo [OK] Abhaengigkeiten installiert
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

REM ─── Prisma Seed (nur wenn noch kein Admin) ──────────────
npx prisma db push --skip-generate >nul 2>&1
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.user.count().then(n=>{if(n===0){process.exit(1)}else{process.exit(0)}}).catch(()=>process.exit(0))" >nul 2>&1
if %errorlevel% equ 1 (
    echo [INFO] Kein Admin gefunden - Seed wird ausgefuehrt...
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
