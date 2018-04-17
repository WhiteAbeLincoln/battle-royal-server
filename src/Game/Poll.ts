export class Poll {
  private responseset: Set<string>
  private votes: Map<string, Set<string>>
  private open: boolean
  constructor (public name: string, public owner: string, public description = `A poll by ${owner}` , responselist = ['yes', 'no']) {
    this.open = true
    this.votes = new Map()
    this.responseset = new Set(responselist)
  }

  close () {
    this.open = false
  }

  get closed () {
    return !this.open
  }

  get validResponses () {
    return [...this.responseset.values()]
  }

  cast (user: string, response: string) {
    if (!this.open) {
      throw new Error(`Poll ${this.name} is closed`)
    }

    if (!this.responseset.has(response)) {
      throw new Error(`Invalid Response ${response}\nValid Responses: ${this.validResponses.join(', ')}`)
    }

    if (!this.votes.has(response)) {
      this.votes.set(response, new Set())
    }

    for (const set of this.votes.values()) {
      if (set.has(user)) {
        set.delete(user)
      }
    }

    const userset = this.votes.get(response)
    userset && userset.add(user)
  }

  getVotes () {
    let responseStr = ''
    for (const entry of this.votes.entries()) {
      responseStr += `${entry[0]}: ${entry[1].size} - ${[...entry[1].values()].join(', ')}\n`
    }

    return responseStr
  }

  get respondents () {
    const users = [...this.votes.values()].reduce((p: string[], c) => [...p, ...c.values()], [])
    const userSet = new Set(users)
    return [...userSet]
  }

  toString () {
    return (
`Poll: ${this.name} by ${this.owner} - ${this.closed ? 'closed' : 'open'}
Description: ${this.description}
Valid Responses: ${this.validResponses.join(', ')}
Responses:
${this.getVotes()}
`)
  }
}

export default Poll
