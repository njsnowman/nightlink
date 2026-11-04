; ANSI terminal setup. Custom pages retain NSIS navigation and per-user upgrade policy.
!include "nsDialogs.nsh"
!include "LogicLib.nsh"
!include "MUI2.nsh"
!define NIGHTLINK_INSTALLER_ART "${__FILEDIR__}\installer-assets"
!define MUI_BGCOLOR "000000"
!define MUI_TEXTCOLOR "FFFFFF"
!define MUI_DIRECTORYPAGE_BGCOLOR "000000"
!define MUI_INSTFILESPAGE_COLORS "55FFFF 000000"
!define MUI_UNWELCOMEPAGE_TITLE "Remove Nightlink"
!define MUI_UNWELCOMEPAGE_TEXT "Remove the application from this Windows account.$\r$\n$\r$\nYour saved messages and contact details are retained."
!define MUI_UNFINISHPAGE_TITLE "Nightlink removed"
!define MUI_UNFINISHPAGE_TEXT "The application has been removed.$\r$\n$\r$\nYour saved messages and contact details remain on this computer."
!ifdef BUILD_UNINSTALLER
  !define MUI_CUSTOMFUNCTION_UNGUIINIT un.NightlinkThemeWindow
!else
  !define MUI_CUSTOMFUNCTION_GUIINIT NightlinkThemeWindow
!endif
Var NightlinkBodyFont
Var NightlinkTitleFont
Var NightlinkMonoFont
!macro NightlinkWindowTheme PREFIX
Function ${PREFIX}NightlinkThemeWindow
  CreateFont $NightlinkBodyFont "Consolas" 10 400
  CreateFont $NightlinkTitleFont "Consolas" 15 700
  CreateFont $NightlinkMonoFont "Consolas" 9 400
  SetCtlColors $HWNDPARENT FFFFFF 000000
  GetDlgItem $0 $HWNDPARENT 1028
  SetCtlColors $0 AAAAAA 000000
  GetDlgItem $0 $HWNDPARENT 1034
  SetCtlColors $0 AAAAAA 000000
  GetDlgItem $0 $HWNDPARENT 1256
  SetCtlColors $0 AAAAAA 000000
  GetDlgItem $0 $HWNDPARENT 1
  SendMessage $0 ${WM_SETFONT} $NightlinkBodyFont 1
  GetDlgItem $0 $HWNDPARENT 2
  SendMessage $0 ${WM_SETFONT} $NightlinkBodyFont 1
  GetDlgItem $0 $HWNDPARENT 3
  SendMessage $0 ${WM_SETFONT} $NightlinkBodyFont 1
FunctionEnd
!macroend
!ifdef BUILD_UNINSTALLER
  !insertmacro NightlinkWindowTheme "un."
!else
  !insertmacro NightlinkWindowTheme ""
Function NightlinkThemePage
  FindWindow $0 "#32770" "" $HWNDPARENT
  SetCtlColors $0 FFFFFF 000000
  GetDlgItem $2 $0 1000
  SetCtlColors $2 FFFFFF 000000
  GetDlgItem $2 $0 1006
  SetCtlColors $2 FFFFFF 000000
  GetDlgItem $2 $0 1020
  System::Call 'uxtheme::SetWindowTheme(p r2, w "", w "")'
  System::Call 'user32::GetWindow(p r0, i 5) p .r1'
  nightlink_loop:
    StrCmp $1 0 nightlink_done
    SetCtlColors $1 FFFFFF 000000
    System::Call 'user32::GetWindow(p r1, i 2) p .r1'
    Goto nightlink_loop
  nightlink_done:
  GetDlgItem $2 $0 1004
  SendMessage $2 ${PBM_SETBARCOLOR} 0 0xFFFF55
  SendMessage $2 ${PBM_SETBKCOLOR} 0 0x000000
FunctionEnd
!macro NightlinkLabel X Y W H TEXT COLOR FONT
  ${NSD_CreateLabel} ${X} ${Y} ${W} ${H} "${TEXT}"
  Pop $1
  SetCtlColors $1 ${COLOR} 000000
  SendMessage $1 ${WM_SETFONT} ${FONT} 1
!macroend
!macro NightlinkRule Y
  ${NSD_CreateLabel} 0 ${Y} 100% 1u ""
  Pop $1
  SetCtlColors $1 55FFFF 0000AA
!macroend
Var NightlinkWordmarkHandle
!macro NightlinkWordmark
  InitPluginsDir
  File /oname=$PLUGINSDIR\nightlink-wordmark.bmp "${NIGHTLINK_INSTALLER_ART}\wordmark.bmp"
  ${NSD_CreateBitmap} 0 18u 100% 36u ""
  Pop $1
  ${NSD_SetStretchedImage} $1 "$PLUGINSDIR\nightlink-wordmark.bmp" $NightlinkWordmarkHandle
!macroend
!macro NightlinkCreate
  nsDialogs::Create 1018
  Pop $0
  StrCmp $0 error nightlink_end
  SetCtlColors $0 FFFFFF 000000
!macroend
Function NightlinkWelcome
  IfSilent nightlink_end
  !insertmacro NightlinkCreate
  !insertmacro MUI_HEADER_TEXT "NIGHTLINK / SETUP" "MeshCore companion terminal for Windows."
  !insertmacro NightlinkLabel 0 0u 100% 12u "[01] PREPARE  /  [02] INSTALL  /  [03] READY" 55FFFF $NightlinkMonoFont
  !insertmacro NightlinkWordmark
  !insertmacro NightlinkRule 63u
  !insertmacro NightlinkLabel 0 72u 100% 20u "Set up your terminal." FFFFFF $NightlinkTitleFont
  !insertmacro NightlinkLabel 0 98u 100% 22u "Channel chat, direct messages and radio tools over Bluetooth or USB." AAAAAA $NightlinkBodyFont
  !insertmacro NightlinkLabel 0 125u 100% 14u "Upgrades retain saved messages and contacts." 55FFFF $NightlinkMonoFont
  GetDlgItem $1 $HWNDPARENT 1
  SendMessage $1 ${WM_SETTEXT} 0 "STR:&Continue >"
  nsDialogs::Show
  ${NSD_FreeImage} $NightlinkWordmarkHandle
  StrCpy $NightlinkWordmarkHandle 0
  nightlink_end:
FunctionEnd
Function NightlinkFinish
  IfSilent nightlink_end
  !insertmacro NightlinkCreate
  !insertmacro MUI_HEADER_TEXT "NIGHTLINK / SETUP COMPLETE" "Application files have been installed."
  !insertmacro NightlinkLabel 0 0u 100% 12u "[03] READY  /  INSTALLATION COMPLETE" 55FFFF $NightlinkMonoFont
  !insertmacro NightlinkWordmark
  !insertmacro NightlinkRule 63u
  !insertmacro NightlinkLabel 0 72u 100% 20u "Your terminal is ready." FFFFFF $NightlinkTitleFont
  !insertmacro NightlinkLabel 0 98u 100% 22u "Open Nightlink from Start. Choose Connect radio, then Bluetooth or USB." AAAAAA $NightlinkBodyFont
  !insertmacro NightlinkLabel 0 125u 100% 14u "Radio connection begins inside Nightlink." 55FFFF $NightlinkMonoFont
  GetDlgItem $1 $HWNDPARENT 1
  SendMessage $1 ${WM_SETTEXT} 0 "STR:&Finish"
  nsDialogs::Show
  ${NSD_FreeImage} $NightlinkWordmarkHandle
  StrCpy $NightlinkWordmarkHandle 0
  nightlink_end:
FunctionEnd
Var NightlinkShortcutControl
Var NightlinkShortcutChoice
Function NightlinkShortcutPage
  IfSilent nightlink_end
  !insertmacro NightlinkCreate
  !insertmacro MUI_HEADER_TEXT "NIGHTLINK / WORKSPACE OPTIONS" "Choose your desktop shortcut preference."
  !insertmacro NightlinkLabel 0 2u 100% 14u "[02] INSTALL / SHORTCUTS" 55FFFF $NightlinkMonoFont
  !insertmacro NightlinkLabel 0 22u 100% 28u "Choose your shortcuts." FFFFFF $NightlinkTitleFont
  !insertmacro NightlinkRule 64u
  ${NSD_CreateCheckbox} 0 77u 100% 18u "Create a desktop shortcut"
  Pop $NightlinkShortcutControl
  System::Call 'uxtheme::SetWindowTheme(p $NightlinkShortcutControl, w "", w "")'
  SetCtlColors $NightlinkShortcutControl FFFFFF 000000
  SendMessage $NightlinkShortcutControl ${WM_SETFONT} $NightlinkBodyFont 1
  ${NSD_SetState} $NightlinkShortcutControl $NightlinkShortcutChoice
  !insertmacro NightlinkLabel 0 103u 100% 18u "A Start menu entry is included." AAAAAA $NightlinkBodyFont
  !insertmacro NightlinkLabel 0 124u 100% 15u "Installed for this Windows account." AAAAAA $NightlinkBodyFont
  nsDialogs::Show
  nightlink_end:
FunctionEnd
Function NightlinkShortcutLeave
  ${NSD_GetState} $NightlinkShortcutControl $NightlinkShortcutChoice
FunctionEnd
!macro customWelcomePage
  Page custom NightlinkWelcome
!macroend
!macro customFinishPage
  Page custom NightlinkFinish
!macroend
!macroundef MUI_PAGE_DIRECTORY
!macro MUI_PAGE_DIRECTORY
  !define MUI_PAGE_CUSTOMFUNCTION_SHOW NightlinkThemePage
  !insertmacro MUI_PAGE_INIT
  !insertmacro MUI_PAGEDECLARATION_DIRECTORY
!macroend
!macro customPageAfterChangeDir
  Page custom NightlinkShortcutPage NightlinkShortcutLeave
  !define MUI_PAGE_CUSTOMFUNCTION_SHOW NightlinkThemePage
!macroend
!macro customInstall
  ${If} $NightlinkShortcutChoice == ${BST_CHECKED}
    CreateShortCut "$DESKTOP\${SHORTCUT_NAME}.lnk" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  ${EndIf}
!macroend
!endif
!macro customInstallMode
  StrCpy $isForceCurrentInstall "1"
!macroend
!macro customUnInstall
  Delete "$DESKTOP\${SHORTCUT_NAME}.lnk"
!macroend
!macro customHeader
  BrandingText " "
  SetFont "Consolas" 9
!macroend
