const { resolve } = require('path')

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(resolve('database/adonis.sqlite'))

function getUserID () {
  let paramIndex = process.argv.indexOf('--user-id')

  if (paramIndex < 0) {
    paramIndex = process.argv.indexOf('-u')
  }

  const userID = process.argv[paramIndex + 1]

  if (paramIndex < 0 || !userID) {
    console.log('\x1b[31m')
    console.log('User id not found.')
    console.log('\x1b[33m')
    console.log('Pass the user id through --user-id or -u.')
    console.log('Ex: "make --user-id 1" or "unmake --user-id 1"')
    console.log('\x1b[0m')
    process.exit()
  }

  return userID
}

const commands = {
  make: process.argv.indexOf('make') > -1,
  unmake: process.argv.indexOf('unmake') > -1
}

let hasCommand
Object.values(commands).forEach(command => {
  if (command) hasCommand = true
})

if (!hasCommand) {
  console.log('\x1b[31m')
  console.error('Command does not exist.')
  console.log('\x1b[33m')
  console.log(`available commands: ${Object.keys(commands)}`)
  console.log('\x1b[0m')
  process.exit()
}

const userID = getUserID()

const query = admin => `UPDATE users SET admin=${admin} WHERE id=${userID}`

db.serialize(() => {
  if (commands.make) {
    db.run(query(true))
  } else if (commands.unmake) {
    db.run(query(false))
  }
})
