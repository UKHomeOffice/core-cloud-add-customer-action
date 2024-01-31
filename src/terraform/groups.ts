import { parse, stringify } from 'yaml'
import { readFileSync, writeFileSync } from 'fs'
import path from 'node:path'
import { Group } from '../types/group'
import * as core from '@actions/core'

export const Groups = (folder_path: string): GroupsAction => {
  const file_path = path.join(folder_path, 'terraform', 'groups.yaml')

  let parsedGroups: Group[]
  try {
    parsedGroups = parse(readFileSync(file_path, 'utf8')) ?? []
  } catch (error: unknown) {
    throw new Error(`Error reading groups from file '${file_path}'`)
  }

  core.info(`${parsedGroups.length} groups loaded from file '${file_path}'`)

  const writeFile = (): void => {
    try {
      core.info(`${parsedGroups.length} groups written to file '${file_path}'`)

      writeFileSync(
        file_path,
        stringify(parsedGroups, { collectionStyle: 'block' }),
        'utf8'
      )
    } catch (error: unknown) {
      throw new Error(`Error writing assignments to file '${file_path}'`)
    }
  }

  return {
    addGroup: (groupName: string, customerName: string) => {
      parsedGroups.push(new Group(groupName, customerName))
      writeFile()
    }
  }
}

export type GroupsAction = {
  addGroup(groupName: string, customerName: string): void
}
