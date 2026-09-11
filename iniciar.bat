@echo off
title FinControl - Gestao Financeira
cd /d "%~dp0"
echo ===================================================
echo     Iniciando FinControl (Gestao Financeira)
echo ===================================================
echo.
echo Abrindo servidor local em http://localhost:3000...
echo.
npm.cmd run dev
pause
