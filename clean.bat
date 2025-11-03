@echo off
echo Cleaning DevQuest monorepo...
echo.

echo Removing node_modules directories...
if exist node_modules rmdir /s /q node_modules
if exist frontend\node_modules rmdir /s /q frontend\node_modules
if exist backend\node_modules rmdir /s /q backend\node_modules
if exist contracts\node_modules rmdir /s /q contracts\node_modules
if exist shared\node_modules rmdir /s /q shared\node_modules

echo Removing build directories...
if exist frontend\.next rmdir /s /q frontend\.next
if exist backend\dist rmdir /s /q backend\dist
if exist contracts\artifacts rmdir /s /q contracts\artifacts
if exist contracts\cache rmdir /s /q contracts\cache
if exist shared\dist rmdir /s /q shared\dist

echo Removing lock files...
if exist bun.lockb del /f bun.lockb
if exist frontend\bun.lockb del /f frontend\bun.lockb
if exist backend\bun.lockb del /f backend\bun.lockb
if exist contracts\bun.lockb del /f contracts\bun.lockb

echo.
echo Clean complete!
echo.
echo Run 'bun install' to reinstall dependencies.
