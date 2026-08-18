' ============================================================
'  Edu_AI_Child — Windows Shortcut (no console window)
'  Double-click this or pin it to taskbar/desktop.
' ============================================================
Option Explicit

Dim shell, root, ps1
Set shell = CreateObject("WScript.Shell")

' Find the folder this .vbs lives in
root = CreateObject("Scripting.FileSystemObject") _
       .GetParentFolderName(WScript.ScriptFullName)

ps1 = root & "\Edu_AI_Child_Windows.ps1"

' Launch PowerShell hidden (no black window)
shell.Run "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & ps1 & """", 0, False

' Show a small launch toast via MsgBox (optional — remove if unwanted)
' MsgBox "Edu_AI_Child is starting... open http://localhost:8000 in your browser.", 64, "Edu_AI_Child"

Set shell = Nothing
