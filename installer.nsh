; Tactical branding uses native NSIS controls and keyboard navigation.
!define MUI_BGCOLOR "101715"
!define MUI_TEXTCOLOR "EDF1E8"
!define MUI_DIRECTORYPAGE_BGCOLOR "1B251F"
!define MUI_INSTFILESPAGE_COLORS "B6CB86 101715"
!ifdef BUILD_UNINSTALLER
  !define MUI_CUSTOMFUNCTION_UNGUIINIT un.NightlinkThemeWindow
!else
  !define MUI_CUSTOMFUNCTION_GUIINIT NightlinkThemeWindow
!endif
!define MUI_WELCOMEPAGE_TITLE "Nightlink radio desktop"
!define MUI_WELCOMEPAGE_TEXT "Connect to your MeshCore radio over Bluetooth or USB.$\r$\n$\r$\nChoose an installation folder and your shortcut preference to prepare this computer.$\r$\n$\r$\nPREPARE  /  INSTALL  /  COMPLETE"
!define MUI_FINISHPAGE_TITLE "Nightlink is ready"
!define MUI_FINISHPAGE_TEXT "Installation is complete.$\r$\n$\r$\nOpen Nightlink from the Start menu, then choose Bluetooth or USB to connect your radio.$\r$\n$\r$\nYour saved messages and contact details are retained during upgrades."
!ifndef BUILD_UNINSTALLER
Function NightlinkThemeWindow
  SetCtlColors $HWNDPARENT EDF1E8 101715
  GetDlgItem $0 $HWNDPARENT 1028
  SetCtlColors $0 9EAFA2 101715
  GetDlgItem $0 $HWNDPARENT 1034
  SetCtlColors $0 9EAFA2 101715
  GetDlgItem $0 $HWNDPARENT 1256
  SetCtlColors $0 9EAFA2 101715
FunctionEnd
!else
Function un.NightlinkThemeWindow
  SetCtlColors $HWNDPARENT EDF1E8 101715
  GetDlgItem $0 $HWNDPARENT 1028
  SetCtlColors $0 9EAFA2 101715
  GetDlgItem $0 $HWNDPARENT 1034
  SetCtlColors $0 9EAFA2 101715
  GetDlgItem $0 $HWNDPARENT 1256
  SetCtlColors $0 9EAFA2 101715
FunctionEnd
!endif
!ifndef BUILD_UNINSTALLER
Function NightlinkThemePage
  FindWindow $0 "#32770" "" $HWNDPARENT
  SetCtlColors $0 EDF1E8 101715
  System::Call 'user32::GetWindow(p r0, i 5) p .r1'
  loop:
    StrCmp $1 0 done
    SetCtlColors $1 EDF1E8 101715
    System::Call 'user32::GetWindow(p r1, i 2) p .r1'
    Goto loop
  done:
FunctionEnd
!endif
!macro customWelcomePage
  !insertmacro MUI_PAGE_WELCOME
  !define MUI_PAGE_CUSTOMFUNCTION_SHOW NightlinkThemePage
!macroend
!include "nsDialogs.nsh"
!include "LogicLib.nsh"
!include "MUI2.nsh"
!macro customInstallMode
  StrCpy $isForceCurrentInstall "1"
!macroend
!ifndef BUILD_UNINSTALLER
Var NightlinkShortcutControl
Var NightlinkShortcutChoice
Function NightlinkShortcutPage
  IfSilent done
  nsDialogs::Create 1018
  Pop $0
  StrCmp $0 error done
  !insertmacro MUI_HEADER_TEXT "Prepare your workspace" "Choose how to open Nightlink."
  SetCtlColors $0 EDF1E8 101715
  ${NSD_CreateCheckbox} 0 10u 100% 14u "Create a desktop shortcut"
  Pop $NightlinkShortcutControl
  System::Call 'uxtheme::SetWindowTheme(p $NightlinkShortcutControl, w "", w "")'
  SetCtlColors $NightlinkShortcutControl EDF1E8 101715
  ${NSD_SetState} $NightlinkShortcutControl ${BST_UNCHECKED}
  ${NSD_CreateLabel} 0 44u 100% 36u "A Start menu entry is created automatically. Your radio can connect over Bluetooth or a USB data cable."
  Pop $1
  SetCtlColors $1 B6CB86 101715
  nsDialogs::Show
  done:
FunctionEnd
Function NightlinkShortcutLeave
  ${NSD_GetState} $NightlinkShortcutControl $NightlinkShortcutChoice
FunctionEnd
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
!macro customUnInstall
  Delete "$DESKTOP\${SHORTCUT_NAME}.lnk"
!macroend

!macro customHeader
  BrandingText " "
!macroend
