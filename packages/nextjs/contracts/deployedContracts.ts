/**
 * Deployed contract addresses for TodoList
 * Updated after deployment to Base mainnet (chain 8453)
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  [8453]: {
    TodoList: {
      address: "0x9e465b444384f3368e660b3991c286feaebabd28",
      abi: [
        { type: "error", inputs: [], name: "TodoList__AlreadyCompleted" },
        { type: "error", inputs: [], name: "TodoList__EmptyContent" },
        { type: "error", inputs: [], name: "TodoList__IndexOutOfBounds" },
        { type: "error", inputs: [], name: "TodoList__NotCompleted" },
        { type: "error", inputs: [], name: "TodoList__NotOwner" },
        {
          type: "function",
          inputs: [{ name: "content", type: "string", internalType: "string" }],
          name: "createTodo",
          outputs: [{ name: "todoId", type: "uint256", internalType: "uint256" }],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          inputs: [{ name: "todoId", type: "uint256", internalType: "uint256" }],
          name: "completeTodo",
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          inputs: [{ name: "todoId", type: "uint256", internalType: "uint256" }],
          name: "uncompleteTodo",
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          inputs: [{ name: "todoId", type: "uint256", internalType: "uint256" }],
          name: "deleteTodo",
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          inputs: [
            { name: "user", type: "address", internalType: "address" },
            { name: "todoId", type: "uint256", internalType: "uint256" },
          ],
          name: "getTodo",
          outputs: [
            { name: "content", type: "string", internalType: "string" },
            { name: "completed", type: "bool", internalType: "bool" },
            { name: "createdAt", type: "uint256", internalType: "uint256" },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          inputs: [{ name: "user", type: "address", internalType: "address" }],
          name: "getTodoCount",
          outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
          stateMutability: "view",
        },
        {
          type: "function",
          inputs: [
            { name: "user", type: "address", internalType: "address" },
            { name: "offset", type: "uint256", internalType: "uint256" },
            { name: "limit", type: "uint256", internalType: "uint256" },
          ],
          name: "getTodos",
          outputs: [
            {
              components: [
                { name: "content", type: "string", internalType: "string" },
                { name: "completed", type: "bool", internalType: "bool" },
                { name: "createdAt", type: "uint256", internalType: "uint256" },
              ],
              name: "result",
              type: "tuple[]",
              internalType: "struct TodoList.Todo[]",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          inputs: [
            { name: "", type: "address", internalType: "address" },
            { name: "", type: "uint256", internalType: "uint256" },
          ],
          name: "userTodos",
          outputs: [
            { name: "content", type: "string", internalType: "string" },
            { name: "completed", type: "bool", internalType: "bool" },
            { name: "createdAt", type: "uint256", internalType: "uint256" },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          anonymous: false,
          inputs: [
            { name: "user", type: "address", indexed: true, internalType: "address" },
            { name: "todoId", type: "uint256", indexed: true, internalType: "uint256" },
            { name: "content", type: "string", indexed: false, internalType: "string" },
          ],
          name: "TodoCreated",
        },
        {
          type: "event",
          anonymous: false,
          inputs: [
            { name: "user", type: "address", indexed: true, internalType: "address" },
            { name: "todoId", type: "uint256", indexed: true, internalType: "uint256" },
          ],
          name: "TodoCompleted",
        },
        {
          type: "event",
          anonymous: false,
          inputs: [
            { name: "user", type: "address", indexed: true, internalType: "address" },
            { name: "todoId", type: "uint256", indexed: true, internalType: "uint256" },
          ],
          name: "TodoUncompleted",
        },
        {
          type: "event",
          anonymous: false,
          inputs: [
            { name: "user", type: "address", indexed: true, internalType: "address" },
            { name: "todoId", type: "uint256", indexed: true, internalType: "uint256" },
          ],
          name: "TodoDeleted",
        },
      ],
    },
  },
  [31337]: {
    TodoList: {
      address: "0x0000000000000000000000000000000000000001",
      abi: [],
    },
  },
} as const satisfies GenericContractsDeclaration;

export default deployedContracts;
