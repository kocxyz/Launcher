@REM wait 5 seconds
echo Waiting for starter process to finish...
ping -n 6 127.0.0.1 > nul

@REM start the update file in the download folder
start C:\Users\Public\Downloads\kocity-update.exe
exit