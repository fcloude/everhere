$env:PATH = "C:\Program Files\nodejs;C:\Users\aryan\AppData\Roaming\npm;" + $env:PATH
cd "C:\Users\aryan\OneDrive\Desktop\EVERHERE\Website (freebuff)\apps\web"

# Build static export
$env:NEXT_PUBLIC_API_URL = "https://api.everhere.free.je/api/v1"
& "C:\Program Files\nodejs\node.exe" "C:\Users\aryan\OneDrive\Desktop\EVERHERE\Website (freebuff)\apps\web\node_modules\next\dist\bin\next" build
