; Switchboard setup. Custom pages retain NSIS navigation and per-user upgrade policy.
!include "nsDialogs.nsh"
!include "LogicLib.nsh"
!include "MUI2.nsh"
!define MUI_BGCOLOR "080908"
!define MUI_TEXTCOLOR "EEEEDE"
!define MUI_DIRECTORYPAGE_BGCOLOR "10120F"
!define MUI_INSTFILESPAGE_COLORS "FFBE55 080908"
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
  CreateFont $NightlinkBodyFont "Segoe UI" 10 400
  CreateFont $NightlinkTitleFont "Segoe UI" 20 700
  CreateFont $NightlinkMonoFont "Consolas" 9 400
  SetCtlColors $HWNDPARENT EEEEDE 080908
  GetDlgItem $0 $HWNDPARENT 1028
  SetCtlColors $0 AAA99A 080908
  GetDlgItem $0 $HWNDPARENT 1034
  SetCtlColors $0 AAA99A 080908
  GetDlgItem $0 $HWNDPARENT 1256
  SetCtlColors $0 AAA99A 080908
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
  SetCtlColors $0 EEEEDE 080908
  GetDlgItem $2 $0 1000
  SetCtlColors $2 EEEEDE 10120F
  GetDlgItem $2 $0 1006
  SetCtlColors $2 EEEEDE 10120F
  GetDlgItem $2 $0 1020
  System::Call 'uxtheme::SetWindowTheme(p r2, w "", w "")'
  System::Call 'user32::GetWindow(p r0, i 5) p .r1'
  nightlink_loop:
    StrCmp $1 0 nightlink_done
    SetCtlColors $1 EEEEDE 080908
    System::Call 'user32::GetWindow(p r1, i 2) p .r1'
    Goto nightlink_loop
  nightlink_done:
  GetDlgItem $2 $0 1004
  SendMessage $2 ${PBM_SETBARCOLOR} 0 0x55BEFF
  SendMessage $2 ${PBM_SETBKCOLOR} 0 0x080908
FunctionEnd
!macro NightlinkLabel X Y W H TEXT COLOR FONT
  ${NSD_CreateLabel} ${X} ${Y} ${W} ${H} "${TEXT}"
  Pop $1
  SetCtlColors $1 ${COLOR} 080908
  SendMessage $1 ${WM_SETFONT} ${FONT} 1
!macroend
!macro NightlinkRule Y
  ${NSD_CreateLabel} 0 ${Y} 100% 1u ""
  Pop $1
  SetCtlColors $1 FFBE55 444234
!macroend
!macro NightlinkCreate
  nsDialogs::Create 1018
  Pop $0
  StrCmp $0 error nightlink_end
  SetCtlColors $0 EEEEDE 080908
!macroend
Function NightlinkWelcome
  IfSilent nightlink_end
  !insertmacro NightlinkCreate
  !insertmacro MUI_HEADER_TEXT "NIGHTLINK / WINDOWS SETUP" "Your MeshCore desktop workspace."
  !insertmacro NightlinkLabel 0 2u 100% 14u "01 / PREPARE" FFBE55 $NightlinkMonoFont
  !insertmacro NightlinkLabel 0 20u 100% 28u "Your next connection." EEEEDE $NightlinkTitleFont
  !insertmacro NightlinkLabel 0 51u 100% 18u "Install your MeshCore workspace." AAA99A $NightlinkBodyFont
  !insertmacro NightlinkRule 77u
  !insertmacro NightlinkLabel 0 87u 100% 16u "BLUETOOTH + USB" FFBE55 $NightlinkMonoFont
  !insertmacro NightlinkLabel 0 108u 100% 26u "Existing messages and contact details are retained during upgrades." EEEEDE $NightlinkBodyFont
  GetDlgItem $1 $HWNDPARENT 1
  SendMessage $1 ${WM_SETTEXT} 0 "STR:&Continue >"
  nsDialogs::Show
  nightlink_end:
FunctionEnd
Function NightlinkFinish
  IfSilent nightlink_end
  !insertmacro NightlinkCreate
  !insertmacro MUI_HEADER_TEXT "NIGHTLINK / SETUP COMPLETE" "The application is installed."
  !insertmacro NightlinkLabel 0 2u 100% 14u "03 / READY" FFBE55 $NightlinkMonoFont
  !insertmacro NightlinkLabel 0 20u 100% 28u "Ready for the mesh." EEEEDE $NightlinkTitleFont
  !insertmacro NightlinkLabel 0 55u 100% 22u "Open Nightlink from the Start menu." EEEEDE $NightlinkBodyFont
  !insertmacro NightlinkRule 84u
  !insertmacro NightlinkLabel 0 94u 100% 14u "CONNECT YOUR RADIO" FFBE55 $NightlinkMonoFont
  !insertmacro NightlinkLabel 0 114u 100% 24u "Choose Connect radio in Nightlink, then select Bluetooth or USB." EEEEDE $NightlinkBodyFont
  GetDlgItem $1 $HWNDPARENT 1
  SendMessage $1 ${WM_SETTEXT} 0 "STR:&Finish"
  nsDialogs::Show
  nightlink_end:
FunctionEnd
Var NightlinkShortcutControl
Var NightlinkShortcutChoice
Function NightlinkShortcutPage
  IfSilent nightlink_end
  !insertmacro NightlinkCreate
  !insertmacro MUI_HEADER_TEXT "NIGHTLINK / WORKSPACE OPTIONS" "Choose your desktop shortcut preference."
  !insertmacro NightlinkLabel 0 2u 100% 14u "02 / INSTALL" FFBE55 $NightlinkMonoFont
  !insertmacro NightlinkLabel 0 22u 100% 28u "Keep setup simple." EEEEDE $NightlinkTitleFont
  !insertmacro NightlinkRule 64u
  ${NSD_CreateCheckbox} 0 77u 100% 18u "Create a desktop shortcut"
  Pop $NightlinkShortcutControl
  System::Call 'uxtheme::SetWindowTheme(p $NightlinkShortcutControl, w "", w "")'
  SetCtlColors $NightlinkShortcutControl EEEEDE 080908
  SendMessage $NightlinkShortcutControl ${WM_SETFONT} $NightlinkBodyFont 1
  ${NSD_SetState} $NightlinkShortcutControl $NightlinkShortcutChoice
  !insertmacro NightlinkLabel 0 103u 100% 18u "A Start menu entry is included." AAA99A $NightlinkBodyFont
  !insertmacro NightlinkLabel 0 124u 100% 15u "Installed for this Windows account." AAA99A $NightlinkBodyFont
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
  SetFont "Segoe UI" 9
!macroend
