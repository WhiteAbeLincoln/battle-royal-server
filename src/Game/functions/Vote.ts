import { SocketFunc, bugger, Message } from '../index'
import { MessageKeys, EmitKeys } from '../keys'
import { Vec2 } from '../models/World'
import Poll from '../models/Poll'
import { sendMessage, startGame } from '../helpers'
import { init } from '../models/Game'

export const VoteStart: SocketFunc = (socket, io) => (auth, state) => {
  socket.on(MessageKeys.VOTE_START, (msg: Message<boolean>) => {
    if (msg.data) {
      bugger('%s voted to start', auth.token.gamertag)
      state.startVotes.add(auth.token.gamertag)

      sendMessage(io, `${auth.token.gamertag} is ready`)

      if ([...state.UserMap.keys()].every(u => state.startVotes.has(u))) {
        // start game, everyone voted yes
        startGame(io, state)
        bugger('starting game')
        init()
      }
    } else {
      bugger('%s removed vote to start', auth.token.gamertag)
      state.startVotes.delete(auth.token.gamertag)
      sendMessage(io, `${auth.token.gamertag} is not ready`)
    }
  })
}

export const VoteKick: SocketFunc = (socket, io) => (auth, state) => {
  socket.on(MessageKeys.VOTE_KICK, (msg: Message<string>) => {
    bugger('%s voted to kick %s', auth.token.gamertag, msg.data)
    const user = state.UserMap.get(msg.data)

    if (!user) {
      sendMessage(socket, `Invalid user ${msg.data}`)
      return
    }

    user.kickvotes.add(auth.token.gamertag)
    if (user.kickvotes.size > Object.keys(state.UserMap).length / 2) {
      // we have a majority vote to ban user
      user.socket.emit(EmitKeys.KICK_USER)
      user.socket.disconnect()
      state.UserMap.delete(msg.data)
    }

    io.emit(EmitKeys.NEW_SPAWN, { [auth.token.gamertag]: msg })
    sendMessage(io, `${msg.data} was kicked`, '<SERVER>')
  })
}

interface PollCreate {
  kind: 'create'
  name: string
  responses?: string[]
  description?: string
}

interface PollClose {
  kind: 'close'
  name: string
}

interface PollQuery {
  kind: 'query'
  name?: string
}

type PollData = PollCreate | PollClose | PollQuery

export const PollHandler: SocketFunc = (socket, io) => (auth, state) => {
  socket.on(MessageKeys.POLL, (msg: Message<PollData>) => {
    switch (msg.data.kind) {
      case 'create': {
        if (state.polls.has(msg.data.name) && state.polls.get(msg.data.name)!.owner !== auth.token.gamertag) {
          sendMessage(socket, `Poll ${msg.data.name} already exists and is owned by another user`)
          return
        }

        state.polls.set(msg.data.name, new Poll(msg.data.name, auth.token.gamertag, msg.data.description, msg.data.responses))
        bugger('%s created a new poll: \'%s\' with valid responses: \'%s\'', auth.token.gamertag, msg.data.name, (msg.data.responses || ['<DEFAULTS>']).join(', '))
        sendMessage(socket, `Created poll ${msg.data.name}`)
        sendMessage(socket, `New poll ${msg.data.name} by ${auth.token.gamertag}`, '<SERVER>', true)
        break
      }
      case 'close': {
        if (!state.polls.has(msg.data.name) || state.polls.get(msg.data.name)!.owner !== auth.token.gamertag) {
          sendMessage(socket, `Poll ${msg.data.name} doesn't exist or owned by another user`)
          return
        }
        const poll = state.polls.get(msg.data.name)!

        if (!poll.closed) {
          poll.close()
          const message = `Poll ${poll.name} is now closed\n`
                        + `Results for Poll ${poll.name}\n\n${poll.getVotes()}`
          sendMessage(io, message, '<SERVER>')
          bugger('%s closed their poll %s', auth.token.gamertag, msg.data.name)
        }
        break
      }
      case 'query': {
        if (msg.data.name) {
          const poll = state.polls.get(msg.data.name)
          if (!poll) {
            sendMessage(socket, `No such poll ${msg.data.name}`)
            break
          }
          sendMessage(socket, poll.toString())
          break
        }
        const polls = [...state.polls.values()].map(e => `${e.name} - ${e.closed ? 'closed' : 'open'}`)
        if (polls.length === 0) {
          sendMessage(socket, 'No polls')
        } else {
          sendMessage(socket, polls.join('\n'))
        }
        break
      }
    }
  })
}

export const VoteHandler: SocketFunc = (socket, io) => (auth, state) => {
  socket.on(MessageKeys.VOTE, (msg: Message<{ poll: string, response: string }>) => {
    const poll = state.polls.get(msg.data.poll)
    if (!poll) {
      sendMessage(socket, `No such poll ${msg.data.poll}`)
      return
    }

    try {
      poll.cast(auth.token.gamertag, msg.data.response)
      sendMessage(socket, `Cast vote: '${msg.data.response}' for poll: '${msg.data.poll}'`)
      const users = state.UserMap
      if (poll.respondents.every(u => users.has(u)) && users.size === poll.respondents.length) {
        poll.close()
        const message = `Poll ${poll.name} is now closed\n`
                      + `Results for Poll ${poll.name}\n\n${poll.getVotes()}`
        sendMessage(io, message, '<SERVER>')
        bugger('Poll %s recieved all responses. Now closed', poll.name)
      }
    } catch (e) {
      const err = e as Error
      sendMessage(socket, err.message)
    }
  })
}
