const { resolve } = require('path')

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(resolve('database/adonis.sqlite'))

// Queries
const makeQuery = (admin, userID) => `UPDATE users SET admin=${admin} WHERE id=${userID}`
const checkUserQuery = userID => `SELECT id FROM users WHERE id=${userID}`
const listQuery = `SELECT * FROM users WHERE admin=true`

async function getUserID () {
  return new Promise((resolve, reject) => {
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

    db.all(checkUserQuery(userID), (error, rows) => {
      if (rows.length) {
        resolve(userID)
      } else {
        console.log('\x1b[31m')
        console.log('User not found.')
        console.log('\x1b[0m')
        process.exit()
      }
    })
  })
}

const commands = {
  make: process.argv.indexOf('make') > -1,
  unmake: process.argv.indexOf('unmake') > -1,
  list: process.argv.indexOf('list')
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

db.serialize(async () => {
  if (commands.make) {
    const userID = await getUserID()
    db.run(makeQuery(true, userID))
  } else if (commands.unmake) {
    const userID = await getUserID()
    db.run(makeQuery(false, userID))
  } else if (commands.list) {
    db.all(listQuery, (error, rows) => {
      if (rows.length === 0) {
        console.log('\x1b[33m')
        console.log('Admins not found.')
        console.log('\x1b[0m')
      } else {
        console.table(rows)
      }
    })
  }
})
