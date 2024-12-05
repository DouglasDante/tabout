import { CharacterSet } from './CharacterSet'
import { characterSetsToTabOutFrom } from './charactersToTabOutFrom'
import { window, Position, Selection, commands } from 'vscode';

export function returnHighest(num1: number, num2: number): number {
    return num1 > num2 ? num1 : num2;
}

export function returnLowest(num1: number, num2: number): number {
    return num1 < num2 ? num1 : num2;
}

export function oneNumberIsNegative(num1: number, num2: number): boolean {
    return (num1 <= -1 || num2 <= -1);
}

export function getPreviousChar(currentPosition: number, text: string): string {
    return text.substring(currentPosition - 1, currentPosition);
}

export function getNextChar(currentPosition: number, text: string): string {
    return text.substring(currentPosition + 1, currentPosition);
}

export function determineNextSpecialCharPosition(charInfo: CharacterSet, text: string, position: number): number {
    // 커서가 현재 위치한 줄의 코드(text)에서 타겟문자(charInfo)를 position+1의 위치에서 부터 검색한다.
    let positionNextOpenChar = text.indexOf(charInfo.open, position + 1);

    // open 타겟 문자를 못 찾으면 close 타겟 문자를 검색한다.
    if (positionNextOpenChar == -1) {
        positionNextOpenChar = text.indexOf(charInfo.close, position + 1);
    }

    // 값을 찾지 못 했을 경우
    if (positionNextOpenChar == -1) {
        //find first other special character    
        // 현재 커서 위치에서 코드를 짤라서
        var strToSearchIn = text.substr(position);
        var counter = position;

        // 내용물을 하나하나 비교 검새개한다.
        for (var char of strToSearchIn) {
            counter++;
            let info = characterSetsToTabOutFrom().find(c => c.open == char || c.close == char);

            // 검색 중 값이 발견되면 해당 위치(열)를 리턴 값에 대입 시킨 뒤 반복문을 나간다.
            if (info !== undefined) {
                positionNextOpenChar = counter;
                break;
            }
        }
        // 값을 발견하지 못 하면 positionNextOpenChar 값은 그대로 -1이 된다.
    }

    return positionNextOpenChar;
}

export function determinePreviousSpecialCharPosition(charInfo: CharacterSet, text: string, position: number): number {
    // 커서가 현재 위치한 줄의 코드(text)에서 타겟문자(charInfo)를 position-1의 위치에서 부터 검색한다.
    let positionPreviousOpenChar = text.indexOf(charInfo.open, position - 1);

    // open 타겟 문자를 못 찾으면 close 타겟 문자를 검색한다.
    if (positionPreviousOpenChar == -1) {
        positionPreviousOpenChar = text.indexOf(charInfo.close, position - 1);
    }

    // 값을 찾지 못 했을 경우
    if (positionPreviousOpenChar == -1) {
        //find first other special character    
        // 현재 커서 위치에서 코드를 짤라서
        var strToSearchIn = text.substr(position);
        var counter = position;

        // 내용물을 하나하나 비교 검새개한다.
        for (var char of strToSearchIn) {
            counter++;
            let info = characterSetsToTabOutFrom().find(c => c.open == char || c.close == char);

            // 검색 중 값이 발견되면 해당 위치(열)를 리턴 값에 대입 시킨 뒤 반복문을 나간다.
            if (info !== undefined) {
                positionPreviousOpenChar = counter;
                break;
            }
        }
        // 값을 발견하지 못 하면 positionNextOpenChar 값은 그대로 -1이 된다.
    }

    return positionPreviousOpenChar;
}

export function selectNextCharacter(text: string, position: number) {
    // 타겟 문자를 가져와서
    let nextCharacter = getNextChar(position, text);

    // 한번 더 검사를 한 뒤
    let indxNext = characterSetsToTabOutFrom().find(o => o.open == nextCharacter || o.close == nextCharacter)
    if (indxNext !== undefined) {
        //no tab, put selection just AFTER the next special character 
        // 커서를 한 칸 더 이동시킨 위치를 할당하여
        let nextCursorPosition = new Position(window.activeTextEditor.selection.active.line, position + 1);

        // 해당 위치 값을 반환한다
        return window.activeTextEditor.selection = new Selection(nextCursorPosition, nextCursorPosition);
    }

    // Default
    commands.executeCommand("tab");
}

export function selectPreviousCharacter(text: string, position: number) {
    // 타겟 문자를 가져와서
    let previousCharacter = getPreviousChar(position, text);

    // 한번 더 검사를 한 뒤
    let indxPrevious = characterSetsToTabOutFrom().find(o => o.open == previousCharacter || o.close == previousCharacter)

    if (indxPrevious !== undefined) {
        //no tab, put selection just AFTER the next special character 
        // 커서를 한 칸 뒤로 이동시킨 위치를 할당하여
        let previousCursorPosition = new Position(window.activeTextEditor.selection.active.line, position - 1);

        // 해당 위치 값을 반환한다
        return window.activeTextEditor.selection = new Selection(previousCursorPosition, previousCursorPosition);
    }

    // Default
    commands.executeCommand("shift+tab");
}