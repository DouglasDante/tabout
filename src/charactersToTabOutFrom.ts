import { CharacterSet } from './CharacterSet'

/**
   *  패키지 구성에서 charactersToTabOutFrom 섹션으로 가서 특수문자 코드를 가져와 ICharacterSet[]로 만든 뒤,
   *  이를 map 함수를 통해 각각의 요소를 CharacterSet으로 만들어 Array<CharacterSet>으로 반환한다
   * 
   * @return `Array<CharacterSet>`
   */
export function characterSetsToTabOutFrom(): Array<CharacterSet> {
  return CharacterSet.loadCharacterSets()
}
