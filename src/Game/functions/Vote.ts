import { SocketFunc, bugger, Message } from '../index'
import { MessageKeys, EmitKeys } from '../keys'
import { Vec2 } from '../World'
import Poll from '../Poll'
import { sendMessage } from '../helpers'

// export const VoteStart: SocketFunc = (socket, io) => (auth, state) => {
//   socket.on(MessageKeys.VOTE_START, (msg: Vec2) => {
//     bugger('%s set spawn location to %d, %d', auth.token.gamertag, msg.x, msg.y)

//     state.UserMap[auth.token.gamertag] = msg

//     io.emit(EmitKeys.NEW_SPAWN, { [auth.token.gamertag]: msg })
//     io.emit(EmitKeys.NEW_MESSAGE, ({ from: '<SERVER>', data: `${auth.token.gamertag} set spawn to ${msg.x}, ${msg.y}` }))
//   })
// }

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
        bugger('%s created a new poll %s with valid responses %s', auth.token.gamertag, msg.data.name, (msg.data.responses || ['<DEFAULTS>']).join(', '))
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
          sendMessage(io, `Poll ${msg.data.name} is now closed`, '<SERVER>')
          sendMessage(io, `Results for Poll ${msg.data.name}\n\n${poll.getVotes()}`, '<SERVER>')
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
        const polls = [...state.polls.entries()].map(e => e[0] + e[1].closed ? ' closed' : ' open').join('\n')
        sendMessage(socket, polls)
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
    } catch (e) {
      sendMessage(socket, e)
    }
  })
}
