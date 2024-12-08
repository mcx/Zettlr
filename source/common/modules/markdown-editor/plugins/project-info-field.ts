/**
 * @ignore
 * BEGIN HEADER
 *
 * Contains:        Project info field
 * CVM-Role:        CodeMirror plugin
 * Maintainer:      Hendrik Erz
 * License:         GNU GPL v3
 *
 * Description:     A small state field that contains various infos about the
 *                  associated Zettlr project, if the currently loaded file is
 *                  part of such a project.
 *
 * END HEADER
 */

import { StateEffect, StateField, type EditorState } from '@codemirror/state'
import type { StatusbarItem } from '../statusbar'
import localiseNumber from 'source/common/util/localise-number'
import { trans } from 'source/common/i18n-renderer'
import type { EditorView } from '@codemirror/view'
import { configField } from '../util/configuration'

export interface ProjectInfo {
  name: string // Project name
  wordCount: number // Total words across project files
  charCount: number // Total characters across project files
}

/**
 * Use this effect to provide updated information about a project to the editor.
 */
export const projectInfoUpdateEffect = StateEffect.define<ProjectInfo|null>()

/**
 * This field can be used to provide to the editor further context information
 * on the file's association with a Zettlr project.
 */
export const projectInfoField = StateField.define<ProjectInfo|null>({
  create (_state: EditorState) {
    return null
  },
  update (value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(projectInfoUpdateEffect)) {
        console.log('Found project info update effect!')
        value = effect.value
      }
    }

    return value
  }
})

/**
 * Displays project info (if present in the EditorState) in the statusbar.
 *
 * @param   {EditorState}    state  The EditorState
 * @param   {EditorView}     _view  The EditorView
 *
 * @return  {StatusbarItem}         The field content
 */
export function statusbarProjectInfo (state: EditorState, _view: EditorView): StatusbarItem|null {
  const field = state.field(projectInfoField, false)
  const conf = state.field(configField, false)

  if (field == null) {
    return null
  }

  const countLabel = conf?.countChars === true
    ? trans('%s characters', localiseNumber(field.charCount))
    : trans('%s words', localiseNumber(field.wordCount))

  return {
    // NOTE: Should be the same icon that we also use for projects in the file manager
    content: `<cds-icon shape="blocks-group"></cds-icon> ${countLabel}`,
    title: trans('This file is part of project "%s"', field.name),
    allowHtml: true
  }
}
