!include "nsDialogs.nsh"
!include "LogicLib.nsh"
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
  ${NSD_CreateCheckbox} 0 10u 100% 14u "Create a desktop shortcut"
  Pop $NightlinkShortcutControl
  ${NSD_SetState} $NightlinkShortcutControl ${BST_UNCHECKED}
  nsDialogs::Show
  done:
FunctionEnd
Function NightlinkShortcutLeave
  ${NSD_GetState} $NightlinkShortcutControl $NightlinkShortcutChoice
FunctionEnd
!macro customPageAfterChangeDir
  Page custom NightlinkShortcutPage NightlinkShortcutLeave
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
