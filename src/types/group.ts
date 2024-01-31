export class Group {
  name: string
  description: string

  constructor(name: string, customerName: string) {
    this.name = name
    this.description = Group.getDescription(customerName)
  }

  private static getDescription = (customerName: string): string => {
    return `Foundry Identity Center Group for ${customerName}`
  }
}
