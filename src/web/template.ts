export function useTemplate(
  html: string,
  code?: number,
  isSvg: boolean = false
): () => Node {
  const t: HTMLTemplateElement = document.createElement('template')
  t.innerHTML = html

  const l = t.innerHTML.split('<').length
  if (code != null && l !== code) {
    throw new Error(
      `The browser resolved template HTML(${l}) does not match the code(${code}).`
    )
  }

  const node = isSvg ? t.content.firstChild?.firstChild : t.content.firstChild
  if (node == null) {
    throw new Error('The browser resolved template HTML should not be empty.')
  }

  return () => node.cloneNode(true)
}

export function useFirstChild(node: Node): ChildNode | null
export function useFirstChild(node: Node, must: true): ChildNode
export function useFirstChild(node: Node, must: false): ChildNode | null
export function useFirstChild(node: Node, must: boolean): ChildNode | null
export function useFirstChild(
  node: Node,
  must: boolean = false
): ChildNode | null {
  if (!must && node.firstChild == null) {
    throw new Error('Not found the first child.')
  }
  return node.firstChild
}

export function useNextSibling(node: ChildNode): ChildNode | null
export function useNextSibling(node: ChildNode, must: true): ChildNode
export function useNextSibling(node: ChildNode, must: false): ChildNode | null
export function useNextSibling(node: ChildNode, must: boolean): ChildNode | null
export function useNextSibling(
  node: ChildNode,
  must: boolean = false
): ChildNode | null {
  if (!must && node.nextSibling == null) {
    throw new Error('Not found the next sibling.')
  }
  return node.nextSibling
}
