const cp = require('child_process');
// const { shell } = require("electron");
const {AutoLanguageClient} = require('@savetheclocktower/atom-languageclient')

const PACKAGE_NAME = require('../package.json').name ?? 'pulsar-ide-golang';

function openConfig () {
  atom.workspace.open(`atom://config/packages/${PACKAGE_NAME}`);
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
  }
};
