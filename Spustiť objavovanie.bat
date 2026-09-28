@echo off
rem Spusti Objavujem svet: maly lokalny server (PowerShell z Windows) + okno aplikacie v Edge.
rem Server bezi v minimalizovanom okne "Objavujem svet" - pocas hry ho nezatvarajte.
start "Objavujem svet" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Minimized -File "%~dp0server.ps1"
