const { log, error, openBrowser } = require('@vue/cli-shared-utils')
const portfinder = require('portfinder')

async function ui (options = {}, context = process.cwd()) {
  let port = options.port
  if (!port) {
    port = await portfinder.getPortPromise()
  }

  // Config
  process.env.VUE_APP_CLI_UI_URL = ''

  if (!options.dev) {
    // Optimize express
    process.env.NODE_ENV = 'production'
  }

  if (!options.quiet) log(`🚀  Starting GUI...`)
  let server = require('vue-cli-plugin-apollo/graphql-server')
  server = server.default || server

  const opts = {
    port,
    graphqlPath: '/graphql',
    graphqlSubscriptionsPath: '/graphql',
    graphqlPlaygroundPath: '/graphql-playground',
    graphqlCors: '*',
    mock: false,
    apolloEngine: false,
    timeout: 1000000,
    quiet: true,
    paths: {
      typeDefs: require.resolve('@vue/cli-ui/src/graphql-api/type-defs.js'),
      resolvers: require.resolve('@vue/cli-ui/src/graphql-api/resolvers.js'),
      context: require.resolve('@vue/cli-ui/src/graphql-api/context.js'),
      pubsub: require.resolve('@vue/cli-ui/src/graphql-api/pubsub.js'),
      server: require.resolve('@vue/cli-ui/src/graphql-api/server.js')
    }
  }

  server(opts, () => {
    // Reset for yarn/npm to work correctly
    process.env.NODE_ENV = undefined

    // Open browser
    const url = `http://localhost:${port}`
    if (!options.quiet) log(`🌠  Ready on ${url}`)
    if (options.headless) {
      console.log(port)
    } else {
      openBrowser(url)
    }
  })
}

module.exports = (...args) => {
  return ui(...args).catch(err => {
    error(err)
    if (!process.env.VUE_CLI_TEST) {
      process.exit(1)
    }
  })
}
