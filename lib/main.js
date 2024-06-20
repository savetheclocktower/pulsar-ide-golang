const cp = require('child_process');
// const { shell } = require("electron");
const {AutoLanguageClient} = require('@savetheclocktower/atom-languageclient')

const PACKAGE_NAME = require('../package.json').name ?? 'pulsar-ide-golang';

function openConfig () {
  atom.workspace.open(`atom://config/packages/${PACKAGE_NAME}`);
}

const MESSAGE_SEVERITY_MAP = {
  Error: 1,
  Warning: 2,
  Info: 3,
  Log: 4,
  Debug: 5
}

class GoplsClient extends AutoLanguageClient {

  constructor () {
    // enable debug output
    // atom.config.set('core.debugLSP', true);
    super();
  }
  getGrammarScopes () { return ['source.go']; }
  getLanguageName () { return 'Go'; }
  getServerName () { return 'gopls'; }
  getPackageName() { return PACKAGE_NAME; }
  getConnectionType() { return 'stdio'; }

  // If the user doesn't have `busy-signal` installed, then `gopls` will use
  // `window/showMessage` for some tasks which otherwise would've been
  // signalled through `window/workDoneProgress`.
  shouldShowMessage (params) {
    let {
      minimumLogLevel,
      hidePackageLoadingMessages
    } = atom.config.get(`${this.getPackageName()}.notifications`)

    if (hidePackageLoadingMessages && /loading packages/i.test(params.message)) {
      return false;
    }

    if (params.type > MESSAGE_SEVERITY_MAP[minimumLogLevel]) {
      // Too esoteric.
      return false;
    }
    return true;
  }

  startServerProcess (projectPath) {
    const args = ['serve']
    const path = atom.config.get(`${PACKAGE_NAME}.goplsBin`)
    const childProcess = cp.spawn(path, args, { cwd: projectPath });

    childProcess.on("error", err => {
      console.error(err);
      atom.notifications.addError(
        "Unable to start the gopls language server.",
        {
          dismissable: true,
          buttons: [
            {
              text: "Open package settings",
              onDidClick: openConfig
            }
          ],
          description:
          "This can occur if you do not have `gopls` installed or if it is not in your path.\n\nViewing the README is strongly recommended."
        }
      )
    });

    return childProcess;
  }

  // `gopls` has an annoying habit of reporting an error whenever a
  // `findReferences` call is made at a location that has no identifer at the
  // cursor. Most other language servers are content to return an empty result
  // set.
  //
  // The consuming package can decide what to do with that error, so it's not a
  // big deal… except that `atom-languageclient` has _its own_ annoying
  // behavior: logging an error in the console whenever the server throws an
  // error, even if the error is later caught! For an innocuous error like the
  // one described above, all this does is put noise in one's console.
  //
  // The default log level of `atom-languageclient` surfaces all warnings and
  // errors. Let's just proxy the logger so that we can filter out this one
  // specific non-actionable error message. It'll still get logged if nothing
  // catches it, or if the consumer catches it and decides to log it.
  getLogger () {
    let isDebugging = atom.config.get("core.debugLSP")
    let logger = super.getLogger()

    // Allow all messages through when `core.debugLSP` is enabled so as not to
    // paint a false picture when someone is debugging.
    if (isDebugging) return logger

    return new Proxy(logger, {
      get(target, prop) {
        let original = target[prop].bind(target)
        // Ignore all functions except for `logger.error`.
        if (prop !== 'error') return original

        // Sit in front of the standard `logger.error` method and suppress any
        // calls that simply report `no identifier found`.
        return (...args) => {
          for (let arg of args) {
            if (arg instanceof Error && shouldIgnoreErrorMessage(arg.message)) {
              return
            }
          }
          return original(...args)
        }
      }
    })
  }
}

module.exports = new GoplsClient();

module.exports.config = {
  // goBin: {
  //   type: 'string',
  //   title: 'Path to go',
  //   description: 'Specify the location of `go` if it is not in your $PATH. This default should work for most. Reload or restart to take effect.',
  //   default: 'go'
  // },

  // TODO: Try to infer this. If `go` is in the path, we at least can determine
  // some good candidates for places where `gopls` could be.
  goplsBin: {
    type: 'string',
    title: 'Path to gopls',
    description: 'Specify the location of `gopls` if it is not in your $PATH. Reload or restart to take effect.',
    default: 'gopls',
    order: 1
  },
  commandArguments: {
    type: 'string',
    title: 'Command-line arguments',
    description: 'Specify arguments passed to `gopls` at launch, separated by commas (`,`). Reload or restart to take effect.',
    default: '',
    order: 2
  },

  notifications: {
    title: "Notifications",
    type: "object",
    order: 3,
    properties: {
      hidePackageLoadingMessages: {
        title: "Hide “Package Loading” Messages",
        type: 'boolean',
        default: false,
        description: "Whether to hide the non-actionable messages about package loading that `gopls` sends at the beginning of a session. (You can also suppress these messages by installing the [busy-signal](https://github.com/steelbrain/busy-signal/) package so that they are reported via another means.)"
      },
      minimumLogLevel: {
        title: "Minimum Log Level",
        default: "Info",
        description: "Only messages of the selected severity or higher will be shown; others will be suppressed.",
        type: 'string',
        enum: [
          "Error",
          "Warning",
          "Info",
          "Log",
          "Debug"
        ]
      }
    }
  }
};

function shouldIgnoreErrorMessage (message) {
  if (message.includes('no identifier found')) return true
  if (message.includes('references to builtin')) return true
  return false
}
