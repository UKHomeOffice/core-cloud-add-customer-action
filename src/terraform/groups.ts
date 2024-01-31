import { parse } from 'yaml'
import { readFileSync } from 'fs'
import path from 'node:path'
import { Group } from '../types/group'
import * as core from '@actions/core'

export const Groups = (folder_path: string): Record<string, never> => {
  const file_path = path.join(folder_path, 'terraform', 'groups.yaml')

  let parsedGroups: Group[]
  try {
    parsedGroups = parse(readFileSync(file_path, 'utf8')) ?? []
  } catch (error: unknown) {
    throw new Error(`Error reading groups from file '${file_path}'`)
  }

  core.info(`${parsedGroups.length} groups loaded from file '${file_path}'`)

  return {}
}
