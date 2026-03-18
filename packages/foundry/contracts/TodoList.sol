// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title TodoList
/// @notice Simple onchain todo list — one contract, no over-engineering.
///         Following ethskills.com: 1 contract for MVP, events for every state change.
contract TodoList is Ownable {
    // ---------------------------------------------------------------------------
    // Errors
    // ---------------------------------------------------------------------------
    error TodoList__AlreadyCompleted();
    error TodoList__NotCompleted();
    error TodoList__IndexOutOfBounds();
    error TodoList__EmptyContent();
    error TodoList__NotOwner();

    // ---------------------------------------------------------------------------
    // Structs
    // ---------------------------------------------------------------------------
    struct Todo {
        string content;
        bool completed;
        uint256 createdAt;
    }

    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------
    /// @notice All todos — each index is unique per owner
    mapping(address => Todo[]) public userTodos;

    // ---------------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------------
    event TodoCreated(address indexed user, uint256 indexed todoId, string content);
    event TodoCompleted(address indexed user, uint256 indexed todoId);
    event TodoUncompleted(address indexed user, uint256 indexed todoId);
    event TodoDeleted(address indexed user, uint256 indexed todoId);

    // ---------------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------------
    constructor() Ownable(msg.sender) {} // solhint-disable-line no-empty-blocks

    // ---------------------------------------------------------------------------
    // Core Functions
    // ---------------------------------------------------------------------------

    /// @notice Create a new todo
    /// @param content The todo text
    /// @return todoId The ID of the newly created todo
    function createTodo(string calldata content) external returns (uint256 todoId) {
        // Reject empty or whitespace-only strings
        bytes memory b = bytes(content);
        bool allSpaces = true;
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] != bytes1(0x20)) {
                allSpaces = false;
                break;
            }
        }
        if (b.length == 0 || allSpaces) revert TodoList__EmptyContent();

        Todo memory newTodo = Todo({
            content: content,
            completed: false,
            createdAt: block.timestamp
        });

        userTodos[msg.sender].push(newTodo);
        todoId = userTodos[msg.sender].length - 1;

        emit TodoCreated(msg.sender, todoId, content);
    }

    /// @notice Mark a todo as completed
    /// @param todoId The todo ID
    function completeTodo(uint256 todoId) external {
        _validateTodoExists(msg.sender, todoId);

        Todo storage todo = userTodos[msg.sender][todoId];
        if (todo.completed) revert TodoList__AlreadyCompleted();

        todo.completed = true;
        emit TodoCompleted(msg.sender, todoId);
    }

    /// @notice Mark a completed todo as incomplete (uncomplete)
    /// @param todoId The todo ID
    function uncompleteTodo(uint256 todoId) external {
        _validateTodoExists(msg.sender, todoId);

        Todo storage todo = userTodos[msg.sender][todoId];
        if (!todo.completed) revert TodoList__NotCompleted();

        todo.completed = false;
        emit TodoUncompleted(msg.sender, todoId);
    }

    /// @notice Delete a todo by swapping with the last element and popping
    /// @param todoId The todo ID to delete
    function deleteTodo(uint256 todoId) external {
        _validateTodoExists(msg.sender, todoId);

        uint256 lastIndex = userTodos[msg.sender].length - 1;

        // If deleting the last item, just pop — no swap needed
        if (todoId != lastIndex) {
            userTodos[msg.sender][todoId] = userTodos[msg.sender][lastIndex];
        }
        userTodos[msg.sender].pop();

        emit TodoDeleted(msg.sender, todoId);
    }

    // ---------------------------------------------------------------------------
    // View Functions
    // ---------------------------------------------------------------------------

    /// @notice Get a specific todo
    function getTodo(address user, uint256 todoId)
        external
        view
        returns (string memory content, bool completed, uint256 createdAt)
    {
        _validateTodoExists(user, todoId);
        Todo memory todo = userTodos[user][todoId];
        return (todo.content, todo.completed, todo.createdAt);
    }

    /// @notice Get the total number of todos for a user
    function getTodoCount(address user) external view returns (uint256) {
        return userTodos[user].length;
    }

    /// @notice Get all todos for a user (paginated to avoid unbounded gas)
    /// @param user The user address
    /// @param offset Start index
    /// @param limit Max items to return
    function getTodos(address user, uint256 offset, uint256 limit)
        external
        view
        returns (Todo[] memory result)
    {
        uint256 total = userTodos[user].length;
        if (offset >= total) return new Todo[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;

        uint256 size = end - offset;
        result = new Todo[](size);

        for (uint256 i = 0; i < size; i++) {
            result[i] = userTodos[user][offset + i];
        }
    }

    // ---------------------------------------------------------------------------
    // Internal
    // ---------------------------------------------------------------------------
    function _validateTodoExists(address user, uint256 todoId) internal view {
        if (todoId >= userTodos[user].length) revert TodoList__IndexOutOfBounds();
    }
}
