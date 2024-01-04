import fs from 'fs'

export const compareTwoFiles = (
  filePath1: string,
  filePath2: string
): boolean => {
  return fs.readFileSync(filePath1).equals(fs.readFileSync(filePath2))
}
