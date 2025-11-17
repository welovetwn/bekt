@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   ⚠  即將刪除本次生成的所有程式碼
echo ========================================
echo.
echo 將刪除以下項目：
echo   - src/schema/*.js
echo   - src/services/*.js
echo   - src/stores/*.js
echo   - src/views/[entity]/ 資料夾
echo   - src/router/*Routes.js
echo.
set /p "confirm=是否繼續？(Y/N): "
if /i "%confirm%" neq "Y" if /i "%confirm%" neq "是" (
    echo.
    echo ❌ 操作已取消。
    pause
    exit /b
)
echo.
echo 正在清除...
if exist "src\schema\productSchema.js" del /q "src\schema\productSchema.js"
if exist "src\services\productService.js" del /q "src\services\productService.js"
if exist "src\stores\productStore.js" del /q "src\stores\productStore.js"
if exist "src\views\product" rd /s /q "src\views\product"
if exist "src\router\ProductRoutes.js" del /q "src\router\ProductRoutes.js"
if exist "src\schema\roleSchema.js" del /q "src\schema\roleSchema.js"
if exist "src\services\roleService.js" del /q "src\services\roleService.js"
if exist "src\stores\roleStore.js" del /q "src\stores\roleStore.js"
if exist "src\views\role" rd /s /q "src\views\role"
if exist "src\router\RoleRoutes.js" del /q "src\router\RoleRoutes.js"
if exist "src\schema\userSchema.js" del /q "src\schema\userSchema.js"
if exist "src\services\userService.js" del /q "src\services\userService.js"
if exist "src\stores\userStore.js" del /q "src\stores\userStore.js"
if exist "src\views\user" rd /s /q "src\views\user"
if exist "src\router\UserRoutes.js" del /q "src\router\UserRoutes.js"
echo.
echo 嘗試清理空資料夾...
if exist "src\schema" (rmdir "src\schema" 2>nul || echo   - schema 資料夾非空，保留)
if exist "src\services" (rmdir "src\services" 2>nul || echo   - services 資料夾非空，保留)
if exist "src\stores" (rmdir "src\stores" 2>nul || echo   - stores 資料夾非空，保留)
if exist "src\views" (rmdir "src\views" 2>nul || echo   - views 資料夾非空，保留)
if exist "src\router" (rmdir "src\router" 2>nul || echo   - router 資料夾非空，保留)

echo.
echo ✅ 所有指定檔案已清除！
echo.
pause