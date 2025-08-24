$headers = @{
    "User-Agent" = "curl/7.88.1"      # mimic curl
    "Accept" = "*/*"                  # default curl accept
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/wifi-panel" `
        -Headers $headers -UseBasicParsing
    $response.Content
} catch [System.Net.WebException] {
    $webResponse = $_.Exception.Response
    if ($webResponse -ne $null) {
        $reader = New-Object System.IO.StreamReader $webResponse.GetResponseStream()
        $reader.ReadToEnd()
    } else {
        Write-Error $_
    }
}
