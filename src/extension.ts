'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument, Selection, Range, Position } from 'vscode';
import { characterSetsToTabOutFrom } from './charactersToTabOutFrom'
import { selectNextCharacter, selectPreviousCharacter, returnHighest, returnLowest, oneNumberIsNegative, getPreviousChar, getNextChar, determineNextSpecialCharPosition, determinePreviousSpecialCharPosition } from './utils';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  let isDisabledByDefault = vscode.workspace.getConfiguration("ctabout").get('disableByDefault');
  context.workspaceState.update("ctabout-active", (isDisabledByDefault ? false : true));

  context.subscriptions.push(
    // 텝 아웃을 껐다 켰다 하는 명령
    vscode.commands.registerCommand('ctoggle-tabout', () => {
      let currentState = context.workspaceState.get("ctabout-active");
      // true, false 값을 뒤집는다
      context.workspaceState.update("ctabout-active", !currentState);
      window.showInformationMessage("cTabOut is " + (!currentState ? "" : " NOT ") + "active");
    }));


  let ctabout = vscode.commands.registerCommand('ctabout', () => {
    // The code you place here will be executed every time your command is executed
    // 활성된 텍스트 에디터를 가져와서(탭)
    let editor = window.activeTextEditor;

    //vscode.commands.executeCommand("acceptSelectedSuggestion");
    // 에디터가 비었으면 종료
    if (!editor)
      return;

    // 워크스페이스에서 '탭아웃' 토글이 활성돼 있지 않으면 기존 탭 명령(다중 공백) 실행
    if (!context.workspaceState.get('ctabout-active')) {
      commands.executeCommand("tab");
      return;
    }

    /// 커서가 위치한 현재 줄의 코드(문자열)
    let currentLineText = editor.document.lineAt(editor.selection.active.line).text;
    /// 커서가 위치현 현재 줄의 열
    let currentPositionInLine = editor.selection.active.character;

    // window.showInformationMessage("현재 열 위치: " + editor.selection.active.character);
    // if (currentPositionInLine == 0) {
    //   commands.executeCommand("tab");
    //   return;
    // }

    // if (editor.selection.active.character > 0) {
    //   // 현재 커서가 있는 줄의 코드를 가져와서(0~현재 커서 열까지)
    //   var rangeBeforeCurrentPosition = new Range(new Position(editor.selection.active.line, 0), new Position(editor.selection.active.line, currentPositionInLine));
    //   // 가져온 범위의 코드를 문자열로 바꾼 뒤
    //   var textBeforeCurrentPosition = editor.document.getText(rangeBeforeCurrentPosition);
    //   // 내용물이 없으면 그냥 탭
    //   if (textBeforeCurrentPosition.trim() == "") {
    //     commands.executeCommand("tab");
    //     return;
    //   }
    // }

    // Previous character special?
    // 바로 직전 문자를 가져온다
    let previousCharacter = getPreviousChar(currentPositionInLine, currentLineText);

    // 패키지에서 정의하고 있는 타겟문자 목록을 배열로 만들어 가져온 뒤
    // 직전 문자와 같은 요소를 찾는다.
    let characterInfo = characterSetsToTabOutFrom().find(o => o.open == previousCharacter || o.close == previousCharacter)

    if (characterInfo !== undefined) {

      // 커서 바로 우측의 문자를 가져와서
      let nextCharacter = getNextChar(currentPositionInLine, currentLineText);

      // 가져온 문자와 같은 값이 있는지 타겟문자 목록에서 찾는다
      let indxNext = characterSetsToTabOutFrom().find(o => o.open == nextCharacter || o.close == nextCharacter)

      // 타겟문자 목록과 일치하는 값이 없지 않으면
      if (indxNext !== undefined) {
        // 커서를 한칸 우측으로 이동시키는 명령을 수행한다
        return selectNextCharacter(currentLineText, currentPositionInLine);
      }
    }

    if (characterInfo !== undefined) {
      //no tab, put selection just before the next special character
      // 직후 특별 문자 위치를 가져와서
      let positionNextSpecialCharacter = determineNextSpecialCharPosition(characterInfo, currentLineText, currentPositionInLine);

      // 특수 문자가 발견 되었을 경우
      if (positionNextSpecialCharacter > -1) {
        //Move cursor
        // 현재 커서 위치를 한칸 우측으로 이동시킨다.
        let nextCursorPosition = new vscode.Position(editor.selection.active.line, positionNextSpecialCharacter);
        return editor.selection = new vscode.Selection(nextCursorPosition, nextCursorPosition);

      }
    }

    //Next character special?
    // 직후 문자가 특별하면 커서를 우측 한 칸 이동시킨다
    return selectNextCharacter(currentLineText, currentPositionInLine);
  });

  let back_tabout = vscode.commands.registerCommand("back-tabout", () => {
    // The code you place here will be executed every time your command is executed
    // 활성된 텍스트 에디터를 가져와서(탭)
    let editor = window.activeTextEditor;

    //vscode.commands.executeCommand("acceptSelectedSuggestion");
    // 에디터가 비었으면 종료
    if (!editor)
      return;

    // 워크스페이스에서 '탭아웃' 토글이 활성돼 있지 않으면 기존 백탭 명령 실행
    if (!context.workspaceState.get('ctabout-active')) {
      commands.executeCommand("outdent");
      return;
    }

    /// 커서가 위치한 현재 줄의 코드(문자열)
    let currentLineText = editor.document.lineAt(editor.selection.active.line).text;
    /// 커서가 위치현 현재 줄의 열
    let currentPositionInLine = editor.selection.active.character;

    // window.showInformationMessage("back_tabout, 현재 열 위치: " + editor.selection.active.character);
    // if (currentPositionInLine == 0) {
    //   commands.executeCommand("outdent");
    //   return;
    // }

    // if (editor.selection.active.character > 0) {
    //   // 현재 커서가 있는 줄의 코드를 가져와서(0~현재 커서 열까지)
    //   var rangeBeforeCurrentPosition = new Range(new Position(editor.selection.active.line, 0), new Position(editor.selection.active.line, currentPositionInLine));
    //   // 가져온 범위의 코드를 문자열로 바꾼 뒤
    //   var textBeforeCurrentPosition = editor.document.getText(rangeBeforeCurrentPosition);
    //   // 내용물이 없으면 그냥 백탭
    //   if (textBeforeCurrentPosition.trim() == "") {
    //     commands.executeCommand("outdent");
    //     return;
    //   }
    // }

    // 바로 다음 문자를 가져온다
    let nextCharacter = getNextChar(currentPositionInLine, currentLineText);

    // 패키지에서 정의하고 있는 타겟문자 목록을 배열로 만들어 가져온 뒤
    // 다음 문자와 같은 요소를 찾는다.
    let characterInfo = characterSetsToTabOutFrom().find(o => o.open == nextCharacter || o.close == nextCharacter)

    if (characterInfo !== undefined) {

      // 커서 직전 좌측의 문자를 가져와서
      let previousCharacter = getNextChar(currentPositionInLine, currentLineText);

      // 가져온 문자와 같은 값이 있는지 타겟문자 목록에서 찾는다
      let indxPrevious = characterSetsToTabOutFrom().find(o => o.open == previousCharacter || o.close == previousCharacter)

      // 타겟문자 목록과 일치하는 값이 있으면(없지 않으면)
      if (indxPrevious !== undefined) {
        // 커서를 한칸 좌측으로 이동시키는 명령을 수행한다
        return selectPreviousCharacter(currentLineText, currentPositionInLine);
      }
    }

    if (characterInfo !== undefined) {
      //no tab, put selection just before the next special character
      // 직전 특수문자 위치를 가져와서
      let positionPreviousSpecialCharacter = determinePreviousSpecialCharPosition(characterInfo, currentLineText, currentPositionInLine);

      // 특수 문자가 발견 되었을 경우
      if (positionPreviousSpecialCharacter > -1) {
        //Move cursor
        // 현재 커서 위치를 한칸 좌측으로 이동시킨다.
        let previousCursorPosition = new vscode.Position(editor.selection.active.line, positionPreviousSpecialCharacter);
        return editor.selection = new vscode.Selection(previousCursorPosition, previousCursorPosition);
      }
    }

    // {
    //   commands.executeCommand("outdent");

    //   return;
    // }

    // Previous character special?
    return selectPreviousCharacter(currentLineText, currentPositionInLine);
  });

  let show_col = vscode.commands.registerCommand('show-col', () => {
    let editor = window.activeTextEditor;

    let currentLineText = editor.document.lineAt(editor.selection.active.line).text;
    let currentPositionInLine = editor.selection.active.character;

    let index_position = currentPositionInLine;

    for (; index_position > -1; index_position -= 1) {
      if (currentLineText.charAt(index_position) == "v") {
        window.showInformationMessage("v 위치 반환: " + index_position);

        break;
      }
    }

    window.showInformationMessage("v 위치 반환: " + currentLineText.indexOf("v", 5));
    // commands.executeCommand("outdent");
  });

  context.subscriptions.push(ctabout);
  context.subscriptions.push(back_tabout);
  context.subscriptions.push(show_col);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
