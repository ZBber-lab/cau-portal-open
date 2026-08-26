@echo off
chcp 65001 >nul
rem CAU Portal scheduled task entry (Windows Task Scheduler, every 30 min)
rem incremental crawl (2 list pages + up to 8 new details per column) -> AI enrich (up to 8)
cd /d "%~dp0..\.."
echo ===== %date% %time% ===== >> data\crawl-task.log
D:\nodejs1\node.exe tools\scraper\crawl.mjs --pages 2 --articles 8 >> data\crawl-task.log 2>&1
D:\nodejs1\node.exe tools\scraper\enrich.mjs --limit 8 >> data\crawl-task.log 2>&1
