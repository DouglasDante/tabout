import * as vscode from 'vscode'

export class CharacterSet {
  public open: string
  public close: string
  constructor(o: ICharacterSet)
  constructor(o: string, c: string)
  constructor(o: string | ICharacterSet, c?: string) {
    if (typeof o === 'string') {
      this.open = o
      this.close = c
    } else {
      this.open = o.open
      this.close = o.close
    }
  }

  /**
   *  패키지 구성에서 charactersToTabOutFrom 섹션으로 가서 특수문자 코드를 가져와 ICharacterSet[]로 만든 뒤,
   *  이를 map 함수를 통해 각각의 요소를 CharacterSet으로 만들어 Array<CharacterSet>으로 반환한다
   * 
   */
  public static loadCharacterSets(): Array<CharacterSet> {
    return vscode.workspace.getConfiguration(`ctabout`).get<ICharacterSet[]>(`charactersToTabOutFrom`, [
      { open: '[', close: ']' },
      { open: '{', close: '}' },
      { open: '(', close: ')' },
      { open: '\'', close: '\'' },
      { open: '"', close: '"' },
      { open: ':', close: ':' },
      { open: '=', close: '=' },
      { open: '>', close: '>' },
      { open: '<', close: '<' },
      { open: '.', close: '.' },
      { open: '`', close: '`' },
      { open: ';', close: ';' },
    ]).map(o => new CharacterSet(o))
  }
}

export interface ICharacterSet {
  open: string
  close: string
}

