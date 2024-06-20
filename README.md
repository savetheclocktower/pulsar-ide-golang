# pulsar-ide-golang

A wrapper around `gopls`. Provides linting, autocompletion, reference-finding, symbol navigation, and other stuff.

## Prerequisites

You must [install `go`](https://go.dev/doc/install).

This package does not yet manage the installation of `gopls`. You can install it manually [using these instructions](https://pkg.go.dev/golang.org/x/tools/gopls#section-readme).

If your `PATH` includes `GOBIN` (or `$GOPATH/bin`), then `gopls` will be in your path after installation, and this package should not need further configuration.

If `gopls` is not present in your path:

* Find your `GOBIN` by running `go env GOBIN`. If it doesn’t exist, run `go env GOPATH` and look for a `bin` directory at that location.
* If you see a `gopls` binary present in that folder, you’re in the right place.
* Enter the full absolute path to `gopls`, with the binary name included, in the “Path to gopls” setting on this package’s configuration page.
* Reload the window (**Window: Reload** from the command palette) or quit and relaunch Pulsar.

### “Finished loading packages” notification

You might notice a notification like this on startup:

![gopls-finished-loading-packages](https://gist.github.com/assets/3450/c66fe9a6-2e2a-4d1f-9fcc-0058893d6d77)

`gopls` wants to report its progress on some server-side–initiated tasks like workspace setup. The output of this progress will use the `busy-signal` package if you have it installed. If you don’t have `busy-signal` installed, `gopls` gracefully degrades and sends those messages a different way: as notifications.

Hence there are two ways out of seeing this notification on every startup:

1. Install `busy-signal`. The version in Pulsar’s package registry is out of date, so you are encouraged to install it directly from GitHub:

    ```
    ppm install steelbrain/busy-signal
    ```

2. If, for whatever reason, you don’t want to install `busy-signal`, you can instead enable this package’s **Hide “Package Loading” Messages** setting.


## What does it do?

Install this package, then install any of the following packages to get special features.

Start with these packages; they’re all builtin, actively maintained, and/or built exclusively for Pulsar:

* [autocomplete-plus](https://web.pulsar-edit.dev/packages/autocomplete-plus) (builtin)
  * See autocompletion options as you type
* [symbols-view](https://web.pulsar-edit.dev/packages/symbols-view) (builtin)
  * View and filter a list of symbols in the current file
  * View and filter a list of symbols across all files in the project
  * Jump to the definition of the symbol under the cursor
* [linter](https://web.pulsar-edit.dev/packages/linter) and [linter-ui-default](https://web.pulsar-edit.dev/packages/linter-ui-default)
  * View diagnostic messages as you type
* [intentions](https://web.pulsar-edit.dev/packages/intentions)
  * Open a menu to view possible code actions for a diagnostic message
  * Open a menu to view possible code actions for the file at large
* [pulsar-outline-view](https://web.pulsar-edit.dev/packages/pulsar-outline-view)
  * View a hierarchical list of the file’s symbols
* [pulsar-refactor](https://web.pulsar-edit.dev/packages/pulsar-refactor)
  * Perform project-wide renaming of variables, methods, classes and types
* [pulsar-find-references](https://web.pulsar-edit.dev/packages/pulsar-find-references)
  * Place the cursor inside of a token to highlight other usages of that token
  * Place the cursor inside of a token, then view a `find-and-replace`-style “results” panel containing all usages of that token across your project

For other features that don’t have equivalents above, the legacy `atom-ide` packages should also work:

* [atom-ide-definitions](https://web.pulsar-edit.dev/packages/atom-ide-definitions)
  * Jump to the definition of the symbol under the cursor
* [atom-ide-outline](https://web.pulsar-edit.dev/packages/atom-ide-outline)
  * View a hierarchical list of the file’s symbols
  * View the call hierarchy for a given file
* [atom-ide-datatip](https://web.pulsar-edit.dev/packages/atom-ide-datatip)
  * Hover over a symbol to see any related documentation, including method signatures
* [atom-ide-signature-help](https://web.pulsar-edit.dev/packages/atom-ide-signature-help)
  * View a function’s parameter signature as you type its arguments
* [atom-ide-code-format](https://web.pulsar-edit.dev/packages/atom-ide-code-format)
  * Invoke on a buffer (or a subset of your buffer) to reformat your code according to the language server’s settings
