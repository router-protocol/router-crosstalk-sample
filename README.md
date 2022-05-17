# Router CrossTalk Sample

This project is the go-to hardhat sample project for development using Router's CrossTalk library. A developer who wants to create projects using the CrossTalk library just needs to clone this library, install all the dependencies using the command `yarn` or `npm install` and start creating his/her cross-chain contracts.

The sample project comes with a cross-chain Greeter contract along with various tasks needed to make it cross-chain compatible. However, these tasks are created for the Greeter contract. So the developer needs to create their own tasks keeping in mind the requirements of their contract but the basic schema remains the same.

## Workflow

1. Clone the repository.
2. Run command `yarn` or `npm install` to install dependencies.
3. Create your cross-chain smart contracts. Greeter contract can be used as an example.
4. Deploy your contracts using the **deploy** task inside the tasks folder. Make sure you create your own task according to the requirements of your contract. This task will deploy the contracts, set the linker and fee token addresses, approve the fee token as well as store deployment addresses inside the deployments.json file.
5. The only task left now is to map your contracts with each other using the **MAP_CONTRACTS** task. Make sure to make changes to this task according to requirements of your contracts. Also remember that a fully updated deployments file is necessary for this task.

The addresses to various variables such as the Generic Handlers, the fee tokens etc are available in the documentation of the Router CrossTalk library. Make sure to use the correct addresses for different networks. Also make sure to send some fee tokens to your contracts on respective chains so that it is able to use those tokens to pay fees to the Generic Handler for cross-chain requests.

Now your task is complete and the contract is ready to interact with its counterparts on different blockchains.
