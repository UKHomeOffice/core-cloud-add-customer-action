# Add Customer Action

GitHub Action to add a customer to the Core Cloud LZA config.

## Workflow Action

### Generating dist/index.js

We use [ncc](https://github.com/vercel/ncc) to package the action into an executable file.
This removes the need to either check in the node_modules folder or build the action prior to using.

We need to ensure that the dist folder is updated whenever there is a functionality change, otherwise we won't be
running the correct version within jobs that use this action.

Before checking creating your Pull Request you should ensure that you have built this file by running `npm run build`
within the root directory.

A blocking workflow called [check-dist](.github/workflows/check-dist.yml) is enabled that checks this dist folder for
changes happens at both push to main and on pull request events.

## Licence

This project is licensed under the MIT License - see the [LICENCE](./LICENCE.md) file for details.
